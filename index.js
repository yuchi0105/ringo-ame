import { chat, eventSource, event_types, getThumbnailUrl, showMoreMessages } from '../../../../script.js';
import { power_user } from '../../../power-user.js';
import { getUserAvatar, getUserAvatars, setUserAvatar, user_avatar } from '../../../personas.js';

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
const CONTEXT_ICON_SVGS = {
    total: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.953C12.449 1.995 12 2.448 12 3v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8.11 2.79"/></svg>',
    system: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg>',
    world: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v14"/><path d="M16 12h2"/><path d="M16 8h2"/><path d="M3 18a1 1 0 0 1-1-1V5a2 2 0 0 1 2-2h5a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3z"/><path d="M21 18a1 1 0 0 0 1-1V5a2 2 0 0 0-2-2h-5a3 3 0 0 0-3 3v15a3 3 0 0 1 3-3z"/></svg>',
    character: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2l-2 2v-2a2 2 0 0 1-2-2z"/><path d="M4 6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2l2 2v-2h6a2 2 0 0 0 2-2v-4"/></svg>',
    persona: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>',
    other: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/><path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9z"/></svg>',
    remaining: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>',
    prompt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="m8 9 2 2-2 2M13 15h3"/></svg>',
    reserve: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 10h8M8 14h5"/></svg>',
    connection: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v6M8 5h8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M8 14h.01M12 14h4"/></svg>',
};
const LUCIDE_ICONS = {
    check: '<path d="m20 6-11 11-5-5"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    chevronUp: '<path d="m18 15-6-6-6 6"/>',
    desktop: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>',
    mobile: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    sparkles: '<path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9z"/><path d="M5 3v4M3 5h4M19 17v4M17 19h4"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
};

function lucideIcon(name, className = '') {
    const classAttribute = className ? ` class="${className}"` : '';
    return `<svg${classAttribute} viewBox="0 0 24 24" aria-hidden="true" focusable="false">${LUCIDE_ICONS[name]}</svg>`;
}

function createLucideIcon(name, className = '') {
    const template = document.createElement('template');
    template.innerHTML = lucideIcon(name, className);
    return template.content.firstElementChild;
}
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

const supportsPersonaThumbnails = getThumbnailUrl('persona', 'st-pocket-probe.png', true).includes('&t=');

function getPersonaImageUrl(avatarId) {
    if (!avatarId) return '/img/ai4.png';
    if (supportsPersonaThumbnails) return getThumbnailUrl('persona', avatarId, true);
    return `${getUserAvatar(avatarId)}?t=${Date.now()}`;
}

function createQuickPersonaSwitcher() {
    if (document.getElementById('st-pocket-quick-persona')) return true;
    const leftSendForm = document.getElementById('leftSendForm');
    if (!leftSendForm) return false;

    const wrapper = document.createElement('div');
    wrapper.id = 'st-pocket-quick-persona';
    wrapper.className = 'st-pocket-quick-persona';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'st-pocket-quick-persona-toggle';
    toggle.setAttribute('aria-label', '快速切換 Persona');
    toggle.setAttribute('aria-haspopup', 'dialog');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `<img src="/img/ai4.png" alt="">${lucideIcon('chevronUp', 'st-pocket-persona-chevron')}`;

    const menu = document.createElement('section');
    menu.className = 'st-pocket-quick-persona-menu';
    menu.hidden = true;
    menu.setAttribute('role', 'dialog');
    menu.setAttribute('aria-label', '選擇 Persona');
    menu.innerHTML = `<div class="st-pocket-quick-persona-heading"><strong>快速切換 Persona</strong><button type="button" aria-label="關閉 Persona 選單">${lucideIcon('x')}</button></div><div class="st-pocket-quick-persona-grid"></div>`;

    const toggleImage = toggle.querySelector('img');
    const grid = menu.querySelector('.st-pocket-quick-persona-grid');
    const close = () => {
        menu.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        toggle.querySelector('.st-pocket-persona-chevron')?.replaceWith(createLucideIcon('chevronUp', 'st-pocket-persona-chevron'));
    };
    const positionMenu = () => {
        if (menu.hidden) return;
        const rect = toggle.getBoundingClientRect();
        const gutter = 8;
        const left = Math.min(Math.max(gutter, rect.left), Math.max(gutter, globalThis.innerWidth - menu.offsetWidth - gutter));
        menu.style.left = `${Math.round(left)}px`;
        menu.style.bottom = `${Math.max(gutter, Math.round(globalThis.innerHeight - rect.top + gutter))}px`;
    };
    const syncCurrentPersona = () => {
        const personaName = power_user.personas?.[user_avatar] || user_avatar || '目前 Persona';
        const personaTitle = power_user.persona_descriptions?.[user_avatar]?.title || '';
        toggleImage.src = getPersonaImageUrl(user_avatar);
        toggleImage.alt = '';
        toggle.title = personaTitle ? `${personaName}－${personaTitle}` : personaName;
        toggle.setAttribute('aria-label', `快速切換 Persona，目前為 ${personaName}`);
        grid.querySelectorAll('[data-persona-avatar]').forEach((button) => {
            const selected = button.dataset.personaAvatar === user_avatar;
            button.classList.toggle('is-selected', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
    };
    const renderPersonas = async () => {
        grid.setAttribute('aria-busy', 'true');
        try {
            const avatars = await getUserAvatars(false);
            const fragment = document.createDocumentFragment();
            for (const avatarId of avatars) {
                const personaName = power_user.personas?.[avatarId] || avatarId;
                const personaTitle = power_user.persona_descriptions?.[avatarId]?.title || '';
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'st-pocket-quick-persona-option';
                button.dataset.personaAvatar = avatarId;
                button.setAttribute('aria-label', personaTitle ? `${personaName}，${personaTitle}` : personaName);
                button.innerHTML = `<img alt=""><span></span>${lucideIcon('check')}`;
                button.querySelector('img').src = getPersonaImageUrl(avatarId);
                button.querySelector('span').textContent = personaName;
                button.classList.toggle('is-default', avatarId === power_user.default_persona);
                button.addEventListener('click', async () => {
                    button.disabled = true;
                    try {
                        await setUserAvatar(avatarId);
                        syncCurrentPersona();
                        close();
                        toggle.focus({ preventScroll: true });
                    } catch (error) {
                        console.warn('[ST Pocket UI] Persona switch failed.', error);
                    } finally {
                        button.disabled = false;
                    }
                });
                fragment.append(button);
            }
            grid.replaceChildren(fragment);
            syncCurrentPersona();
        } catch (error) {
            grid.textContent = '無法讀取 Persona 清單';
            console.warn('[ST Pocket UI] Persona list is unavailable.', error);
        } finally {
            grid.removeAttribute('aria-busy');
        }
    };
    const open = async () => {
        menu.hidden = false;
        toggle.setAttribute('aria-expanded', 'true');
        toggle.querySelector('.st-pocket-persona-chevron')?.replaceWith(createLucideIcon('chevronDown', 'st-pocket-persona-chevron'));
        await renderPersonas();
        positionMenu();
        menu.querySelector('.is-selected, .st-pocket-quick-persona-option')?.focus({ preventScroll: true });
    };

    toggle.addEventListener('click', () => menu.hidden ? open() : close());
    menu.querySelector('.st-pocket-quick-persona-heading button').addEventListener('click', () => {
        close();
        toggle.focus({ preventScroll: true });
    });
    document.addEventListener('click', (event) => {
        if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) close();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !menu.hidden) {
            close();
            toggle.focus({ preventScroll: true });
        }
    });
    globalThis.addEventListener('resize', positionMenu);
    globalThis.visualViewport?.addEventListener('resize', positionMenu);
    globalThis.visualViewport?.addEventListener('scroll', positionMenu);
    eventSource.on(event_types.CHAT_CHANGED, syncCurrentPersona);
    eventSource.on(event_types.SETTINGS_UPDATED, syncCurrentPersona);

    wrapper.append(toggle);
    leftSendForm.prepend(wrapper);
    document.body.append(menu);
    syncCurrentPersona();
    return true;
}

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
    syncTopInfoBarVisibility();

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

function syncTopInfoBarVisibility() {
    const topBar = document.getElementById('extensionTopBar');
    if (!topBar) return;

    const shouldHide = document.documentElement.classList.contains('st-pocket-ui-enabled');
    if (shouldHide && !topBar.hasAttribute('data-st-pocket-topinfobar-hidden')) {
        topBar.dataset.stPocketPreviousInert = String(topBar.inert);
        topBar.dataset.stPocketTopinfobarHidden = '';
        topBar.inert = true;
    } else if (!shouldHide && topBar.hasAttribute('data-st-pocket-topinfobar-hidden')) {
        topBar.inert = topBar.dataset.stPocketPreviousInert === 'true';
        delete topBar.dataset.stPocketPreviousInert;
        delete topBar.dataset.stPocketTopinfobarHidden;
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
                ${lucideIcon('chevronDown', 'inline-drawer-icon down')}
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
        ['auto', '自動', '依視窗寬度切換', 'sparkles'],
        ['mobile', '手機', '使用單欄觸控版面', 'mobile'],
        ['desktop', '電腦', '保留完整桌面配置', 'desktop'],
    ];

    for (const [mode, label, description, icon] of modes) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'menu_button st-pocket-ui-mode';
        button.dataset.stPocketMode = mode;
        button.innerHTML = `${lucideIcon(icon)}<span><strong></strong><small></small></span>${lucideIcon('check', 'st-pocket-mode-check')}`;
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
    toggle.className = 'menu_button st-pocket-launcher-toggle';
    toggle.innerHTML = lucideIcon('menu');
    toggle.setAttribute('aria-label', '開啟 SillyTavern 功能');
    toggle.setAttribute('aria-expanded', 'false');

    const menu = document.createElement('nav');
    menu.id = 'st-pocket-native-menu';
    menu.className = 'st-pocket-native-menu';
    menu.setAttribute('aria-label', 'SillyTavern 功能');
    menu.hidden = true;

    const scrim = document.createElement('button');
    scrim.type = 'button';
    scrim.className = 'st-pocket-drawer-scrim';
    scrim.setAttribute('aria-label', '關閉主選單');
    scrim.hidden = true;

    const sheetHandle = document.createElement('span');
    sheetHandle.className = 'st-pocket-sheet-handle';
    sheetHandle.setAttribute('aria-hidden', 'true');
    menu.append(sheetHandle);

    const sheetHeader = document.createElement('div');
    sheetHeader.className = 'st-pocket-sheet-header';
    const sheetTitle = document.createElement('strong');
    sheetTitle.textContent = 'SillyTavern 功能';
    const sheetClose = document.createElement('button');
    sheetClose.type = 'button';
    sheetClose.className = 'menu_button st-pocket-sheet-close';
    sheetClose.innerHTML = lucideIcon('x');
    sheetClose.setAttribute('aria-label', '關閉主選單');
    sheetHeader.append(sheetTitle, sheetClose);
    menu.append(sheetHeader);

    const closeMenu = () => {
        menu.hidden = true;
        scrim.hidden = true;
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
        scrim.hidden = !opening;
        toggle.setAttribute('aria-expanded', String(opening));
    });

    scrim.addEventListener('click', closeMenu);
    sheetClose.addEventListener('click', closeMenu);
    toggle.setAttribute('aria-controls', menu.id);

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

    const mobileHeader = document.createElement('header');
    mobileHeader.className = 'st-pocket-mobile-header';
    mobileHeader.dataset.stPocketUi = 'mobile-header';

    const identity = document.createElement('button');
    identity.type = 'button';
    identity.className = 'st-pocket-chat-identity';
    identity.setAttribute('aria-label', '開啟聊天操作');
    identity.setAttribute('aria-expanded', 'false');
    const avatar = document.createElement('img');
    avatar.className = 'st-pocket-chat-avatar';
    avatar.alt = '';
    const title = document.createElement('span');
    title.className = 'st-pocket-chat-title';
    title.textContent = 'SillyTavern';
    identity.append(avatar, title);

    const chatActions = createChatActions(identity);

    const search = document.createElement('div');
    search.className = 'st-pocket-chat-search';
    search.innerHTML = lucideIcon('search');
    const searchInput = document.createElement('input');
    searchInput.type = 'search';
    searchInput.placeholder = '搜尋目前對話';
    searchInput.setAttribute('aria-label', '搜尋目前對話');
    const searchStatus = document.createElement('output');
    searchStatus.className = 'st-pocket-chat-search-status';
    searchStatus.setAttribute('aria-live', 'polite');
    const previousResult = document.createElement('button');
    previousResult.type = 'button';
    previousResult.className = 'st-pocket-chat-search-nav';
    previousResult.setAttribute('aria-label', '上一筆搜尋結果');
    previousResult.innerHTML = lucideIcon('chevronUp');
    const nextResult = document.createElement('button');
    nextResult.type = 'button';
    nextResult.className = 'st-pocket-chat-search-nav';
    nextResult.setAttribute('aria-label', '下一筆搜尋結果');
    nextResult.innerHTML = lucideIcon('chevronDown');
    const clearSearch = document.createElement('button');
    clearSearch.type = 'button';
    clearSearch.className = 'st-pocket-chat-search-clear';
    clearSearch.setAttribute('aria-label', '清除搜尋');
    clearSearch.innerHTML = lucideIcon('x');
    search.append(searchInput, searchStatus, previousResult, nextResult, clearSearch);

    const contextStats = createContextUsageStats();

    const syncChatIdentity = () => {
        const lastCharacterMessage = [...document.querySelectorAll('#chat .mes')]
            .reverse()
            .find((message) => message.getAttribute('is_user') !== 'true');
        const sourceAvatar = lastCharacterMessage?.querySelector('.avatar img, img.avatar');
        const sourceName = lastCharacterMessage?.querySelector('.name_text, .ch_name, .mes_name');
        if (sourceAvatar?.src) {
            avatar.src = sourceAvatar.src;
            avatar.hidden = false;
        } else {
            avatar.removeAttribute('src');
            avatar.hidden = true;
        }
        title.textContent = sourceName?.textContent?.trim() || 'SillyTavern';
    };

    const searchState = {
        results: [],
        activeIndex: -1,
        restoreMessageId: null,
        restoreOffset: 0,
        navigationToken: 0,
    };
    const getSearchText = (message) => String(message?.extra?.display_text ?? message?.mes ?? '');
    const rememberChatPosition = () => {
        const chatElement = document.getElementById('chat');
        const chatTop = chatElement?.getBoundingClientRect().top ?? 0;
        const anchor = [...document.querySelectorAll('#chat .mes')].find((message) => {
            const rect = message.getBoundingClientRect();
            return rect.bottom > chatTop;
        });
        searchState.restoreMessageId = anchor?.getAttribute('mesid') ?? null;
        searchState.restoreOffset = anchor ? anchor.getBoundingClientRect().top - chatTop : 0;
    };
    const clearActiveResult = () => {
        document.querySelectorAll('#chat .mes.st-pocket-search-current').forEach((message) => {
            message.classList.remove('st-pocket-search-current', 'st-pocket-search-reveal');
        });
    };
    const ensureMessageLoaded = async (messageId) => {
        let target = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
        if (target) return target;
        const firstDisplayedId = Number(document.querySelector('#chat .mes')?.getAttribute('mesid'));
        if (!Number.isNaN(firstDisplayedId) && messageId < firstDisplayedId) {
            await showMoreMessages(firstDisplayedId - messageId);
            target = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
        }
        return target;
    };
    const updateSearchControls = () => {
        const count = searchState.results.length;
        searchStatus.value = count ? `${searchState.activeIndex + 1} / ${count}` : (searchInput.value.trim() ? '無結果' : '');
        searchStatus.textContent = searchStatus.value;
        previousResult.disabled = count === 0;
        nextResult.disabled = count === 0;
        clearSearch.hidden = !searchInput.value;
        search.classList.toggle('has-results', count > 0);
    };
    const navigateToResult = async (index) => {
        if (!searchState.results.length) return;
        const token = ++searchState.navigationToken;
        searchState.activeIndex = (index + searchState.results.length) % searchState.results.length;
        updateSearchControls();
        clearActiveResult();
        const result = searchState.results[searchState.activeIndex];
        const target = await ensureMessageLoaded(result.messageId);
        if (!target || token !== searchState.navigationToken) return;
        target.classList.add('st-pocket-search-current');
        if (result.hidden) target.classList.add('st-pocket-search-reveal');
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    };
    const runChatSearch = () => {
        const query = searchInput.value.trim().toLocaleLowerCase();
        clearActiveResult();
        searchState.navigationToken += 1;
        searchState.results = query
            ? chat.flatMap((message, messageId) => getSearchText(message).toLocaleLowerCase().includes(query)
                ? [{ messageId, hidden: Boolean(message?.is_system) }]
                : [])
            : [];
        searchState.activeIndex = searchState.results.length ? 0 : -1;
        updateSearchControls();
        if (searchState.results.length) navigateToResult(0);
    };
    const resetChatSearch = async ({ restore = true } = {}) => {
        searchInput.value = '';
        clearActiveResult();
        searchState.navigationToken += 1;
        searchState.results = [];
        searchState.activeIndex = -1;
        updateSearchControls();
        if (!restore || searchState.restoreMessageId === null) return;
        const anchor = await ensureMessageLoaded(Number(searchState.restoreMessageId));
        if (!anchor) return;
        const chatElement = document.getElementById('chat');
        const currentOffset = anchor.getBoundingClientRect().top - chatElement.getBoundingClientRect().top;
        chatElement.scrollTop += currentOffset - searchState.restoreOffset;
    };
    searchInput.addEventListener('focus', () => {
        if (!searchInput.value) rememberChatPosition();
    });
    searchInput.addEventListener('input', runChatSearch);
    searchInput.addEventListener('search', () => {
        if (searchInput.value) runChatSearch();
        else resetChatSearch();
    });
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            navigateToResult(searchState.activeIndex + (event.shiftKey ? -1 : 1));
        } else if (event.key === 'Escape' && searchInput.value) {
            event.stopPropagation();
            resetChatSearch();
        }
    });
    previousResult.addEventListener('click', () => navigateToResult(searchState.activeIndex - 1));
    nextResult.addEventListener('click', () => navigateToResult(searchState.activeIndex + 1));
    clearSearch.addEventListener('click', () => {
        resetChatSearch();
        searchInput.focus();
    });

    mobileHeader.append(identity, search, contextStats, launcher);
    document.body.append(scrim, mobileHeader, chatActions, menu);
    syncChatIdentity();
    const chatObserver = new MutationObserver(() => {
        syncChatIdentity();
    });
    const chat = document.getElementById('chat');
    if (chat) chatObserver.observe(chat, { childList: true, subtree: true });
    eventSource.on(event_types.CHAT_CHANGED, () => resetChatSearch({ restore: false }));
    for (const eventType of [event_types.MESSAGE_RECEIVED, event_types.MESSAGE_EDITED, event_types.MESSAGE_DELETED]) {
        eventSource.on(eventType, () => {
            if (searchInput.value) runChatSearch();
        });
    }
    syncNativeActions();

    document.addEventListener('click', (event) => {
        if (!launcher.contains(event.target) && !menu.contains(event.target)) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
    });
}

function createChatActions(toggle) {
    const panel = document.createElement('section');
    panel.className = 'st-pocket-chat-actions';
    panel.hidden = true;
    panel.setAttribute('aria-label', '聊天操作');
    panel.innerHTML = `
        <div class="st-pocket-chat-actions-heading"><strong>聊天操作</strong><button type="button" aria-label="關閉聊天操作">×</button></div>
        <div class="st-pocket-chat-actions-grid">
            <button type="button" data-native="#option_select_chat">聊天檔案</button>
            <button type="button" data-native="#option_start_new_chat">新增聊天</button>
            <button type="button" data-action="rename">重新命名</button>
            <button type="button" data-action="delete">刪除聊天</button>
            <button type="button" data-native="#option_close_chat">關閉聊天</button>
        </div>
        <section class="st-pocket-chat-actions-extensions" aria-labelledby="st-pocket-chat-actions-extensions-title">
            <strong id="st-pocket-chat-actions-extensions-title">擴充快捷操作</strong>
            <div id="st-pocket-chat-actions-topinfobar" class="st-pocket-chat-actions-grid" aria-label="TopInfoBar 快捷操作"></div>
            <div id="st-pocket-chat-actions-slot" class="st-pocket-chat-actions-grid" aria-label="第三方擴充快捷操作"></div>
        </section>`;
    const close = () => {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
        const opening = panel.hidden;
        panel.hidden = !opening;
        toggle.setAttribute('aria-expanded', String(opening));
    });
    panel.querySelector('.st-pocket-chat-actions-heading button').addEventListener('click', close);
    panel.querySelectorAll('[data-native]').forEach((button) => button.addEventListener('click', () => {
        const nativeAction = document.querySelector(button.dataset.native);
        if (nativeAction) nativeAction.click();
        else console.warn(`[ST Pocket UI] Native chat action is unavailable: ${button.dataset.native}`);
        close();
    }));
    panel.querySelector('[data-action="rename"]').addEventListener('click', async () => {
        try {
            const context = globalThis.SillyTavern?.getContext?.();
            const currentName = context?.getCurrentChatId?.();
            if (!currentName) return;
            const nextName = await context.Popup?.show?.input?.('輸入新的聊天名稱', null, currentName);
            if (nextName && nextName !== currentName) await context.renameChat?.(currentName, String(nextName));
        } catch (error) {
            console.warn('[ST Pocket UI] Chat rename is unavailable.', error);
        } finally {
            close();
        }
    });
    panel.querySelector('[data-action="delete"]').addEventListener('click', async () => {
        try {
            const context = globalThis.SillyTavern?.getContext?.();
            const confirmed = await context?.Popup?.show?.confirm?.('確定要刪除目前聊天嗎？');
            if (confirmed) await context?.executeSlashCommandsWithOptions?.('/delchat');
        } catch (error) {
            console.warn('[ST Pocket UI] Chat delete is unavailable.', error);
        } finally {
            close();
        }
    });
    setupChatActionExtensions(panel, close);
    document.addEventListener('click', (event) => {
        if (!panel.contains(event.target) && !toggle.contains(event.target)) close();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
    });
    return panel;
}

function setupChatActionExtensions(panel, closePanel) {
    const actionSelector = 'button, a[href], input[type="button"], input[type="submit"], [role="button"], [tabindex]';
    const proxyContainer = panel.querySelector('#st-pocket-chat-actions-topinfobar');
    const publicSlot = panel.querySelector('#st-pocket-chat-actions-slot');
    const excludedTopInfoBarIds = new Set([
        'extensionTopBarChatManager',
        'extensionTopBarNewChat',
        'extensionTopBarRenameChat',
        'extensionTopBarDeleteChat',
        'extensionTopBarCloseChat',
        'extensionTopBarToggleConnectionProfiles',
    ]);
    let observedTopBar = null;
    let syncFrame = 0;

    const getActionLabel = (source) => source.getAttribute('aria-label')
        || source.getAttribute('title')
        || source.textContent?.trim()
        || '';
    const isAvailable = (source) => {
        const style = globalThis.getComputedStyle?.(source);
        return !source.hidden
            && source.getAttribute('aria-hidden') !== 'true'
            && !source.classList.contains('displayNone')
            && !source.classList.contains('not-in-chat')
            && style?.display !== 'none'
            && style?.visibility !== 'hidden';
    };
    const syncProxies = () => {
        syncFrame = 0;
        if (!observedTopBar?.isConnected) return;
        const sources = [...observedTopBar.querySelectorAll(actionSelector)]
            .filter((source) => !source.parentElement?.closest(actionSelector))
            .filter((source) => !excludedTopInfoBarIds.has(source.id))
            .filter((source) => !['extensionTopBarChatName', 'extensionTopBarSearchInput'].includes(source.id))
            .filter((source) => getActionLabel(source));
        const fragment = document.createDocumentFragment();
        for (const source of sources) {
            const label = getActionLabel(source);
            const proxy = document.createElement('button');
            proxy.type = 'button';
            proxy.className = 'st-pocket-extension-action';
            proxy.dataset.stPocketProxyFor = source.id || label;
            proxy.disabled = Boolean(source.disabled) || source.getAttribute('aria-disabled') === 'true';
            proxy.hidden = !isAvailable(source);
            if (source.getAttribute('aria-pressed')) proxy.setAttribute('aria-pressed', source.getAttribute('aria-pressed'));
            const sourceIcon = source.matches('i, svg, img') ? source : source.querySelector('i, svg, img');
            if (sourceIcon) {
                const icon = sourceIcon.cloneNode(true);
                [icon, ...icon.querySelectorAll?.('*') || []].forEach((element) => {
                    element.removeAttribute('id');
                    for (const attribute of [...element.attributes]) {
                        if (attribute.name.startsWith('on')) element.removeAttribute(attribute.name);
                    }
                });
                icon.setAttribute('aria-hidden', 'true');
                proxy.append(icon);
            }
            const text = document.createElement('span');
            text.textContent = label;
            proxy.append(text);
            proxy.addEventListener('click', () => {
                if (!source.isConnected || proxy.disabled) return;
                source.click();
                closePanel();
            });
            fragment.append(proxy);
        }
        proxyContainer.replaceChildren(fragment);
    };
    const scheduleSync = () => {
        if (!syncFrame) syncFrame = globalThis.requestAnimationFrame?.(syncProxies) || globalThis.setTimeout(syncProxies, 0);
    };
    const topBarObserver = new MutationObserver(scheduleSync);
    const discoverTopBar = () => {
        const topBar = document.getElementById('extensionTopBar');
        syncTopInfoBarVisibility();
        if (topBar === observedTopBar) return;
        topBarObserver.disconnect();
        observedTopBar = topBar;
        if (observedTopBar) topBarObserver.observe(observedTopBar, {
            attributes: true,
            attributeFilter: ['aria-disabled', 'aria-hidden', 'aria-label', 'aria-pressed', 'class', 'disabled', 'hidden', 'title'],
            childList: true,
            subtree: true,
        });
        scheduleSync();
    };
    const discoveryObserver = new MutationObserver(discoverTopBar);
    discoveryObserver.observe(document.body, { childList: true, subtree: true });
    discoverTopBar();
    document.dispatchEvent(new CustomEvent('st-pocket-ui:chat-actions-ready', { detail: { slot: publicSlot } }));
}

function createContextUsageStats() {
    const wrapper = document.createElement('div');
    wrapper.className = 'st-pocket-context-stats';

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'st-pocket-context-toggle';
    toggle.setAttribute('aria-label', '上下文使用統計：尚無資料');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = `${CONTEXT_ICON_SVGS.total}<span>--%</span>`;

    const panel = document.createElement('section');
    panel.className = 'st-pocket-context-panel';
    panel.hidden = true;
    panel.innerHTML = `
        <div class="st-pocket-context-heading">
            <div><strong>上下文使用統計</strong><small>最近一次實際送給 AI 的內容</small></div>
            <button type="button" class="st-pocket-context-close" aria-label="關閉上下文統計">×</button>
        </div>
        <div class="st-pocket-context-total-line">
            <span class="st-pocket-context-total">尚無資料</span>
        </div>
        <div class="st-pocket-context-metrics">
            <div class="st-pocket-context-metric" data-metric="usage">${CONTEXT_ICON_SVGS.total}<span>總使用率</span><strong>--%</strong></div>
            <div class="st-pocket-context-metric" data-metric="remaining">${CONTEXT_ICON_SVGS.remaining}<span>剩餘</span><strong>--</strong></div>
            <div class="st-pocket-context-metric" data-metric="prompt">${CONTEXT_ICON_SVGS.prompt}<span>Prompt</span><strong>-- / --</strong></div>
            <div class="st-pocket-context-metric" data-metric="reserve">${CONTEXT_ICON_SVGS.reserve}<span>回覆預留</span><strong>--</strong></div>
        </div>
        <section class="st-pocket-connection" aria-labelledby="st-pocket-connection-title">
            <div class="st-pocket-connection-heading">${CONTEXT_ICON_SVGS.connection}<div><strong id="st-pocket-connection-title">目前 API 連線</strong><small class="st-pocket-connection-status">讀取中…</small></div></div>
            <label><span>Connection Profile</span><select class="st-pocket-connection-select" aria-label="切換 Connection Profile" disabled><option>尚無可用設定檔</option></select></label>
        </section>
        <div class="st-pocket-context-breakdown"></div>
        <p class="st-pocket-context-note">分項取自 SillyTavern 最近一次 Prompt；總使用率包含本次回覆預留空間。</p>`;

    const closePanel = () => {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
    };
    toggle.addEventListener('click', () => {
        const opening = panel.hidden;
        panel.hidden = !opening;
        toggle.setAttribute('aria-expanded', String(opening));
    });
    panel.querySelector('.st-pocket-context-close').addEventListener('click', closePanel);
    document.addEventListener('click', (event) => {
        if (!wrapper.contains(event.target)) closePanel();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closePanel();
    });
    wrapper.append(toggle, panel);

    const formatTokens = (value) => new Intl.NumberFormat('zh-TW').format(Math.max(0, Math.round(Number(value) || 0)));

    const connectionSelect = panel.querySelector('.st-pocket-connection-select');
    const connectionStatus = panel.querySelector('.st-pocket-connection-status');
    let nativeConnectionSelect = null;
    const syncConnection = async () => {
        const context = globalThis.SillyTavern?.getContext?.();
        nativeConnectionSelect = document.getElementById('connection_profiles');
        if (nativeConnectionSelect) {
            connectionSelect.replaceChildren(...[...nativeConnectionSelect.options].map((option) => option.cloneNode(true)));
            connectionSelect.value = nativeConnectionSelect.value;
            connectionSelect.disabled = false;
        } else {
            connectionSelect.innerHTML = '<option>尚無可用設定檔</option>';
            connectionSelect.disabled = true;
        }
        const online = context?.onlineStatus;
        if (!online || online === 'no_connection') {
            connectionStatus.textContent = '未連線';
            connectionStatus.dataset.online = 'false';
            return;
        }
        let api = context?.mainApi || 'API';
        let model = online;
        try {
            const commands = context?.SlashCommandParser?.commands;
            api = await commands?.api?.callback?.({ quiet: 'true' }, '') || api;
            model = await commands?.model?.callback?.({ quiet: 'true' }, '') || model;
        } catch (error) {
            console.debug('[ST Pocket UI] Detailed API status is unavailable.', error);
        }
        connectionStatus.textContent = `${api} · ${model}`;
        connectionStatus.dataset.online = 'true';
    };
    connectionSelect.addEventListener('change', () => {
        if (!nativeConnectionSelect) return;
        nativeConnectionSelect.value = connectionSelect.value;
        nativeConnectionSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const render = ({ total, maximum, reserved = 0, categories } = {}) => {
        if (!total || !maximum) return;
        const promptBudget = Math.max(0, maximum - reserved);
        const usedContext = Math.min(maximum, total + reserved);
        const percent = Math.min(100, Math.round((usedContext / maximum) * 100));
        const level = percent >= 90 ? 'danger' : percent >= 75 ? 'warning' : 'normal';
        wrapper.dataset.level = level;
        toggle.querySelector('span').textContent = `${percent}%`;
        toggle.setAttribute('aria-label', `上下文使用統計：已使用 ${percent}%`);
        panel.querySelector('.st-pocket-context-total').textContent = `${formatTokens(usedContext)} / ${formatTokens(maximum)} Token`;
        panel.querySelector('[data-metric="usage"] strong').textContent = `${percent}%`;
        panel.querySelector('[data-metric="remaining"] strong').textContent = formatTokens(maximum - usedContext);
        panel.querySelector('[data-metric="prompt"] strong').textContent = `${formatTokens(total)} / ${formatTokens(promptBudget)}`;
        panel.querySelector('[data-metric="reserve"] strong').textContent = formatTokens(reserved);
        const breakdown = panel.querySelector('.st-pocket-context-breakdown');
        breakdown.replaceChildren(...categories.map(({ key, label, value }) => {
            const row = document.createElement('div');
            const categoryPercent = total ? Math.round((value / total) * 100) : 0;
            row.className = 'st-pocket-context-row';
            row.innerHTML = `${CONTEXT_ICON_SVGS[key]}<span>${label}</span><div class="st-pocket-context-row-bar" aria-hidden="true"><i style="width:${Math.min(100, categoryPercent)}%"></i></div><strong>${formatTokens(value)}</strong>`;
            return row;
        }));
    };

    const update = async () => {
        try {
            const [{ itemizedPrompts, itemizedParams }, { getMaxContextTokens }] = await Promise.all([
                import('/scripts/itemized-prompts.js'),
                import('/script.js'),
            ]);
            const latest = itemizedPrompts.at(-1);
            if (!latest) return;
            const index = itemizedPrompts.length - 1;
            const params = await itemizedParams(itemizedPrompts, index, Number(latest.mesId));
            const isOpenAi = latest.main_api === 'openai';
            const total = Number(params.finalPromptTokens || params.totalTokensInPrompt || 0);
            let categories = isOpenAi
                ? [
                    { key: 'system', label: '系統提示', value: Number(params.oaiSystemTokens || 0) + Number(params.oaiBiasTokens || 0) },
                    { key: 'world', label: '世界書', value: Number(params.worldInfoStringTokens || 0) },
                    { key: 'character', label: '角色設定', value: Number(params.oaiPromptTokens || 0) + Number(params.beforeScenarioAnchorTokens || 0) + Number(params.afterScenarioAnchorTokens || 0) },
                    { key: 'chat', label: '聊天紀錄', value: Number(params.ActualChatHistoryTokens || 0) },
                ]
                : [
                    { key: 'system', label: '系統提示', value: Number(params.promptBiasTokens || 0) },
                    { key: 'world', label: '世界書', value: Number(params.worldInfoStringTokens || 0) },
                    { key: 'character', label: '角色設定', value: Number(params.storyStringTokens || 0) + Number(params.examplesStringTokens || 0) },
                    { key: 'chat', label: '聊天紀錄', value: Number(params.ActualChatHistoryTokens || 0) + Number(params.allAnchorsTokens || 0) },
                ];
            if (isOpenAi) {
                try {
                    const { promptManager } = await import('/scripts/openai.js');
                    const counts = promptManager?.tokenHandler?.getCounts?.();
                    if (counts && typeof counts === 'object') {
                        const count = (key) => Math.max(0, Number(counts[key]) || 0);
                        const known = {
                            chat: count('chatHistory'),
                            world: count('worldInfoBefore') + count('worldInfoAfter'),
                            character: count('charDescription') + count('charPersonality') + count('scenario'),
                            persona: count('personaDescription'),
                        };
                        const knownTotal = Object.values(known).reduce((sum, value) => sum + value, 0);
                        categories = [
                            { key: 'chat', label: '聊天紀錄', value: known.chat },
                            { key: 'world', label: '世界書', value: known.world },
                            { key: 'character', label: '角色設定', value: known.character },
                            { key: 'persona', label: 'Persona', value: known.persona },
                            { key: 'other', label: '其他 Prompt', value: Math.max(0, total - knownTotal) },
                        ];
                    }
                } catch (error) {
                    console.debug('[ST Pocket UI] Detailed Prompt Manager breakdown is unavailable.', error);
                }
            }
            const context = globalThis.SillyTavern?.getContext?.();
            const reserved = Number(context?.chatCompletionSettings?.openai_max_tokens || 0);
            render({ total, maximum: Number(getMaxContextTokens()), reserved, categories });
        } catch (error) {
            console.warn('[ST Pocket UI] Context usage statistics are unavailable.', error);
        }
    };
    update();
    syncConnection();
    Promise.resolve().then(() => {
        const context = globalThis.SillyTavern?.getContext?.();
        context?.eventSource?.on?.('itemized_prompts_saved', update);
        context?.eventSource?.on?.('chat_id_changed', update);
        context?.eventSource?.on?.('online_status_changed', syncConnection);
        context?.eventSource?.on?.('connection_profile_loaded', syncConnection);
    });
    return wrapper;
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

function enableMobileKeyboardAvoidance() {
    const root = document.documentElement;
    const viewport = globalThis.visualViewport;
    if (!viewport) {
        root.dataset.stPocketKeyboardSupport = 'fallback';
        return;
    }

    root.dataset.stPocketKeyboardSupport = 'visual-viewport';
    let frame = 0;
    const isEditable = (element) => element instanceof Element
        && Boolean(element.closest('input, textarea, select, [contenteditable="true"]'));
    const update = () => {
        frame = 0;
        const mobile = root.dataset.stPocketLayout === 'mobile';
        const focused = isEditable(document.activeElement);
        const keyboardInset = Math.max(0, globalThis.innerHeight - viewport.height - viewport.offsetTop);
        const keyboardOpen = mobile && focused && keyboardInset >= 120;
        const focusArea = document.activeElement?.closest?.('#send_form') ? 'composer' : 'overlay';

        root.style.setProperty('--st-pocket-visual-height', `${Math.round(viewport.height)}px`);
        root.style.setProperty('--st-pocket-viewport-top', `${Math.round(viewport.offsetTop)}px`);
        root.style.setProperty('--st-pocket-keyboard-inset', keyboardOpen ? `${Math.round(keyboardInset)}px` : '0px');
        root.dataset.stPocketKeyboard = keyboardOpen ? 'open' : 'closed';
        root.dataset.stPocketKeyboardFocus = keyboardOpen ? focusArea : 'none';
    };
    const scheduleUpdate = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(update);
    };

    viewport.addEventListener('resize', scheduleUpdate);
    viewport.addEventListener('scroll', scheduleUpdate);
    globalThis.addEventListener('resize', scheduleUpdate);
    document.addEventListener('focusin', (event) => {
        if (!isEditable(event.target)) return;
        scheduleUpdate();
        globalThis.setTimeout(() => {
            scheduleUpdate();
            event.target.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
        }, 180);
    });
    document.addEventListener('focusout', () => globalThis.setTimeout(scheduleUpdate, 80));
    update();
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
    enableMobileKeyboardAvoidance();
    createModeSwitcher();
    createNativeDrawerLauncher();
    if (!createQuickPersonaSwitcher()) {
        const personaObserver = new MutationObserver(() => {
            if (createQuickPersonaSwitcher()) personaObserver.disconnect();
        });
        personaObserver.observe(document.body, { childList: true, subtree: true });
        globalThis.setTimeout(() => personaObserver.disconnect(), 10000);
    }
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
