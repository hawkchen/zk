# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gallery-scan.spec.ts >> gallery >> grid-header
- Location: src/test/playwright/gallery-scan.spec.ts:48:9

# Error details

```
Error: expect(locator).toHaveScreenshot(expected) failed

Locator: locator('.z-p-8').first()
  Expected an image 1280px by 4525px, received 1280px by 4522px. 

  Snapshot: grid-header-gallery.png

Call log:
  - Expect "toHaveScreenshot(grid-header-gallery.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="bN7W0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - Expected an image 1280px by 4525px, received 1280px by 4522px.
  - waiting 100ms before taking screenshot
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="bN7W0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - captured a stable screenshot
  - Expected an image 1280px by 4525px, received 1280px by 4522px.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Grid Header
  - generic [ref=e5]:
    - generic [ref=e6]: Auxhead + Column Combinations
    - generic [ref=e8]:
      - grid [ref=e9]:
        - rowgroup [ref=e14]:
          - row "A+B C" [ref=e15]:
            - columnheader "A+B" [ref=e16]:
              - generic [ref=e17]: A+B
            - columnheader "C" [ref=e18]:
              - generic [ref=e19]: C
          - row "Align Left Align Center Align Right" [ref=e20]:
            - columnheader "Align Left" [ref=e21]:
              - generic [ref=e22]: Align Left
            - columnheader "Align Center" [ref=e23]:
              - generic [ref=e24]: Align Center
            - columnheader "Align Right" [ref=e25]:
              - generic [ref=e26]: Align Right
          - row "C+D E" [ref=e27]:
            - columnheader "C+D" [ref=e28]:
              - generic [ref=e29]: C+D
            - columnheader "E" [ref=e30]:
              - generic [ref=e31]: E
        - rowgroup [ref=e36]:
          - row "AA01 BB01 CC01" [ref=e37]:
            - gridcell "AA01" [ref=e38]:
              - generic [ref=e39]: AA01
            - gridcell "BB01" [ref=e40]:
              - generic [ref=e41]: BB01
            - gridcell "CC01" [ref=e42]:
              - generic [ref=e43]: CC01
        - rowgroup [ref=e48]:
          - row "footer 1 footer 2 footer 3" [ref=e49]:
            - gridcell "footer 1" [ref=e50]:
              - generic [ref=e51]: footer 1
            - gridcell "footer 2" [ref=e52]:
              - generic [ref=e53]: footer 2
            - gridcell "footer 3" [ref=e54]:
              - generic [ref=e55]: footer 3
      - grid [ref=e56]:
        - rowgroup [ref=e61]:
          - row "Align Left Align Center Align Right" [ref=e62]:
            - columnheader "Align Left" [ref=e63]:
              - generic [ref=e64]: Align Left
            - columnheader "Align Center" [ref=e65]:
              - generic [ref=e66]: Align Center
            - columnheader "Align Right" [ref=e67]:
              - generic [ref=e68]: Align Right
          - row "A+B C" [ref=e69]:
            - columnheader "A+B" [ref=e70]:
              - generic [ref=e71]: A+B
            - columnheader "C" [ref=e72]:
              - generic [ref=e73]: C
          - row "C+D E" [ref=e74]:
            - columnheader "C+D" [ref=e75]:
              - generic [ref=e76]: C+D
            - columnheader "E" [ref=e77]:
              - generic [ref=e78]: E
        - rowgroup [ref=e83]:
          - row "AA01 BB01 CC01" [ref=e84]:
            - gridcell "AA01" [ref=e85]:
              - generic [ref=e86]: AA01
            - gridcell "BB01" [ref=e87]:
              - generic [ref=e88]: BB01
            - gridcell "CC01" [ref=e89]:
              - generic [ref=e90]: CC01
        - rowgroup [ref=e95]:
          - row "footer 1 footer 2 footer 3" [ref=e96]:
            - gridcell "footer 1" [ref=e97]:
              - generic [ref=e98]: footer 1
            - gridcell "footer 2" [ref=e99]:
              - generic [ref=e100]: footer 2
            - gridcell "footer 3" [ref=e101]:
              - generic [ref=e102]: footer 3
      - grid [ref=e103]:
        - rowgroup [ref=e108]:
          - row "A+B C" [ref=e109]:
            - columnheader "A+B" [ref=e110]:
              - generic [ref=e111]: A+B
            - columnheader "C" [ref=e112]:
              - generic [ref=e113]: C
          - row "C+D E" [ref=e114]:
            - columnheader "C+D" [ref=e115]:
              - generic [ref=e116]: C+D
            - columnheader "E" [ref=e117]:
              - generic [ref=e118]: E
          - row "Align Left Align Center Align Right" [ref=e119]:
            - columnheader "Align Left" [ref=e120]:
              - generic [ref=e121]: Align Left
            - columnheader "Align Center" [ref=e122]:
              - generic [ref=e123]: Align Center
            - columnheader "Align Right" [ref=e124]:
              - generic [ref=e125]: Align Right
        - rowgroup [ref=e130]:
          - row "AA01 BB01 CC01" [ref=e131]:
            - gridcell "AA01" [ref=e132]:
              - generic [ref=e133]: AA01
            - gridcell "BB01" [ref=e134]:
              - generic [ref=e135]: BB01
            - gridcell "CC01" [ref=e136]:
              - generic [ref=e137]: CC01
        - rowgroup [ref=e142]:
          - row "footer 1 footer 2 footer 3" [ref=e143]:
            - gridcell "footer 1" [ref=e144]:
              - generic [ref=e145]: footer 1
            - gridcell "footer 2" [ref=e146]:
              - generic [ref=e147]: footer 2
            - gridcell "footer 3" [ref=e148]:
              - generic [ref=e149]: footer 3
  - generic [ref=e150]:
    - generic [ref=e151]: Column / Auxhead Only
    - generic [ref=e153]:
      - grid [ref=e154]:
        - rowgroup [ref=e159]:
          - row "Align Left Align Center Align Right" [ref=e160]:
            - columnheader "Align Left" [ref=e161]:
              - generic [ref=e162]: Align Left
            - columnheader "Align Center" [ref=e163]:
              - generic [ref=e164]: Align Center
            - columnheader "Align Right" [ref=e165]:
              - generic [ref=e166]: Align Right
        - rowgroup [ref=e171]:
          - row "AA01 BB01 CC01" [ref=e172]:
            - gridcell "AA01" [ref=e173]:
              - generic [ref=e174]: AA01
            - gridcell "BB01" [ref=e175]:
              - generic [ref=e176]: BB01
            - gridcell "CC01" [ref=e177]:
              - generic [ref=e178]: CC01
        - rowgroup [ref=e183]:
          - row "footer 1 footer 2" [ref=e184]:
            - gridcell "footer 1" [ref=e185]:
              - generic [ref=e186]: footer 1
            - gridcell "footer 2" [ref=e187]:
              - generic [ref=e188]: footer 2
      - grid [ref=e189]:
        - rowgroup [ref=e190]:
          - row "AA01 BB01 CC01" [ref=e191]:
            - gridcell "AA01" [ref=e192]:
              - generic [ref=e193]: AA01
            - gridcell "BB01" [ref=e194]:
              - generic [ref=e195]: BB01
            - gridcell "CC01" [ref=e196]:
              - generic [ref=e197]: CC01
        - rowgroup [ref=e198]:
          - row "footer 1 footer 2" [ref=e199]:
            - gridcell "footer 1" [ref=e200]:
              - generic [ref=e201]: footer 1
            - gridcell "footer 2" [ref=e202]:
              - generic [ref=e203]: footer 2
      - grid [ref=e204]:
        - rowgroup [ref=e205]:
          - row "AA01 BB01 CC01" [ref=e206]:
            - gridcell "AA01" [ref=e207]:
              - generic [ref=e208]: AA01
            - gridcell "BB01" [ref=e209]:
              - generic [ref=e210]: BB01
            - gridcell "CC01" [ref=e211]:
              - generic [ref=e212]: CC01
        - rowgroup [ref=e213]:
          - row "footer 1 footer 2" [ref=e214]:
            - gridcell "footer 1" [ref=e215]:
              - generic [ref=e216]: footer 1
            - gridcell "footer 2" [ref=e217]:
              - generic [ref=e218]: footer 2
  - generic [ref=e219]:
    - generic [ref=e220]: Static Sort Direction
    - generic [ref=e222]:
      - grid [ref=e223]:
        - rowgroup [ref=e227]:
          - row "Subject (asc) Received" [ref=e228]:
            - columnheader "Subject (asc)" [ref=e229] [cursor=pointer]:
              - generic [ref=e230]: Subject (asc)
            - columnheader "Received" [ref=e233] [cursor=pointer]:
              - generic [ref=e234]: Received
        - rowgroup [ref=e238]:
          - row "Style Guide for ZK 3.5 released 2008/11/14" [ref=e239]:
            - gridcell "Style Guide for ZK 3.5 released" [ref=e240]:
              - generic [ref=e241]: Style Guide for ZK 3.5 released
            - gridcell "2008/11/14" [ref=e242]:
              - generic [ref=e243]: 2008/11/14
          - row "ZK Jet 0.8.0 is released 2008/11/17" [ref=e244]:
            - gridcell "ZK Jet 0.8.0 is released" [ref=e245]:
              - generic [ref=e246]: ZK Jet 0.8.0 is released
            - gridcell "2008/11/17" [ref=e247]:
              - generic [ref=e248]: 2008/11/17
      - grid [ref=e249]:
        - rowgroup [ref=e253]:
          - row "Subject Received (desc)" [ref=e254]:
            - columnheader "Subject" [ref=e255] [cursor=pointer]:
              - generic [ref=e256]: Subject
            - columnheader "Received (desc)" [ref=e257] [cursor=pointer]:
              - generic [ref=e258]: Received (desc)
        - rowgroup [ref=e264]:
          - row "ZK Jet 0.8.0 is released 2008/11/17" [ref=e265]:
            - gridcell "ZK Jet 0.8.0 is released" [ref=e266]:
              - generic [ref=e267]: ZK Jet 0.8.0 is released
            - gridcell "2008/11/17" [ref=e268]:
              - generic [ref=e269]: 2008/11/17
          - row "Style Guide for ZK 3.5 released 2008/11/14" [ref=e270]:
            - gridcell "Style Guide for ZK 3.5 released" [ref=e271]:
              - generic [ref=e272]: Style Guide for ZK 3.5 released
            - gridcell "2008/11/14" [ref=e273]:
              - generic [ref=e274]: 2008/11/14
  - generic [ref=e275]:
    - generic [ref=e276]: Auxheader Rowspan
    - generic [ref=e278]:
      - grid [ref=e279]:
        - rowgroup [ref=e284]:
          - row "Group A Detail" [ref=e285]:
            - columnheader "Group A" [ref=e286]:
              - generic [ref=e287]: Group A
            - columnheader "Detail" [ref=e288]:
              - generic [ref=e289]: Detail
          - row "Sub-A1 Sub-A2" [ref=e290]:
            - columnheader "Sub-A1" [ref=e291]:
              - generic [ref=e292]: Sub-A1
            - columnheader "Sub-A2" [ref=e293]:
              - generic [ref=e294]: Sub-A2
          - row "Col 1 Col 2 Col 3" [ref=e295]:
            - columnheader "Col 1" [ref=e296]:
              - generic [ref=e297]: Col 1
            - columnheader "Col 2" [ref=e298]:
              - generic [ref=e299]: Col 2
            - columnheader "Col 3" [ref=e300]:
              - generic [ref=e301]: Col 3
        - rowgroup [ref=e306]:
          - row "R1C1 R1C2 R1C3" [ref=e307]:
            - gridcell "R1C1" [ref=e308]:
              - generic [ref=e309]: R1C1
            - gridcell "R1C2" [ref=e310]:
              - generic [ref=e311]: R1C2
            - gridcell "R1C3" [ref=e312]:
              - generic [ref=e313]: R1C3
          - row "R2C1 R2C2 R2C3" [ref=e314]:
            - gridcell "R2C1" [ref=e315]:
              - generic [ref=e316]: R2C1
            - gridcell "R2C2" [ref=e317]:
              - generic [ref=e318]: R2C2
            - gridcell "R2C3" [ref=e319]:
              - generic [ref=e320]: R2C3
      - grid [ref=e321]:
        - rowgroup [ref=e326]:
          - row "Span2Rows B+C" [ref=e327]:
            - columnheader "Span2Rows" [ref=e328]:
              - generic [ref=e329]: Span2Rows
            - columnheader "B+C" [ref=e330]:
              - generic [ref=e331]: B+C
          - row "B C" [ref=e332]:
            - columnheader "B" [ref=e333]:
              - generic [ref=e334]: B
            - columnheader "C" [ref=e335]:
              - generic [ref=e336]: C
          - row "Name Value Unit" [ref=e337]:
            - columnheader "Name" [ref=e338]:
              - generic [ref=e339]: Name
            - columnheader "Value" [ref=e340]:
              - generic [ref=e341]: Value
            - columnheader "Unit" [ref=e342]:
              - generic [ref=e343]: Unit
        - rowgroup [ref=e348]:
          - row "Alpha 42 kg" [ref=e349]:
            - gridcell "Alpha" [ref=e350]:
              - generic [ref=e351]: Alpha
            - gridcell "42" [ref=e352]:
              - generic [ref=e353]: "42"
            - gridcell "kg" [ref=e354]:
              - generic [ref=e355]: kg
          - row "Beta 18 m" [ref=e356]:
            - gridcell "Beta" [ref=e357]:
              - generic [ref=e358]: Beta
            - gridcell "18" [ref=e359]:
              - generic [ref=e360]: "18"
            - gridcell "m" [ref=e361]:
              - generic [ref=e362]: m
  - generic [ref=e363]:
    - generic [ref=e364]: sizedByContent + Span Column
    - generic [ref=e366]:
      - grid [ref=e367]:
        - rowgroup [ref=e372]:
          - row "ID Product Name Price" [ref=e373]:
            - columnheader "ID" [ref=e374]:
              - generic [ref=e375]: ID
            - columnheader "Product Name" [ref=e376]:
              - generic [ref=e377]: Product Name
            - columnheader "Price" [ref=e378]:
              - generic [ref=e379]: Price
        - rowgroup [ref=e384]:
          - row "001 Widget Pro X $49.99" [ref=e385]:
            - gridcell "001" [ref=e386]:
              - generic [ref=e387]: "001"
            - gridcell "Widget Pro X" [ref=e388]:
              - generic [ref=e389]: Widget Pro X
            - gridcell "$49.99" [ref=e390]:
              - generic [ref=e391]: $49.99
          - row "002 Gadget Mini $9.99" [ref=e392]:
            - gridcell "002" [ref=e393]:
              - generic [ref=e394]: "002"
            - gridcell "Gadget Mini" [ref=e395]:
              - generic [ref=e396]: Gadget Mini
            - gridcell "$9.99" [ref=e397]:
              - generic [ref=e398]: $9.99
          - row "003 Super Long Product Name Here $199.00" [ref=e399]:
            - gridcell "003" [ref=e400]:
              - generic [ref=e401]: "003"
            - gridcell "Super Long Product Name Here" [ref=e402]:
              - generic [ref=e403]: Super Long Product Name Here
            - gridcell "$199.00" [ref=e404]:
              - generic [ref=e405]: $199.00
      - grid [ref=e406]:
        - rowgroup [ref=e411]:
          - row "Fixed Span (grid span=true) Fixed2" [ref=e412]:
            - columnheader "Fixed" [ref=e413]:
              - generic [ref=e414]: Fixed
            - columnheader "Span (grid span=true)" [ref=e415]:
              - generic [ref=e416]: Span (grid span=true)
            - columnheader "Fixed2" [ref=e417]:
              - generic [ref=e418]: Fixed2
        - rowgroup [ref=e423]:
          - row "A This column stretches to fill remaining space Z" [ref=e424]:
            - gridcell "A" [ref=e425]:
              - generic [ref=e426]: A
            - gridcell "This column stretches to fill remaining space" [ref=e427]:
              - generic [ref=e428]: This column stretches to fill remaining space
            - gridcell "Z" [ref=e429]:
              - generic [ref=e430]: Z
          - row "B Short Y" [ref=e431]:
            - gridcell "B" [ref=e432]:
              - generic [ref=e433]: B
            - gridcell "Short" [ref=e434]:
              - generic [ref=e435]: Short
            - gridcell "Y" [ref=e436]:
              - generic [ref=e437]: "Y"
  - generic [ref=e438]:
    - generic [ref=e439]: Frozen Right (Start Columns Scroll)
    - grid [ref=e441]:
      - rowgroup [ref=e449]:
        - row "ID Product Category Stock Price Action" [ref=e450]:
          - columnheader "ID" [ref=e451]:
            - generic [ref=e452]: ID
          - columnheader "Product" [ref=e453]:
            - generic [ref=e454]: Product
          - columnheader "Category" [ref=e455]:
            - generic [ref=e456]: Category
          - columnheader "Stock" [ref=e457]:
            - generic [ref=e458]: Stock
          - columnheader "Price" [ref=e459]:
            - generic [ref=e460]: Price
          - columnheader "Action" [ref=e461]:
            - generic [ref=e462]: Action
      - rowgroup [ref=e470]:
        - row "001 Widget Pro X Electronics 120 $49.99 Edit" [ref=e471]:
          - gridcell "001" [ref=e472]:
            - generic [ref=e473]: "001"
          - gridcell "Widget Pro X" [ref=e474]:
            - generic [ref=e475]: Widget Pro X
          - gridcell "Electronics" [ref=e476]:
            - generic [ref=e477]: Electronics
          - gridcell "120" [ref=e478]:
            - generic [ref=e479]: "120"
          - gridcell "$49.99" [ref=e480]:
            - generic [ref=e481]: $49.99
          - gridcell "Edit" [ref=e482]:
            - generic [ref=e483]: Edit
        - row "002 Gadget Mini Accessories 45 $9.99 Edit" [ref=e484]:
          - gridcell "002" [ref=e485]:
            - generic [ref=e486]: "002"
          - gridcell "Gadget Mini" [ref=e487]:
            - generic [ref=e488]: Gadget Mini
          - gridcell "Accessories" [ref=e489]:
            - generic [ref=e490]: Accessories
          - gridcell "45" [ref=e491]:
            - generic [ref=e492]: "45"
          - gridcell "$9.99" [ref=e493]:
            - generic [ref=e494]: $9.99
          - gridcell "Edit" [ref=e495]:
            - generic [ref=e496]: Edit
        - row "003 SuperLong Name Product Furniture 8 $199.00 Edit" [ref=e497]:
          - gridcell "003" [ref=e498]:
            - generic [ref=e499]: "003"
          - gridcell "SuperLong Name Product" [ref=e500]:
            - generic [ref=e501]: SuperLong Name Product
          - gridcell "Furniture" [ref=e502]:
            - generic [ref=e503]: Furniture
          - gridcell "8" [ref=e504]:
            - generic [ref=e505]: "8"
          - gridcell "$199.00" [ref=e506]:
            - generic [ref=e507]: $199.00
          - gridcell "Edit" [ref=e508]:
            - generic [ref=e509]: Edit
        - row "004 Basic Stand Office 200 $24.50 Edit" [ref=e510]:
          - gridcell "004" [ref=e511]:
            - generic [ref=e512]: "004"
          - gridcell "Basic Stand" [ref=e513]:
            - generic [ref=e514]: Basic Stand
          - gridcell "Office" [ref=e515]:
            - generic [ref=e516]: Office
          - gridcell "200" [ref=e517]:
            - generic [ref=e518]: "200"
          - gridcell "$24.50" [ref=e519]:
            - generic [ref=e520]: $24.50
          - gridcell "Edit" [ref=e521]:
            - generic [ref=e522]: Edit
  - generic [ref=e528]:
    - generic [ref=e529]: Sticky Header (z-sticky-header)
    - grid [ref=e532]:
      - rowgroup [ref=e537]:
        - 'row "Row # Subject Date" [ref=e538]':
          - 'columnheader "Row #" [ref=e539]':
            - generic [ref=e540]: "Row #"
          - columnheader "Subject" [ref=e541]:
            - generic [ref=e542]: Subject
          - columnheader "Date" [ref=e543]:
            - generic [ref=e544]: Date
      - rowgroup [ref=e549]:
        - row "1 Introduction to ZK Framework 2024-01-01" [ref=e550]:
          - gridcell "1" [ref=e551]:
            - generic [ref=e552]: "1"
          - gridcell "Introduction to ZK Framework" [ref=e553]:
            - generic [ref=e554]: Introduction to ZK Framework
          - gridcell "2024-01-01" [ref=e555]:
            - generic [ref=e556]: 2024-01-01
        - row "2 Building Reactive UIs 2024-01-02" [ref=e557]:
          - gridcell "2" [ref=e558]:
            - generic [ref=e559]: "2"
          - gridcell "Building Reactive UIs" [ref=e560]:
            - generic [ref=e561]: Building Reactive UIs
          - gridcell "2024-01-02" [ref=e562]:
            - generic [ref=e563]: 2024-01-02
        - row "3 Data Binding in MVVM 2024-01-03" [ref=e564]:
          - gridcell "3" [ref=e565]:
            - generic [ref=e566]: "3"
          - gridcell "Data Binding in MVVM" [ref=e567]:
            - generic [ref=e568]: Data Binding in MVVM
          - gridcell "2024-01-03" [ref=e569]:
            - generic [ref=e570]: 2024-01-03
        - row "4 Component Lifecycle 2024-01-04" [ref=e571]:
          - gridcell "4" [ref=e572]:
            - generic [ref=e573]: "4"
          - gridcell "Component Lifecycle" [ref=e574]:
            - generic [ref=e575]: Component Lifecycle
          - gridcell "2024-01-04" [ref=e576]:
            - generic [ref=e577]: 2024-01-04
        - row "5 Custom CSS Themes 2024-01-05" [ref=e578]:
          - gridcell "5" [ref=e579]:
            - generic [ref=e580]: "5"
          - gridcell "Custom CSS Themes" [ref=e581]:
            - generic [ref=e582]: Custom CSS Themes
          - gridcell "2024-01-05" [ref=e583]:
            - generic [ref=e584]: 2024-01-05
        - row "6 Grid and Listbox 2024-01-06" [ref=e585]:
          - gridcell "6" [ref=e586]:
            - generic [ref=e587]: "6"
          - gridcell "Grid and Listbox" [ref=e588]:
            - generic [ref=e589]: Grid and Listbox
          - gridcell "2024-01-06" [ref=e590]:
            - generic [ref=e591]: 2024-01-06
        - row "7 Tree Component 2024-01-07" [ref=e592]:
          - gridcell "7" [ref=e593]:
            - generic [ref=e594]: "7"
          - gridcell "Tree Component" [ref=e595]:
            - generic [ref=e596]: Tree Component
          - gridcell "2024-01-07" [ref=e597]:
            - generic [ref=e598]: 2024-01-07
        - row "8 Tabbox and Panels 2024-01-08" [ref=e599]:
          - gridcell "8" [ref=e600]:
            - generic [ref=e601]: "8"
          - gridcell "Tabbox and Panels" [ref=e602]:
            - generic [ref=e603]: Tabbox and Panels
          - gridcell "2024-01-08" [ref=e604]:
            - generic [ref=e605]: 2024-01-08
        - row "9 Event Handling 2024-01-09" [ref=e606]:
          - gridcell "9" [ref=e607]:
            - generic [ref=e608]: "9"
          - gridcell "Event Handling" [ref=e609]:
            - generic [ref=e610]: Event Handling
          - gridcell "2024-01-09" [ref=e611]:
            - generic [ref=e612]: 2024-01-09
        - row "10 Server Push 2024-01-10" [ref=e613]:
          - gridcell "10" [ref=e614]:
            - generic [ref=e615]: "10"
          - gridcell "Server Push" [ref=e616]:
            - generic [ref=e617]: Server Push
          - gridcell "2024-01-10" [ref=e618]:
            - generic [ref=e619]: 2024-01-10
        - row "11 Security Configuration 2024-01-11" [ref=e620]:
          - gridcell "11" [ref=e621]:
            - generic [ref=e622]: "11"
          - gridcell "Security Configuration" [ref=e623]:
            - generic [ref=e624]: Security Configuration
          - gridcell "2024-01-11" [ref=e625]:
            - generic [ref=e626]: 2024-01-11
        - row "12 Spring Integration 2024-01-12" [ref=e627]:
          - gridcell "12" [ref=e628]:
            - generic [ref=e629]: "12"
          - gridcell "Spring Integration" [ref=e630]:
            - generic [ref=e631]: Spring Integration
          - gridcell "2024-01-12" [ref=e632]:
            - generic [ref=e633]: 2024-01-12
        - row "13 Hibernate ORM 2024-01-13" [ref=e634]:
          - gridcell "13" [ref=e635]:
            - generic [ref=e636]: "13"
          - gridcell "Hibernate ORM" [ref=e637]:
            - generic [ref=e638]: Hibernate ORM
          - gridcell "2024-01-13" [ref=e639]:
            - generic [ref=e640]: 2024-01-13
        - row "14 Testing ZK Apps 2024-01-14" [ref=e641]:
          - gridcell "14" [ref=e642]:
            - generic [ref=e643]: "14"
          - gridcell "Testing ZK Apps" [ref=e644]:
            - generic [ref=e645]: Testing ZK Apps
          - gridcell "2024-01-14" [ref=e646]:
            - generic [ref=e647]: 2024-01-14
        - row "15 Deployment Guide 2024-01-15" [ref=e648]:
          - gridcell "15" [ref=e649]:
            - generic [ref=e650]: "15"
          - gridcell "Deployment Guide" [ref=e651]:
            - generic [ref=e652]: Deployment Guide
          - gridcell "2024-01-15" [ref=e653]:
            - generic [ref=e654]: 2024-01-15
        - row "16 Performance Tuning 2024-01-16" [ref=e655]:
          - gridcell "16" [ref=e656]:
            - generic [ref=e657]: "16"
          - gridcell "Performance Tuning" [ref=e658]:
            - generic [ref=e659]: Performance Tuning
          - gridcell "2024-01-16" [ref=e660]:
            - generic [ref=e661]: 2024-01-16
        - row "17 Accessibility Tips 2024-01-17" [ref=e662]:
          - gridcell "17" [ref=e663]:
            - generic [ref=e664]: "17"
          - gridcell "Accessibility Tips" [ref=e665]:
            - generic [ref=e666]: Accessibility Tips
          - gridcell "2024-01-17" [ref=e667]:
            - generic [ref=e668]: 2024-01-17
        - row "18 Internationalization 2024-01-18" [ref=e669]:
          - gridcell "18" [ref=e670]:
            - generic [ref=e671]: "18"
          - gridcell "Internationalization" [ref=e672]:
            - generic [ref=e673]: Internationalization
          - gridcell "2024-01-18" [ref=e674]:
            - generic [ref=e675]: 2024-01-18
        - row "19 Client-Side Widgets 2024-01-19" [ref=e676]:
          - gridcell "19" [ref=e677]:
            - generic [ref=e678]: "19"
          - gridcell "Client-Side Widgets" [ref=e679]:
            - generic [ref=e680]: Client-Side Widgets
          - gridcell "2024-01-19" [ref=e681]:
            - generic [ref=e682]: 2024-01-19
        - row "20 Release Notes 10.x 2024-01-20" [ref=e683]:
          - gridcell "20" [ref=e684]:
            - generic [ref=e685]: "20"
          - gridcell "Release Notes 10.x" [ref=e686]:
            - generic [ref=e687]: Release Notes 10.x
          - gridcell "2024-01-20" [ref=e688]:
            - generic [ref=e689]: 2024-01-20
  - generic [ref=e690]:
    - generic [ref=e691]: Embedded Components in Header
    - generic [ref=e693]:
      - grid [ref=e694]:
        - rowgroup [ref=e699]:
          - row "Align Left Align Center Align Right" [ref=e700]:
            - columnheader "Align Left" [ref=e701]:
              - generic [ref=e702]: Align Left
            - columnheader "Align Center" [ref=e703]:
              - generic [ref=e704]: Align Center
            - columnheader "Align Right" [ref=e705]:
              - generic [ref=e706]: Align Right
          - row "A+B C" [ref=e707]:
            - columnheader "A+B" [ref=e708]:
              - generic [ref=e709]: A+B
            - columnheader "C" [ref=e710]:
              - generic [ref=e711]: C
          - row "ss ssss" [ref=e712]:
            - columnheader "ss ssss" [ref=e713]:
              - generic [ref=e714]:
                - text: ss
                - textbox [ref=e715]
                - combobox [ref=e716]:
                  - textbox [ref=e717]
                  - button [ref=e718] [cursor=pointer]
                - text: ssss
        - rowgroup [ref=e724]:
          - row "AA01 BB01 CC01" [ref=e725]:
            - gridcell "AA01" [ref=e726]:
              - generic [ref=e727]: AA01
            - gridcell "BB01" [ref=e728]:
              - generic [ref=e729]: BB01
            - gridcell "CC01" [ref=e730]:
              - generic [ref=e731]: CC01
          - row "AA01 BB01 CC01" [ref=e732]:
            - gridcell "AA01" [ref=e733]:
              - generic [ref=e734]: AA01
            - gridcell "BB01" [ref=e735]:
              - generic [ref=e736]: BB01
            - gridcell "CC01" [ref=e737]:
              - generic [ref=e738]: CC01
          - row "AA01 BB01 CC01" [ref=e739]:
            - gridcell "AA01" [ref=e740]:
              - generic [ref=e741]: AA01
            - gridcell "BB01" [ref=e742]:
              - generic [ref=e743]: BB01
            - gridcell "CC01" [ref=e744]:
              - generic [ref=e745]: CC01
        - rowgroup [ref=e750]:
          - row "footer 1 footer 2" [ref=e751]:
            - gridcell "footer 1" [ref=e752]:
              - generic [ref=e753]: footer 1
            - gridcell "footer 2" [ref=e754]:
              - generic [ref=e755]: footer 2
      - grid [ref=e756]:
        - rowgroup [ref=e760]:
          - row "Type lable Content option1" [ref=e761]:
            - columnheader "Type lable" [ref=e762]:
              - generic [ref=e763]:
                - text: Type
                - menubar [ref=e764]:
                  - menuitem "File" [ref=e765] [cursor=pointer]:
                    - generic: File
                  - menuitem "Help" [ref=e767] [cursor=pointer]:
                    - generic: Help
                - button "lable" [ref=e769] [cursor=pointer]
                - combobox [ref=e770]:
                  - textbox [ref=e771]
                  - button [ref=e772] [cursor=pointer]
            - columnheader "Content option1" [ref=e774]:
              - generic [ref=e775]:
                - text: Content
                - combobox [ref=e776] [cursor=pointer]:
                  - option "option1"
                  - option "option2"
                  - option "option3"
        - rowgroup [ref=e780]:
          - row "File:" [ref=e781]:
            - gridcell "File:" [ref=e782]:
              - generic [ref=e783]: "File:"
            - gridcell [ref=e784]:
              - textbox [ref=e786]
          - 'row "Type: Java Files,(*.java) Browse..." [ref=e787]':
            - gridcell "Type:" [ref=e788]:
              - generic [ref=e789]: "Type:"
            - gridcell "Java Files,(*.java) Browse..." [ref=e790]:
              - generic [ref=e792]:
                - combobox [ref=e793] [cursor=pointer]:
                  - option "Java Files,(*.java)"
                  - option "All Files,(*.*)"
                - button "Browse..." [ref=e794] [cursor=pointer]
          - row "Options:" [ref=e795]:
            - gridcell "Options:" [ref=e796]:
              - generic [ref=e797]: "Options:"
            - gridcell [ref=e798]:
              - textbox [ref=e800]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import * as fs from 'fs';
  3  | import * as path from 'path';
  4  | 
  5  | // Scan-driven gallery coverage (test-architecture.md §6, roadmap step 2).
  6  | //
  7  | // This spec discovers preview pages by SCANNING src/test/resources/web/*.zul at
  8  | // collection time, so a NEW component page is covered by a baseline screenshot the
  9  | // moment it is added — no edit to this file required. That closes the silent-gap
  10 | // problem of the hand-maintained screenshot.spec.ts.
  11 | //
  12 | // Each covered page gets ONE gallery screenshot of its `.z-p-8` wrapper. Richer
  13 | // state matrices (hover/focus/active) and computed-style guards stay in
  14 | // screenshot.spec.ts; this spec is the breadth layer, that one is the depth layer.
  15 | //
  16 | // Requires the preview app on ${PREVIEW_URL}
  17 | //   withjdk.sh 17 mvn test exec:java@preview-app
  18 | 
  19 | const WEB_DIR = path.resolve(__dirname, '../../main/webapp/web');
  20 | 
  21 | // Pages with a bespoke gallery block already in screenshot.spec.ts — skip here to
  22 | // avoid duplicate baselines. Their depth coverage (states) lives there.
  23 | const COVERED_ELSEWHERE = new Set([
  24 |   'button', 'textbox', 'checkbox', 'combobox', 'listbox', 'grid', 'datebox',
  25 |   'timebox', 'spinner', 'bandbox', 'selectbox', 'tabbox', 'tree', 'window', 'panel', 'toast',
  26 | ]);
  27 | 
  28 | // Pages a static gallery screenshot can't meaningfully or stably capture.
  29 | const SKIP = new Set([
  30 |   // Non-visual primitives / structural / meta pages
  31 |    'area', 'html', 'iframe', 'imagemap', 
  32 |   'scrollbar',  'overview', 'preview', 'inputs',
  33 |   // Non-deterministic / hardware / external-resource / animated → flaky baselines
  34 |   'camera', 'barcodescanner', 'captcha', 'video', 'audio', 'fileupload', 'loading', 'loadingbar',
  35 |   // Auto-generated icon catalog (all Lucide icons) — a whole-page listing, not an ordinary
  36 |   // preview; regenerated by build:css. Also excluded from check-icon-coverage.sh.
  37 |   'icons-lucide'
  38 | ]);
  39 | 
  40 | const pages = fs.readdirSync(WEB_DIR)
  41 |   .filter(f => f.endsWith('.zul'))
  42 |   .map(f => f.replace(/\.zul$/, ''))
  43 |   .filter(name => !COVERED_ELSEWHERE.has(name) && !SKIP.has(name))
  44 |   .sort();
  45 | 
  46 | test.describe('gallery', () => {
  47 |   for (const comp of pages) {
  48 |     test(comp, async ({ page }) => {
  49 |       await page.goto(`/${comp}.zul`, { waitUntil: 'networkidle' });
  50 |       // Wait for the Inter web font to settle — otherwise the shot can be taken
  51 |       // mid font-swap and the page height drifts a few px (see reorg investigation).
  52 |       await page.evaluate(() => document.fonts.ready.then(() => true));
  53 |       // Snap CSS transitions to their end state. `animations: 'disabled'` below does not
  54 |       // cover a transition that ZK starts client-side after Playwright has set the page up:
  55 |       // progressmeter's fill transitions width 0 -> value on first render (~0.3s, see
  56 |       // progressmeter.css), so the shot landed at a variable point and progressmeter-gallery
  57 |       // was non-reproducible run to run — three samples differed only along the 4px-tall
  58 |       // fill's antialiased leading edge. Zero duration completes any in-flight transition
  59 |       // immediately (chat D68).
  60 |       await page.addStyleTag({ content: '*{transition-duration:0s !important}' });
  61 |       const wrapper = page.locator('.z-p-8').first();
  62 |       // Every standard preview page renders the .z-p-8 wrapper; fail loudly if a
  63 |       // newly-added page uses a different shell so it gets an explicit decision
  64 |       // (add a wrapper, or add it to SKIP) rather than a silent body-sized shot.
  65 |       await expect(
  66 |         wrapper,
  67 |         `${comp}.zul has no .z-p-8 wrapper — give it one or add "${comp}" to SKIP in gallery-scan.spec.ts`
  68 |       ).toBeVisible();
  69 |       // Flat layout: doc/screenshots/<comp>-gallery.png (single hyphenated name).
> 70 |       await expect(wrapper).toHaveScreenshot(`${comp}-gallery.png`, {
     |                             ^ Error: expect(locator).toHaveScreenshot(expected) failed
  71 |         animations: 'disabled',
  72 |         // small tolerance for sub-pixel AA differences across runs
  73 |         maxDiffPixelRatio: 0.01,
  74 |       });
  75 |     });
  76 |   }
  77 | });
  78 | 
```