/**
 * PILOT Extension: pilot_theme_26
 *
 * Re-skins PILOT so it looks like gps.im2m.ws (Trakzee "Smart" theme); the reference capture is in
 * reference/gps-im2m/ (DESIGN.md, CSS, fonts, screenshots).
 *
 * What it does (v0.1):
 *   - replaces PILOT's top header with a 90px navy left sidebar: logo, user + notifications,
 *     one icon-over-label item per PILOT module, and the header tools at the bottom.
 *     Every sidebar item clicks PILOT's own button, so all behaviour stays PILOT's.
 *   - shows PILOT's object counters (Total / Moving / Parking / Idle / Problems) as gps.im2m.ws
 *     status tiles above the left panel.
 *   - theme.css: Open Sans, navy/blue headers and tabs, dense lists, cards, blue buttons.
 *   - "Classic view" (bottom of the sidebar) switches back to the normal PILOT look; the choice is
 *     remembered in this browser.
 *
 * Nothing is removed from PILOT: the header is only hidden, and everything is restored in classic view.
 */
(function () {
    var EXT = 'pilot_theme_26';
    var VERSION = '0.1.0';
    var BASE = '/store/' + EXT + '/';

    // PILOT main-menu itemId -> glyph of the gps.im2m.ws "tree" icon font (others keep PILOT's Font Awesome icon)
    var TREE_GLYPH = { home: '', reports: '', analytics: '', history: '', account: '', events: '' };
    // PILOT counter tooltip -> tile style
    var TILE = { Total: 'total', Moving: 'moving', Parking: 'parking', Idle: 'idle', Problems: 'problems' };

    function enc(v) { return Ext.String.htmlEncode(v === null || v === undefined ? '' : String(v)); }
    function plain(html) { return String(html || '').replace(/<[^>]*>/g, '').trim(); }
    function store(key, val) {
        try {
            if (val === undefined) { return window.localStorage.getItem(EXT + '.' + key); }
            window.localStorage.setItem(EXT + '.' + key, val);
        } catch (e) { /* storage blocked */ }
        return null;
    }
    function domClick(cmp) {
        // Fire PILOT's own handler exactly as a user click would.
        var el = cmp && cmp.el && cmp.el.dom;
        if (el) { el.click(); }
    }

    Ext.define('Store.pilot_theme_26.Module', {
        extend: 'Ext.Component',

        initModule: function () {
            var me = this;
            if (window.console) { console.log(EXT + ': initModule() v' + VERSION); }
            me.loadCss();
            // The header and its buttons are built by PILOT; wait until they are rendered.
            me.waitFor(function () {
                var hdr = Ext.ComponentQuery.query('pilot-header')[0];
                return hdr && hdr.rendered && hdr.items.getCount() > 2 ? hdr : null;
            }, function (hdr) {
                try {
                    me.setup(hdr);
                } catch (e) {
                    if (window.console) { console.error(EXT + ': setup failed, PILOT keeps its normal look', e); }
                    me.classic(true);
                }
            });
        },

        waitFor: function (test, done, tries) {
            var me = this, v = test();
            if (v) { done(v); return; }
            if ((tries || 0) > 100) { if (window.console) { console.warn(EXT + ': PILOT header not found'); } return; }
            Ext.defer(function () { me.waitFor(test, done, (tries || 0) + 1); }, 200);
        },

        loadCss: function () {
            if (document.getElementById(EXT + '-css')) { return; }
            var css = document.createElement('link');
            css.id = EXT + '-css';
            css.rel = 'stylesheet';
            css.href = BASE + 'theme.css?v=' + VERSION;
            document.head.appendChild(css);
        },

        setup: function (hdr) {
            var me = this,
                sk = Ext.ComponentQuery.query('pilot-skeleton')[0];

            me.hdr = hdr;
            me.menu = hdr.down('toolbar[cls~=main_buttons]') || hdr.items.getAt(1);
            me.counters = [];
            me.tools = [];
            me.userPic = null;
            me.bell = null;
            hdr.items.each(function (c) {
                var tip = plain(c.tooltip);
                if (c === me.menu) { return; }
                if (c.xtype === 'button' && /header_tool/.test(c.cls || '') && TILE[tip]) { me.counters.push(c); }
                else if (/userpic/.test(c.cls || '')) { me.userPic = c; }
                else if (c.xtype === 'badgebutton') { me.bell = c; }
                else if (c.xtype === 'button' && !/header_tool/.test(c.cls || '')) { me.tools.push(c); }
            });

            me.sidebar = Ext.create('Ext.Component', {
                region: 'west',
                width: 90,
                cls: 'pt26-sidebar-cmp',
                html: '<div class="pt26-sidebar"></div>',
                hidden: true,
                listeners: {
                    click: { element: 'el', fn: function (e) { me.onSidebarClick(e); } }
                }
            });
            sk.insert(0, me.sidebar);

            me.tiles = Ext.create('Ext.Component', {
                dock: 'top',
                cls: 'pt26-tiles-cmp',
                html: '<div class="pt26-tiles"></div>',
                hidden: true,
                listeners: {
                    click: { element: 'el', fn: function (e) {
                        var t = e.getTarget('[data-i]');
                        if (t) { domClick(me.counters[Number(t.getAttribute('data-i'))]); }
                    } }
                }
            });
            var nav = skeleton && skeleton.navigation;
            if (nav && nav.addDocked) { nav.addDocked(me.tiles); }

            me.classic(store('classic') === '1');
            // PILOT changes the active module and the counters itself; keep the sidebar in sync.
            me.timer = setInterval(function () { if (!me.isClassic) { me.sync(); } }, 1000);
        },

        /** Switch between the gps.im2m.ws look (false) and PILOT's normal look (true). */
        classic: function (on) {
            var me = this;
            me.isClassic = !!on;
            store('classic', on ? '1' : '0');
            document.documentElement.classList.toggle('pt26', !on);
            if (me.hdr) { me.hdr.setHidden(!on); }
            if (me.sidebar) { me.sidebar.setHidden(!!on); }
            if (me.tiles) { me.tiles.setHidden(!!on || !me.counters.length); }
            if (!on) { me.build(); }
            if (!on && !me.classicBtn) { me.addClassicButton(); }
        },

        /** In classic view, a small button in PILOT's header brings the new look back. */
        addClassicButton: function () {
            var me = this;
            me.classicBtn = me.hdr.add({
                xtype: 'button', cls: 'header_tool', iconCls: 'fa fa-table-columns', tooltip: 'Switch to the new look (gps.im2m.ws style)',
                handler: function () { me.classic(false); }
            });
        },

        build: function () {
            var me = this, html = [], logo = me.hdr.down('container[cls~=logo_bg]'),
                // PILOT draws its logo as a CSS background image (/backend/logo.php); reuse it in a white circle.
                bg = logo && logo.el ? window.getComputedStyle(logo.el.dom).backgroundImage : 'none';

            html.push('<div class="pt26-logo" data-act="home" title="Main"><div class="pt26-logo-img"' +
                (bg && bg !== 'none' ? ' style="background-image:' + enc(bg).replace(/&quot;/g, '\'') + '"' : '') + '></div></div>');
            html.push('<div class="pt26-user-row">' +
                (me.userPic ? '<span class="fa fa-user" data-act="user" title="User"></span>' : '') +
                (me.bell ? '<span class="fa fa-bell" data-act="bell" title="Notifications"><i class="pt26-badge" style="display:none"></i></span>' : '') +
                '</div>');
            html.push('<div class="pt26-modules">');
            me.menu.items.each(function (b, i) {
                if (b.isHidden() || !b.text) { return; }
                var key = b.itemId && !/-\d+$/.test(b.itemId) ? b.itemId : '',
                    glyph = TREE_GLYPH[key],
                    icon = glyph ? '<span class="pt26-icon pt26-tree">' + glyph + '</span>' : '<span class="pt26-icon ' + enc(b.iconCls || 'fa fa-circle') + '"></span>';
                html.push('<div class="pt26-item" data-i="' + i + '" title="' + enc(plain(b.text)) + '">' + icon + '<span class="pt26-label">' + enc(plain(b.text)) + '</span></div>');
            });
            html.push('</div>');
            html.push('<div class="pt26-bottom">' + Ext.Array.map(me.tools, function (t, i) {
                return '<span class="' + enc(t.iconCls || 'fa fa-ellipsis') + '" data-tool="' + i + '" title="' + enc(plain(t.tooltip)) + '"></span>';
            }).join('') + '<span class="fa fa-table-columns" data-act="classic" title="Classic view (normal PILOT look)"></span></div>');

            me.sidebar.update('<div class="pt26-sidebar">' + html.join('') + '</div>');
            me.sync();
        },

        sync: function () {
            var me = this, root = me.sidebar && me.sidebar.el && me.sidebar.el.dom, tiles;
            if (!root) { return; }
            // active module = the PILOT button that has "main_active"
            me.menu.items.each(function (b, i) {
                var item = root.querySelector('.pt26-item[data-i="' + i + '"]');
                if (item) { item.classList.toggle('pt26-active', !!(b.el && b.el.hasCls('main_active'))); }
            });
            if (me.bell) {
                var badge = root.querySelector('.pt26-badge'), n = plain(me.bell.badgeText || (me.bell.getBadgeText && me.bell.getBadgeText()) || '');
                if (badge) { badge.style.display = n && n !== '0' ? '' : 'none'; badge.textContent = n; }
            }
            if (me.tiles && me.tiles.el) {
                tiles = Ext.Array.map(me.counters, function (c, i) {
                    var tip = plain(c.tooltip);
                    return '<div class="pt26-tile pt26-t-' + TILE[tip] + '" data-i="' + i + '" title="' + enc(tip) + '"><b>' + enc(plain(c.text) || '0') + '</b><small>' + enc(tip) + '</small></div>';
                }).join('');
                if (tiles !== me.lastTiles) {
                    me.lastTiles = tiles;
                    me.tiles.update('<div class="pt26-tiles">' + tiles + '</div>');
                }
            }
        },

        onSidebarClick: function (e) {
            var me = this, item = e.getTarget('.pt26-item'), act = e.getTarget('[data-act]'), tool = e.getTarget('[data-tool]');
            if (item) {
                domClick(me.menu.items.getAt(Number(item.getAttribute('data-i'))));
                Ext.defer(me.sync, 50, me);
                return;
            }
            if (tool) { domClick(me.tools[Number(tool.getAttribute('data-tool'))]); return; }
            if (!act) { return; }
            switch (act.getAttribute('data-act')) {
            case 'home': domClick(me.menu.down('#home')); Ext.defer(me.sync, 50, me); break;
            case 'user': domClick(me.userPic); break;
            case 'bell': domClick(me.bell); break;
            case 'classic': me.classic(true); break;
            }
        }
    });
}());
