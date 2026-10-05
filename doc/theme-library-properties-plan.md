# Marble 全域設定的 Library Property（Density／Brand）評估與規劃

- 日期：2026-10-05
- 狀態：**程式、測試、Javadoc 與 zk spec 已完成；zkdoc（步驟 4）與淺色品牌色對比警告交給寫文件的 session**
- 觸發：zkdoc `tasks/marble_theme_doc_outline.md` 第 5 節，切換 compact 只能用 Java API 或 JavaScript，不符合 ZK「在 `zk.xml` 設定」的慣例
- 本文件的決策編號 D1–D6 只在本文件內有效

---

## 1. 現況

| 設定 | 目前的開關 | Java 工程師怎麼用 |
|---|---|---|
| Density | `<html>`（或任一元素）上的 `data-density="compact"`，規則在 `tokens/_sizing.css` | `MarbleDensity.apply(Density.COMPACT)`（`Clients.evalJavaScript`）、`MarbleDensity.apply(component, …)`（`setClientDataAttribute`） |
| Brand color | `--zk-color-primary` 一個 seed，其餘用 `oklch(from …)` 自動衍生；三個 preset 用 `:root[data-brand="…"]` | `MarbleBrand.apply(Brand.SLATE)`；自訂顏色要自己寫 CSS（`doc/spec/brand-override.md`） |

兩個 Java API 都是**執行期**切換：必須在 ZK execution 裡呼叫，而且在頁面載入時呼叫會在第一次繪製之後才生效，畫面會先以 comfortable／預設藍色出現再跳換（FOUC）。`MarbleDensity` 的 Javadoc 已經自己寫明：固定預設值應該「在 server 端繪製時就寫進屬性」，但目前沒有任何設定能做到這件事。

### 1.1 其實已經存在、但沒人會想到的零程式碼途徑

| 途徑 | 能做到 | 問題 |
|---|---|---|
| ZUL 頁首 `<?root-attributes data-density="compact"?>` | `zul/impl/PageRenderer.renderDesktop` 會把它原樣寫進 `<html …>`，無 FOUC | 每一頁都要寫；不是全域 |
| `zk.xml` `<device-config><embed>` 放一段 `<script>` | 全域、在 `<head>` 執行，無 FOUC | 要客戶手寫 JavaScript，正是要避免的事；CSP 下還要處理 nonce |
| `zk.xml` `<desktop-config><theme-uri>/brand.css</theme-uri></desktop-config>` | 全域品牌色；`HtmlPageRenders.getStyleSheets` 保證 theme-uri 排在語言樣式表之後 | 要多一個 CSS 檔；只能處理品牌色，處理不了 density（density 靠屬性不是靠 CSS 變數） |

結論：**品牌色已有符合 ZK 慣例的全域途徑（theme-uri），density 沒有。** 新增 library property 的必要性 density 高、品牌色中。

---

## 2. 方案

### 2.1 新增兩個 library property

```xml
<!-- zk.xml -->
<library-property>
    <name>org.zkoss.theme.marble.density</name>
    <value>compact</value>          <!-- comfortable（預設）| compact -->
</library-property>
<library-property>
    <name>org.zkoss.theme.marble.brand</name>
    <value>#0a7d5a</value>          <!-- preset 名稱 default | slate | copper，或 #rgb／#rrggbb -->
</library-property>
```

- 命名採 `org.zkoss.theme.marble.*`：與既有的 `org.zkoss.theme.preferred` 同屬 `org.zkoss.theme` 命名空間，並以 `marble` 標明只對 Marble 有效（IceBlue 不讀這兩個 property）。
- 品牌色 property 原本草擬為 `primaryColor`。D2 決定也接受 preset 名稱後，`primaryColor=slate` 讀起來不對，因此改名為 `brand`，與 `MarbleBrand`、`data-brand` 同一個字。
- `Library.getProperty` 本來就也讀 Java system property，所以 `-Dorg.zkoss.theme.marble.density=compact` 免費可用（例如不同部署環境用不同密度）。
- 不設定時行為與現在完全相同。

### 2.2 輸出位置：全部在 `zul/impl/PageRenderer`，不動 `zk` 模組

| 設定值 | 輸出 | 位置 |
|---|---|---|
| `density=compact` | `<html … data-density="compact">` | `renderDesktop()` 寫 `rootAttrs` 之後 |
| `brand=slate`／`copper` | `<html … data-brand="slate">`（與執行期 `MarbleBrand.apply` 同一個屬性） | 同上 |
| `brand=#0a7d5a` | `<style>:root{--zk-color-primary:#0a7d5a}</style>`（附 CSP nonce，用既有的 `HtmlPageRenders.outCspNonceAttr`） | `outHeaders()` 中 `outLangStyleSheets` 之後、頁面自己的 headers 之前 |
| `density=comfortable`、`brand=default` | 不輸出（等同未設定） | — |

為什麼這樣排：

- **無 FOUC、無 JavaScript**：屬性和樣式在 HTML 裡就已存在，第一次繪製就是正確結果。
- **優先順序自然成立**：`zk.xml` 是預設值 → 頁面 `<?root-attributes?>`／頁面 `<?link?>` 的 CSS 可以覆蓋 → 執行期 `MarbleDensity.apply`／`MarbleBrand.apply`（`:root[data-brand]` 特異度 0,2,0）再覆蓋。不需要額外的優先權邏輯。
- **tokens 不在 cascade layer 內**（見 `_layer-order.css`），所以 `<style>` 只要排在 theme 樣式表之後就會贏，與 `brand-override.md` 的手寫作法同一機制。
- hex 不寫成 `<html style="--zk-color-primary:…">`：inline style 會壓過執行期 `MarbleBrand.apply` 設的 `:root[data-brand]`，執行期切換就失效了。
- 只改 `zul`，`zk` 模組不必認識 Marble。`zkcml` 的 `stateless` 模組也使用同一個 renderer，自動得到此功能；兩個 repo 都沒有 `PageRenderer` 的子類別。

### 2.3 輸入驗證

- `density`：只接受 `comfortable`／`compact`（不分大小寫、去頭尾空白）。
- `brand`：hex 只接受 `#rgb`／`#rrggbb`；不是 hex 時比對 preset 名稱（不分大小寫）。hex 會被寫進 `<style>`，限制格式同時也排除 CSS／HTML 注入。
- 其他值：記 warning 並忽略該 property（另一個 property 照常生效）。

### 2.4 Java API 調整（小）

- `MarbleDensity` Javadoc 中「shipped as `marble-compact.css`」已過時（repo 已無此檔，zkdoc outline 也標註不寫），改為指向新的 library property。
- `MarbleBrand` Javadoc 的「For a customer's own fixed brand color, prefer a static CSS rule」改為優先推薦 library property，CSS／theme-uri 列為進階作法。
- 不新增 public API。

---

## 3. 適用範圍與限制（要寫進文件）

1. **只對「ZUL 頁面本身就是整份 HTML」的情況生效**（`renderDesktop` 路徑）。若 ZUL 被嵌在 JSP、Spring MVC 樣板、被 include，或用 zhtml 的 `<html>` 當根元素，`<html>` 標籤是客戶自己寫的，ZK 碰不到——這時客戶直接在自己的 `<html>` 加 `data-density`／`data-brand`，或用 theme-uri CSS 設品牌色。被 include 的 ZUL 走 `renderPage`，見 D5。
2. **淺色品牌色的白字問題（D3=C：只寫文件）。** `--zk-color-on-primary` 寫死為白色；客戶設定像 `#ffd400` 這類淺色時，按鈕白字會低於 WCAG AA。文件要寫：選中深色系，或另以 CSS 覆蓋 `--zk-color-on-primary`。
3. **只是預設值。** 每位使用者自己選密度／品牌色仍需用既有的 Java API。
4. 若應用改用 IceBlue（theme pack），兩個設定無害但不起作用。

---

## 4. 不再開放其他設定

**這次只做 density 與 brand**（D4），理由：

- 這兩個是 Marble spec 裡明確設計成「一個開關、全站生效」的旋鈕；其他 token（字型、圓角、基礎字級……）都是 CSS 變數，`theme-uri` 加一個 CSS 檔就能改，已經是 ZK 慣例，用 property 包一層只是語法糖。
- 每多一個 property 就是一個要維護、寫文件、相容到 ZK 12 的承諾；ZK 11 剩餘人力有限。
- 若之後客戶回饋某項設定很常被問（例如字型），再以同一機制加一個 property，成本低。

文件上的做法：zkdoc 的 customization 頁面列一張「想改什麼 → 用什麼」表格，把 property 和 theme-uri CSS 並列，讓客戶知道其他 token 也能全域改。

---

## 5. 決策事項

- **D1：是否新增 library property？** 已決：A，density 與 brand 兩個。
- **D2：品牌色 property 收什麼值？** 已決：B，hex 與 preset 名稱都收。連帶影響：property 不叫 `primaryColor`，改叫 `brand`；命名空間依裁示採 `org.zkoss.theme.marble.*`（見 2.1）。
- **D3：淺色品牌色的白字問題？** 已決：C，只在文件警告。
- **D4：其他 token 是否也開 property？** 已決：A，這次不做。
- **D5：被 include 的 ZUL（`renderPage` 路徑）是否也輸出 hex 的 `<style>`？** 已決：A，不輸出；兩個 property 都只在整頁 ZUL（`renderDesktop`）生效。
- **D6：Jira 單號。** 已決：沿用 ZK-6112。`B110_ZK_6112Test` 已存在，依 `B100_ZK_5468_GridTest` 的慣例另取後綴：`B110_ZK_6112_ThemePropertiesTest.java` + `B110-ZK-6112-ThemeProperties.zul`。

---

## 6. 實作步驟

1. 依第 8.4 節先寫測試（紅燈），再改 `zul/impl/PageRenderer`（綠燈）。
2. zktest：ZUL 頁登錄 `config.properties`；以 `./gradlew test --tests` 執行兩層測試。
3. 更新 `MarbleDensity`、`MarbleBrand` Javadoc；`doc/spec/data-dense-mode.md`、`doc/spec/brand-override.md` 加上 property 作法與淺色品牌色警告。
4. zkdoc：`tasks/marble_theme_doc_outline.md` 第 4、5 節把 `zk.xml` property 排為**第一種**作法；Configuration Reference 新增兩個 property 條目。
5. `./gradlew :zul:checkstyleMain`（本變更沒有 TS）。

---

## 7. 不做

- 不改 `zk` 模組的 `HtmlPageRenders`／`zkopt`，不加 client 端 JavaScript。
- 不讓 property 支援單一區域的 density（區域用 `MarbleDensity.apply(component, …)` 或 `xmlns:ca="client/attribute"` 的 `ca:data-density="compact"`）。
- 不恢復 `marble-compact.css`。
- 不自動計算淺色品牌色的 on-primary（D3）。

---

## 8. 程式設計

### 8.0 `PageRenderer` 的生命週期與插入點

**(1) 從 request 到 `PageRenderer`**

```text
DHtmlLayoutServlet.process                          (zk/ui/http)
  UiEngineImpl.execNewPage → execNewPage0           (zk/ui/impl)
    建立 component tree、執行 composer／ViewModel 的 init
    PageImpl.redraw(out)                            (PageImpl.java:898)
      langdef.getPageRenderer().render(page, out)   ← lang.xml 的 <renderer-class>
        = org.zkoss.zul.impl.PageRenderer.render
```

renderer 在 component tree 建好之後才被呼叫：`zk.xml` 已讀取、composer 已執行，但瀏覽器還沒收到任何輸出。

**(2) `render()` 的三條分支**

```text
render(page, out)
 │
 ├─ setCspHeader                          （非 AU 請求才做）
 │
 ├─ page.isComplete() 或 ctl = "complete"？
 │    └─ 是 → renderComplete              ✗ <html> 由 ZUL 自己寫（native／zhtml 根元素）
 │
 ├─ AU 更新，或被 include（ctl ≠ "desktop"）？
 │    └─ 是 → renderPage                  ✗ 只輸出頁面片段，沒有 <html>
 │
 └─ 其他 → renderDesktop                  ✓ ZK 輸出整份 HTML ← 新 property 只在這條生效
```

標 ✗ 的兩條：`<html>` 不是 ZK 寫的或根本不存在，即第 3 節的限制與 D5。

**(3) `renderDesktop` 的輸出順序與新增的三處（`+` 為新增）**

```diff
 renderDesktop(exec, page, out)
+  MarbleThemeDefaults defaults = parseThemeDefaults()       ← 解析：唯一讀 property 的地方
   rootAttrs = page.getRootAttributes()                ← 頁面的 <?root-attributes?>
   <!DOCTYPE html>
   <html lang="…" + rootAttrs
+    + outThemeRootAttributes(defaults, rootAttrs)     ← 輸出點 1：data-density／data-brand
   ><head><title>…</title>
   outHeaders(exec, page, out, defaults)
     HtmlPageRenders.outHeaders(before=true)           ← 頁面的 <?meta?> 等
     outInitCrashScript
     outLangJavaScripts                                ← zk.wpd、zkopt(...)、device <embed>
     outLangStyleSheets                                ← zk.wcs（Marble tokens）＋ theme-uri
+    outThemeStyle(defaults)                           ← 輸出點 2：<style>:root{--zk-color-primary:#…}
     HtmlPageRenders.outHeaders(before=false)          ← 頁面的 <?link?>、<?style?>
   </head><body>
   outPageContent                                      ← widget 由 JS 建立 → 第一次繪製
   </body></html>
```

兩個輸出點都在 `outPageContent` 之前，第一次繪製時 token 已是設定值，所以沒有 FOUC。

**(4) 誰贏（由弱到強）**

```text
zk.xml property                               ← 全站預設
  < 頁面 <?root-attributes?>                  ← 輸出點 1 遇到同名屬性就不輸出
  < 頁面 <?link?> 的 CSS                       ← 排在輸出點 2 之後
  < 執行期 MarbleDensity／MarbleBrand.apply    ← 繪製後才改 <html>；:root[data-brand] 特異度較高
```

### 8.1 結構：一個解析、兩個輸出，都是 `PageRenderer` 的 package-private static method

```
renderDesktop()
 ├─ MarbleThemeDefaults defaults = parseThemeDefaults();      ← 唯一讀 Library property 的地方
 ├─ out.write("<html" … rootAttrs)
 ├─ write(out, outThemeRootAttributes(defaults, rootAttrs))   ← 輸出點 1：<html> 屬性
 └─ outHeaders(exec, page, out, defaults)
      ├─ outLangStyleSheets(...)
      ├─ write(out, outThemeStyle(defaults))                  ← 輸出點 2：<head> 中的 <style>
      └─ HtmlPageRenders.outHeaders(exec, page, false)
```

輸出點必須有兩個：`data-*` 屬性只能放在 `<html>` 標籤上，hex 的 `<style>` 必須排在 theme 樣式表之後；兩個位置在 HTML 中隔著 `<title>` 與整段 script。要合成一個輸出點，唯一的辦法是用 `<script>` 在 head 裡補屬性——那就回到要 JavaScript 與 CSP script nonce 的作法，不划算。

解析只做一次，結果由 `org.zkoss.zul.impl.PageRenderer` 內的 package-private static nested class `MarbleThemeDefaults` 帶到兩個輸出點。放在 `PageRenderer` 內而不是獨立成 top-level class，因為只有 `PageRenderer` 用它：獨立放在 `org.zkoss.zul.theme`（與 `MarbleDensity` 同 package）就必須是 public，等於多一個要相容的 API；放在 `org.zkoss.zul.impl` 則只是把三個欄位拆到另一個檔案。

```java
/** Marble defaults read from zk.xml library properties; a null field means "not configured". */
static final class MarbleThemeDefaults {
	private final String density;      // data-density token, e.g. "compact"
	private final String brand;        // data-brand token, e.g. "slate"
	private final String primaryColor; // validated #rgb or #rrggbb
}
```

`brand` 與 `primaryColor` 互斥（同一個 property 不是 preset 就是 hex）。

### 8.2 解析：`parseThemeDefaults()`

```java
private static final String DENSITY_PROPERTY = "org.zkoss.theme.marble.density";
private static final String BRAND_PROPERTY = "org.zkoss.theme.marble.brand";
private static final Pattern HEX_COLOR_PATTERN = Pattern.compile("#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})");

static MarbleThemeDefaults parseThemeDefaults() {
	String density = null, brand = null, primaryColor = null;

	String value = trimToNull(Library.getProperty(DENSITY_PROPERTY));
	if (value != null) {
		Density d = findDensity(value);           // loops Density.values(), compares token() ignoring case
		if (d == null)
			log.warn("Ignored {}={}: expected comfortable or compact", DENSITY_PROPERTY, value);
		else if (d != Density.COMFORTABLE)
			density = d.token();
	}

	value = trimToNull(Library.getProperty(BRAND_PROPERTY));
	if (value != null) {
		if (HEX_COLOR_PATTERN.matcher(value).matches())
			primaryColor = value;
		else {
			Brand b = findBrand(value);           // loops Brand.values(), compares token() ignoring case
			if (b == null)
				log.warn("Ignored {}={}: expected #rgb, #rrggbb or a preset name", BRAND_PROPERTY, value);
			else if (b != Brand.DEFAULT)
				brand = b.token();
		}
	}
	return new MarbleThemeDefaults(density, brand, primaryColor);
}
```

- 合法值的來源是既有的 `MarbleDensity.Density`／`MarbleBrand.Brand` enum，不另外寫一份清單；之後加 preset 只要改 enum。
- 不在 enum 上加 `fromToken()`：`PageRenderer` 在不同 package，加了就是新的 public API。
- 每次整頁繪製都解析一次：`Library.getProperty` 只是查表，而且這樣測試或管理介面在執行期 `Library.setProperty` 改值後立即生效（與 `org.zkoss.theme.preferred` 行為一致）。代價是設錯值時每次載入頁面都會記一次 warning——這正好讓設定錯誤容易被發現。

### 8.3 輸出

```java
private static final Pattern DENSITY_ATTRIBUTE_PATTERN = Pattern.compile("(?i)(?:^|\\s)data-density\\s*=");
private static final Pattern BRAND_ATTRIBUTE_PATTERN = Pattern.compile("(?i)(?:^|\\s)data-brand\\s*=");

/** Returns the root attributes to append to <html>, or null; a page's own <?root-attributes?> wins. */
static String outThemeRootAttributes(MarbleThemeDefaults defaults, String rootAttrs) {
	StringBuilder sb = new StringBuilder();
	if (defaults.density != null && !DENSITY_ATTRIBUTE_PATTERN.matcher(rootAttrs).find())
		sb.append(" data-density=\"").append(defaults.density).append('"');
	if (defaults.brand != null && !BRAND_ATTRIBUTE_PATTERN.matcher(rootAttrs).find())
		sb.append(" data-brand=\"").append(defaults.brand).append('"');
	return sb.length() > 0 ? sb.toString() : null;
}

/** Returns the <style> that overrides the primary seed, or null. Must follow the theme stylesheets. */
static String outThemeStyle(MarbleThemeDefaults defaults) {
	if (defaults.primaryColor == null)
		return null;
	return HtmlPageRenders.outCspNonceAttr(
			"<style>:root{--zk-color-primary:" + defaults.primaryColor + "}</style>\n");
}
```

- 屬性值都來自 enum 的 token 或已通過 regex 的 hex，不需要再 encode。
- 頁面的 `<?root-attributes?>` 已有同名屬性時不輸出，避免 `<html>` 上出現重複屬性（HTML 只認第一個，結果會跟客戶預期相反）。與既有的 `containsLangAttribute` 同一作法，但不重構那個 method。
- 新增 import：`org.slf4j.Logger`／`LoggerFactory`、`org.zkoss.zul.theme.MarbleDensity.Density`、`org.zkoss.zul.theme.MarbleBrand.Brand`。

### 8.4 測試（TDD：先寫測試、確認失敗，再實作）

zktest 的 `test` task 設定 `forkEvery = 1`（每個 test class 一個 JVM），所以 `Library.setProperty` 不會影響其他 test class，**不需要** `@ForkJVMTestOnly`；同一 class 內以 `@AfterEach` 把 property 設回 `null`。這與既有的 `B110_ZK_6112Test.testBrowserDefaultServesEmbedReset` 同一作法。

為了讓單元測試能直接呼叫，`MarbleThemeDefaults`、`parseThemeDefaults`、`outThemeRootAttributes`、`outThemeStyle` 是 **package-private**（不是 private），`MarbleThemeDefaults` 另有 package-private constructor。仍然不是 public API。

#### 第一層：單元測試（JUnit，不開瀏覽器）

`zktest/src/test/java/org/zkoss/zul/impl/MarbleThemeDefaultsTest.java`（與 `PageRenderer` 同 package；`zul` 模組沒有測試環境）

| # | 方法 | 輸入 | 預期 |
|---|---|---|---|
| U1 | parse | 兩個 property 都未設定 | 三個欄位皆 `null` |
| U2 | parse | `density=compact` | `density="compact"` |
| U3 | parse | `density=" COMPACT "` | `density="compact"`（不分大小寫、去空白） |
| U4 | parse | `density=comfortable` | `density=null`（預設值不輸出） |
| U5 | parse | `density=tiny` | `density=null`（記 warning） |
| U6 | parse | `brand=slate`、`brand=Copper` | `brand="slate"`／`"copper"`，`primaryColor=null` |
| U7 | parse | `brand=default` | 三個欄位皆 `null` |
| U8 | parse | `brand=#0a7d5a`、`brand=#ABC` | `primaryColor` 為原值，`brand=null` |
| U9 | parse | `brand` 為 `red`、`#12345`、`rgb(1,2,3)`、`#0a7d5a;}body{x:y` | 三個欄位皆 `null`（含注入字串） |
| U10 | parse | `density=tiny` + `brand=slate` | 一個錯不影響另一個：`brand="slate"` |
| U11 | outThemeRootAttributes | 全部 `null` | `null` |
| U12 | outThemeRootAttributes | density + brand，rootAttrs `""` | `" data-density=\"compact\" data-brand=\"slate\""` |
| U13 | outThemeRootAttributes | density + brand，rootAttrs `data-density="comfortable"` | 只輸出 `" data-brand=\"slate\""` |
| U14 | outThemeRootAttributes | density，rootAttrs `DATA-DENSITY = "x"`（大寫、等號旁空白） | `null` |
| U15 | outThemeRootAttributes | density，rootAttrs `data-density-x="1"`（相似但不同名） | 仍輸出 `data-density` |
| U16 | outThemeRootAttributes | density，rootAttrs `null` | 不拋例外，輸出 `data-density` |
| U17 | outThemeStyle | `primaryColor=null` | `null` |
| U18 | outThemeStyle | `primaryColor="#0a7d5a"` | `"<style>:root{--zk-color-primary:#0a7d5a}</style>\n"`（測試環境無 CSP，故無 nonce） |

#### 第二層：整合測試（WebDriver，真的載入頁面）

`zktest/src/test/java/org/zkoss/zktest/zats/test2/B110_ZK_6112_ThemePropertiesTest.java` + `zktest/src/main/webapp/test2/B110-ZK-6112-ThemeProperties.zul`（登錄 `config.properties`）

| # | 設定 | 預期 |
|---|---|---|
| W1 | 都未設定 | `<html>` 無 `data-density`、`data-brand`；head 中沒有我們輸出的 `<style>` |
| W2 | `density=compact` | `<html data-density="compact">`；`--zk-input-height` 計算值為 `32px`（預設 40px） |
| W3 | `brand=slate` | `<html data-brand="slate">`；`--zk-color-primary` 為 `#506274` |
| W4 | `brand=#0a7d5a` | `--zk-color-primary` 為 `#0a7d5a`；`<style>` 在 head 中排在 `zk.wcs` 的 `<link>` 之後；無 `data-brand` |
| W5 | `brand=#0a7d5a`，按頁面按鈕執行 `MarbleBrand.apply(COPPER)` | `--zk-color-primary` 變為 `#b45309`（執行期覆蓋 zk.xml 預設） |

格式驗證與 `<?root-attributes?>` 優先權由第一層涵蓋，第二層只驗證「輸出位置正確、瀏覽器真的套用、執行期仍可覆蓋」。

#### 執行順序

1. 寫好兩層測試 → 跑第一層，預期**編譯失敗**（方法尚不存在）＝紅燈。
2. 實作 `PageRenderer` → `./gradlew :zul:publishToMavenLocal` → 第一層全綠。
3. 跑第二層 → 全綠。
4. `./gradlew :zul:checkstyleMain`。

---

## 9. 實作結果（2026-10-05）

| 項目 | 結果 |
|---|---|
| 紅燈 | 測試先寫；第一次執行 `compileTestJava` 失敗（`cannot find symbol`：`PageRenderer` 尚無這些 method） |
| 第一層 `MarbleThemeDefaultsTest` | 18/18 通過 |
| 第二層 `B110_ZK_6112_ThemePropertiesTest` | 5/5 通過 |
| 回歸 `B110_ZK_6112Test` | 2/2 通過 |
| `./gradlew :zul:checkstyleMain` | 通過；為消除新增一行造成的 `VariableDeclarationUsageDistance`，`renderDesktop` 的 `number` 改為 `final` |

第二層與第一層在同一個 test source set，紅燈階段一起編譯失敗；第二層的斷言本身沒有在「未實作」狀態下單獨跑過。

### 9.1 文件（2026-10-05）

- 步驟 3 已完成：`MarbleDensity`／`MarbleBrand` Javadoc 改為優先推薦 library property（`marble-compact.css` 的過時說法已移除）；`doc/spec/data-dense-mode.md`、`doc/spec/brand-override.md` 新增 `zk.xml` 寫法與適用範圍。`brand-override.md` 原本就有淺色 seed 需覆蓋 `--zk-color-on-primary` 的說明，未改動。
- 步驟 4（zkdoc outline 第 4、5 節、Configuration Reference）與給客戶看的淺色品牌色對比警告，交由負責 zkdoc 的 session 撰寫。
