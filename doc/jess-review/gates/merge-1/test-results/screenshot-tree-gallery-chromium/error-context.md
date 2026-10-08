# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screenshot.spec.ts >> tree >> gallery
- Location: src/test/playwright/screenshot.spec.ts:798:7

# Error details

```
Error: expect(locator).toHaveScreenshot(expected) failed

Locator: locator('.z-p-8').first()
  1737 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: tree-gallery.png

Call log:
  - Expect "toHaveScreenshot(tree-gallery.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="pScU0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - 1737 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="pScU0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - captured a stable screenshot
  - 1737 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Tree
  - generic [ref=e5]:
    - generic [ref=e6]: Tree — State Gallery
    - generic [ref=e8]:
      - generic [ref=e9]: Node States
      - treegrid [ref=e10]:
        - row "Name" [ref=e14]:
          - columnheader "Name" [ref=e15]:
            - generic [ref=e16]: Name
        - generic [ref=e17]:
          - row "Leaf Node" [level=1] [ref=e20] [cursor=pointer]:
            - gridcell "Leaf Node" [ref=e21]:
              - generic [ref=e24]: Leaf Node
          - row "Expanded" [expanded] [level=1] [ref=e25] [cursor=pointer]:
            - gridcell "Expanded" [ref=e26]:
              - generic [ref=e27]:
                - generic "Close" [ref=e29]
                - generic [ref=e30]: Expanded
          - row "Child 1" [level=2] [ref=e31] [cursor=pointer]:
            - gridcell "Child 1" [ref=e32]:
              - generic [ref=e36]: Child 1
          - row "Child 2" [level=2] [ref=e37] [cursor=pointer]:
            - gridcell "Child 2" [ref=e38]:
              - generic [ref=e42]: Child 2
          - row "Collapsed" [level=1] [ref=e43] [cursor=pointer]:
            - gridcell "Collapsed" [ref=e44]:
              - generic [ref=e45]:
                - generic "Open" [ref=e47]
                - generic [ref=e48]: Collapsed
          - row "Selected selected" [level=1] [selected] [ref=e49] [cursor=pointer]:
            - gridcell "Selected" [ref=e50]:
              - generic [ref=e53]: Selected
  - generic [ref=e54]:
    - generic [ref=e55]: Basic Tree
    - treegrid [ref=e57]:
      - row "Name Description" [ref=e62]:
        - columnheader "Name" [ref=e63]:
          - generic [ref=e64]: Name
        - columnheader "Description" [ref=e65]:
          - generic [ref=e66]: Description
      - generic [ref=e67]:
        - row "Item 1Item 1 description" [level=1] [ref=e71] [cursor=pointer]:
          - gridcell "Item 1" [ref=e72]:
            - generic [ref=e75]: Item 1
          - gridcell "Item 1 description" [ref=e76]:
            - generic [ref=e77]: Item 1 description
        - row "Item 2Item 2 description" [expanded] [level=1] [ref=e78] [cursor=pointer]:
          - gridcell "Item 2" [ref=e79]:
            - generic [ref=e80]:
              - generic "Close" [ref=e82]
              - generic [ref=e83]: Item 2
          - gridcell "Item 2 description" [ref=e84]:
            - generic [ref=e85]: Item 2 description
        - row "Item 2.1" [expanded] [level=2] [ref=e86] [cursor=pointer]:
          - gridcell "Item 2.1" [ref=e87]:
            - generic [ref=e88]:
              - generic "Close" [ref=e91]
              - generic [ref=e92]: Item 2.1
          - gridcell [ref=e93]
        - row "Item 2.1.1" [level=3] [ref=e95] [cursor=pointer]:
          - gridcell "Item 2.1.1" [ref=e96]:
            - generic [ref=e101]: Item 2.1.1
          - gridcell [ref=e102]
        - row "Item 2.1.2" [level=3] [ref=e104] [cursor=pointer]:
          - gridcell "Item 2.1.2" [ref=e105]:
            - generic [ref=e110]: Item 2.1.2
          - gridcell [ref=e111]
        - row "Item 2.2" [expanded] [level=2] [ref=e113] [cursor=pointer]:
          - gridcell "Item 2.2" [ref=e114]:
            - generic [ref=e115]:
              - generic "Close" [ref=e118]
              - generic [ref=e119]: Item 2.2
          - gridcell [ref=e120]
        - row "Item 2.2.1" [level=3] [ref=e122] [cursor=pointer]:
          - gridcell "Item 2.2.1" [ref=e123]:
            - generic [ref=e128]: Item 2.2.1
          - gridcell [ref=e129]
        - row "Item 3" [level=1] [ref=e131] [cursor=pointer]:
          - gridcell "Item 3" [ref=e132]:
            - generic [ref=e135]: Item 3
          - gridcell [ref=e136]
  - generic [ref=e138]:
    - generic [ref=e139]: Tree Live Data
    - treegrid [ref=e141]:
      - generic [ref=e142]:
        - row "1" [expanded] [level=1] [ref=e143] [cursor=pointer]:
          - gridcell "1" [ref=e144]:
            - generic [ref=e145]:
              - generic "Close" [ref=e147]
              - generic [ref=e148]: "1"
        - row "3" [expanded] [level=2] [ref=e149] [cursor=pointer]:
          - gridcell "3" [ref=e150]:
            - generic [ref=e151]:
              - generic "Close" [ref=e154]
              - generic [ref=e155]: "3"
        - row "7" [expanded] [level=3] [ref=e156] [cursor=pointer]:
          - gridcell "7" [ref=e157]:
            - generic [ref=e158]:
              - generic "Close" [ref=e162]
              - generic [ref=e163]: "7"
        - row "15" [expanded] [level=4] [ref=e164] [cursor=pointer]:
          - gridcell "15" [ref=e165]:
            - generic [ref=e166]:
              - generic "Close" [ref=e171]
              - generic [ref=e172]: "15"
        - row "31" [expanded] [level=5] [ref=e173] [cursor=pointer]:
          - gridcell "31" [ref=e174]:
            - generic [ref=e175]:
              - generic "Close" [ref=e181]
              - generic [ref=e182]: "31"
        - row "63" [expanded] [level=6] [ref=e183] [cursor=pointer]:
          - gridcell "63" [ref=e184]:
            - generic [ref=e185]:
              - generic "Close" [ref=e192]
              - generic [ref=e193]: "63"
        - row "127" [expanded] [level=7] [ref=e194] [cursor=pointer]:
          - gridcell "127" [ref=e195]:
            - generic [ref=e196]:
              - generic "Close" [ref=e204]
              - generic [ref=e205]: "127"
        - row "255" [expanded] [level=8] [ref=e206] [cursor=pointer]:
          - gridcell "255" [ref=e207]:
            - generic [ref=e208]:
              - generic "Close" [ref=e217]
              - generic [ref=e218]: "255"
        - row "511" [level=9] [ref=e219] [cursor=pointer]:
          - gridcell "511" [ref=e220]:
            - generic [ref=e231]: "511"
        - row "512" [level=9] [ref=e232] [cursor=pointer]:
          - gridcell "512" [ref=e233]:
            - generic [ref=e244]: "512"
        - row "256" [level=8] [ref=e245] [cursor=pointer]:
          - gridcell "256" [ref=e246]:
            - generic [ref=e247]:
              - generic "Open" [ref=e256]
              - generic [ref=e257]: "256"
        - row "128" [level=7] [ref=e258] [cursor=pointer]:
          - gridcell "128" [ref=e259]:
            - generic [ref=e260]:
              - generic "Open" [ref=e268]
              - generic [ref=e269]: "128"
        - row "64" [level=6] [ref=e270] [cursor=pointer]:
          - gridcell "64" [ref=e271]:
            - generic [ref=e272]:
              - generic "Open" [ref=e279]
              - generic [ref=e280]: "64"
        - row "32" [level=5] [ref=e281] [cursor=pointer]:
          - gridcell "32" [ref=e282]:
            - generic [ref=e283]:
              - generic "Open" [ref=e289]
              - generic [ref=e290]: "32"
        - row "16" [level=4] [ref=e291] [cursor=pointer]:
          - gridcell "16" [ref=e292]:
            - generic [ref=e293]:
              - generic "Open" [ref=e298]
              - generic [ref=e299]: "16"
        - row "8" [level=3] [ref=e300] [cursor=pointer]:
          - gridcell "8" [ref=e301]:
            - generic [ref=e302]:
              - generic "Open" [ref=e306]
              - generic [ref=e307]: "8"
        - row "4" [level=2] [ref=e308] [cursor=pointer]:
          - gridcell "4" [ref=e309]:
            - generic [ref=e310]:
              - generic "Open" [ref=e313]
              - generic [ref=e314]: "4"
        - row "2" [expanded] [level=1] [ref=e315] [cursor=pointer]:
          - gridcell "2" [ref=e316]:
            - generic [ref=e317]:
              - generic "Close" [ref=e319]
              - generic [ref=e320]: "2"
        - row "5" [level=2] [ref=e321] [cursor=pointer]:
          - gridcell "5" [ref=e322]:
            - generic [ref=e323]:
              - generic "Open" [ref=e326]
              - generic [ref=e327]: "5"
        - row "6" [expanded] [level=2] [ref=e328] [cursor=pointer]:
          - gridcell "6" [ref=e329]:
            - generic [ref=e330]:
              - generic "Close" [ref=e333]
              - generic [ref=e334]: "6"
        - row "13" [level=3] [ref=e335] [cursor=pointer]:
          - gridcell "13" [ref=e336]:
            - generic [ref=e337]:
              - generic "Open" [ref=e341]
              - generic [ref=e342]: "13"
        - row "14" [expanded] [level=3] [ref=e343] [cursor=pointer]:
          - gridcell "14" [ref=e344]:
            - generic [ref=e345]:
              - generic "Close" [ref=e349]
              - generic [ref=e350]: "14"
        - row "29" [level=4] [ref=e351] [cursor=pointer]:
          - gridcell "29" [ref=e352]:
            - generic [ref=e353]:
              - generic "Open" [ref=e358]
              - generic [ref=e359]: "29"
        - row "30" [expanded] [level=4] [ref=e360] [cursor=pointer]:
          - gridcell "30" [ref=e361]:
            - generic [ref=e362]:
              - generic "Close" [ref=e367]
              - generic [ref=e368]: "30"
        - row "61" [level=5] [ref=e369] [cursor=pointer]:
          - gridcell "61" [ref=e370]:
            - generic [ref=e371]:
              - generic "Open" [ref=e377]
              - generic [ref=e378]: "61"
        - row "62" [expanded] [level=5] [ref=e379] [cursor=pointer]:
          - gridcell "62" [ref=e380]:
            - generic [ref=e381]:
              - generic "Close" [ref=e387]
              - generic [ref=e388]: "62"
        - row "125" [level=6] [ref=e389] [cursor=pointer]:
          - gridcell "125" [ref=e390]:
            - generic [ref=e391]:
              - generic "Open" [ref=e398]
              - generic [ref=e399]: "125"
        - row "126" [expanded] [level=6] [ref=e400] [cursor=pointer]:
          - gridcell "126" [ref=e401]:
            - generic [ref=e402]:
              - generic "Close" [ref=e409]
              - generic [ref=e410]: "126"
        - row "253" [level=7] [ref=e411] [cursor=pointer]:
          - gridcell "253" [ref=e412]:
            - generic [ref=e413]:
              - generic "Open" [ref=e421]
              - generic [ref=e422]: "253"
        - row "254" [expanded] [level=7] [ref=e423] [cursor=pointer]:
          - gridcell "254" [ref=e424]:
            - generic [ref=e425]:
              - generic "Close" [ref=e433]
              - generic [ref=e434]: "254"
        - row "509" [level=8] [ref=e435] [cursor=pointer]:
          - gridcell "509" [ref=e436]:
            - generic [ref=e446]: "509"
        - row "510" [level=8] [ref=e447] [cursor=pointer]:
          - gridcell "510" [ref=e448]:
            - generic [ref=e458]: "510"
  - generic [ref=e459]:
    - generic [ref=e460]: Tree with Checkmark
    - generic [ref=e461]:
      - generic [ref=e462]:
        - button "Toggle checkmark" [ref=e463] [cursor=pointer]
        - button "Toggle multiple" [ref=e464] [cursor=pointer]
      - treegrid [ref=e465]:
        - row "Select All Name Description" [ref=e470]:
          - columnheader "Select All Name" [ref=e471]:
            - generic [ref=e472]:
              - checkbox "Select All" [ref=e473]:
                - generic "Check" [ref=e474]
              - text: Name
          - columnheader "Description" [ref=e475]:
            - generic [ref=e476]: Description
        - generic [ref=e477]:
          - row "Item 1Item 1 description" [level=1] [ref=e481] [cursor=pointer]:
            - gridcell "checkbox Item 1" [ref=e482]:
              - generic [ref=e483]:
                - checkbox "checkbox" [ref=e484]:
                  - generic "Check" [ref=e485]
                - generic [ref=e487]: Item 1
            - gridcell "Item 1 description" [ref=e488]:
              - generic [ref=e489]: Item 1 description
          - row "Item 2Item 2 description" [expanded] [level=1] [ref=e490] [cursor=pointer]:
            - gridcell "checkbox Item 2" [ref=e491]:
              - generic [ref=e492]:
                - checkbox "checkbox" [ref=e493]:
                  - generic "Check" [ref=e494]
                - generic "Close" [ref=e496]
                - generic [ref=e497]: Item 2
            - gridcell "Item 2 description" [ref=e498]:
              - generic [ref=e499]: Item 2 description
          - row "Item 2.1" [expanded] [level=2] [ref=e500] [cursor=pointer]:
            - gridcell "checkbox Item 2.1" [ref=e501]:
              - generic [ref=e502]:
                - checkbox "checkbox" [ref=e503]:
                  - generic "Check" [ref=e504]
                - generic "Close" [ref=e507]
                - generic [ref=e508]: Item 2.1
            - gridcell [ref=e509]
          - row "Item 2.1.1" [level=3] [ref=e511] [cursor=pointer]:
            - gridcell "checkbox Item 2.1.1" [ref=e512]:
              - generic [ref=e513]:
                - checkbox "checkbox" [ref=e514]:
                  - generic "Check" [ref=e515]
                - generic [ref=e519]: Item 2.1.1
            - gridcell [ref=e520]
          - row "Item 2.1.2" [level=3] [ref=e522] [cursor=pointer]:
            - gridcell "checkbox Item 2.1.2" [ref=e523]:
              - generic [ref=e524]:
                - checkbox "checkbox" [ref=e525]:
                  - generic "Check" [ref=e526]
                - generic [ref=e530]: Item 2.1.2
            - gridcell [ref=e531]
          - row "Item 2.2Item 2.2 is something who cares" [level=2] [ref=e533] [cursor=pointer]:
            - gridcell "checkbox Item 2.2" [ref=e534]:
              - generic [ref=e535]:
                - checkbox "checkbox" [ref=e536]:
                  - generic "Check" [ref=e537]
                - generic [ref=e540]: Item 2.2
            - gridcell "Item 2.2 is something who cares" [ref=e541]:
              - generic [ref=e542]: Item 2.2 is something who cares
          - row "Item 3" [level=1] [ref=e543] [cursor=pointer]:
            - gridcell "checkbox Item 3" [ref=e544]:
              - generic [ref=e545]:
                - checkbox "checkbox" [ref=e546]:
                  - generic "Check" [ref=e547]
                - generic [ref=e549]: Item 3
            - gridcell [ref=e550]
    - generic [ref=e552]:
      - generic [ref=e553]: Single selection — renders a radio, not a checkbox
      - treegrid [ref=e554]:
        - row "Name Description" [ref=e559]:
          - columnheader "Name" [ref=e560]:
            - generic [ref=e561]: Name
          - columnheader "Description" [ref=e562]:
            - generic [ref=e563]: Description
        - generic [ref=e564]:
          - row "Item 1Item 1 description" [level=1] [ref=e568] [cursor=pointer]:
            - gridcell "checkbox Item 1" [ref=e569]:
              - generic [ref=e570]:
                - checkbox "checkbox" [ref=e571]:
                  - generic "Check" [ref=e572]
                - generic [ref=e574]: Item 1
            - gridcell "Item 1 description" [ref=e575]:
              - generic [ref=e576]: Item 1 description
          - row "Item 2Item 2 description" [expanded] [level=1] [ref=e577] [cursor=pointer]:
            - gridcell "checkbox Item 2" [ref=e578]:
              - generic [ref=e579]:
                - checkbox "checkbox" [ref=e580]:
                  - generic "Check" [ref=e581]
                - generic "Close" [ref=e583]
                - generic [ref=e584]: Item 2
            - gridcell "Item 2 description" [ref=e585]:
              - generic [ref=e586]: Item 2 description
          - row "Item 2.1 (selected)Active selected" [level=2] [selected] [ref=e587] [cursor=pointer]:
            - gridcell "checkbox Item 2.1 (selected)" [ref=e588]:
              - generic [ref=e589]:
                - checkbox "checkbox" [checked] [ref=e590]:
                  - generic "Check" [ref=e591]
                - generic [ref=e594]: Item 2.1 (selected)
            - gridcell "Active" [ref=e595]:
              - generic [ref=e596]: Active
          - row "Item 2.2" [level=2] [ref=e597] [cursor=pointer]:
            - gridcell "checkbox Item 2.2" [ref=e598]:
              - generic [ref=e599]:
                - checkbox "checkbox" [ref=e600]:
                  - generic "Check" [ref=e601]
                - generic [ref=e604]: Item 2.2
            - gridcell [ref=e605]
          - row "Item 3" [level=1] [ref=e607] [cursor=pointer]:
            - gridcell "checkbox Item 3" [ref=e608]:
              - generic [ref=e609]:
                - checkbox "checkbox" [ref=e610]:
                  - generic "Check" [ref=e611]
                - generic [ref=e613]: Item 3
            - gridcell [ref=e614]
    - generic [ref=e616]:
      - generic [ref=e617]: Tristate — toggle a child and its parent recomputes (all→checked, some→indeterminate, none→unchecked); toggle a parent and it cascades to its children
      - treegrid [ref=e618]:
        - row "Select All Node" [ref=e622]:
          - columnheader "Select All Node" [ref=e623]:
            - generic [ref=e624]:
              - checkbox "Select All" [ref=e625]
              - text: Node
        - generic [ref=e627]:
          - row "Parent A (partial)" [level=1] [ref=e630] [cursor=pointer]:
            - gridcell "checkbox Parent A (partial)" [ref=e631]:
              - generic [ref=e632]:
                - checkbox "checkbox" [ref=e633]:
                  - generic "Check" [ref=e634]
                - generic "Open" [ref=e636]
                - generic [ref=e637]: Parent A (partial)
          - row "Parent B (all selected) selected" [level=1] [selected] [ref=e638] [cursor=pointer]:
            - gridcell "checkbox Parent B (all selected)" [ref=e639]:
              - generic [ref=e640]:
                - checkbox "checkbox" [checked] [ref=e641]:
                  - generic "Check" [ref=e642]
                - generic "Open" [ref=e644]
                - generic [ref=e645]: Parent B (all selected)
          - row "Parent C (none selected)" [level=1] [ref=e646] [cursor=pointer]:
            - gridcell "checkbox Parent C (none selected)" [ref=e647]:
              - generic [ref=e648]:
                - checkbox "checkbox" [ref=e649]:
                  - generic "Check" [ref=e650]
                - generic "Open" [ref=e652]
                - generic [ref=e653]: Parent C (none selected)
  - generic [ref=e654]:
    - generic [ref=e655]: Paging with Tree
    - generic [ref=e656]:
      - generic [ref=e657]:
        - radiogroup [ref=e658]:
          - generic [ref=e659] [cursor=pointer]:
            - radio "top" [ref=e660]
            - generic [ref=e661]: top
          - generic [ref=e662] [cursor=pointer]:
            - radio "bottom" [checked] [ref=e663]
            - generic [ref=e664]: bottom
          - generic [ref=e665] [cursor=pointer]:
            - radio "both" [ref=e666]
            - generic [ref=e667]: both
        - button "Change Paging Mold" [ref=e668] [cursor=pointer]
      - treegrid [ref=e669]:
        - generic [ref=e670]:
          - row "1" [expanded] [level=1] [ref=e671] [cursor=pointer]:
            - gridcell "1" [ref=e672]:
              - generic [ref=e673]:
                - generic "Close" [ref=e675]
                - generic [ref=e676]: "1"
          - row "3" [expanded] [level=2] [ref=e677] [cursor=pointer]:
            - gridcell "3" [ref=e678]:
              - generic [ref=e679]:
                - generic "Close" [ref=e682]
                - generic [ref=e683]: "3"
          - row "7" [expanded] [level=3] [ref=e684] [cursor=pointer]:
            - gridcell "7" [ref=e685]:
              - generic [ref=e686]:
                - generic "Close" [ref=e690]
                - generic [ref=e691]: "7"
          - row "15" [expanded] [level=4] [ref=e692] [cursor=pointer]:
            - gridcell "15" [ref=e693]:
              - generic [ref=e694]:
                - generic "Close" [ref=e699]
                - generic [ref=e700]: "15"
          - row "31" [expanded] [level=5] [ref=e701] [cursor=pointer]:
            - gridcell "31" [ref=e702]:
              - generic [ref=e703]:
                - generic "Close" [ref=e709]
                - generic [ref=e710]: "31"
          - row "63" [expanded] [level=6] [ref=e711] [cursor=pointer]:
            - gridcell "63" [ref=e712]:
              - generic [ref=e713]:
                - generic "Close" [ref=e720]
                - generic [ref=e721]: "63"
          - row "127" [expanded] [level=7] [ref=e722] [cursor=pointer]:
            - gridcell "127" [ref=e723]:
              - generic [ref=e724]:
                - generic "Close" [ref=e732]
                - generic [ref=e733]: "127"
          - row "255" [expanded] [level=8] [ref=e734] [cursor=pointer]:
            - gridcell "255" [ref=e735]:
              - generic [ref=e736]:
                - generic "Close" [ref=e745]
                - generic [ref=e746]: "255"
          - row "511" [level=9] [ref=e747] [cursor=pointer]:
            - gridcell "511" [ref=e748]:
              - generic [ref=e759]: "511"
          - row "512" [level=9] [ref=e760] [cursor=pointer]:
            - gridcell "512" [ref=e761]:
              - generic [ref=e772]: "512"
          - row "256" [level=8] [ref=e773] [cursor=pointer]:
            - gridcell "256" [ref=e774]:
              - generic [ref=e775]:
                - generic "Open" [ref=e784]
                - generic [ref=e785]: "256"
          - row "128" [level=7] [ref=e786] [cursor=pointer]:
            - gridcell "128" [ref=e787]:
              - generic [ref=e788]:
                - generic "Open" [ref=e796]
                - generic [ref=e797]: "128"
          - row "64" [level=6] [ref=e798] [cursor=pointer]:
            - gridcell "64" [ref=e799]:
              - generic [ref=e800]:
                - generic "Open" [ref=e807]
                - generic [ref=e808]: "64"
          - row "32" [level=5] [ref=e809] [cursor=pointer]:
            - gridcell "32" [ref=e810]:
              - generic [ref=e811]:
                - generic "Open" [ref=e817]
                - generic [ref=e818]: "32"
          - row "16" [level=4] [ref=e819] [cursor=pointer]:
            - gridcell "16" [ref=e820]:
              - generic [ref=e821]:
                - generic "Open" [ref=e826]
                - generic [ref=e827]: "16"
        - navigation [ref=e829]:
          - button "First" [disabled]
          - button "Prev" [disabled]
          - textbox "Current page 1 out of 3" [ref=e830]: "1"
          - generic [ref=e831]: / 3
          - button "Next" [ref=e832] [cursor=pointer]
          - button "Last" [ref=e833] [cursor=pointer]
          - generic [ref=e834]:
            - generic [ref=e835]: "[ 1 - 15 / 32 ]"
            - generic [ref=e836]: Currently displaying items 1-15 out of 32
  - generic [ref=e837]:
    - generic [ref=e838]: Frozen Columns
    - treegrid [ref=e840]:
      - row "aaa bbb ccc ddd eee fff" [ref=e849]:
        - columnheader "aaa" [ref=e850]:
          - generic [ref=e851]: aaa
        - columnheader "bbb" [ref=e852]:
          - generic [ref=e853]: bbb
        - columnheader "ccc" [ref=e854]:
          - generic [ref=e855]: ccc
        - columnheader "ddd" [ref=e856]:
          - generic [ref=e857]: ddd
        - columnheader "eee" [ref=e858]:
          - generic [ref=e859]: eee
        - columnheader "fff" [ref=e860]:
          - generic [ref=e861]: fff
      - generic [ref=e862]:
        - row "111222333444555666" [level=1] [ref=e870] [cursor=pointer]:
          - gridcell "111" [ref=e871]:
            - generic [ref=e874]: "111"
          - gridcell "222" [ref=e875]:
            - generic [ref=e877]: "222"
          - gridcell "333" [ref=e878]:
            - generic [ref=e880]: "333"
          - gridcell "444" [ref=e881]:
            - generic [ref=e883]: "444"
          - gridcell "555" [ref=e884]:
            - generic [ref=e886]: "555"
          - gridcell "666" [ref=e887]:
            - generic [ref=e889]: "666"
        - row "111222333444555666" [level=1] [ref=e890] [cursor=pointer]:
          - gridcell "111" [ref=e891]:
            - generic [ref=e894]: "111"
          - gridcell "222" [ref=e895]:
            - generic [ref=e897]: "222"
          - gridcell "333" [ref=e898]:
            - generic [ref=e900]: "333"
          - gridcell "444" [ref=e901]:
            - generic [ref=e903]: "444"
          - gridcell "555" [ref=e904]:
            - generic [ref=e906]: "555"
          - gridcell "666" [ref=e907]:
            - generic [ref=e909]: "666"
        - row [level=1] [ref=e910] [cursor=pointer]:
          - gridcell [ref=e911]:
            - textbox [ref=e914]
          - gridcell [ref=e915]:
            - textbox [ref=e917]
          - gridcell [ref=e918]:
            - textbox [ref=e920]
          - gridcell [ref=e921]:
            - textbox [ref=e923]
          - gridcell [ref=e924]:
            - textbox [ref=e926]
          - gridcell [ref=e927]:
            - textbox [ref=e929]
        - row "111222333444555666" [level=1] [ref=e930] [cursor=pointer]:
          - gridcell "111" [ref=e931]:
            - generic [ref=e934]: "111"
          - gridcell "222" [ref=e935]:
            - generic [ref=e937]: "222"
          - gridcell "333" [ref=e938]:
            - generic [ref=e940]: "333"
          - gridcell "444" [ref=e941]:
            - generic [ref=e943]: "444"
          - gridcell "555" [ref=e944]:
            - generic [ref=e946]: "555"
          - gridcell "666" [ref=e947]:
            - generic [ref=e949]: "666"
        - row "111222333444555666" [level=1] [ref=e950] [cursor=pointer]:
          - gridcell "111" [ref=e951]:
            - generic [ref=e954]: "111"
          - gridcell "222" [ref=e955]:
            - generic [ref=e957]: "222"
          - gridcell "333" [ref=e958]:
            - generic [ref=e960]: "333"
          - gridcell "444" [ref=e961]:
            - generic [ref=e963]: "444"
          - gridcell "555" [ref=e964]:
            - generic [ref=e966]: "555"
          - gridcell "666" [ref=e967]:
            - generic [ref=e969]: "666"
      - generic [ref=e975]:
        - generic [ref=e983]: Footer 1
        - generic [ref=e984]: Footer 2
        - generic [ref=e985]: Footer 3
        - generic [ref=e986]: Footer 4
        - generic [ref=e987]: Footer 5
        - generic [ref=e988]: Footer 6
  - generic [ref=e989]:
    - generic [ref=e990]: Disabled State
    - generic [ref=e992]:
      - generic [ref=e993]: Individual disabled treeitems
      - treegrid [ref=e994]:
        - row "Name" [ref=e998]:
          - columnheader "Name" [ref=e999]:
            - generic [ref=e1000]: Name
        - generic [ref=e1001]:
          - row "Normal item" [level=1] [ref=e1004] [cursor=pointer]:
            - gridcell "Normal item" [ref=e1005]:
              - generic [ref=e1008]: Normal item
          - row "Disabled leaf" [level=1]:
            - gridcell "Disabled leaf":
              - generic:
                - generic: Disabled leaf
          - row "Normal parent" [expanded] [level=1] [ref=e1009] [cursor=pointer]:
            - gridcell "Normal parent" [ref=e1010]:
              - generic [ref=e1011]:
                - generic "Close" [ref=e1013]
                - generic [ref=e1014]: Normal parent
          - row "Normal child" [level=2] [ref=e1015] [cursor=pointer]:
            - gridcell "Normal child" [ref=e1016]:
              - generic [ref=e1020]: Normal child
          - row "Disabled child" [level=2]:
            - gridcell "Disabled child":
              - generic:
                - generic: Disabled child
          - row "Disabled + selected selected" [level=1] [selected]:
            - gridcell "Disabled + selected":
              - generic:
                - generic: Disabled + selected
  - generic [ref=e1021]:
    - generic [ref=e1022]: No-Border Variant (z-tree-noborder)
    - generic [ref=e1023]: A tree is an outlined card by default. Add sclass="z-tree-noborder" to strip its own frame when nesting it inside another bounded surface — here an elevated card — so it blends into the parent instead of double-framing.
    - treegrid [ref=e1025]:
      - row "Name Value" [ref=e1030]:
        - columnheader "Name" [ref=e1031]:
          - generic [ref=e1032]: Name
        - columnheader "Value" [ref=e1033]:
          - generic [ref=e1034]: Value
      - generic [ref=e1035]:
        - row "Alpha1" [expanded] [level=1] [ref=e1039] [cursor=pointer]:
          - gridcell "Alpha" [ref=e1040]:
            - generic [ref=e1041]:
              - generic "Close" [ref=e1043]
              - generic [ref=e1044]: Alpha
          - gridcell "1" [ref=e1045]:
            - generic [ref=e1047]: "1"
        - row "Alpha-11.1" [level=2] [ref=e1048] [cursor=pointer]:
          - gridcell "Alpha-1" [ref=e1049]:
            - generic [ref=e1053]: Alpha-1
          - gridcell "1.1" [ref=e1054]:
            - generic [ref=e1056]: "1.1"
        - row "Beta2" [level=1] [ref=e1057] [cursor=pointer]:
          - gridcell "Beta" [ref=e1058]:
            - generic [ref=e1061]: Beta
          - gridcell "2" [ref=e1062]:
            - generic [ref=e1064]: "2"
```

# Test source

```ts
  699 | 
  700 |   test('gallery', async ({ page }) => {
  701 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  702 |   });
  703 | 
  704 |   for (const { name, action } of hoverFocusStates) {
  705 |     test(name, async ({ page }) => {
  706 |       // Action on the inner input, capture the wrapper — the border/ring lives
  707 |       // on .z-spinner, not the transparent .z-spinner-input. (See bandbox note.)
  708 |       await action(page.locator('.z-spinner-input').first());
  709 |       await padShot(page, page.locator('.z-spinner').first(), `${DIR}-${name}.png`);
  710 |     });
  711 |   }
  712 | });
  713 | 
  714 | // -------------------------------------------------------
  715 | // Bandbox
  716 | // -------------------------------------------------------
  717 | test.describe('bandbox', () => {
  718 |   const DIR = 'bandbox';
  719 |   test.beforeEach(async ({ page }) => {
  720 |     await page.goto('/bandbox.zul');
  721 |     await page.waitForLoadState('networkidle');
  722 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  723 |   });
  724 | 
  725 |   test('gallery', async ({ page }) => {
  726 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  727 |   });
  728 | 
  729 |   for (const { name, action } of hoverFocusStates) {
  730 |     test(name, async ({ page }) => {
  731 |       // Focus/hover the inner <input> (the focusable node), but capture the
  732 |       // bordered WRAPPER: the hover border-color and the :focus-within ring are
  733 |       // painted on .z-bandbox, while .z-bandbox-input is transparent/borderless.
  734 |       // Capturing the input would clip away the very effect under test.
  735 |       await action(page.locator('.z-bandbox-input').first());
  736 |       await padShot(page, page.locator('.z-bandbox').first(), `${DIR}-${name}.png`);
  737 |     });
  738 |   }
  739 | });
  740 | 
  741 | // -------------------------------------------------------
  742 | // Selectbox
  743 | // -------------------------------------------------------
  744 | test.describe('selectbox', () => {
  745 |   const DIR = 'selectbox';
  746 |   test.beforeEach(async ({ page }) => {
  747 |     await page.goto('/selectbox.zul');
  748 |     await page.waitForLoadState('networkidle');
  749 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  750 |   });
  751 | 
  752 |   test('gallery', async ({ page }) => {
  753 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  754 |   });
  755 | 
  756 |   for (const { name, action } of hoverFocusStates) {
  757 |     test(name, async ({ page }) => {
  758 |       const el = page.locator('.z-selectbox').first();
  759 |       await action(el);
  760 |       await padShot(page, el, `${DIR}-${name}.png`);
  761 |     });
  762 |   }
  763 | });
  764 | 
  765 | // -------------------------------------------------------
  766 | // Tabbox
  767 | // -------------------------------------------------------
  768 | test.describe('tabbox', () => {
  769 |   const DIR = 'tabbox';
  770 |   test.beforeEach(async ({ page }) => {
  771 |     await page.goto('/tabbox.zul');
  772 |     await page.waitForLoadState('networkidle');
  773 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  774 |   });
  775 | 
  776 |   test('gallery', async ({ page }) => {
  777 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  778 |   });
  779 | 
  780 |   test('hover', async ({ page }) => {
  781 |     const el = page.locator('.z-tab').first();
  782 |     await el.hover();
  783 |     await expect(el).toHaveScreenshot(`${DIR}-hover.png`);
  784 |   });
  785 | });
  786 | 
  787 | // -------------------------------------------------------
  788 | // Tree
  789 | // -------------------------------------------------------
  790 | test.describe('tree', () => {
  791 |   const DIR = 'tree';
  792 |   test.beforeEach(async ({ page }) => {
  793 |     await page.goto('/tree.zul');
  794 |     await page.waitForLoadState('networkidle');
  795 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  796 |   });
  797 | 
  798 |   test('gallery', async ({ page }) => {
> 799 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
      |                                                  ^ Error: expect(locator).toHaveScreenshot(expected) failed
  800 |   });
  801 | 
  802 |   test('hover', async ({ page }) => {
  803 |     const el = page.locator('.z-treerow').first();
  804 |     await el.hover();
  805 |     await expect(el).toHaveScreenshot(`${DIR}-hover.png`);
  806 |   });
  807 | });
  808 | 
  809 | // -------------------------------------------------------
  810 | // Window
  811 | // -------------------------------------------------------
  812 | test.describe('window', () => {
  813 |   const DIR = 'window';
  814 |   test.beforeEach(async ({ page }) => {
  815 |     await page.goto('/window.zul');
  816 |     await page.waitForLoadState('networkidle');
  817 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  818 |   });
  819 | 
  820 |   test('gallery', async ({ page }) => {
  821 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  822 |   });
  823 | });
  824 | 
  825 | // -------------------------------------------------------
  826 | // Panel
  827 | // -------------------------------------------------------
  828 | test.describe('panel', () => {
  829 |   const DIR = 'panel';
  830 |   test.beforeEach(async ({ page }) => {
  831 |     await page.goto('/panel.zul');
  832 |     await page.waitForLoadState('networkidle');
  833 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  834 |   });
  835 | 
  836 |   test('gallery', async ({ page }) => {
  837 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  838 |   });
  839 | });
  840 | 
  841 | // -------------------------------------------------------
  842 | // Navbar — selected item is a rounded tonal container, NO left accent
  843 | // -------------------------------------------------------
  844 | // The selected navitem's active marker is the rounded tonal CONTAINER alone
  845 | // (12% primary tint fill + primary text + weight 600) — MD3 Navigation Drawer /
  846 | // MUI ListItemButton. There is NO left-edge accent: an earlier iteration added a
  847 | // left bar (first a radius-clipped `border-left` arc, then a straight `::after`
  848 | // strip), but stacking a classic-sidebar bar on the MD3 pill is redundant and
  849 | // clashes at the corners, so the bar was dropped (design review 2026-07-07). This
  850 | // guards against either accent re-appearing. NB: the `.z-listitem` "blue left
  851 | // line" is a *focus* indicator (`box-shadow: inset 3px 0 0`), a different
  852 | // component/state — not this. Gallery breadth is owned by gallery-scan.spec.ts
  853 | // (the static gallery has no selected item). See doc/skill-gaps.md 2026-07-07 and
  854 | // doc/contracts/navbar.md c7.
  855 | test.describe('navbar', () => {
  856 |   test.beforeEach(async ({ page }) => {
  857 |     await page.goto('/navbar.zul');
  858 |     await page.waitForLoadState('networkidle');
  859 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  860 |   });
  861 | 
  862 |   test('selected item is a rounded tonal container with no left accent', async ({ page }) => {
  863 |     // Select the first item in the expanded vertical navbar via a real click.
  864 |     await page.locator('.z-navbar-vertical .z-navitem-content').first().click();
  865 |     const selected = page.locator('.z-navbar-vertical .z-navitem-selected > .z-navitem-content').first();
  866 |     await selected.waitFor({ state: 'visible' });
  867 | 
  868 |     const m = await selected.evaluate((el) => {
  869 |       // Handles rgb/rgba AND the slash-alpha form Chrome uses for color-mix()
  870 |       // results (e.g. `oklab(L a b / 0.12)`, `color(srgb r g b / 0.12)`).
  871 |       const alphaOf = (s: string) => {
  872 |         if (!s || s === 'transparent') return 0;
  873 |         const slash = s.match(/\/\s*([\d.]+)\s*\)/);
  874 |         if (slash) return parseFloat(slash[1]);
  875 |         const mm = s.match(/rgba?\(([^)]+)\)/);
  876 |         if (!mm) return 1; // opaque named/hex-resolved colour
  877 |         const p = mm[1].split(',').map((x) => x.trim());
  878 |         return p.length === 4 ? parseFloat(p[3]) : 1;
  879 |       };
  880 |       const cs = getComputedStyle(el);
  881 |       const after = getComputedStyle(el, '::after');
  882 |       return {
  883 |         borderTopLeftRadius: parseFloat(cs.borderTopLeftRadius) || 0,
  884 |         bgAlpha: alphaOf(cs.backgroundColor),
  885 |         borderLeftWidth: parseFloat(cs.borderLeftWidth) || 0,
  886 |         borderLeftAlpha: alphaOf(cs.borderLeftColor),
  887 |         afterContent: after.content,
  888 |         afterWidth: parseFloat(after.width) || 0,
  889 |       };
  890 |     });
  891 | 
  892 |     // Active marker = the rounded tonal container: a rounded corner + a visible
  893 |     // tint fill. Both must be present.
  894 |     expect(m.borderTopLeftRadius, 'selected item must be a rounded container').toBeGreaterThan(0);
  895 |     expect(m.bgAlpha, 'selected item must carry the tonal tint fill').toBeGreaterThan(0);
  896 |     // NO left accent of any kind. (a) not a coloured border-left…
  897 |     const borderAccent = m.borderLeftWidth > 0 && m.borderLeftAlpha > 0.1;
  898 |     expect(
  899 |       borderAccent,
```