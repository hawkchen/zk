// C3 (D22-B check 3): for each new dropdown/chip baseline, reproduce the shot's state on the
// live page exactly as screenshot.spec.ts does, then compare
//   (a) the item's background in the committed baseline PNG (dominant colour of the item box,
//       which excludes glyph pixels, plus one padding pixel),
//   (b) the item's live computed background-color, and
//   (c) --zk-color-secondary-container resolved on a probe element.
// Read-only: never calls toHaveScreenshot. Copied into the scratch mut/ dir by make-mut.js.
import { test, expect, Locator, Page } from '@playwright/test';
import * as fs from 'fs';
import { createRequire } from 'module';

const SHOTS = '/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/doc/screenshots';
const req = createRequire('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/package.json');
const { PNG } = req('playwright-core/lib/utilsBundle');
const PAD = 12;

async function toRgb(page: Page, color: string) {
  return page.evaluate((c) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 1;
    const g = cv.getContext('2d')!; g.fillStyle = '#fff'; g.fillRect(0, 0, 1, 1);
    g.fillStyle = c; g.fillRect(0, 0, 1, 1);
    return Array.from(g.getImageData(0, 0, 1, 1).data);
  }, color);
}

async function measure(page: Page, target: Locator, item: Locator, file: string) {
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  const x0 = Math.max(0, box.x - PAD), y0 = Math.max(0, box.y - PAD);
  const r = (await item.boundingBox())!;
  const live = await item.evaluate((el) => {
    const bg = getComputedStyle(el).backgroundColor;
    const probe = document.createElement('div');
    probe.style.background = 'var(--zk-color-secondary-container)';
    el.parentElement!.appendChild(probe);
    const sc = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return { bg, sc, cls: (el as HTMLElement).className };
  });
  const png = PNG.sync.read(fs.readFileSync(`${SHOTS}/${file}`));
  const px = (x: number, y: number) => { const i = (y * png.width + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
  // item rect in PNG coordinates, inset 1px to stay off the edge
  const ix0 = Math.ceil(r.x - x0) + 1, iy0 = Math.ceil(r.y - y0) + 1;
  const ix1 = Math.floor(r.x + r.width - x0) - 2, iy1 = Math.floor(r.y + r.height - y0) - 2;
  const hist = new Map<string, number>();
  let total = 0;
  for (let y = iy0; y <= iy1; y++) for (let x = ix0; x <= ix1; x++) {
    const k = px(x, y).join(','); hist.set(k, (hist.get(k) ?? 0) + 1); total++;
  }
  const top = [...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const padPt = [ix0 + 2, Math.round((iy0 + iy1) / 2)];
  return {
    file, png: [png.width, png.height], clip: [x0, y0, box.x + box.width + PAD - x0, box.y + box.height + PAD - y0].map((v) => +v.toFixed(1)),
    itemCls: live.cls, itemRectInPng: [ix0, iy0, ix1, iy1], dominant: top.map(([k, n]) => `${k} x${n}/${total}`),
    paddingPixel: { at: padPt, rgb: px(padPt[0], padPt[1]) },
    liveBg: live.bg, liveBgRgb: (await toRgb(page, live.bg)).slice(0, 3),
    secondaryContainer: live.sc, secondaryContainerRgb: (await toRgb(page, live.sc)).slice(0, 3),
  };
}

const results: unknown[] = [];
test.afterAll(() => {
  fs.writeFileSync(process.env.C3_OUT ?? '/dev/stdout', JSON.stringify(results, null, 2));
});

test('c3 combobox-dropdown', async ({ page }) => {
  await page.goto('/combobox.zul');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.locator('.z-combobox-button').first().click();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.mouse.move(0, 0);
  const popup = page.locator('.z-combobox-popup.z-combobox-open');
  await expect(popup).toBeVisible();
  const item = popup.locator('.z-comboitem-selected');
  await expect(item).toHaveCount(1);
  await page.waitForTimeout(600);
  results.push(await measure(page, popup, item, 'combobox-dropdown.png'));
});

test('c3 searchbox-dropdown', async ({ page }) => {
  await page.goto('/searchbox.zul');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready.then(() => true));
  await page.locator('.z-searchbox:not(.z-searchbox-disabled)').nth(1).click();
  await page.mouse.move(0, 0);
  const popup = page.locator('.z-searchbox-popup:visible');
  await expect(popup).toHaveCount(1);
  const item = popup.locator('.z-searchbox-selected');
  await expect(item).toHaveCount(1);
  await page.waitForTimeout(600);
  results.push(await measure(page, popup, item, 'searchbox-dropdown.png'));
});

test('c3 chosenbox-chip-focus', async ({ page }) => {
  await page.goto('/chosenbox.zul');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready.then(() => true));
  const box = page.locator('.z-chosenbox:has(.z-chosenbox-item)').first();
  await box.locator('.z-chosenbox-item').first().click();
  await page.mouse.move(0, 0);
  const item = page.locator('.z-chosenbox-item-focus');
  await expect(item).toHaveCount(1);
  await page.waitForTimeout(600);
  results.push(await measure(page, box, item, 'chosenbox-chip-focus.png'));
});
