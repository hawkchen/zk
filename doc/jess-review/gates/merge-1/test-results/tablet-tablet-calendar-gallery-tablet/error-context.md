# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tablet.spec.ts >> tablet-calendar >> gallery
- Location: src/test/playwright/tablet.spec.ts:469:9

# Error details

```
Error: expect(locator).toHaveScreenshot(expected) failed

Locator: locator('.z-p-8').first()
  1145 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: calendar-tablet.png

Call log:
  - Expect "toHaveScreenshot(calendar-tablet.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="gXYB0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - 1145 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="gXYB0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - captured a stable screenshot
  - 1145 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Calendar
  - generic [ref=e5]:
    - generic [ref=e6]: Variants
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Default
        - application [ref=e10]:
          - generic [ref=e11]:
            - link "Prev" [ref=e12] [cursor=pointer]:
              - /url: javascript:;
              - button "Prev" [ref=e13]
            - link "Mar 2020" [ref=e14] [cursor=pointer]:
              - /url: javascript:;
              - generic: Mar
              - generic: "2020"
            - link "Next" [ref=e15] [cursor=pointer]:
              - /url: javascript:;
              - button "Next" [ref=e16]
          - grid [ref=e17]:
            - rowgroup [ref=e18]:
              - row "Sunday Monday Tuesday Wednesday Thursday Friday Saturday" [ref=e19]:
                - columnheader "Sunday" [ref=e20]: Sun
                - columnheader "Monday" [ref=e21]: Mon
                - columnheader "Tuesday" [ref=e22]: Tue
                - columnheader "Wednesday" [ref=e23]: Wed
                - columnheader "Thursday" [ref=e24]: Thu
                - columnheader "Friday" [ref=e25]: Fri
                - columnheader "Saturday" [ref=e26]: Sat
            - rowgroup [ref=e27]:
              - row "1 March, 2020 2 March, 2020 3 March, 2020 4 March, 2020 5 March, 2020 6 March, 2020 7 March, 2020" [ref=e28]:
                - gridcell "1 March, 2020" [ref=e29] [cursor=pointer]: "1"
                - gridcell "2 March, 2020" [ref=e30] [cursor=pointer]: "2"
                - gridcell "3 March, 2020" [ref=e31] [cursor=pointer]: "3"
                - gridcell "4 March, 2020" [ref=e32] [cursor=pointer]: "4"
                - gridcell "5 March, 2020" [ref=e33] [cursor=pointer]: "5"
                - gridcell "6 March, 2020" [ref=e34] [cursor=pointer]: "6"
                - gridcell "7 March, 2020" [ref=e35] [cursor=pointer]: "7"
              - row "8 March, 2020 9 March, 2020 10 March, 2020 11 March, 2020 12 March, 2020 13 March, 2020 14 March, 2020" [ref=e36]:
                - gridcell "8 March, 2020" [ref=e37] [cursor=pointer]: "8"
                - gridcell "9 March, 2020" [ref=e38] [cursor=pointer]: "9"
                - gridcell "10 March, 2020" [ref=e39] [cursor=pointer]: "10"
                - gridcell "11 March, 2020" [ref=e40] [cursor=pointer]: "11"
                - gridcell "12 March, 2020" [ref=e41] [cursor=pointer]: "12"
                - gridcell "13 March, 2020" [ref=e42] [cursor=pointer]: "13"
                - gridcell "14 March, 2020" [ref=e43] [cursor=pointer]: "14"
              - row "15 March, 2020 16 March, 2020 17 March, 2020 18 March, 2020 19 March, 2020 20 March, 2020 21 March, 2020" [ref=e44]:
                - gridcell "15 March, 2020" [selected] [ref=e45] [cursor=pointer]: "15"
                - gridcell "16 March, 2020" [ref=e46] [cursor=pointer]: "16"
                - gridcell "17 March, 2020" [ref=e47] [cursor=pointer]: "17"
                - gridcell "18 March, 2020" [ref=e48] [cursor=pointer]: "18"
                - gridcell "19 March, 2020" [ref=e49] [cursor=pointer]: "19"
                - gridcell "20 March, 2020" [ref=e50] [cursor=pointer]: "20"
                - gridcell "21 March, 2020" [ref=e51] [cursor=pointer]: "21"
              - row "22 March, 2020 23 March, 2020 24 March, 2020 25 March, 2020 26 March, 2020 27 March, 2020 28 March, 2020" [ref=e52]:
                - gridcell "22 March, 2020" [ref=e53] [cursor=pointer]: "22"
                - gridcell "23 March, 2020" [ref=e54] [cursor=pointer]: "23"
                - gridcell "24 March, 2020" [ref=e55] [cursor=pointer]: "24"
                - gridcell "25 March, 2020" [ref=e56] [cursor=pointer]: "25"
                - gridcell "26 March, 2020" [ref=e57] [cursor=pointer]: "26"
                - gridcell "27 March, 2020" [ref=e58] [cursor=pointer]: "27"
                - gridcell "28 March, 2020" [ref=e59] [cursor=pointer]: "28"
              - row "29 March, 2020 30 March, 2020 31 March, 2020 1 April, 2020 2 April, 2020 3 April, 2020 4 April, 2020" [ref=e60]:
                - gridcell "29 March, 2020" [ref=e61] [cursor=pointer]: "29"
                - gridcell "30 March, 2020" [ref=e62] [cursor=pointer]: "30"
                - gridcell "31 March, 2020" [ref=e63] [cursor=pointer]: "31"
                - gridcell "1 April, 2020" [ref=e64] [cursor=pointer]: "1"
                - gridcell "2 April, 2020" [ref=e65] [cursor=pointer]: "2"
                - gridcell "3 April, 2020" [ref=e66] [cursor=pointer]: "3"
                - gridcell "4 April, 2020" [ref=e67] [cursor=pointer]: "4"
      - generic [ref=e68]:
        - generic [ref=e69]: Week of year
        - application [ref=e70]:
          - generic [ref=e71]:
            - link "Prev" [ref=e72] [cursor=pointer]:
              - /url: javascript:;
              - button "Prev" [ref=e73]
            - link "Mar 2020" [ref=e74] [cursor=pointer]:
              - /url: javascript:;
              - generic: Mar
              - generic: "2020"
            - link "Next" [ref=e75] [cursor=pointer]:
              - /url: javascript:;
              - button "Next" [ref=e76]
          - grid [ref=e77]:
            - rowgroup [ref=e78]:
              - row "Wk Sunday Monday Tuesday Wednesday Thursday Friday Saturday" [ref=e79]:
                - columnheader "Wk"
                - columnheader "Sunday" [ref=e80]: Sun
                - columnheader "Monday" [ref=e81]: Mon
                - columnheader "Tuesday" [ref=e82]: Tue
                - columnheader "Wednesday" [ref=e83]: Wed
                - columnheader "Thursday" [ref=e84]: Thu
                - columnheader "Friday" [ref=e85]: Fri
                - columnheader "Saturday" [ref=e86]: Sat
            - rowgroup [ref=e87]:
              - row "10 1 March, 2020 2 March, 2020 3 March, 2020 4 March, 2020 5 March, 2020 6 March, 2020 7 March, 2020" [ref=e88]:
                - gridcell "10"
                - gridcell "1 March, 2020" [ref=e89] [cursor=pointer]: "1"
                - gridcell "2 March, 2020" [ref=e90] [cursor=pointer]: "2"
                - gridcell "3 March, 2020" [ref=e91] [cursor=pointer]: "3"
                - gridcell "4 March, 2020" [ref=e92] [cursor=pointer]: "4"
                - gridcell "5 March, 2020" [ref=e93] [cursor=pointer]: "5"
                - gridcell "6 March, 2020" [ref=e94] [cursor=pointer]: "6"
                - gridcell "7 March, 2020" [ref=e95] [cursor=pointer]: "7"
              - row "11 8 March, 2020 9 March, 2020 10 March, 2020 11 March, 2020 12 March, 2020 13 March, 2020 14 March, 2020" [ref=e96]:
                - gridcell "11"
                - gridcell "8 March, 2020" [ref=e97] [cursor=pointer]: "8"
                - gridcell "9 March, 2020" [ref=e98] [cursor=pointer]: "9"
                - gridcell "10 March, 2020" [ref=e99] [cursor=pointer]: "10"
                - gridcell "11 March, 2020" [ref=e100] [cursor=pointer]: "11"
                - gridcell "12 March, 2020" [ref=e101] [cursor=pointer]: "12"
                - gridcell "13 March, 2020" [ref=e102] [cursor=pointer]: "13"
                - gridcell "14 March, 2020" [ref=e103] [cursor=pointer]: "14"
              - row "12 15 March, 2020 16 March, 2020 17 March, 2020 18 March, 2020 19 March, 2020 20 March, 2020 21 March, 2020" [ref=e104]:
                - gridcell "12"
                - gridcell "15 March, 2020" [selected] [ref=e105] [cursor=pointer]: "15"
                - gridcell "16 March, 2020" [ref=e106] [cursor=pointer]: "16"
                - gridcell "17 March, 2020" [ref=e107] [cursor=pointer]: "17"
                - gridcell "18 March, 2020" [ref=e108] [cursor=pointer]: "18"
                - gridcell "19 March, 2020" [ref=e109] [cursor=pointer]: "19"
                - gridcell "20 March, 2020" [ref=e110] [cursor=pointer]: "20"
                - gridcell "21 March, 2020" [ref=e111] [cursor=pointer]: "21"
              - row "13 22 March, 2020 23 March, 2020 24 March, 2020 25 March, 2020 26 March, 2020 27 March, 2020 28 March, 2020" [ref=e112]:
                - gridcell "13"
                - gridcell "22 March, 2020" [ref=e113] [cursor=pointer]: "22"
                - gridcell "23 March, 2020" [ref=e114] [cursor=pointer]: "23"
                - gridcell "24 March, 2020" [ref=e115] [cursor=pointer]: "24"
                - gridcell "25 March, 2020" [ref=e116] [cursor=pointer]: "25"
                - gridcell "26 March, 2020" [ref=e117] [cursor=pointer]: "26"
                - gridcell "27 March, 2020" [ref=e118] [cursor=pointer]: "27"
                - gridcell "28 March, 2020" [ref=e119] [cursor=pointer]: "28"
              - row "14 29 March, 2020 30 March, 2020 31 March, 2020 1 April, 2020 2 April, 2020 3 April, 2020 4 April, 2020" [ref=e120]:
                - gridcell "14"
                - gridcell "29 March, 2020" [ref=e121] [cursor=pointer]: "29"
                - gridcell "30 March, 2020" [ref=e122] [cursor=pointer]: "30"
                - gridcell "31 March, 2020" [ref=e123] [cursor=pointer]: "31"
                - gridcell "1 April, 2020" [ref=e124] [cursor=pointer]: "1"
                - gridcell "2 April, 2020" [ref=e125] [cursor=pointer]: "2"
                - gridcell "3 April, 2020" [ref=e126] [cursor=pointer]: "3"
                - gridcell "4 April, 2020" [ref=e127] [cursor=pointer]: "4"
      - generic [ref=e128]:
        - generic [ref=e129]: Today link
        - application [ref=e130]:
          - generic [ref=e131]:
            - link "Prev" [ref=e132] [cursor=pointer]:
              - /url: javascript:;
              - button "Prev" [ref=e133]
            - link "Mar 2020" [ref=e134] [cursor=pointer]:
              - /url: javascript:;
              - generic: Mar
              - generic: "2020"
            - link "Next" [ref=e135] [cursor=pointer]:
              - /url: javascript:;
              - button "Next" [ref=e136]
          - grid [ref=e137]:
            - rowgroup [ref=e138]:
              - row "Sunday Monday Tuesday Wednesday Thursday Friday Saturday" [ref=e139]:
                - columnheader "Sunday" [ref=e140]: Sun
                - columnheader "Monday" [ref=e141]: Mon
                - columnheader "Tuesday" [ref=e142]: Tue
                - columnheader "Wednesday" [ref=e143]: Wed
                - columnheader "Thursday" [ref=e144]: Thu
                - columnheader "Friday" [ref=e145]: Fri
                - columnheader "Saturday" [ref=e146]: Sat
            - rowgroup [ref=e147]:
              - row "1 March, 2020 2 March, 2020 3 March, 2020 4 March, 2020 5 March, 2020 6 March, 2020 7 March, 2020" [ref=e148]:
                - gridcell "1 March, 2020" [ref=e149] [cursor=pointer]: "1"
                - gridcell "2 March, 2020" [ref=e150] [cursor=pointer]: "2"
                - gridcell "3 March, 2020" [ref=e151] [cursor=pointer]: "3"
                - gridcell "4 March, 2020" [ref=e152] [cursor=pointer]: "4"
                - gridcell "5 March, 2020" [ref=e153] [cursor=pointer]: "5"
                - gridcell "6 March, 2020" [ref=e154] [cursor=pointer]: "6"
                - gridcell "7 March, 2020" [ref=e155] [cursor=pointer]: "7"
              - row "8 March, 2020 9 March, 2020 10 March, 2020 11 March, 2020 12 March, 2020 13 March, 2020 14 March, 2020" [ref=e156]:
                - gridcell "8 March, 2020" [ref=e157] [cursor=pointer]: "8"
                - gridcell "9 March, 2020" [ref=e158] [cursor=pointer]: "9"
                - gridcell "10 March, 2020" [ref=e159] [cursor=pointer]: "10"
                - gridcell "11 March, 2020" [ref=e160] [cursor=pointer]: "11"
                - gridcell "12 March, 2020" [ref=e161] [cursor=pointer]: "12"
                - gridcell "13 March, 2020" [ref=e162] [cursor=pointer]: "13"
                - gridcell "14 March, 2020" [ref=e163] [cursor=pointer]: "14"
              - row "15 March, 2020 16 March, 2020 17 March, 2020 18 March, 2020 19 March, 2020 20 March, 2020 21 March, 2020" [ref=e164]:
                - gridcell "15 March, 2020" [selected] [ref=e165] [cursor=pointer]: "15"
                - gridcell "16 March, 2020" [ref=e166] [cursor=pointer]: "16"
                - gridcell "17 March, 2020" [ref=e167] [cursor=pointer]: "17"
                - gridcell "18 March, 2020" [ref=e168] [cursor=pointer]: "18"
                - gridcell "19 March, 2020" [ref=e169] [cursor=pointer]: "19"
                - gridcell "20 March, 2020" [ref=e170] [cursor=pointer]: "20"
                - gridcell "21 March, 2020" [ref=e171] [cursor=pointer]: "21"
              - row "22 March, 2020 23 March, 2020 24 March, 2020 25 March, 2020 26 March, 2020 27 March, 2020 28 March, 2020" [ref=e172]:
                - gridcell "22 March, 2020" [ref=e173] [cursor=pointer]: "22"
                - gridcell "23 March, 2020" [ref=e174] [cursor=pointer]: "23"
                - gridcell "24 March, 2020" [ref=e175] [cursor=pointer]: "24"
                - gridcell "25 March, 2020" [ref=e176] [cursor=pointer]: "25"
                - gridcell "26 March, 2020" [ref=e177] [cursor=pointer]: "26"
                - gridcell "27 March, 2020" [ref=e178] [cursor=pointer]: "27"
                - gridcell "28 March, 2020" [ref=e179] [cursor=pointer]: "28"
              - row "29 March, 2020 30 March, 2020 31 March, 2020 1 April, 2020 2 April, 2020 3 April, 2020 4 April, 2020" [ref=e180]:
                - gridcell "29 March, 2020" [ref=e181] [cursor=pointer]: "29"
                - gridcell "30 March, 2020" [ref=e182] [cursor=pointer]: "30"
                - gridcell "31 March, 2020" [ref=e183] [cursor=pointer]: "31"
                - gridcell "1 April, 2020" [ref=e184] [cursor=pointer]: "1"
                - gridcell "2 April, 2020" [ref=e185] [cursor=pointer]: "2"
                - gridcell "3 April, 2020" [ref=e186] [cursor=pointer]: "3"
                - gridcell "4 April, 2020" [ref=e187] [cursor=pointer]: "4"
          - link "Today" [ref=e189] [cursor=pointer]:
            - /url: javascript:;
  - generic [ref=e190]:
    - generic [ref=e191]: With Datebox
    - generic [ref=e192]:
      - generic [ref=e193]:
        - generic [ref=e194]: Calendar + datebox (GMT±8)
        - application [ref=e195]:
          - generic [ref=e196]:
            - link "Prev" [ref=e197] [cursor=pointer]:
              - /url: javascript:;
              - button "Prev" [ref=e198]
            - link "Mar 2020" [ref=e199] [cursor=pointer]:
              - /url: javascript:;
              - generic: Mar
              - generic: "2020"
            - link "Next" [ref=e200] [cursor=pointer]:
              - /url: javascript:;
              - button "Next" [ref=e201]
          - grid [ref=e202]:
            - rowgroup [ref=e203]:
              - row "Sunday Monday Tuesday Wednesday Thursday Friday Saturday" [ref=e204]:
                - columnheader "Sunday" [ref=e205]: Sun
                - columnheader "Monday" [ref=e206]: Mon
                - columnheader "Tuesday" [ref=e207]: Tue
                - columnheader "Wednesday" [ref=e208]: Wed
                - columnheader "Thursday" [ref=e209]: Thu
                - columnheader "Friday" [ref=e210]: Fri
                - columnheader "Saturday" [ref=e211]: Sat
            - rowgroup [ref=e212]:
              - row "1 March, 2020 2 March, 2020 3 March, 2020 4 March, 2020 5 March, 2020 6 March, 2020 7 March, 2020" [ref=e213]:
                - gridcell "1 March, 2020" [ref=e214] [cursor=pointer]: "1"
                - gridcell "2 March, 2020" [ref=e215] [cursor=pointer]: "2"
                - gridcell "3 March, 2020" [ref=e216] [cursor=pointer]: "3"
                - gridcell "4 March, 2020" [ref=e217] [cursor=pointer]: "4"
                - gridcell "5 March, 2020" [ref=e218] [cursor=pointer]: "5"
                - gridcell "6 March, 2020" [ref=e219] [cursor=pointer]: "6"
                - gridcell "7 March, 2020" [ref=e220] [cursor=pointer]: "7"
              - row "8 March, 2020 9 March, 2020 10 March, 2020 11 March, 2020 12 March, 2020 13 March, 2020 14 March, 2020" [ref=e221]:
                - gridcell "8 March, 2020" [ref=e222] [cursor=pointer]: "8"
                - gridcell "9 March, 2020" [ref=e223] [cursor=pointer]: "9"
                - gridcell "10 March, 2020" [ref=e224] [cursor=pointer]: "10"
                - gridcell "11 March, 2020" [ref=e225] [cursor=pointer]: "11"
                - gridcell "12 March, 2020" [ref=e226] [cursor=pointer]: "12"
                - gridcell "13 March, 2020" [ref=e227] [cursor=pointer]: "13"
                - gridcell "14 March, 2020" [ref=e228] [cursor=pointer]: "14"
              - row "15 March, 2020 16 March, 2020 17 March, 2020 18 March, 2020 19 March, 2020 20 March, 2020 21 March, 2020" [ref=e229]:
                - gridcell "15 March, 2020" [selected] [ref=e230] [cursor=pointer]: "15"
                - gridcell "16 March, 2020" [ref=e231] [cursor=pointer]: "16"
                - gridcell "17 March, 2020" [ref=e232] [cursor=pointer]: "17"
                - gridcell "18 March, 2020" [ref=e233] [cursor=pointer]: "18"
                - gridcell "19 March, 2020" [ref=e234] [cursor=pointer]: "19"
                - gridcell "20 March, 2020" [ref=e235] [cursor=pointer]: "20"
                - gridcell "21 March, 2020" [ref=e236] [cursor=pointer]: "21"
              - row "22 March, 2020 23 March, 2020 24 March, 2020 25 March, 2020 26 March, 2020 27 March, 2020 28 March, 2020" [ref=e237]:
                - gridcell "22 March, 2020" [ref=e238] [cursor=pointer]: "22"
                - gridcell "23 March, 2020" [ref=e239] [cursor=pointer]: "23"
                - gridcell "24 March, 2020" [ref=e240] [cursor=pointer]: "24"
                - gridcell "25 March, 2020" [ref=e241] [cursor=pointer]: "25"
                - gridcell "26 March, 2020" [ref=e242] [cursor=pointer]: "26"
                - gridcell "27 March, 2020" [ref=e243] [cursor=pointer]: "27"
                - gridcell "28 March, 2020" [ref=e244] [cursor=pointer]: "28"
              - row "29 March, 2020 30 March, 2020 31 March, 2020 1 April, 2020 2 April, 2020 3 April, 2020 4 April, 2020" [ref=e245]:
                - gridcell "29 March, 2020" [ref=e246] [cursor=pointer]: "29"
                - gridcell "30 March, 2020" [ref=e247] [cursor=pointer]: "30"
                - gridcell "31 March, 2020" [ref=e248] [cursor=pointer]: "31"
                - gridcell "1 April, 2020" [ref=e249] [cursor=pointer]: "1"
                - gridcell "2 April, 2020" [ref=e250] [cursor=pointer]: "2"
                - gridcell "3 April, 2020" [ref=e251] [cursor=pointer]: "3"
                - gridcell "4 April, 2020" [ref=e252] [cursor=pointer]: "4"
        - combobox [ref=e253]:
          - textbox [ref=e254] [cursor=pointer]: 2020/03/15 AM 10:30:00
          - button [ref=e255] [cursor=pointer]
      - generic [ref=e257]:
        - generic [ref=e258]: Week of year
        - application [ref=e259]:
          - generic [ref=e260]:
            - link "Prev" [ref=e261] [cursor=pointer]:
              - /url: javascript:;
              - button "Prev" [ref=e262]
            - link "Mar 2020" [ref=e263] [cursor=pointer]:
              - /url: javascript:;
              - generic: Mar
              - generic: "2020"
            - link "Next" [ref=e264] [cursor=pointer]:
              - /url: javascript:;
              - button "Next" [ref=e265]
          - grid [ref=e266]:
            - rowgroup [ref=e267]:
              - row "Wk Sunday Monday Tuesday Wednesday Thursday Friday Saturday" [ref=e268]:
                - columnheader "Wk"
                - columnheader "Sunday" [ref=e269]: Sun
                - columnheader "Monday" [ref=e270]: Mon
                - columnheader "Tuesday" [ref=e271]: Tue
                - columnheader "Wednesday" [ref=e272]: Wed
                - columnheader "Thursday" [ref=e273]: Thu
                - columnheader "Friday" [ref=e274]: Fri
                - columnheader "Saturday" [ref=e275]: Sat
            - rowgroup [ref=e276]:
              - row "10 1 March, 2020 2 March, 2020 3 March, 2020 4 March, 2020 5 March, 2020 6 March, 2020 7 March, 2020" [ref=e277]:
                - gridcell "10"
                - gridcell "1 March, 2020" [ref=e278] [cursor=pointer]: "1"
                - gridcell "2 March, 2020" [ref=e279] [cursor=pointer]: "2"
                - gridcell "3 March, 2020" [ref=e280] [cursor=pointer]: "3"
                - gridcell "4 March, 2020" [ref=e281] [cursor=pointer]: "4"
                - gridcell "5 March, 2020" [ref=e282] [cursor=pointer]: "5"
                - gridcell "6 March, 2020" [ref=e283] [cursor=pointer]: "6"
                - gridcell "7 March, 2020" [ref=e284] [cursor=pointer]: "7"
              - row "11 8 March, 2020 9 March, 2020 10 March, 2020 11 March, 2020 12 March, 2020 13 March, 2020 14 March, 2020" [ref=e285]:
                - gridcell "11"
                - gridcell "8 March, 2020" [ref=e286] [cursor=pointer]: "8"
                - gridcell "9 March, 2020" [ref=e287] [cursor=pointer]: "9"
                - gridcell "10 March, 2020" [ref=e288] [cursor=pointer]: "10"
                - gridcell "11 March, 2020" [ref=e289] [cursor=pointer]: "11"
                - gridcell "12 March, 2020" [ref=e290] [cursor=pointer]: "12"
                - gridcell "13 March, 2020" [ref=e291] [cursor=pointer]: "13"
                - gridcell "14 March, 2020" [ref=e292] [cursor=pointer]: "14"
              - row "12 15 March, 2020 16 March, 2020 17 March, 2020 18 March, 2020 19 March, 2020 20 March, 2020 21 March, 2020" [ref=e293]:
                - gridcell "12"
                - gridcell "15 March, 2020" [selected] [ref=e294] [cursor=pointer]: "15"
                - gridcell "16 March, 2020" [ref=e295] [cursor=pointer]: "16"
                - gridcell "17 March, 2020" [ref=e296] [cursor=pointer]: "17"
                - gridcell "18 March, 2020" [ref=e297] [cursor=pointer]: "18"
                - gridcell "19 March, 2020" [ref=e298] [cursor=pointer]: "19"
                - gridcell "20 March, 2020" [ref=e299] [cursor=pointer]: "20"
                - gridcell "21 March, 2020" [ref=e300] [cursor=pointer]: "21"
              - row "13 22 March, 2020 23 March, 2020 24 March, 2020 25 March, 2020 26 March, 2020 27 March, 2020 28 March, 2020" [ref=e301]:
                - gridcell "13"
                - gridcell "22 March, 2020" [ref=e302] [cursor=pointer]: "22"
                - gridcell "23 March, 2020" [ref=e303] [cursor=pointer]: "23"
                - gridcell "24 March, 2020" [ref=e304] [cursor=pointer]: "24"
                - gridcell "25 March, 2020" [ref=e305] [cursor=pointer]: "25"
                - gridcell "26 March, 2020" [ref=e306] [cursor=pointer]: "26"
                - gridcell "27 March, 2020" [ref=e307] [cursor=pointer]: "27"
                - gridcell "28 March, 2020" [ref=e308] [cursor=pointer]: "28"
              - row "14 29 March, 2020 30 March, 2020 31 March, 2020 1 April, 2020 2 April, 2020 3 April, 2020 4 April, 2020" [ref=e309]:
                - gridcell "14"
                - gridcell "29 March, 2020" [ref=e310] [cursor=pointer]: "29"
                - gridcell "30 March, 2020" [ref=e311] [cursor=pointer]: "30"
                - gridcell "31 March, 2020" [ref=e312] [cursor=pointer]: "31"
                - gridcell "1 April, 2020" [ref=e313] [cursor=pointer]: "1"
                - gridcell "2 April, 2020" [ref=e314] [cursor=pointer]: "2"
                - gridcell "3 April, 2020" [ref=e315] [cursor=pointer]: "3"
                - gridcell "4 April, 2020" [ref=e316] [cursor=pointer]: "4"
        - combobox [ref=e317]:
          - textbox [ref=e318] [cursor=pointer]
          - button [ref=e319] [cursor=pointer]
      - generic [ref=e321]:
        - generic [ref=e322]: Today link
        - application [ref=e323]:
          - generic [ref=e324]:
            - link "Prev" [ref=e325] [cursor=pointer]:
              - /url: javascript:;
              - button "Prev" [ref=e326]
            - link "Mar 2020" [ref=e327] [cursor=pointer]:
              - /url: javascript:;
              - generic: Mar
              - generic: "2020"
            - link "Next" [ref=e328] [cursor=pointer]:
              - /url: javascript:;
              - button "Next" [ref=e329]
          - grid [ref=e330]:
            - rowgroup [ref=e331]:
              - row "Sunday Monday Tuesday Wednesday Thursday Friday Saturday" [ref=e332]:
                - columnheader "Sunday" [ref=e333]: Sun
                - columnheader "Monday" [ref=e334]: Mon
                - columnheader "Tuesday" [ref=e335]: Tue
                - columnheader "Wednesday" [ref=e336]: Wed
                - columnheader "Thursday" [ref=e337]: Thu
                - columnheader "Friday" [ref=e338]: Fri
                - columnheader "Saturday" [ref=e339]: Sat
            - rowgroup [ref=e340]:
              - row "1 March, 2020 2 March, 2020 3 March, 2020 4 March, 2020 5 March, 2020 6 March, 2020 7 March, 2020" [ref=e341]:
                - gridcell "1 March, 2020" [ref=e342] [cursor=pointer]: "1"
                - gridcell "2 March, 2020" [ref=e343] [cursor=pointer]: "2"
                - gridcell "3 March, 2020" [ref=e344] [cursor=pointer]: "3"
                - gridcell "4 March, 2020" [ref=e345] [cursor=pointer]: "4"
                - gridcell "5 March, 2020" [ref=e346] [cursor=pointer]: "5"
                - gridcell "6 March, 2020" [ref=e347] [cursor=pointer]: "6"
                - gridcell "7 March, 2020" [ref=e348] [cursor=pointer]: "7"
              - row "8 March, 2020 9 March, 2020 10 March, 2020 11 March, 2020 12 March, 2020 13 March, 2020 14 March, 2020" [ref=e349]:
                - gridcell "8 March, 2020" [ref=e350] [cursor=pointer]: "8"
                - gridcell "9 March, 2020" [ref=e351] [cursor=pointer]: "9"
                - gridcell "10 March, 2020" [ref=e352] [cursor=pointer]: "10"
                - gridcell "11 March, 2020" [ref=e353] [cursor=pointer]: "11"
                - gridcell "12 March, 2020" [ref=e354] [cursor=pointer]: "12"
                - gridcell "13 March, 2020" [ref=e355] [cursor=pointer]: "13"
                - gridcell "14 March, 2020" [ref=e356] [cursor=pointer]: "14"
              - row "15 March, 2020 16 March, 2020 17 March, 2020 18 March, 2020 19 March, 2020 20 March, 2020 21 March, 2020" [ref=e357]:
                - gridcell "15 March, 2020" [selected] [ref=e358] [cursor=pointer]: "15"
                - gridcell "16 March, 2020" [ref=e359] [cursor=pointer]: "16"
                - gridcell "17 March, 2020" [ref=e360] [cursor=pointer]: "17"
                - gridcell "18 March, 2020" [ref=e361] [cursor=pointer]: "18"
                - gridcell "19 March, 2020" [ref=e362] [cursor=pointer]: "19"
                - gridcell "20 March, 2020" [ref=e363] [cursor=pointer]: "20"
                - gridcell "21 March, 2020" [ref=e364] [cursor=pointer]: "21"
              - row "22 March, 2020 23 March, 2020 24 March, 2020 25 March, 2020 26 March, 2020 27 March, 2020 28 March, 2020" [ref=e365]:
                - gridcell "22 March, 2020" [ref=e366] [cursor=pointer]: "22"
                - gridcell "23 March, 2020" [ref=e367] [cursor=pointer]: "23"
                - gridcell "24 March, 2020" [ref=e368] [cursor=pointer]: "24"
                - gridcell "25 March, 2020" [ref=e369] [cursor=pointer]: "25"
                - gridcell "26 March, 2020" [ref=e370] [cursor=pointer]: "26"
                - gridcell "27 March, 2020" [ref=e371] [cursor=pointer]: "27"
                - gridcell "28 March, 2020" [ref=e372] [cursor=pointer]: "28"
              - row "29 March, 2020 30 March, 2020 31 March, 2020 1 April, 2020 2 April, 2020 3 April, 2020 4 April, 2020" [ref=e373]:
                - gridcell "29 March, 2020" [ref=e374] [cursor=pointer]: "29"
                - gridcell "30 March, 2020" [ref=e375] [cursor=pointer]: "30"
                - gridcell "31 March, 2020" [ref=e376] [cursor=pointer]: "31"
                - gridcell "1 April, 2020" [ref=e377] [cursor=pointer]: "1"
                - gridcell "2 April, 2020" [ref=e378] [cursor=pointer]: "2"
                - gridcell "3 April, 2020" [ref=e379] [cursor=pointer]: "3"
                - gridcell "4 April, 2020" [ref=e380] [cursor=pointer]: "4"
          - link "Today" [ref=e382] [cursor=pointer]:
            - /url: javascript:;
        - combobox [ref=e383]:
          - textbox [ref=e384] [cursor=pointer]
          - button [ref=e385] [cursor=pointer]
  - generic [ref=e387]:
    - generic [ref=e388]: Constrained (Disabled Dates)
    - generic [ref=e389]:
      - generic [ref=e390]:
        - generic [ref=e391]: constraint="no past" (past days greyed)
        - application [ref=e392]:
          - generic [ref=e393]:
            - link "Prev" [ref=e394] [cursor=pointer]:
              - /url: javascript:;
              - button "Prev" [ref=e395]
            - link "Mar 2020" [ref=e396] [cursor=pointer]:
              - /url: javascript:;
              - generic: Mar
              - generic: "2020"
            - link "Next" [ref=e397] [cursor=pointer]:
              - /url: javascript:;
              - button "Next" [ref=e398]
          - grid [ref=e399]:
            - rowgroup [ref=e400]:
              - row "Sunday Monday Tuesday Wednesday Thursday Friday Saturday" [ref=e401]:
                - columnheader "Sunday" [ref=e402]: Sun
                - columnheader "Monday" [ref=e403]: Mon
                - columnheader "Tuesday" [ref=e404]: Tue
                - columnheader "Wednesday" [ref=e405]: Wed
                - columnheader "Thursday" [ref=e406]: Thu
                - columnheader "Friday" [ref=e407]: Fri
                - columnheader "Saturday" [ref=e408]: Sat
            - rowgroup [ref=e409]:
              - row "1 March, 2020 2 March, 2020 3 March, 2020 4 March, 2020 5 March, 2020 6 March, 2020 7 March, 2020" [ref=e410]:
                - gridcell "1 March, 2020": "1"
                - gridcell "2 March, 2020": "2"
                - gridcell "3 March, 2020": "3"
                - gridcell "4 March, 2020": "4"
                - gridcell "5 March, 2020": "5"
                - gridcell "6 March, 2020": "6"
                - gridcell "7 March, 2020": "7"
              - row "8 March, 2020 9 March, 2020 10 March, 2020 11 March, 2020 12 March, 2020 13 March, 2020 14 March, 2020" [ref=e411]:
                - gridcell "8 March, 2020": "8"
                - gridcell "9 March, 2020": "9"
                - gridcell "10 March, 2020": "10"
                - gridcell "11 March, 2020": "11"
                - gridcell "12 March, 2020": "12"
                - gridcell "13 March, 2020": "13"
                - gridcell "14 March, 2020": "14"
              - row "15 March, 2020 16 March, 2020 17 March, 2020 18 March, 2020 19 March, 2020 20 March, 2020 21 March, 2020" [ref=e412]:
                - gridcell "15 March, 2020": "15"
                - gridcell "16 March, 2020": "16"
                - gridcell "17 March, 2020": "17"
                - gridcell "18 March, 2020": "18"
                - gridcell "19 March, 2020": "19"
                - gridcell "20 March, 2020": "20"
                - gridcell "21 March, 2020": "21"
              - row "22 March, 2020 23 March, 2020 24 March, 2020 25 March, 2020 26 March, 2020 27 March, 2020 28 March, 2020" [ref=e413]:
                - gridcell "22 March, 2020": "22"
                - gridcell "23 March, 2020": "23"
                - gridcell "24 March, 2020": "24"
                - gridcell "25 March, 2020": "25"
                - gridcell "26 March, 2020": "26"
                - gridcell "27 March, 2020": "27"
                - gridcell "28 March, 2020": "28"
              - row "29 March, 2020 30 March, 2020 31 March, 2020 1 April, 2020 2 April, 2020 3 April, 2020 4 April, 2020" [ref=e414]:
                - gridcell "29 March, 2020": "29"
                - gridcell "30 March, 2020": "30"
                - gridcell "31 March, 2020": "31"
                - gridcell "1 April, 2020": "1"
                - gridcell "2 April, 2020": "2"
                - gridcell "3 April, 2020": "3"
                - gridcell "4 April, 2020": "4"
      - generic [ref=e415]:
        - generic [ref=e416]: constraint="no future" (future days greyed)
        - application [ref=e417]:
          - generic [ref=e418]:
            - link "Prev" [ref=e419] [cursor=pointer]:
              - /url: javascript:;
              - button "Prev" [ref=e420]
            - link "Mar 2020" [ref=e421] [cursor=pointer]:
              - /url: javascript:;
              - generic: Mar
              - generic: "2020"
            - link "Next" [ref=e422] [cursor=pointer]:
              - /url: javascript:;
              - button "Next" [ref=e423]
          - grid [ref=e424]:
            - rowgroup [ref=e425]:
              - row "Sunday Monday Tuesday Wednesday Thursday Friday Saturday" [ref=e426]:
                - columnheader "Sunday" [ref=e427]: Sun
                - columnheader "Monday" [ref=e428]: Mon
                - columnheader "Tuesday" [ref=e429]: Tue
                - columnheader "Wednesday" [ref=e430]: Wed
                - columnheader "Thursday" [ref=e431]: Thu
                - columnheader "Friday" [ref=e432]: Fri
                - columnheader "Saturday" [ref=e433]: Sat
            - rowgroup [ref=e434]:
              - row "1 March, 2020 2 March, 2020 3 March, 2020 4 March, 2020 5 March, 2020 6 March, 2020 7 March, 2020" [ref=e435]:
                - gridcell "1 March, 2020" [ref=e436] [cursor=pointer]: "1"
                - gridcell "2 March, 2020" [ref=e437] [cursor=pointer]: "2"
                - gridcell "3 March, 2020" [ref=e438] [cursor=pointer]: "3"
                - gridcell "4 March, 2020" [ref=e439] [cursor=pointer]: "4"
                - gridcell "5 March, 2020" [ref=e440] [cursor=pointer]: "5"
                - gridcell "6 March, 2020" [ref=e441] [cursor=pointer]: "6"
                - gridcell "7 March, 2020" [ref=e442] [cursor=pointer]: "7"
              - row "8 March, 2020 9 March, 2020 10 March, 2020 11 March, 2020 12 March, 2020 13 March, 2020 14 March, 2020" [ref=e443]:
                - gridcell "8 March, 2020" [ref=e444] [cursor=pointer]: "8"
                - gridcell "9 March, 2020" [ref=e445] [cursor=pointer]: "9"
                - gridcell "10 March, 2020" [ref=e446] [cursor=pointer]: "10"
                - gridcell "11 March, 2020" [ref=e447] [cursor=pointer]: "11"
                - gridcell "12 March, 2020" [ref=e448] [cursor=pointer]: "12"
                - gridcell "13 March, 2020" [ref=e449] [cursor=pointer]: "13"
                - gridcell "14 March, 2020" [ref=e450] [cursor=pointer]: "14"
              - row "15 March, 2020 16 March, 2020 17 March, 2020 18 March, 2020 19 March, 2020 20 March, 2020 21 March, 2020" [ref=e451]:
                - gridcell "15 March, 2020" [selected] [ref=e452] [cursor=pointer]: "15"
                - gridcell "16 March, 2020" [ref=e453] [cursor=pointer]: "16"
                - gridcell "17 March, 2020" [ref=e454] [cursor=pointer]: "17"
                - gridcell "18 March, 2020" [ref=e455] [cursor=pointer]: "18"
                - gridcell "19 March, 2020" [ref=e456] [cursor=pointer]: "19"
                - gridcell "20 March, 2020" [ref=e457] [cursor=pointer]: "20"
                - gridcell "21 March, 2020" [ref=e458] [cursor=pointer]: "21"
              - row "22 March, 2020 23 March, 2020 24 March, 2020 25 March, 2020 26 March, 2020 27 March, 2020 28 March, 2020" [ref=e459]:
                - gridcell "22 March, 2020" [ref=e460] [cursor=pointer]: "22"
                - gridcell "23 March, 2020" [ref=e461] [cursor=pointer]: "23"
                - gridcell "24 March, 2020" [ref=e462] [cursor=pointer]: "24"
                - gridcell "25 March, 2020" [ref=e463] [cursor=pointer]: "25"
                - gridcell "26 March, 2020" [ref=e464] [cursor=pointer]: "26"
                - gridcell "27 March, 2020" [ref=e465] [cursor=pointer]: "27"
                - gridcell "28 March, 2020" [ref=e466] [cursor=pointer]: "28"
              - row "29 March, 2020 30 March, 2020 31 March, 2020 1 April, 2020 2 April, 2020 3 April, 2020 4 April, 2020" [ref=e467]:
                - gridcell "29 March, 2020" [ref=e468] [cursor=pointer]: "29"
                - gridcell "30 March, 2020" [ref=e469] [cursor=pointer]: "30"
                - gridcell "31 March, 2020" [ref=e470] [cursor=pointer]: "31"
                - gridcell "1 April, 2020" [ref=e471] [cursor=pointer]: "1"
                - gridcell "2 April, 2020" [ref=e472] [cursor=pointer]: "2"
                - gridcell "3 April, 2020" [ref=e473] [cursor=pointer]: "3"
                - gridcell "4 April, 2020" [ref=e474] [cursor=pointer]: "4"
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