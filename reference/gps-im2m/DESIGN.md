# gps.im2m.ws (Trakzee "Smart" theme): captured design reference

This was captured on 2026-11-08 from `https://gps.im2m.ws/jsp/index.html` (version v04.212.07), using the signed-in session in Chrome.
It is the target look for the `pilot-theme-26` extension.

## How the page is built

- `index.html` contains the iframe `#divframe` (`/jsp/goindex.jsp`). That iframe is the app shell: the sidebar and the logo.
- Inside it, `#windowframe` (`/jsp/oldindex.jsp`) is a frameset. Its `contentframe` (`/jsp/DetailScreen.jsp`) is the tracking screen:
  the object list, the map and the right-hand info panel. The `body` class is `trakzeeTrackingBody`.
- The screen loads 137 stylesheets. The ones that define the look are in `css/`. The rest are mostly icon fonts.

## Colors

| Token | Value | Where |
|---|---|---|
| sidebar-bg | `rgb(7, 22, 61)` `#07163D` | `#left-tree.left_bg.tree-container` |
| logo-bg | `rgb(2, 5, 15)` `#02050F` | `#tree-logo` (78×78, round "im" logo) |
| sidebar-active | `rgb(21, 66, 183)` `#1542B7` | `li.app-container.selected-app` |
| sidebar-fg | `#FFFFFF`, submenu text `#F4F4F4` | |
| submenu-bg | blue gradient, same family as `#1542B7` (see screenshot 02) | `.sub-menu-layer` (170px wide) |
| panel-header-bg | `rgb(35, 66, 146)` `#234292` | `.list-header-container.top-frame-bg` (tab bar "Object …"), white text |
| panel-header-active-tab | white tab with `#234292` text | "Object" tab |
| text | `rgb(68, 68, 68)` `#444` | lists, cards |
| label-muted | `rgb(82, 82, 82)` `#525252` | `.widget-label` |
| search-bg | `rgb(245, 245, 245)` `#F5F5F5`, text `#7A7A7A`, shadow `0 0 1px #D3D3D3` | `input.inputbox-search` (28px high) |
| group-row-bg | light grey (`#E6E6E6` approx.) bold `#444` 11px | `.ol-company-name` |
| card | `#FFF`, radius `6px`, shadow `0 2px 4px rgba(0,0,0,.3)`, padding `10px` | `.stack-item-content` (right panel) |
| card-dark | navy gradient cards ("No Temperature Sensor Found") | right panel |
| map label | `#2F6E8F`-ish teal/blue box, white bold text; selected = red `#E53935` | map markers |

### Status tiles (object counts)

Each tile has a 15% tint background with the solid color as text: count on top, label under it in 7px bold.

| Status | Background | Text |
|---|---|---|
| Running | `rgba(0,128,0,.15)` | `rgb(0,128,0)` |
| Idle | `rgba(255,193,7,.15)` | `rgb(206,154,0)` |
| Stopped | `rgba(255,0,0,.15)` | `rgb(255,0,0)` |
| Inactive | `rgba(0,0,255,.15)` | `rgb(0,0,255)` |
| No Data | `rgba(128,128,128,.15)` | `rgb(128,128,128)` |
| Expired | `rgb(253,236,236)` | `rgb(198,40,40)` |
| Total | `rgba(0,0,0,.15)` | `rgb(0,0,0)` |

Element ids: `#data-status-running|idle|stop|inactive|nodata|expired|total` and `#data-status-label-*`.

## Typography

- The font is **Open Sans** (`Open-Sans`). `fonts/OpenSans-Regular.ttf` and `fonts/OpenSans-Semibold.ttf` are here, and Google Fonts also has it.
- Sizes are small and dense: list text 11px, group rows 11px/600, card titles 12px/600, card labels 11px, status labels 7px/600, sidebar labels 12px, sidebar icons 27px.

## Sidebar (`goindex.jsp`)

- It is 90px wide and fixed on the left. The logo block (78×78) is at the top, then the user and bell icons, then the modules.
- Each module item is 90×80: an icon (icon font `tree`, 27px) above a 12px label. The active item gets the `#1542B7` background.
- Clicking a module opens a flyout submenu (170px) with a list of items and `>` arrows, styled as a blue panel (screenshot 02).
- Two icons sit at the bottom: download and support/chat.

```html
<div id="left-tree" class="left_bg tree-container">
  <div id="tree-logo" class="logo-container app-logo"><img id="logo-img" class="logo-img" src="showimage.jsp"></div>
  <div id="tree-user" class="user-container">
    <span id="user_info_btn" class="user-img tree-icon icon tree-user" title="User"></span>
    <span class="user-img tree-icon icon tree-notification" title="Notifications"></span>
  </div>
  <div id="tree-module" class="module-container scrollable-content">
    <ul id="menu" class="menu nav nav-sidebar firstMenu">
      <li id="menu_01" class="app-container" title="Dashboard">
        <button class="cursor-hand"><div class="module cursor-hand">
          <span class="module-img tree-icon icon tree-icon-text tree-Dashboard"></span>
          <span class="tree-icon-text main_menu">Dashboard</span>
        </div></button>
      </li>
      <li id="menu_02" class="app-container selected-app"> … Tracking … </li>
      <li class="app-container"> … Reports …
        <div id="subMenu" class="menu-layer sub-menu-layer"><ul class="subMenuUl">
          <li><a>Activity</a><div id="deepMenu" class="menu-layer deep-menu-layer">…</div></li> …
        </ul></div>
      </li>
      <!-- Charts, Settings -->
    </ul>
  </div>
</div>
```

Glyph names in the `tree` icon font (`fonts/tree.woff2`, `css/Themes_Smart_fonts_tree_tree.css`): administration, avatar, bell,
chart, chart-fill, charts, configuration, dashboard, favourites, help, home, launcher, location, logout, notification,
reports, report-fill, settings, setting-fill, tracking, tracking-fill, user.

## Tracking screen (`DetailScreen.jsp`)

- **Left floating panel**, about 440px wide, rounded, with a shadow, over the map:
  - A tab bar in `#234292`: "Object" tab (active, white), then icon tabs (driver, person, grid, video), with a gear on the right.
  - A row of status tiles (Running / Idle / Stopped / Inactive / NoData / Total).
  - A toolbar: clear (×), select-all checkbox, search box ("Search by IMEI, VIN, Registration, Object Model, SIM Number, etc."), then search, refresh, filter and sort icons.
  - Group rows (grey, bold, with `[ count ]` on the right), then object rows. Each object row shows: checkbox, a status dot (green, red or orange), name in blue bold 11px with the time under it in grey,
    speed, then icon columns (ignition key, battery, GSM signal, voltage in green such as `25.5V`, camera, video, photo, playback, code, phone).
- **Map**: full screen, Leaflet. "Playback" button at the top center; vertical icon toolbar on the right edge; zoom + / −.
- **Right info panel**, about 160px wide, a stack of cards:
  - Object card: name, photo, a red "Stopped" badge with duration, Current Trip km, an odometer-style digit counter, Work Hour, Driver, Mobile, More Details, and an action icon row.
  - "GPS Device Information" card (Device, Device Status in red "Disconnected", Last Date, IMEI, SIM, Installation Date, Warranty).
  - "Today Activity" card (Running, Idle, Stop, Inactive and Work Hour with colored values; "Show Log").
  - Dark navy cards: "No Temperature Sensor Found" and "No Humidity Sensor Found".
  - "Location" card (address and coordinates).

## Files

- `css/`: the downloaded stylesheets. `css_goindex.css` and `css_divFrameStyle.css` are the shell and sidebar. `Themes_Smart_css_*` is the Smart theme.
  `css_advance_newtracking.css`, `css_live_monitoring.css` and `css_smart_tracking_tooltip.css` are the tracking screen.
- `fonts/`: the `tree`, `title-icon` and `bt` icon fonts, plus Open Sans.
- `screenshots/`: `01-tracking-overview.jpg` (main screen), `02-reports-submenu.jpg` (sidebar flyout), `00-loading-empty.jpg`.
- `../gps-im2m-reference.zip`: everything above in one archive.
