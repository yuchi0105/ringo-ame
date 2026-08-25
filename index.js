const STORAGE_KEY = 'st-pocket-ui-mode';
const INPUT_ROWS_STORAGE_KEY = 'st-pocket-ui-input-rows';
const MESSAGE_FONT_SIZE_STORAGE_KEY = 'st-pocket-ui-message-font-size';
const MESSAGE_WIDTH_STORAGE_KEY = 'st-pocket-ui-message-width';
const MESSAGE_SPACING_STORAGE_KEY = 'st-pocket-ui-message-spacing';
const MESSAGE_LINE_HEIGHT_STORAGE_KEY = 'st-pocket-ui-message-line-height';
const EXTENSION_ENABLED_STORAGE_KEY = 'st-pocket-ui-enabled';
const FLOATING_BUTTON_ENABLED_STORAGE_KEY = 'st-pocket-ui-floating-button-enabled';
const FLOATING_BUTTON_POSITION_STORAGE_KEY = 'st-pocket-ui-floating-button-position';
const DEFAULT_BACKGROUND_ENABLED_STORAGE_KEY = 'st-pocket-ui-default-background-enabled';
const FONT_FAMILY_STORAGE_KEY = 'st-pocket-ui-font-family';
const THEME_STORAGE_KEY = 'st-pocket-ui-theme';
const VALID_MODES = new Set(['auto', 'mobile', 'desktop']);
const VALID_INPUT_ROWS = new Set(['1', '2', '3']);
const VALID_MESSAGE_WIDTHS = new Set(['narrow', 'standard', 'wide']);
const VALID_MESSAGE_SPACINGS = new Set(['compact', 'standard', 'relaxed']);
const VALID_THEMES = new Set(['cream-apple']);
const FONT_FAMILIES = new Map([
    ['native', null],
    ['gensen', '"ST Pocket GenSen", "GenSenRounded2 TW", sans-serif'],
    ['huninn', '"ST Pocket Huninn", "jf open 粉圓 2.1", sans-serif'],
    ['iansui', '"ST Pocket Iansui", "芫荽", cursive'],
]);
const MESSAGE_FONT_SIZE_MIN = 12;
const MESSAGE_FONT_SIZE_MAX = 24;
const MESSAGE_FONT_SIZE_NATIVE = 16;
const MESSAGE_LINE_HEIGHT_MIN = 1.4;
const MESSAGE_LINE_HEIGHT_MAX = 2;
const MESSAGE_LINE_HEIGHT_DEFAULT = 1.6;
const MOBILE_VIEWPORT = globalThis.matchMedia?.('(max-width: 767px)') ?? {
    matches: globalThis.innerWidth <= 767,
};
let memoryMode = 'auto';
let memoryInputRows = '1';
let memoryMessageFontSize = null;
let memoryMessageWidth = 'standard';
let memoryMessageSpacing = 'standard';
let memoryMessageLineHeight = String(MESSAGE_LINE_HEIGHT_DEFAULT);
let memoryExtensionEnabled = true;
let memoryFloatingButtonEnabled = true;
let memoryFloatingButtonPosition = null;
let memoryDefaultBackgroundEnabled = true;
let memoryFontFamily = 'native';
let memoryTheme = 'cream-apple';

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

function getSavedMessageFontSize() {
    let saved = memoryMessageFontSize;
    try {
        saved = globalThis.localStorage?.getItem(MESSAGE_FONT_SIZE_STORAGE_KEY) ?? memoryMessageFontSize;
    } catch (error) {
        console.warn('[ST Pocket UI] Message font size storage is unavailable; using this session only.', error);
    }
    const value = Number.parseInt(saved, 10);
    return Number.isInteger(value) && value >= MESSAGE_FONT_SIZE_MIN && value <= MESSAGE_FONT_SIZE_MAX
        ? String(value)
        : null;
}

function applyMessageFontSize(size) {
    const value = Number.parseInt(size, 10);
    const nextSize = Number.isInteger(value)
        ? Math.min(MESSAGE_FONT_SIZE_MAX, Math.max(MESSAGE_FONT_SIZE_MIN, value))
        : MESSAGE_FONT_SIZE_NATIVE;
    memoryMessageFontSize = String(nextSize);
    document.documentElement.style.setProperty('--st-pocket-message-font-size', `${nextSize}px`);
    try {
        globalThis.localStorage?.setItem(MESSAGE_FONT_SIZE_STORAGE_KEY, String(nextSize));
    } catch (error) {
        console.warn('[ST Pocket UI] Message font size could not be persisted; using this session only.', error);
    }

    const setting = document.getElementById('st-pocket-ui-message-font-size-setting');
    const output = document.getElementById('st-pocket-ui-message-font-size-output');
    if (setting) setting.value = String(nextSize);
    if (output) output.value = `${nextSize}px`;
}

function resetMessageFontSize() {
    memoryMessageFontSize = null;
    document.documentElement.style.removeProperty('--st-pocket-message-font-size');
    try {
        globalThis.localStorage?.removeItem(MESSAGE_FONT_SIZE_STORAGE_KEY);
    } catch (error) {
        console.warn('[ST Pocket UI] Message font size could not be reset persistently.', error);
    }

    const setting = document.getElementById('st-pocket-ui-message-font-size-setting');
    const output = document.getElementById('st-pocket-ui-message-font-size-output');
    if (setting) setting.value = String(MESSAGE_FONT_SIZE_NATIVE);
    if (output) output.value = `${MESSAGE_FONT_SIZE_NATIVE}px（原生）`;
}

function getSavedChoice(storageKey, memoryValue, validValues, fallback) {
    let saved = memoryValue;
    try {
        saved = globalThis.localStorage?.getItem(storageKey) ?? memoryValue;
    } catch (error) {
        console.warn(`[ST Pocket UI] ${storageKey} storage is unavailable; using this session only.`, error);
    }
    return validValues.has(saved) ? saved : fallback;
}

function applyMessageChoice(storageKey, datasetKey, value, validValues, fallback) {
    const nextValue = validValues.has(value) ? value : fallback;
    document.documentElement.dataset[datasetKey] = nextValue;
    try {
        globalThis.localStorage?.setItem(storageKey, nextValue);
    } catch (error) {
        console.warn(`[ST Pocket UI] ${storageKey} could not be persisted; using this session only.`, error);
    }
    return nextValue;
}

function getSavedMessageLineHeight() {
    let saved = memoryMessageLineHeight;
    try {
        saved = globalThis.localStorage?.getItem(MESSAGE_LINE_HEIGHT_STORAGE_KEY) ?? memoryMessageLineHeight;
    } catch (error) {
        console.warn('[ST Pocket UI] Message line height storage is unavailable; using this session only.', error);
    }
    const value = Number.parseFloat(saved);
    return Number.isFinite(value) && value >= MESSAGE_LINE_HEIGHT_MIN && value <= MESSAGE_LINE_HEIGHT_MAX
        ? value.toFixed(1)
        : String(MESSAGE_LINE_HEIGHT_DEFAULT);
}

function applyMessageLineHeight(lineHeight) {
    const value = Number.parseFloat(lineHeight);
    const nextValue = Number.isFinite(value)
        ? Math.min(MESSAGE_LINE_HEIGHT_MAX, Math.max(MESSAGE_LINE_HEIGHT_MIN, value)).toFixed(1)
        : String(MESSAGE_LINE_HEIGHT_DEFAULT);
    memoryMessageLineHeight = nextValue;
    document.documentElement.style.setProperty('--st-pocket-message-line-height', nextValue);
    try {
        globalThis.localStorage?.setItem(MESSAGE_LINE_HEIGHT_STORAGE_KEY, nextValue);
    } catch (error) {
        console.warn('[ST Pocket UI] Message line height could not be persisted; using this session only.', error);
    }
    const setting = document.getElementById('st-pocket-ui-message-line-height-setting');
    const output = document.getElementById('st-pocket-ui-message-line-height-output');
    if (setting) setting.value = nextValue;
    if (output) output.value = nextValue;
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

function getSavedExtensionEnabled() {
    let saved = memoryExtensionEnabled;
    try {
        const stored = globalThis.localStorage?.getItem(EXTENSION_ENABLED_STORAGE_KEY);
        if (stored !== null && stored !== undefined) saved = stored !== 'false';
    } catch (error) {
        console.warn('[ST Pocket UI] Enable-state storage is unavailable; using this session only.', error);
    }
    return Boolean(saved);
}

function getSavedFloatingButtonEnabled() {
    let saved = memoryFloatingButtonEnabled;
    try {
        const stored = globalThis.localStorage?.getItem(FLOATING_BUTTON_ENABLED_STORAGE_KEY);
        if (stored !== null && stored !== undefined) saved = stored !== 'false';
    } catch (error) {
        console.warn('[ST Pocket UI] Floating button state is unavailable; using this session only.', error);
    }
    return Boolean(saved);
}

function applyFloatingButtonEnabled(enabled, { persist = true } = {}) {
    const nextEnabled = Boolean(enabled);
    memoryFloatingButtonEnabled = nextEnabled;
    document.documentElement.classList.toggle('st-pocket-floating-button-hidden', !nextEnabled);

    const setting = document.getElementById('st-pocket-ui-floating-button-setting');
    if (setting) setting.checked = nextEnabled;
    if (persist) {
        try {
            globalThis.localStorage?.setItem(FLOATING_BUTTON_ENABLED_STORAGE_KEY, String(nextEnabled));
        } catch (error) {
            console.warn('[ST Pocket UI] Floating button state could not be persisted; using this session only.', error);
        }
    }
}

function getSavedDefaultBackgroundEnabled() {
    let saved = memoryDefaultBackgroundEnabled;
    try {
        const stored = globalThis.localStorage?.getItem(DEFAULT_BACKGROUND_ENABLED_STORAGE_KEY);
        if (stored !== null && stored !== undefined) saved = stored !== 'false';
    } catch (error) {
        console.warn('[ST Pocket UI] Default background state is unavailable; using this session only.', error);
    }
    return Boolean(saved);
}

function applyDefaultBackgroundEnabled(enabled, { persist = true } = {}) {
    const nextEnabled = Boolean(enabled);
    memoryDefaultBackgroundEnabled = nextEnabled;
    document.documentElement.classList.toggle('st-pocket-default-background', nextEnabled);

    const setting = document.getElementById('st-pocket-ui-default-background-setting');
    if (setting) setting.checked = nextEnabled;
    if (persist) {
        try {
            globalThis.localStorage?.setItem(DEFAULT_BACKGROUND_ENABLED_STORAGE_KEY, String(nextEnabled));
        } catch (error) {
            console.warn('[ST Pocket UI] Default background state could not be persisted; using this session only.', error);
        }
    }
}

function getSavedTheme() {
    let saved = memoryTheme;
    try {
        saved = globalThis.localStorage?.getItem(THEME_STORAGE_KEY) ?? memoryTheme;
    } catch (error) {
        console.warn('[ST Pocket UI] Theme setting is unavailable; using this session only.', error);
    }
    return VALID_THEMES.has(saved) ? saved : 'cream-apple';
}

function applyTheme(theme, { persist = true } = {}) {
    const nextTheme = VALID_THEMES.has(theme) ? theme : 'cream-apple';
    memoryTheme = nextTheme;
    document.documentElement.dataset.stPocketTheme = nextTheme;

    const setting = document.getElementById('st-pocket-ui-theme-setting');
    if (setting) setting.value = nextTheme;
    if (persist) {
        try {
            globalThis.localStorage?.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch (error) {
            console.warn('[ST Pocket UI] Theme setting could not be persisted; using this session only.', error);
        }
    }
}

function getSavedFontFamily() {
    let saved = memoryFontFamily;
    try {
        saved = globalThis.localStorage?.getItem(FONT_FAMILY_STORAGE_KEY) ?? memoryFontFamily;
    } catch (error) {
        console.warn('[ST Pocket UI] Font setting is unavailable; using this session only.', error);
    }
    return FONT_FAMILIES.has(saved) ? saved : 'native';
}

function applyFontFamily(fontFamily, { persist = true } = {}) {
    const nextFamily = FONT_FAMILIES.has(fontFamily) ? fontFamily : 'native';
    const cssFamily = FONT_FAMILIES.get(nextFamily);
    memoryFontFamily = nextFamily;

    if (cssFamily) document.documentElement.style.setProperty('--st-pocket-font-family', cssFamily);
    else document.documentElement.style.removeProperty('--st-pocket-font-family');

    const setting = document.getElementById('st-pocket-ui-font-family-setting');
    if (setting) setting.value = nextFamily;
    if (persist) {
        try {
            globalThis.localStorage?.setItem(FONT_FAMILY_STORAGE_KEY, nextFamily);
        } catch (error) {
            console.warn('[ST Pocket UI] Font setting could not be persisted; using this session only.', error);
        }
    }
}

function applyExtensionEnabled(enabled, { persist = true } = {}) {
    const nextEnabled = Boolean(enabled);
    memoryExtensionEnabled = nextEnabled;
    document.documentElement.classList.toggle('st-pocket-ui-enabled', nextEnabled);

    if (nextEnabled) {
        applyTheme(getSavedTheme(), { persist: false });
        applyMode(getSavedMode());
        applyInputRows(getSavedInputRows());
        const savedMessageFontSize = getSavedMessageFontSize();
        if (savedMessageFontSize) applyMessageFontSize(savedMessageFontSize);
        const savedMessageWidth = getSavedChoice(MESSAGE_WIDTH_STORAGE_KEY, memoryMessageWidth, VALID_MESSAGE_WIDTHS, 'standard');
        const savedMessageSpacing = getSavedChoice(MESSAGE_SPACING_STORAGE_KEY, memoryMessageSpacing, VALID_MESSAGE_SPACINGS, 'standard');
        memoryMessageWidth = applyMessageChoice(MESSAGE_WIDTH_STORAGE_KEY, 'stPocketMessageWidth', savedMessageWidth, VALID_MESSAGE_WIDTHS, 'standard');
        memoryMessageSpacing = applyMessageChoice(MESSAGE_SPACING_STORAGE_KEY, 'stPocketMessageSpacing', savedMessageSpacing, VALID_MESSAGE_SPACINGS, 'standard');
        applyMessageLineHeight(getSavedMessageLineHeight());
        applyFontFamily(getSavedFontFamily(), { persist: false });
        applyDefaultBackgroundEnabled(getSavedDefaultBackgroundEnabled(), { persist: false });
    } else {
        delete document.documentElement.dataset.stPocketMode;
        delete document.documentElement.dataset.stPocketLayout;
        delete document.documentElement.dataset.stPocketInputRows;
        delete document.documentElement.dataset.stPocketMessageWidth;
        delete document.documentElement.dataset.stPocketMessageSpacing;
        document.documentElement.style.removeProperty('--st-pocket-message-font-size');
        document.documentElement.style.removeProperty('--st-pocket-message-line-height');
        document.documentElement.style.removeProperty('--st-pocket-font-family');
        document.documentElement.classList.remove('st-pocket-default-background');
    }

    const setting = document.getElementById('st-pocket-ui-enabled-setting');
    if (setting) setting.checked = nextEnabled;
    if (persist) {
        try {
            globalThis.localStorage?.setItem(EXTENSION_ENABLED_STORAGE_KEY, String(nextEnabled));
        } catch (error) {
            console.warn('[ST Pocket UI] Enable state could not be persisted; using this session only.', error);
        }
    }
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
                <div class="st-pocket-setting-group st-pocket-enabled-setting">
                    <label class="checkbox_label" for="st-pocket-ui-enabled-setting">
                        <input id="st-pocket-ui-enabled-setting" type="checkbox">
                        <span>啟用本擴充</span>
                    </label>
                    <small>關閉後會停用 ST Pocket UI 的主題與響應式版面，設定入口仍會保留。</small>
                </div>
                <div class="st-pocket-setting-group">
                    <label for="st-pocket-ui-theme-setting">主題</label>
                    <select id="st-pocket-ui-theme-setting" class="text_pole">
                        <option value="cream-apple">奶油蘋果</option>
                    </select>
                    <small>目前提供奶油蘋果；未來新增的主題會顯示在這裡。</small>
                </div>
                <div class="st-pocket-setting-group st-pocket-enabled-setting">
                    <label class="checkbox_label" for="st-pocket-ui-floating-button-setting">
                        <input id="st-pocket-ui-floating-button-setting" type="checkbox">
                        <span>顯示版面模式懸浮按鈕</span>
                    </label>
                    <small>可拖曳蘋果按鈕調整位置；關閉後仍可在下方切換版面模式。</small>
                </div>
                <div class="st-pocket-setting-group">
                    <label for="st-pocket-ui-mode-setting">版面模式</label>
                    <select id="st-pocket-ui-mode-setting" class="text_pole">
                        <option value="auto">自動</option>
                        <option value="mobile">手機</option>
                        <option value="desktop">電腦</option>
                    </select>
                    <small>自動模式會依畫面寬度切換手機或電腦版面。</small>
                </div>
                <div class="st-pocket-setting-group">
                    <label for="st-pocket-ui-input-rows-setting">輸入欄位高度</label>
                    <select id="st-pocket-ui-input-rows-setting" class="text_pole">
                        <option value="1">1 行（初始）</option>
                        <option value="2">2 行</option>
                        <option value="3">3 行</option>
                    </select>
                </div>
                <div class="st-pocket-setting-group st-pocket-enabled-setting">
                    <label class="checkbox_label" for="st-pocket-ui-default-background-setting">
                        <input id="st-pocket-ui-default-background-setting" type="checkbox">
                        <span>使用本擴充預設背景</span>
                    </label>
                    <small>關閉後不再覆蓋背景，改由 SillyTavern 原生背景圖片系統控制。</small>
                </div>
                <div class="st-pocket-setting-group">
                    <label for="st-pocket-ui-font-family-setting">介面字體</label>
                    <select id="st-pocket-ui-font-family-setting" class="text_pole">
                        <option value="native">酒館原生</option>
                        <option value="gensen">源泉圓體</option>
                        <option value="huninn">jf open 粉圓</option>
                        <option value="iansui">芫荽</option>
                    </select>
                    <small>套用至聊天與操作介面；首次選用開源字體時需要網路載入。</small>
                </div>
                <div class="st-pocket-setting-group">
                    <label for="st-pocket-ui-message-font-size-setting">訊息文字大小</label>
                    <div class="st-pocket-message-font-size-control">
                        <input id="st-pocket-ui-message-font-size-setting" type="range" min="12" max="24" step="1">
                        <output id="st-pocket-ui-message-font-size-output" for="st-pocket-ui-message-font-size-setting">16px（原生）</output>
                        <button id="st-pocket-ui-message-font-size-reset" type="button" class="menu_button">恢復原生大小</button>
                    </div>
                    <small>只調整聊天訊息正文，可選 12px～24px。</small>
                </div>
                <div class="st-pocket-setting-grid">
                    <div class="st-pocket-setting-group">
                        <label for="st-pocket-ui-message-width-setting">訊息區寬度</label>
                        <select id="st-pocket-ui-message-width-setting" class="text_pole">
                            <option value="narrow">窄版</option>
                            <option value="standard">標準</option>
                            <option value="wide">寬版</option>
                        </select>
                    </div>
                    <div class="st-pocket-setting-group">
                        <label for="st-pocket-ui-message-spacing-setting">訊息間距</label>
                        <select id="st-pocket-ui-message-spacing-setting" class="text_pole">
                            <option value="compact">緊湊</option>
                            <option value="standard">標準</option>
                            <option value="relaxed">寬鬆</option>
                        </select>
                    </div>
                </div>
                <div class="st-pocket-setting-group">
                    <label for="st-pocket-ui-message-line-height-setting">文字行距</label>
                    <div class="st-pocket-message-range-control">
                        <input id="st-pocket-ui-message-line-height-setting" type="range" min="1.4" max="2" step="0.1">
                        <output id="st-pocket-ui-message-line-height-output" for="st-pocket-ui-message-line-height-setting">1.6</output>
                    </div>
                    <small>寬度在手機窄螢幕會自動維持滿版，避免浪費空間。</small>
                </div>
            </div>
        </div>`;

    const enabledSetting = section.querySelector('#st-pocket-ui-enabled-setting');
    enabledSetting.checked = getSavedExtensionEnabled();
    enabledSetting.addEventListener('change', () => applyExtensionEnabled(enabledSetting.checked));
    const themeSetting = section.querySelector('#st-pocket-ui-theme-setting');
    themeSetting.value = getSavedTheme();
    themeSetting.addEventListener('change', () => applyTheme(themeSetting.value));
    const floatingButtonSetting = section.querySelector('#st-pocket-ui-floating-button-setting');
    floatingButtonSetting.checked = getSavedFloatingButtonEnabled();
    floatingButtonSetting.addEventListener('change', () => applyFloatingButtonEnabled(floatingButtonSetting.checked));
    const modeSetting = section.querySelector('#st-pocket-ui-mode-setting');
    modeSetting.value = getSavedMode();
    modeSetting.addEventListener('change', () => applyMode(modeSetting.value));
    const inputRowsSetting = section.querySelector('#st-pocket-ui-input-rows-setting');
    inputRowsSetting.value = getSavedInputRows();
    inputRowsSetting.addEventListener('change', () => applyInputRows(inputRowsSetting.value));
    const defaultBackgroundSetting = section.querySelector('#st-pocket-ui-default-background-setting');
    defaultBackgroundSetting.checked = getSavedDefaultBackgroundEnabled();
    defaultBackgroundSetting.addEventListener('change', () => applyDefaultBackgroundEnabled(defaultBackgroundSetting.checked));
    const fontFamilySetting = section.querySelector('#st-pocket-ui-font-family-setting');
    fontFamilySetting.value = getSavedFontFamily();
    fontFamilySetting.addEventListener('change', () => applyFontFamily(fontFamilySetting.value));
    const messageFontSizeSetting = section.querySelector('#st-pocket-ui-message-font-size-setting');
    const savedMessageFontSize = getSavedMessageFontSize();
    messageFontSizeSetting.value = savedMessageFontSize ?? String(MESSAGE_FONT_SIZE_NATIVE);
    messageFontSizeSetting.addEventListener('input', () => applyMessageFontSize(messageFontSizeSetting.value));
    section.querySelector('#st-pocket-ui-message-font-size-reset').addEventListener('click', resetMessageFontSize);
    const messageWidthSetting = section.querySelector('#st-pocket-ui-message-width-setting');
    memoryMessageWidth = getSavedChoice(MESSAGE_WIDTH_STORAGE_KEY, memoryMessageWidth, VALID_MESSAGE_WIDTHS, 'standard');
    messageWidthSetting.value = memoryMessageWidth;
    messageWidthSetting.addEventListener('change', () => {
        memoryMessageWidth = applyMessageChoice(MESSAGE_WIDTH_STORAGE_KEY, 'stPocketMessageWidth', messageWidthSetting.value, VALID_MESSAGE_WIDTHS, 'standard');
    });
    const messageSpacingSetting = section.querySelector('#st-pocket-ui-message-spacing-setting');
    memoryMessageSpacing = getSavedChoice(MESSAGE_SPACING_STORAGE_KEY, memoryMessageSpacing, VALID_MESSAGE_SPACINGS, 'standard');
    messageSpacingSetting.value = memoryMessageSpacing;
    messageSpacingSetting.addEventListener('change', () => {
        memoryMessageSpacing = applyMessageChoice(MESSAGE_SPACING_STORAGE_KEY, 'stPocketMessageSpacing', messageSpacingSetting.value, VALID_MESSAGE_SPACINGS, 'standard');
    });
    const messageLineHeightSetting = section.querySelector('#st-pocket-ui-message-line-height-setting');
    messageLineHeightSetting.value = getSavedMessageLineHeight();
    messageLineHeightSetting.addEventListener('input', () => applyMessageLineHeight(messageLineHeightSetting.value));
    settingsRoot.append(section);
    if (savedMessageFontSize) applyMessageFontSize(savedMessageFontSize);
    else resetMessageFontSize();
    memoryMessageWidth = applyMessageChoice(MESSAGE_WIDTH_STORAGE_KEY, 'stPocketMessageWidth', memoryMessageWidth, VALID_MESSAGE_WIDTHS, 'standard');
    memoryMessageSpacing = applyMessageChoice(MESSAGE_SPACING_STORAGE_KEY, 'stPocketMessageSpacing', memoryMessageSpacing, VALID_MESSAGE_SPACINGS, 'standard');
    applyMessageLineHeight(messageLineHeightSetting.value);
    applyTheme(themeSetting.value, { persist: false });
    applyFontFamily(fontFamilySetting.value, { persist: false });
    applyDefaultBackgroundEnabled(defaultBackgroundSetting.checked, { persist: false });
}

function openPocketSettings() {
    const extensionsToggle = document.querySelector('#extensions-settings-button .drawer-toggle');
    const section = document.getElementById('st-pocket-ui-settings');
    if (!section) return;

    if (!section.getClientRects().length) extensionsToggle?.click();
    const inlineDrawer = section.querySelector('.inline-drawer');
    const content = section.querySelector('.inline-drawer-content');
    if (content && getComputedStyle(content).display === 'none') {
        inlineDrawer?.querySelector('.inline-drawer-toggle')?.click();
    }
    globalThis.setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
}

function createWandMenuEntry() {
    if (document.getElementById('st-pocket-ui-wand-entry')) return true;
    const menu = document.querySelector('#extensionsMenu');
    if (!menu) return false;

    const container = document.createElement('div');
    container.id = 'st-pocket-ui-wand-entry';
    container.className = 'extension_container';

    const entry = document.createElement('button');
    entry.type = 'button';
    entry.className = 'list-group-item flex-container flexGap5 st-pocket-wand-action interactable';
    entry.setAttribute('aria-label', '開啟 ST Pocket UI 設定');
    entry.innerHTML = `<svg class="st-pocket-apple-icon extensionsMenuExtensionButton" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path d="M24 17c-4.2-4.2-13-3.2-15.5 4.3-2.4 7.2 2.4 18.8 9 19.7 2.5.3 4.2-1.5 6.5-1.5s4 1.8 6.5 1.5c6.6-.9 11.4-12.5 9-19.7C37 13.8 28.2 12.8 24 17Z"/>
        <path d="M24 16c-.2-5.5 2.8-9.1 7.8-9.6-.2 4.9-3 8.2-7.8 9.6Z"/>
        <path d="M24 16c-.4-3-1.8-5.3-4.3-7"/>
    </svg><span>ST Pocket UI</span>`;
    entry.addEventListener('click', openPocketSettings);
    container.append(entry);
    menu.append(container);
    return true;
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
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'menu_button st-pocket-mode-toggle';
    toggle.setAttribute('aria-label', '開啟版面模式選單');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `
        <svg class="st-pocket-apple-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <path d="M24 17c-4.2-4.2-13-3.2-15.5 4.3-2.4 7.2 2.4 18.8 9 19.7 2.5.3 4.2-1.5 6.5-1.5s4 1.8 6.5 1.5c6.6-.9 11.4-12.5 9-19.7C37 13.8 28.2 12.8 24 17Z"/>
            <path d="M24 16c-.2-5.5 2.8-9.1 7.8-9.6-.2 4.9-3 8.2-7.8 9.6Z"/>
            <path d="M24 16c-.4-3-1.8-5.3-4.3-7"/>
        </svg>`;

    const panel = document.createElement('div');
    panel.className = 'st-pocket-mode-menu';
    panel.setAttribute('role', 'group');
    panel.setAttribute('aria-label', 'ST Pocket UI 顯示模式');
    panel.hidden = true;
    panel.innerHTML = `
        <div class="st-pocket-mode-menu-heading">
            <span class="st-pocket-mode-menu-kicker">ST Pocket UI</span>
            <strong>版面模式</strong>
        </div>
        <div class="st-pocket-mode-options"></div>`;
    const modeOptions = panel.querySelector('.st-pocket-mode-options');

    const closeMenu = () => {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    };

    const modes = [
        ['auto', '自動', '依視窗寬度切換', 'fa-wand-magic-sparkles'],
        ['mobile', '手機', '使用單欄觸控版面', 'fa-mobile-screen-button'],
        ['desktop', '電腦', '保留完整桌面配置', 'fa-display'],
    ];

    for (const [mode, label, description, icon] of modes) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'menu_button st-pocket-ui-mode';
        button.dataset.stPocketMode = mode;
        button.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i><span><strong></strong><small></small></span><i class="fa-solid fa-check st-pocket-mode-check" aria-hidden="true"></i>`;
        button.querySelector('strong').textContent = label;
        button.querySelector('small').textContent = description;
        button.addEventListener('click', () => applyMode(mode));
        button.addEventListener('click', closeMenu);
        modeOptions.append(button);
    }

    let dragged = false;
    let dragState = null;
    const positionMenu = () => {
        const rect = switcher.getBoundingClientRect();
        panel.classList.toggle('is-above', rect.top > globalThis.innerHeight / 2);
        panel.classList.toggle('is-left-aligned', rect.left < globalThis.innerWidth / 2);
    };
    const clampPosition = (left, top) => {
        const margin = 8;
        const width = switcher.offsetWidth || 48;
        const height = switcher.offsetHeight || 48;
        return {
            left: Math.min(Math.max(margin, left), Math.max(margin, globalThis.innerWidth - width - margin)),
            top: Math.min(Math.max(margin, top), Math.max(margin, globalThis.innerHeight - height - margin)),
        };
    };
    const applyPosition = (position, { persist = false } = {}) => {
        if (!position || !Number.isFinite(position.left) || !Number.isFinite(position.top)) return;
        const next = clampPosition(position.left, position.top);
        memoryFloatingButtonPosition = next;
        switcher.style.left = `${next.left}px`;
        switcher.style.top = `${next.top}px`;
        switcher.style.right = 'auto';
        positionMenu();
        if (persist) {
            try {
                globalThis.localStorage?.setItem(FLOATING_BUTTON_POSITION_STORAGE_KEY, JSON.stringify(next));
            } catch (error) {
                console.warn('[ST Pocket UI] Floating button position could not be persisted; using this session only.', error);
            }
        }
    };
    try {
        const savedPosition = globalThis.localStorage?.getItem(FLOATING_BUTTON_POSITION_STORAGE_KEY);
        if (savedPosition) memoryFloatingButtonPosition = JSON.parse(savedPosition);
    } catch (error) {
        console.warn('[ST Pocket UI] Floating button position is unavailable; using the default position.', error);
    }
    if (memoryFloatingButtonPosition) applyPosition(memoryFloatingButtonPosition);

    toggle.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        const rect = switcher.getBoundingClientRect();
        dragState = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top };
        dragged = false;
        toggle.setPointerCapture?.(event.pointerId);
    });
    toggle.addEventListener('pointermove', (event) => {
        if (!dragState || dragState.pointerId !== event.pointerId) return;
        const deltaX = event.clientX - dragState.startX;
        const deltaY = event.clientY - dragState.startY;
        if (!dragged && Math.hypot(deltaX, deltaY) < 6) return;
        dragged = true;
        closeMenu();
        switcher.classList.add('is-dragging');
        applyPosition({ left: dragState.left + deltaX, top: dragState.top + deltaY });
    });
    const finishDrag = (event) => {
        if (!dragState || dragState.pointerId !== event.pointerId) return;
        toggle.releasePointerCapture?.(event.pointerId);
        dragState = null;
        switcher.classList.remove('is-dragging');
        if (dragged && memoryFloatingButtonPosition) applyPosition(memoryFloatingButtonPosition, { persist: true });
    };
    toggle.addEventListener('pointerup', finishDrag);
    toggle.addEventListener('pointercancel', finishDrag);
    toggle.addEventListener('click', (event) => {
        if (dragged) {
            event.preventDefault();
            event.stopPropagation();
            dragged = false;
            return;
        }
        const opening = panel.hidden;
        if (opening) positionMenu();
        panel.hidden = !opening;
        toggle.setAttribute('aria-expanded', String(opening));
    });
    switcher.append(toggle, panel);
    document.body.append(switcher);
    document.addEventListener('click', (event) => {
        if (!switcher.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
    globalThis.addEventListener?.('resize', () => {
        if (memoryFloatingButtonPosition) applyPosition(memoryFloatingButtonPosition, { persist: true });
    });
    applyFloatingButtonEnabled(getSavedFloatingButtonEnabled(), { persist: false });
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

    const modeSection = document.createElement('section');
    modeSection.className = 'st-pocket-drawer-mode-section';
    modeSection.setAttribute('aria-label', 'ST Pocket UI 版面模式');

    const modeLabel = document.createElement('span');
    modeLabel.className = 'st-pocket-drawer-mode-label';
    modeLabel.textContent = '版面模式';

    const modeControls = document.createElement('div');
    modeControls.className = 'st-pocket-drawer-mode-controls';
    for (const [mode, label] of [
        ['auto', '自動'],
        ['mobile', '手機'],
        ['desktop', '電腦'],
    ]) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'menu_button st-pocket-ui-mode';
        button.dataset.stPocketMode = mode;
        button.textContent = label;
        button.addEventListener('click', () => {
            applyMode(mode);
            closeMenu();
        });
        modeControls.append(button);
    }
    modeSection.append(modeLabel, modeControls);
    menu.append(modeSection);

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
    document.documentElement.dataset.stPocketContext = context ? 'ready' : 'unavailable';
    enableIPhoneSafeArea();
    enableBrowserChromeFallbacks();
    createModeSwitcher();
    createNativeDrawerLauncher();
    createExtensionSettings();
    applyExtensionEnabled(getSavedExtensionEnabled(), { persist: false });
    if (!createWandMenuEntry()) {
        const observer = new MutationObserver(() => {
            if (createWandMenuEntry()) observer.disconnect();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        globalThis.setTimeout(() => observer.disconnect(), 10000);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
    initialize();
}
