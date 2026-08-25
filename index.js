const STORAGE_KEY = 'st-pocket-ui-mode';
const INPUT_ROWS_STORAGE_KEY = 'st-pocket-ui-input-rows';
const VALID_MODES = new Set(['auto', 'mobile', 'desktop']);
const VALID_INPUT_ROWS = new Set(['1', '2', '3']);
const MOBILE_VIEWPORT = globalThis.matchMedia?.('(max-width: 767px)') ?? {
    matches: globalThis.innerWidth <= 767,
};
let memoryMode = 'auto';
let memoryInputRows = '1';

// Pocket UI only opens SillyTavern's native drawers. It does not copy their
// fields or own their data, so updates and other extensions keep working.
const NATIVE_DRAWERS = [
    ['ai-response', 'AI 回覆設定', 'fa-sliders', '#ai-config-button .drawer-toggle'],
    ['api', 'API 連線', 'fa-plug-circle-exclamation', '#sys-settings-button .drawer-toggle'],
    ['formatting', 'AI 回覆格式', 'fa-font', '#advanced-formatting-button .drawer-toggle'],
    ['world-info', '世界書', 'fa-book-atlas', '#WI-SP-button .drawer-toggle'],
    ['user-settings', '使用者設定', 'fa-user-cog', '#user-settings-button .drawer-toggle'],
    ['backgrounds', '背景', 'fa-panorama', '#backgrounds-button .drawer-toggle'],
    ['extensions', '擴充功能', 'fa-cubes', '#extensions-settings-button .drawer-toggle'],
    ['persona', '使用者角色管理', 'fa-face-smile', '#persona-management-button .drawer-toggle'],
    ['characters', '角色管理', 'fa-address-card', '#rightNavHolder .drawer-toggle'],
];

function getSavedMode() {
    let saved = memoryMode;
    try {
        saved = globalThis.localStorage?.getItem(STORAGE_KEY) ?? memoryMode;
    } catch (error) {
        console.warn('[ST Pocket UI] Mode storage is unavailable; using this session only.', error);
    }
    return VALID_MODES.has(saved) ? saved : 'auto';
}

function saveMode(mode) {
    memoryMode = mode;
    try {
        globalThis.localStorage?.setItem(STORAGE_KEY, mode);
        document.documentElement.dataset.stPocketStorage = 'persistent';
    } catch (error) {
        document.documentElement.dataset.stPocketStorage = 'session';
        console.warn('[ST Pocket UI] Mode could not be persisted; using this session only.', error);
    }
}

function getSavedInputRows() {
    let saved = memoryInputRows;
    try {
        saved = globalThis.localStorage?.getItem(INPUT_ROWS_STORAGE_KEY) ?? memoryInputRows;
    } catch (error) {
        console.warn('[ST Pocket UI] Input height storage is unavailable; using this session only.', error);
    }
    return VALID_INPUT_ROWS.has(saved) ? saved : '1';
}

function applyInputRows(rows) {
    const nextRows = VALID_INPUT_ROWS.has(String(rows)) ? String(rows) : '1';
    memoryInputRows = nextRows;
    document.documentElement.dataset.stPocketInputRows = nextRows;
    try {
        globalThis.localStorage?.setItem(INPUT_ROWS_STORAGE_KEY, nextRows);
    } catch (error) {
        console.warn('[ST Pocket UI] Input height could not be persisted; using this session only.', error);
    }

    const setting = document.getElementById('st-pocket-ui-input-rows-setting');
    if (setting) setting.value = nextRows;
}

function syncLayout(mode = document.documentElement.dataset.stPocketMode || 'auto') {
    document.documentElement.dataset.stPocketLayout = mode === 'auto'
        ? (MOBILE_VIEWPORT.matches ? 'mobile' : 'desktop')
        : mode;
}

function applyMode(mode) {
    const nextMode = VALID_MODES.has(mode) ? mode : 'auto';
    document.documentElement.dataset.stPocketMode = nextMode;
    syncLayout(nextMode);
    saveMode(nextMode);

    document.querySelectorAll('[data-st-pocket-mode]').forEach((button) => {
        const active = button.dataset.stPocketMode === nextMode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
    });

    const settingsMode = document.getElementById('st-pocket-ui-mode-setting');
    if (settingsMode) settingsMode.value = nextMode;
}

function createExtensionSettings() {
    if (document.getElementById('st-pocket-ui-settings')) return;

    const settingsRoot = document.querySelector('#extensions_settings2, #extensions_settings');
    if (!settingsRoot) {
        console.warn('[ST Pocket UI] Extension settings container was not found.');
        return;
    }

    const section = document.createElement('div');
    section.id = 'st-pocket-ui-settings';
    section.className = 'extension_container st-pocket-ui-settings';
    section.innerHTML = `
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>ST Pocket UI</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label for="st-pocket-ui-mode-setting">版面模式</label>
                <select id="st-pocket-ui-mode-setting" class="text_pole">
                    <option value="auto">自動</option>
                    <option value="mobile">手機</option>
                    <option value="desktop">電腦</option>
                </select>
                <small>自動模式會依畫面寬度切換手機或電腦版面。</small>
                <label for="st-pocket-ui-input-rows-setting">輸入欄位高度</label>
                <select id="st-pocket-ui-input-rows-setting" class="text_pole">
                    <option value="1">1 行（初始）</option>
                    <option value="2">2 行</option>
                    <option value="3">3 行</option>
                </select>
            </div>
        </div>`;

    const modeSetting = section.querySelector('#st-pocket-ui-mode-setting');
    modeSetting.value = getSavedMode();
    modeSetting.addEventListener('change', () => applyMode(modeSetting.value));
    const inputRowsSetting = section.querySelector('#st-pocket-ui-input-rows-setting');
    inputRowsSetting.value = getSavedInputRows();
    inputRowsSetting.addEventListener('change', () => applyInputRows(inputRowsSetting.value));
    settingsRoot.append(section);
}

const handleViewportChange = () => {
    if (document.documentElement.dataset.stPocketMode === 'auto') syncLayout('auto');
};
if (MOBILE_VIEWPORT.addEventListener) {
    MOBILE_VIEWPORT.addEventListener('change', handleViewportChange);
} else {
    MOBILE_VIEWPORT.addListener?.(handleViewportChange);
}

function createModeSwitcher() {
    if (document.getElementById('st-pocket-ui-switcher')) return;

    const switcher = document.createElement('div');
    switcher.id = 'st-pocket-ui-switcher';
    switcher.className = 'st-pocket-ui-switcher';
    switcher.dataset.stPocketUi = 'mode-switcher';
    switcher.setAttribute('role', 'group');
    switcher.setAttribute('aria-label', 'ST Pocket UI 顯示模式');

    const modes = [
        ['auto', '自動'],
        ['mobile', '手機'],
        ['desktop', '電腦'],
    ];

    for (const [mode, label] of modes) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'menu_button st-pocket-ui-mode';
        button.dataset.stPocketMode = mode;
        button.textContent = label;
        button.addEventListener('click', () => applyMode(mode));
        switcher.append(button);
    }

    document.body.append(switcher);
    applyMode(getSavedMode());
}

function createNativeDrawerLauncher() {
    if (document.getElementById('st-pocket-native-launcher')) return;

    const launcher = document.createElement('div');
    launcher.id = 'st-pocket-native-launcher';
    launcher.className = 'st-pocket-native-launcher';
    launcher.dataset.stPocketUi = 'shortcut-launcher';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'menu_button st-pocket-launcher-toggle fa-solid fa-bars';
    toggle.setAttribute('aria-label', '開啟 SillyTavern 功能');
    toggle.setAttribute('aria-expanded', 'false');

    const menu = document.createElement('nav');
    menu.className = 'st-pocket-native-menu';
    menu.setAttribute('aria-label', 'SillyTavern 功能');
    menu.hidden = true;

    const closeMenu = () => {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    };

    const actions = [];
    const syncNativeActions = () => {
        for (const { button, selector } of actions) {
            const available = Boolean(document.querySelector(selector));
            button.disabled = !available;
            button.dataset.stPocketNative = available ? 'ready' : 'unavailable';
            button.title = available ? '' : '目前找不到這個 SillyTavern 原生入口';
        }
    };

    toggle.addEventListener('click', () => {
        const opening = menu.hidden;
        if (opening) syncNativeActions();
        menu.hidden = !opening;
        toggle.setAttribute('aria-expanded', String(opening));
    });

    for (const [key, label, icon, selector] of NATIVE_DRAWERS) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'menu_button st-pocket-native-action';
        button.dataset.stDrawer = key;
        button.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i><span></span>`;
        button.querySelector('span').textContent = label;
        button.addEventListener('click', () => {
            const nativeToggle = document.querySelector(selector);
            if (!nativeToggle) {
                syncNativeActions();
                return;
            }
            closeMenu();
            nativeToggle.click();
        });
        actions.push({ button, selector });
        menu.append(button);
    }

    launcher.append(toggle, menu);
    document.body.append(launcher);
    syncNativeActions();

    document.addEventListener('click', (event) => {
        if (!launcher.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
}

function enableIPhoneSafeArea() {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) return;

    const values = viewport.content.split(',').map((value) => value.trim()).filter(Boolean);
    if (!values.some((value) => value.startsWith('viewport-fit='))) {
        values.push('viewport-fit=cover');
        viewport.content = values.join(', ');
    }
}

function enableBrowserChromeFallbacks() {
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
        themeColor = document.createElement('meta');
        themeColor.name = 'theme-color';
        document.head.append(themeColor);
    }

    const bodyColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--SmartThemeBodyColor')
        .trim();
    themeColor.content = bodyColor || '#111111';
    document.documentElement.dataset.stPocketDynamicViewport = globalThis.CSS?.supports?.('height', '100dvh') ? 'supported' : 'fallback';

    const background = getComputedStyle(document.body).backgroundImage;
    if (background && background !== 'none') {
        const match = background.match(/url\(["']?(.*?)["']?\)/);
        if (match?.[1]) {
            const probe = new Image();
            probe.addEventListener('error', () => {
                document.documentElement.dataset.stPocketBackground = 'fallback';
            }, { once: true });
            probe.src = match[1];
        }
    }
}

function initialize() {
    let context = null;
    try {
        context = globalThis.SillyTavern?.getContext?.() ?? null;
    } catch (error) {
        console.warn('[ST Pocket UI] 無法取得 SillyTavern context，將只使用可用的原生 DOM。', error);
    }
    document.documentElement.classList.add('st-pocket-ui-enabled');
    document.documentElement.dataset.stPocketContext = context ? 'ready' : 'unavailable';
    enableIPhoneSafeArea();
    enableBrowserChromeFallbacks();
    createModeSwitcher();
    createNativeDrawerLauncher();
    createExtensionSettings();
    applyInputRows(getSavedInputRows());
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
    initialize();
}
