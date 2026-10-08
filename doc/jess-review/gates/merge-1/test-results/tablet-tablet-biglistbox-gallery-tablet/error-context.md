# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tablet.spec.ts >> tablet-biglistbox >> gallery
- Location: src/test/playwright/tablet.spec.ts:469:9

# Error details

```
Error: expect(locator).toHaveScreenshot(expected) failed

Locator: locator('.z-p-8').first()
  38 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: biglistbox-tablet.png

Call log:
  - Expect "toHaveScreenshot(biglistbox-tablet.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="c2hX0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - 38 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="c2hX0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - captured a stable screenshot
  - 38 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Biglistbox
  - generic [ref=e5]:
    - generic [ref=e6]: oddRowSclass Striping
    - generic [ref=e7]:
      - generic [ref=e8]: oddRowSclass="z-biglistbox-odd" (5 rows)
      - grid [ref=e9]:
        - generic [ref=e10]:
          - table [ref=e13]:
            - rowgroup [ref=e14]:
              - row [ref=e15]:
                - columnheader [ref=e16]
                - columnheader [ref=e17]
                - columnheader [ref=e18]
                - columnheader [ref=e19]
                - columnheader [ref=e20]
            - rowgroup [ref=e21]:
              - row "Header x = 0 Header x = 1 Header x = 2 Header x = 3 Header x = 4" [ref=e22]:
                - columnheader "Header x = 0" [ref=e23] [cursor=pointer]:
                  - generic [ref=e25]: Header x = 0
                - columnheader "Header x = 1" [ref=e26] [cursor=pointer]:
                  - generic [ref=e28]: Header x = 1
                - columnheader "Header x = 2" [ref=e29] [cursor=pointer]:
                  - generic [ref=e31]: Header x = 2
                - columnheader "Header x = 3" [ref=e32] [cursor=pointer]:
                  - generic [ref=e34]: Header x = 3
                - columnheader "Header x = 4" [ref=e35] [cursor=pointer]:
                  - generic [ref=e37]: Header x = 4
          - table [ref=e40]:
            - rowgroup [ref=e41]:
              - row [ref=e42]:
                - columnheader [ref=e43]
                - columnheader [ref=e44]
                - columnheader [ref=e45]
                - columnheader [ref=e46]
                - columnheader [ref=e47]
            - rowgroup [ref=e48]:
              - row "y = 0y = 0y = 0y = 0y = 0" [ref=e49]:
                - gridcell "y = 0" [ref=e50]:
                  - generic [ref=e51]: y = 0
                - gridcell "y = 0" [ref=e52]:
                  - generic [ref=e53]: y = 0
                - gridcell "y = 0" [ref=e54]:
                  - generic [ref=e55]: y = 0
                - gridcell "y = 0" [ref=e56]:
                  - generic [ref=e57]: y = 0
                - gridcell "y = 0" [ref=e58]:
                  - generic [ref=e59]: y = 0
              - row "y = 1y = 1y = 1y = 1y = 1" [ref=e60]:
                - gridcell "y = 1" [ref=e61]:
                  - generic [ref=e62]: y = 1
                - gridcell "y = 1" [ref=e63]:
                  - generic [ref=e64]: y = 1
                - gridcell "y = 1" [ref=e65]:
                  - generic [ref=e66]: y = 1
                - gridcell "y = 1" [ref=e67]:
                  - generic [ref=e68]: y = 1
                - gridcell "y = 1" [ref=e69]:
                  - generic [ref=e70]: y = 1
              - row "y = 2y = 2y = 2y = 2y = 2" [ref=e71]:
                - gridcell "y = 2" [ref=e72]:
                  - generic [ref=e73]: y = 2
                - gridcell "y = 2" [ref=e74]:
                  - generic [ref=e75]: y = 2
                - gridcell "y = 2" [ref=e76]:
                  - generic [ref=e77]: y = 2
                - gridcell "y = 2" [ref=e78]:
                  - generic [ref=e79]: y = 2
                - gridcell "y = 2" [ref=e80]:
                  - generic [ref=e81]: y = 2
              - row "y = 3y = 3y = 3y = 3y = 3" [ref=e82]:
                - gridcell "y = 3" [ref=e83]:
                  - generic [ref=e84]: y = 3
                - gridcell "y = 3" [ref=e85]:
                  - generic [ref=e86]: y = 3
                - gridcell "y = 3" [ref=e87]:
                  - generic [ref=e88]: y = 3
                - gridcell "y = 3" [ref=e89]:
                  - generic [ref=e90]: y = 3
                - gridcell "y = 3" [ref=e91]:
                  - generic [ref=e92]: y = 3
              - row "y = 4y = 4y = 4y = 4y = 4" [ref=e93]:
                - gridcell "y = 4" [ref=e94]:
                  - generic [ref=e95]: y = 4
                - gridcell "y = 4" [ref=e96]:
                  - generic [ref=e97]: y = 4
                - gridcell "y = 4" [ref=e98]:
                  - generic [ref=e99]: y = 4
                - gridcell "y = 4" [ref=e100]:
                  - generic [ref=e101]: y = 4
                - gridcell "y = 4" [ref=e102]:
                  - generic [ref=e103]: y = 4
  - generic [ref=e106]:
    - generic [ref=e107]: Controls
    - generic [ref=e108]:
      - generic [ref=e110]:
        - generic [ref=e112]:
          - generic [ref=e113]: "Change Models:"
          - combobox [ref=e115] [cursor=pointer]:
            - option "NonHeader" [selected]
            - option "MultipleHeader"
            - option "SingleColumn"
            - option "MultipleColumn"
            - option "HugeColumn"
            - option "SingleRow"
            - option "MultipleRow"
            - option "HugeRow"
            - option "BigData"
          - generic [ref=e116]: "Change V/Hflex:"
          - radiogroup [ref=e118]:
            - generic [ref=e119] [cursor=pointer]:
              - radio "1" [checked] [ref=e120]
              - generic [ref=e121]: "1"
            - generic [ref=e122] [cursor=pointer]:
              - radio "min" [ref=e123]
              - generic [ref=e124]: min
        - generic [ref=e126]:
          - generic [ref=e127]: "Change fixForzenCols:"
          - radiogroup [ref=e129]:
            - generic [ref=e130] [cursor=pointer]:
              - radio "Disable" [checked] [ref=e131]
              - generic [ref=e132]: Disable
            - generic [ref=e133] [cursor=pointer]:
              - radio "Enable" [ref=e134]
              - generic [ref=e135]: Enable
          - generic [ref=e136]: "Change frozenCols:"
          - combobox [ref=e138] [cursor=pointer]:
            - option "0" [selected]
            - option "1"
            - option "2"
            - option "3"
            - option "4"
            - option "5"
            - option "6"
            - option "7"
            - option "8"
            - option "9"
          - generic [ref=e139]: "Change cols:"
          - combobox [ref=e141] [cursor=pointer]:
            - option "5"
            - option "10"
            - option "15"
            - option "20"
          - generic [ref=e142]: "Change rows:"
          - combobox [ref=e144] [cursor=pointer]:
            - option "5"
            - option "10"
            - option "15"
            - option "20"
        - generic [ref=e146]:
          - generic [ref=e147]: "Invalidate should look the same as before:"
          - button "invalidate" [ref=e149] [cursor=pointer]
      - grid [ref=e151]:
        - generic [ref=e152]:
          - table [ref=e155]:
            - rowgroup [ref=e156]:
              - row [ref=e157]:
                - columnheader [ref=e158]
                - columnheader [ref=e159]
                - columnheader [ref=e160]
                - columnheader [ref=e161]
                - columnheader [ref=e162]
                - columnheader [ref=e163]
                - columnheader [ref=e164]
                - columnheader [ref=e165]
                - columnheader [ref=e166]
                - columnheader [ref=e167]
                - columnheader [ref=e168]
                - columnheader [ref=e169]
                - columnheader [ref=e170]
                - columnheader [ref=e171]
                - columnheader [ref=e172]
                - columnheader [ref=e173]
                - columnheader [ref=e174]
                - columnheader [ref=e175]
                - columnheader [ref=e176]
                - columnheader [ref=e177]
                - columnheader [ref=e178]
                - columnheader [ref=e179]
                - columnheader [ref=e180]
                - columnheader [ref=e181]
                - columnheader [ref=e182]
                - columnheader [ref=e183]
                - columnheader [ref=e184]
                - columnheader [ref=e185]
                - columnheader [ref=e186]
                - columnheader [ref=e187]
                - columnheader [ref=e188]
            - rowgroup [ref=e189]:
              - row "Header x = 0 Header x = 1 Header x = 2 Header x = 3 Header x = 4 Header x = 5 Header x = 6 Header x = 7 Header x = 8 Header x = 9 Header x = 10 Header x = 11 Header x = 12 Header x = 13 Header x = 14 Header x = 15 Header x = 16 Header x = 17 Header x = 18 Header x = 19 Header x = 20 Header x = 21 Header x = 22 Header x = 23 Header x = 24 Header x = 25 Header x = 26 Header x = 27 Header x = 28 Header x = 29 Header x = 30" [ref=e190]:
                - columnheader "Header x = 0" [ref=e191] [cursor=pointer]:
                  - generic "x=0,y=0" [ref=e193]: Header x = 0
                - columnheader "Header x = 1" [ref=e194] [cursor=pointer]:
                  - generic "x=1,y=0" [ref=e196]: Header x = 1
                - columnheader "Header x = 2" [ref=e197] [cursor=pointer]:
                  - generic "x=2,y=0" [ref=e199]: Header x = 2
                - columnheader "Header x = 3" [ref=e200] [cursor=pointer]:
                  - generic "x=3,y=0" [ref=e202]: Header x = 3
                - columnheader "Header x = 4" [ref=e203] [cursor=pointer]:
                  - generic "x=4,y=0" [ref=e205]: Header x = 4
                - columnheader "Header x = 5" [ref=e206] [cursor=pointer]:
                  - generic "x=5,y=0" [ref=e208]: Header x = 5
                - columnheader "Header x = 6" [ref=e209] [cursor=pointer]:
                  - generic "x=6,y=0" [ref=e211]: Header x = 6
                - columnheader "Header x = 7" [ref=e212] [cursor=pointer]:
                  - generic "x=7,y=0" [ref=e214]: Header x = 7
                - columnheader "Header x = 8" [ref=e215] [cursor=pointer]:
                  - generic "x=8,y=0" [ref=e217]: Header x = 8
                - columnheader "Header x = 9" [ref=e218] [cursor=pointer]:
                  - generic "x=9,y=0" [ref=e220]: Header x = 9
                - columnheader "Header x = 10" [ref=e221] [cursor=pointer]:
                  - generic "x=10,y=0" [ref=e223]: Header x = 10
                - columnheader "Header x = 11" [ref=e224] [cursor=pointer]:
                  - generic "x=11,y=0" [ref=e226]: Header x = 11
                - columnheader "Header x = 12" [ref=e227] [cursor=pointer]:
                  - generic "x=12,y=0" [ref=e229]: Header x = 12
                - columnheader "Header x = 13" [ref=e230] [cursor=pointer]:
                  - generic "x=13,y=0" [ref=e232]: Header x = 13
                - columnheader "Header x = 14" [ref=e233] [cursor=pointer]:
                  - generic "x=14,y=0" [ref=e235]: Header x = 14
                - columnheader "Header x = 15" [ref=e236] [cursor=pointer]:
                  - generic "x=15,y=0" [ref=e238]: Header x = 15
                - columnheader "Header x = 16" [ref=e239] [cursor=pointer]:
                  - generic "x=16,y=0" [ref=e241]: Header x = 16
                - columnheader "Header x = 17" [ref=e242] [cursor=pointer]:
                  - generic "x=17,y=0" [ref=e244]: Header x = 17
                - columnheader "Header x = 18" [ref=e245] [cursor=pointer]:
                  - generic "x=18,y=0" [ref=e247]: Header x = 18
                - columnheader "Header x = 19" [ref=e248] [cursor=pointer]:
                  - generic "x=19,y=0" [ref=e250]: Header x = 19
                - columnheader "Header x = 20" [ref=e251] [cursor=pointer]:
                  - generic "x=20,y=0" [ref=e253]: Header x = 20
                - columnheader "Header x = 21" [ref=e254] [cursor=pointer]:
                  - generic "x=21,y=0" [ref=e256]: Header x = 21
                - columnheader "Header x = 22" [ref=e257] [cursor=pointer]:
                  - generic "x=22,y=0" [ref=e259]: Header x = 22
                - columnheader "Header x = 23" [ref=e260] [cursor=pointer]:
                  - generic "x=23,y=0" [ref=e262]: Header x = 23
                - columnheader "Header x = 24" [ref=e263] [cursor=pointer]:
                  - generic "x=24,y=0" [ref=e265]: Header x = 24
                - columnheader "Header x = 25" [ref=e266] [cursor=pointer]:
                  - generic "x=25,y=0" [ref=e268]: Header x = 25
                - columnheader "Header x = 26" [ref=e269] [cursor=pointer]:
                  - generic "x=26,y=0" [ref=e271]: Header x = 26
                - columnheader "Header x = 27" [ref=e272] [cursor=pointer]:
                  - generic "x=27,y=0" [ref=e274]: Header x = 27
                - columnheader "Header x = 28" [ref=e275] [cursor=pointer]:
                  - generic "x=28,y=0" [ref=e277]: Header x = 28
                - columnheader "Header x = 29" [ref=e278] [cursor=pointer]:
                  - generic "x=29,y=0" [ref=e280]: Header x = 29
                - columnheader "Header x = 30" [ref=e281] [cursor=pointer]:
                  - generic "x=30,y=0" [ref=e283]: Header x = 30
          - table [ref=e286]:
            - rowgroup [ref=e287]:
              - row [ref=e288]:
                - columnheader [ref=e289]
                - columnheader [ref=e290]
                - columnheader [ref=e291]
                - columnheader [ref=e292]
                - columnheader [ref=e293]
                - columnheader [ref=e294]
                - columnheader [ref=e295]
                - columnheader [ref=e296]
                - columnheader [ref=e297]
                - columnheader [ref=e298]
                - columnheader [ref=e299]
                - columnheader [ref=e300]
                - columnheader [ref=e301]
                - columnheader [ref=e302]
                - columnheader [ref=e303]
                - columnheader [ref=e304]
                - columnheader [ref=e305]
                - columnheader [ref=e306]
                - columnheader [ref=e307]
                - columnheader [ref=e308]
                - columnheader [ref=e309]
                - columnheader [ref=e310]
                - columnheader [ref=e311]
                - columnheader [ref=e312]
                - columnheader [ref=e313]
                - columnheader [ref=e314]
                - columnheader [ref=e315]
                - columnheader [ref=e316]
                - columnheader [ref=e317]
                - columnheader [ref=e318]
                - columnheader [ref=e319]
            - rowgroup [ref=e320]:
              - row "y = 0 y = 0 y = 0 y = 0 y = 0 y = 0" [ref=e321]:
                - gridcell "y = 0" [ref=e322]:
                  - generic "x=0,y=0" [ref=e323]: y = 0
                - gridcell "y = 0" [ref=e324]:
                  - generic "x=1,y=0" [ref=e325]: y = 0
                - gridcell "y = 0" [ref=e326]:
                  - generic "x=2,y=0" [ref=e327]: y = 0
                - gridcell "y = 0" [ref=e328]:
                  - generic "x=3,y=0" [ref=e329]: y = 0
                - gridcell "y = 0" [ref=e330]:
                  - generic "x=4,y=0" [ref=e331]: y = 0
                - gridcell "y = 0" [ref=e332]:
                  - generic "x=5,y=0" [ref=e333]: y = 0
              - row "y = 1 y = 1 y = 1 y = 1 y = 1 y = 1" [ref=e334]:
                - gridcell "y = 1" [ref=e335]:
                  - generic "x=0,y=1" [ref=e336]: y = 1
                - gridcell "y = 1" [ref=e337]:
                  - generic "x=1,y=1" [ref=e338]: y = 1
                - gridcell "y = 1" [ref=e339]:
                  - generic "x=2,y=1" [ref=e340]: y = 1
                - gridcell "y = 1" [ref=e341]:
                  - generic "x=3,y=1" [ref=e342]: y = 1
                - gridcell "y = 1" [ref=e343]:
                  - generic "x=4,y=1" [ref=e344]: y = 1
                - gridcell "y = 1" [ref=e345]:
                  - generic "x=5,y=1" [ref=e346]: y = 1
              - row "y = 2 y = 2 y = 2 y = 2 y = 2 y = 2" [ref=e347]:
                - gridcell "y = 2" [ref=e348]:
                  - generic "x=0,y=2" [ref=e349]: y = 2
                - gridcell "y = 2" [ref=e350]:
                  - generic "x=1,y=2" [ref=e351]: y = 2
                - gridcell "y = 2" [ref=e352]:
                  - generic "x=2,y=2" [ref=e353]: y = 2
                - gridcell "y = 2" [ref=e354]:
                  - generic "x=3,y=2" [ref=e355]: y = 2
                - gridcell "y = 2" [ref=e356]:
                  - generic "x=4,y=2" [ref=e357]: y = 2
                - gridcell "y = 2" [ref=e358]:
                  - generic "x=5,y=2" [ref=e359]: y = 2
              - row "y = 3 y = 3 y = 3 y = 3 y = 3 y = 3" [ref=e360]:
                - gridcell "y = 3" [ref=e361]:
                  - generic "x=0,y=3" [ref=e362]: y = 3
                - gridcell "y = 3" [ref=e363]:
                  - generic "x=1,y=3" [ref=e364]: y = 3
                - gridcell "y = 3" [ref=e365]:
                  - generic "x=2,y=3" [ref=e366]: y = 3
                - gridcell "y = 3" [ref=e367]:
                  - generic "x=3,y=3" [ref=e368]: y = 3
                - gridcell "y = 3" [ref=e369]:
                  - generic "x=4,y=3" [ref=e370]: y = 3
                - gridcell "y = 3" [ref=e371]:
                  - generic "x=5,y=3" [ref=e372]: y = 3
              - row "y = 4 y = 4 y = 4 y = 4 y = 4 y = 4" [ref=e373]:
                - gridcell "y = 4" [ref=e374]:
                  - generic "x=0,y=4" [ref=e375]: y = 4
                - gridcell "y = 4" [ref=e376]:
                  - generic "x=1,y=4" [ref=e377]: y = 4
                - gridcell "y = 4" [ref=e378]:
                  - generic "x=2,y=4" [ref=e379]: y = 4
                - gridcell "y = 4" [ref=e380]:
                  - generic "x=3,y=4" [ref=e381]: y = 4
                - gridcell "y = 4" [ref=e382]:
                  - generic "x=4,y=4" [ref=e383]: y = 4
                - gridcell "y = 4" [ref=e384]:
                  - generic "x=5,y=4" [ref=e385]: y = 4
              - row "y = 5 y = 5 y = 5 y = 5 y = 5 y = 5" [ref=e386]:
                - gridcell "y = 5" [ref=e387]:
                  - generic "x=0,y=5" [ref=e388]: y = 5
                - gridcell "y = 5" [ref=e389]:
                  - generic "x=1,y=5" [ref=e390]: y = 5
                - gridcell "y = 5" [ref=e391]:
                  - generic "x=2,y=5" [ref=e392]: y = 5
                - gridcell "y = 5" [ref=e393]:
                  - generic "x=3,y=5" [ref=e394]: y = 5
                - gridcell "y = 5" [ref=e395]:
                  - generic "x=4,y=5" [ref=e396]: y = 5
                - gridcell "y = 5" [ref=e397]:
                  - generic "x=5,y=5" [ref=e398]: y = 5
              - row "y = 6 y = 6 y = 6 y = 6 y = 6 y = 6" [ref=e399]:
                - gridcell "y = 6" [ref=e400]:
                  - generic "x=0,y=6" [ref=e401]: y = 6
                - gridcell "y = 6" [ref=e402]:
                  - generic "x=1,y=6" [ref=e403]: y = 6
                - gridcell "y = 6" [ref=e404]:
                  - generic "x=2,y=6" [ref=e405]: y = 6
                - gridcell "y = 6" [ref=e406]:
                  - generic "x=3,y=6" [ref=e407]: y = 6
                - gridcell "y = 6" [ref=e408]:
                  - generic "x=4,y=6" [ref=e409]: y = 6
                - gridcell "y = 6" [ref=e410]:
                  - generic "x=5,y=6" [ref=e411]: y = 6
              - row "y = 7 y = 7 y = 7 y = 7 y = 7 y = 7" [ref=e412]:
                - gridcell "y = 7" [ref=e413]:
                  - generic "x=0,y=7" [ref=e414]: y = 7
                - gridcell "y = 7" [ref=e415]:
                  - generic "x=1,y=7" [ref=e416]: y = 7
                - gridcell "y = 7" [ref=e417]:
                  - generic "x=2,y=7" [ref=e418]: y = 7
                - gridcell "y = 7" [ref=e419]:
                  - generic "x=3,y=7" [ref=e420]: y = 7
                - gridcell "y = 7" [ref=e421]:
                  - generic "x=4,y=7" [ref=e422]: y = 7
                - gridcell "y = 7" [ref=e423]:
                  - generic "x=5,y=7" [ref=e424]: y = 7
              - row "y = 8 y = 8 y = 8 y = 8 y = 8 y = 8" [ref=e425]:
                - gridcell "y = 8" [ref=e426]:
                  - generic "x=0,y=8" [ref=e427]: y = 8
                - gridcell "y = 8" [ref=e428]:
                  - generic "x=1,y=8" [ref=e429]: y = 8
                - gridcell "y = 8" [ref=e430]:
                  - generic "x=2,y=8" [ref=e431]: y = 8
                - gridcell "y = 8" [ref=e432]:
                  - generic "x=3,y=8" [ref=e433]: y = 8
                - gridcell "y = 8" [ref=e434]:
                  - generic "x=4,y=8" [ref=e435]: y = 8
                - gridcell "y = 8" [ref=e436]:
                  - generic "x=5,y=8" [ref=e437]: y = 8
              - row "y = 9 y = 9 y = 9 y = 9 y = 9 y = 9" [ref=e438]:
                - gridcell "y = 9" [ref=e439]:
                  - generic "x=0,y=9" [ref=e440]: y = 9
                - gridcell "y = 9" [ref=e441]:
                  - generic "x=1,y=9" [ref=e442]: y = 9
                - gridcell "y = 9" [ref=e443]:
                  - generic "x=2,y=9" [ref=e444]: y = 9
                - gridcell "y = 9" [ref=e445]:
                  - generic "x=3,y=9" [ref=e446]: y = 9
                - gridcell "y = 9" [ref=e447]:
                  - generic "x=4,y=9" [ref=e448]: y = 9
                - gridcell "y = 9" [ref=e449]:
                  - generic "x=5,y=9" [ref=e450]: y = 9
```

# Test source

```ts
  374 |       .toBeLessThanOrEqual(2);
  375 |     expect(r.top!, `sheet top is ${r.top}px (off-screen above)`).toBeGreaterThanOrEqual(0);
  376 |   });
  377 | });
  378 | 
  379 | // -------------------------------------------------------
  380 | // Visual baselines at tablet size — capture the page wrapper (.z-p-8)
  381 | // -------------------------------------------------------
  382 | // maxDiffPixelRatio: opt-in tolerance for pages with a known sub-1% render
  383 | // flake (font-load / CSS-transition settle timing). tabbox's selection-indicator
  384 | // transition produces ~176px (0.01 ratio) of transient diff; a 0.02 ceiling
  385 | // absorbs it while any real regression (far larger) still fails. Other pages keep
  386 | // zero tolerance. See memory: window/panel/tabbox/toast are the known-flaky set.
  387 | type VisualCase = { name: string; url: string; maxDiffPixelRatio?: number };
  388 | 
  389 | // COVERAGE RULE: every component whose rendering changes on a mobile UA must
  390 | // have a tablet baseline. The authoritative source of "what changes" is the
  391 | // tablet bundle `src/main/resources/web/zkmax/css/tablet/` — every root `.z-*`
  392 | // class targeted by a partial there maps to a page below. When a partial starts
  393 | // (or stops) styling a component, add (or remove) its page here.
  394 | //   _inputs.css    → textbox, intbox, longbox, doublebox, decimalbox,
  395 | //                    passwordbox(=textbox page), combobox, bandbox, datebox,
  396 | //                    timebox, spinner, doublespinner
  397 | //   _selection.css → checkbox, radiogroup
  398 | //   _slider.css    → slider (touch-enlarged knob)
  399 | //   _buttons.css   → button, combobutton, toolbar(.z-toolbarbutton),
  400 | //                    fileupload(.z-uploadbutton — SKIPped: non-deterministic)
  401 | //   _mesh.css      → listbox, grid, tree(.z-treecell/.z-treecol), paging
  402 | //                    (+ checkable cells, tree/group/detail toggle icons)
  403 | //   _scrollbar.css → biglistbox
  404 | //   _calendar.css  → calendar
  405 | //   _menu.css      → menubar (menu/menuitem tap rows + glyphs)
  406 | //   _tabbox.css    → tabbox (tab tap floor, tab image/icon, close, scroll arms)
  407 | //   _window.css    → window, panel
  408 | //   _feedback.css  → errorbox (close), notification (close)
  409 | // selectbox has NO tablet CSS (native <select> — OS handles touch); its entry
  410 | // below is a width-834 render that just guards it doesn't regress at tablet size.
  411 | // notification's only tablet delta is the .z-notification-close button, which the
  412 | // static gallery does not render — its entry is a surface guard; the close-button
  413 | // geometry is verified by computed-style probe, not this baseline.
  414 | const visualCases: VisualCase[] = [
  415 |   // form inputs (_inputs.css)
  416 |   { name: 'tablet-textbox',       url: '/textbox.zul' },
  417 |   { name: 'tablet-intbox',        url: '/intbox.zul' },
  418 |   { name: 'tablet-longbox',       url: '/longbox.zul' },
  419 |   { name: 'tablet-doublebox',     url: '/doublebox.zul' },
  420 |   { name: 'tablet-decimalbox',    url: '/decimalbox.zul' },
  421 |   { name: 'tablet-combobox',      url: '/combobox.zul' },
  422 |   { name: 'tablet-bandbox',       url: '/bandbox.zul' },
  423 |   { name: 'tablet-datebox',       url: '/datebox.zul' },
  424 |   { name: 'tablet-timebox',       url: '/timebox.zul' },
  425 |   { name: 'tablet-spinner',       url: '/spinner.zul' },
  426 |   { name: 'tablet-doublespinner', url: '/doublespinner.zul' },
  427 |   { name: 'tablet-calendar',      url: '/calendar.zul' },
  428 |   // selection controls (_selection.css)
  429 |   { name: 'tablet-checkbox',      url: '/checkbox.zul' },
  430 |   { name: 'tablet-radiogroup',    url: '/radiogroup.zul' },
  431 |   // buttons (_buttons.css)
  432 |   { name: 'tablet-button',        url: '/button.zul' },
  433 |   { name: 'tablet-combobutton',   url: '/combobutton.zul' },
  434 |   { name: 'tablet-toolbar',       url: '/toolbar.zul' },
  435 |   // menu (_menu.css)
  436 |   { name: 'tablet-menubar',       url: '/menubar.zul' },
  437 |   // tabbox (_tabbox.css) — known sub-1% selection-indicator flake, see type note
  438 |   { name: 'tablet-tabbox',        url: '/tabbox.zul', maxDiffPixelRatio: 0.02 },
  439 |   // mesh: data grids/lists/tree + paging (_mesh.css)
  440 |   { name: 'tablet-listbox',       url: '/listbox.zul' },
  441 |   { name: 'tablet-grid',          url: '/grid.zul' },
  442 |   { name: 'tablet-tree',          url: '/tree.zul' },
  443 |   { name: 'tablet-paging',        url: '/paging.zul' },
  444 |   { name: 'tablet-biglistbox',    url: '/biglistbox.zul' },
  445 |   // containers (_window.css)
  446 |   // window has a pre-existing ~1% timing flake (unchanged by this work — the page
  447 |   // embeds none of the touch-enlarged components); same tolerance as tabbox.
  448 |   { name: 'tablet-window',        url: '/window.zul', maxDiffPixelRatio: 0.02 },
  449 |   { name: 'tablet-panel',         url: '/panel.zul' },
  450 |   // feedback (_feedback.css)
  451 |   { name: 'tablet-errorbox',      url: '/errorbox.zul' },
  452 |   { name: 'tablet-notification',  url: '/notification.zul' },
  453 |   // slider (_slider.css — touch-enlarged knob)
  454 |   { name: 'tablet-slider',        url: '/slider.zul' },
  455 |   // no tablet CSS — width-834 regression guard only
  456 |   { name: 'tablet-selectbox',     url: '/selectbox.zul' },
  457 |   // NOTE: scrollview is deliberately NOT here. A goto-and-shoot never paints its
  458 |   // overlay scrollbar (_barPos parks it at opacity 0 at rest), so a generic case
  459 |   // would bank a baseline of the very thing it is meant to show. Its baseline is
  460 |   // cut in the tablet-scrollview-affordance block below, with the bar revealed.
  461 | ];
  462 | 
  463 | for (const { name, url, maxDiffPixelRatio } of visualCases) {
  464 |   // The tablet gallery lands flat alongside the desktop shot, with a -tablet.png
  465 |   // suffix so it never collides with the desktop <comp>-gallery.png:
  466 |   // doc/screenshots/button-tablet.png.
  467 |   const comp = name.replace(/^tablet-/, '');
  468 |   test.describe(name, () => {
  469 |     test('gallery', async ({ page }) => {
  470 |       await page.goto(url);
  471 |       await page.waitForLoadState('networkidle');
  472 |       await page.evaluate(() => document.fonts.ready.then(() => true));
  473 |       await expect(page.locator('.z-p-8').first())
> 474 |         .toHaveScreenshot(`${comp}-tablet.png`, maxDiffPixelRatio ? { maxDiffPixelRatio } : {});
      |          ^ Error: expect(locator).toHaveScreenshot(expected) failed
  475 |     });
  476 |   });
  477 | }
  478 | 
  479 | // -------------------------------------------------------
  480 | // Colorbox popup dismiss on touch — ZK 10.2.1-jakarta's Colorbox.closePopup /
  481 | // onHide only call undoVParent(); they do NOT reset the inline display/position
  482 | // that openPopup set. On desktop undoVParent's style restore hides the reattached
  483 | // popup, but on the mobile (iPad/Safari) UA it does not, so the popup stays
  484 | // display:block (looks un-closed) and leaves a small `.z-palette-button` artifact.
  485 | // Theme workaround (floating-popup-in-body pattern): the OPEN popup is detached to
  486 | // <body>, so force-hiding the popup while it is RE-ATTACHED inside .z-colorbox
  487 | // only ever hides the closed popup. These guard that workaround on a touch UA.
  488 | // -------------------------------------------------------
  489 | test.describe('tablet-colorbox-dismiss', () => {
  490 |   test('outside tap closes the popup (no display:block left on the reattached popup)', async ({ page }) => {
  491 |     await page.goto('/colorbox.zul');
  492 |     await page.waitForLoadState('networkidle');
  493 | 
  494 |     // open must still show (the open popup is detached to <body>)
  495 |     const opened = await page.evaluate(() => {
  496 |       const w = (window as any).zk.Widget.$(document.querySelector('.z-colorbox'));
  497 |       w.openPopup();
  498 |       const pp = w.$n('pp') as HTMLElement;
  499 |       return getComputedStyle(pp).display !== 'none' && (pp.parentElement as HTMLElement).tagName === 'BODY';
  500 |     });
  501 |     expect(opened).toBe(true);
  502 | 
  503 |     // tap an empty/content area away from the colorbox
  504 |     await page.touchscreen.tap(500, 300);
  505 |     await page.waitForTimeout(350);
  506 | 
  507 |     const dismissed = await page.evaluate(() => {
  508 |       const w = (window as any).zk.Widget.$(document.querySelector('.z-colorbox'));
  509 |       return { hidden: getComputedStyle(w.$n('pp') as HTMLElement).display === 'none', open: w._open };
  510 |     });
  511 |     expect(dismissed.open).toBe(false);
  512 |     expect(dismissed.hidden).toBe(true);
  513 |   });
  514 | 
  515 |   test('selecting a color leaves no visible popup/palette-button artifact', async ({ page }) => {
  516 |     await page.goto('/colorbox.zul');
  517 |     await page.waitForLoadState('networkidle');
  518 | 
  519 |     await page.evaluate(() => {
  520 |       const w = (window as any).zk.Widget.$(document.querySelector('.z-colorbox'));
  521 |       w.openPopup();
  522 |       const pp = w.$n('pp') as HTMLElement;
  523 |       const sw = pp.querySelector('.z-colorpalette-color, [data-color]') as HTMLElement;
  524 |       if (sw) ['mousedown', 'mouseup', 'click'].forEach(t => sw.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true })));
  525 |     });
  526 |     await page.waitForTimeout(400);
  527 | 
  528 |     const visibleArtifacts = await page.evaluate(() =>
  529 |       [...document.querySelectorAll('[class*="palette-button"], .z-colorbox-popup')]
  530 |         .filter(e => {
  531 |           const r = (e as HTMLElement).getBoundingClientRect();
  532 |           return r.width > 0 && r.height > 0 && getComputedStyle(e as HTMLElement).display !== 'none';
  533 |         })
  534 |         .map(e => e.className.toString()));
  535 |     expect(visibleArtifacts).toEqual([]);
  536 |   });
  537 | });
  538 | 
  539 | // -------------------------------------------------------
  540 | // Scrollview — the touch path is where its styling actually lives.
  541 | // On a DESKTOP UA `bind_()` writes an inline `overflow: auto` and the browser
  542 | // scrolls natively, so the stylesheet contributes nothing visible and the desktop
  543 | // gallery shot is byte-identical with or without it. On a MOBILE UA the root stays
  544 | // `overflow: hidden` while `_move()` translates the cave, and `_addBar()` builds an
  545 | // overlay scrollbar that is the ONLY scroll affordance the user gets.
  546 | //
  547 | // These guard doc/contracts/scrollview.md M1-M6. They exist because the contract
  548 | // previously asserted only `overflow` and `background-color` — two values ZK's own
  549 | // JS and the CSS defaults already produce — so scrollview was recorded VERIFIED
  550 | // while its stylesheet was an empty placeholder file (doc/harness/work-status.md).
  551 | // Measured against that empty stylesheet (RED re-run 2026-09-12): M1, M3, M4, M5
  552 | // and M8 fail; M2 and M6 pass on it by construction, because they assert an
  553 | // ABSENCE (no surface, no layout space) that an empty file also satisfies —
  554 | // they guard against future decoration, not against a missing stylesheet.
  555 | // -------------------------------------------------------
  556 | test.describe('tablet-scrollview-affordance', () => {
  557 |   test('the overlay scrollbar is present, proportional and inert to touch', async ({ page }) => {
  558 |     await page.goto('/scrollview.zul');
  559 |     await page.waitForLoadState('networkidle');
  560 |     expect(await tabletCssLoaded(page)).toBe(true);
  561 |     // _refresh() builds the bar from a 200ms timer fired by onSize; wait for the
  562 |     // element rather than racing a fixed sleep.
  563 |     await page.waitForSelector('.z-scrollview-scrollbar', { state: 'attached', timeout: 10000 });
  564 | 
  565 |     const m = await page.evaluate(() => {
  566 |       const root = document.querySelector('.z-scrollview') as HTMLElement;
  567 |       const cave = root.querySelector('.z-scrollview-content') as HTMLElement;
  568 |       const bar = root.querySelector('.z-scrollview-scrollbar') as HTMLElement;
  569 |       const ind = root.querySelector('.z-scrollview-scrollbar-indicator') as HTMLElement;
  570 |       const load = root.querySelector('.z-scrollview-load') as HTMLElement;
  571 |       const rs = getComputedStyle(root), is = getComputedStyle(ind);
  572 |       const rr = root.getBoundingClientRect(), br = bar.getBoundingClientRect(),
  573 |             ir = ind.getBoundingClientRect();
  574 |       // M5: who actually receives a touch at the thumb's centre?
```