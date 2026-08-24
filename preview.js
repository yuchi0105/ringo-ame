const frame = document.getElementById('preview-device');
const panel = document.getElementById('left-nav-panel');
const backdrop = document.querySelector('.panel-backdrop');
const pendingPanel = document.getElementById('pending-panel');
const settingsScroll = document.querySelector('.settings-scroll');
settingsScroll.dataset.activeView = 'parameters';
// SillyTavern 原生頂欄的 9 個 drawer，各自指向對應的預覽 section。
const drawerPanels = {
    'ai-response': document.getElementById('ai-settings-panel'),
    'api': document.getElementById('api-settings-panel'),
    'formatting': document.getElementById('format-settings-panel'),
    'world-info': document.getElementById('world-info-panel'),
    'user-settings': document.getElementById('user-settings-panel'),
    'backgrounds': document.getElementById('backgrounds-panel'),
    'extensions': document.getElementById('extensions-panel'),
    'persona': document.getElementById('persona-panel'),
    'characters': document.getElementById('characters-panel'),
};
const pendingDrawers = {};
function closePanel() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    backdrop.classList.remove('is-visible');
}
function closeSettingsPanels() {
    document.querySelectorAll('.settings-panel').forEach((section) => {
        section.classList.remove('is-open');
        section.setAttribute('aria-hidden', 'true');
    });
}
function openSettingsPanel(section) {
    closePanel();
    closeSettingsPanels();
    section.classList.add('is-open');
    section.setAttribute('aria-hidden', 'false');
}
function openDrawer(key) {
    const section = drawerPanels[key];
    if (section) {
        if (key === 'persona' || key === 'characters') section.classList.remove('is-mobile-detail');
        openSettingsPanel(section);
        return;
    }
    const meta = pendingDrawers[key];
    if (!meta) return;
    pendingPanel.querySelector('[data-pending-title]').textContent = meta.title;
    pendingPanel.querySelector('[data-pending-eyebrow]').textContent = meta.eyebrow;
    openSettingsPanel(pendingPanel);
}
document.querySelectorAll('[data-preview-device]').forEach((button) => {
    button.addEventListener('click', () => {
        const desktop = button.dataset.previewDevice === 'desktop';
        frame.classList.toggle('is-desktop', desktop);
        frame.classList.toggle('is-iphone', !desktop);
        document.querySelectorAll('[data-preview-device]').forEach((item) => item.classList.toggle('is-active', item === button));
        closePanel();
        closeSettingsPanels();
    });
});
document.querySelector('[data-panel="left"]').addEventListener('click', () => {
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('is-visible');
});
document.querySelectorAll('[data-close-panel]').forEach((button) => button.addEventListener('click', closePanel));
document.querySelectorAll('[data-st-drawer]').forEach((button) => button.addEventListener('click', () => openDrawer(button.dataset.stDrawer)));
document.querySelectorAll('[data-close-ai-settings], [data-close-api-settings], [data-close-format-settings], [data-close-world-info], [data-close-user-settings], [data-close-backgrounds], [data-close-extensions], [data-close-persona], [data-close-characters], [data-close-pending]').forEach((button) => button.addEventListener('click', closeSettingsPanels));
document.querySelectorAll('.persona-card:not(.persona-upload)').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.persona-card').forEach((item) => item.classList.toggle('is-selected', item === button));
    if (frame.classList.contains('is-iphone')) {
        document.getElementById('persona-panel').classList.add('is-mobile-detail');
        document.querySelector('.persona-scroll').scrollTop = 0;
    }
}));
document.querySelector('[data-persona-back]').addEventListener('click', () => {
    document.getElementById('persona-panel').classList.remove('is-mobile-detail');
    document.querySelector('.persona-scroll').scrollTop = 0;
});
document.querySelectorAll('.character-card').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('.character-card').forEach((item) => item.classList.toggle('is-selected', item === button));
    if (frame.classList.contains('is-iphone')) {
        document.getElementById('characters-panel').classList.add('is-mobile-detail');
        document.querySelector('.character-scroll').scrollTop = 0;
    }
}));
document.querySelector('[data-character-back]').addEventListener('click', () => {
    document.getElementById('characters-panel').classList.remove('is-mobile-detail');
    document.querySelector('.character-scroll').scrollTop = 0;
});
const personaPosition = document.querySelector('[data-persona-position]');
const personaDepthOptions = document.querySelector('[data-persona-depth-options]');
const updatePersonaPosition = () => {
    personaDepthOptions.hidden = personaPosition.value !== 'in-chat';
};
personaPosition.addEventListener('change', updatePersonaPosition);
updatePersonaPosition();
const personaRenameDialog = document.querySelector('[data-persona-rename-dialog]');
document.querySelector('[data-persona-rename]').addEventListener('click', () => personaRenameDialog.showModal());
document.querySelector('[data-persona-rename-save]').addEventListener('click', () => {
    const name = document.querySelector('[data-persona-name-input]').value.trim() || '[Unnamed Persona]';
    const title = document.querySelector('[data-persona-title-input]').value.trim();
    document.querySelector('[data-persona-name]').textContent = name;
    document.querySelector('[data-persona-title]').textContent = title;
    document.querySelector('[data-persona-title]').hidden = title.length === 0;
});
const updatePersonaLinks = () => {
    const linkedItems = [...document.querySelectorAll('[data-persona-linked-item]:not([hidden])')];
    document.querySelector('[data-persona-link-count]').textContent = `${linkedItems.length} 項`;
    document.querySelector('[data-persona-links-empty]').hidden = linkedItems.length !== 0;
};
document.querySelectorAll('[data-persona-link]').forEach((button) => button.addEventListener('click', () => {
    const linked = button.classList.toggle('is-linked');
    button.setAttribute('aria-pressed', String(linked));
    button.querySelector('i').textContent = linked ? (button.dataset.personaLink === 'default' ? '已設定' : '已綁定') : '未綁定';
    const item = document.querySelector(`[data-persona-linked-item="${button.dataset.personaLink}"]`);
    if (item) item.hidden = !linked;
    updatePersonaLinks();
}));
document.querySelectorAll('[data-persona-unlink]').forEach((button) => button.addEventListener('click', () => {
    const key = button.dataset.personaUnlink;
    const option = document.querySelector(`[data-persona-link="${key}"]`);
    const item = document.querySelector(`[data-persona-linked-item="${key}"]`);
    if (option) {
        option.classList.remove('is-linked');
        option.setAttribute('aria-pressed', 'false');
        option.querySelector('i').textContent = '未綁定';
    }
    if (item) item.hidden = true;
    updatePersonaLinks();
}));
document.querySelectorAll('[data-background-tab]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-background-tab]').forEach((item) => item.classList.toggle('is-active', item === button));
    document.querySelectorAll('[data-background-page]').forEach((page) => { page.hidden = page.dataset.backgroundPage !== button.dataset.backgroundTab; });
}));
document.querySelectorAll('[data-user-tab]').forEach((button)=>button.addEventListener('click',()=>{document.querySelectorAll('[data-user-tab]').forEach((item)=>item.classList.toggle('is-active',item===button));document.querySelectorAll('[data-user-page]').forEach((page)=>page.hidden=page.dataset.userPage!==button.dataset.userTab);document.querySelector('.user-settings-scroll').scrollTop=0;}));
document.querySelectorAll('.user-slider-grid input[type="range"]').forEach((input)=>input.addEventListener('input',()=>{input.parentElement.querySelector('output').textContent=input.step==='0.01'?Number(input.value).toFixed(2):input.value;}));
document.querySelector('[data-wi-toggle-settings]').addEventListener('click',(event)=>{const section=document.querySelector('.wi-activation');section.hidden=!section.hidden;event.currentTarget.textContent=section.hidden?'啟用設定':'收合設定';});
document.querySelectorAll('.wi-entry-summary').forEach((button)=>button.addEventListener('click',()=>button.closest('.wi-entry').classList.toggle('is-expanded')));
document.querySelector('[data-wi-expand-all]').addEventListener('click',()=>document.querySelectorAll('.wi-entry').forEach((entry)=>entry.classList.add('is-expanded')));
document.querySelector('[data-wi-collapse-all]').addEventListener('click',()=>document.querySelectorAll('.wi-entry').forEach((entry)=>entry.classList.remove('is-expanded')));
document.querySelector('[data-wi-new-entry]').addEventListener('click',()=>{const entry=document.querySelector('.wi-entry').cloneNode(true);entry.querySelector('b').textContent='未命名條目';entry.querySelector('small').textContent='尚未設定關鍵字';entry.querySelectorAll('input, textarea').forEach((input)=>input.value='');entry.classList.add('is-expanded');entry.querySelector('.wi-entry-summary').addEventListener('click',()=>entry.classList.toggle('is-expanded'));document.querySelector('.wi-entry-list').prepend(entry);});
document.querySelectorAll('[data-format-tab]').forEach((button)=>button.addEventListener('click',()=>{document.querySelectorAll('[data-format-tab]').forEach((item)=>item.classList.toggle('is-active',item===button));document.querySelectorAll('[data-format-page]').forEach((page)=>{page.hidden=page.dataset.formatPage!==button.dataset.formatTab;});document.querySelector('.format-scroll').scrollTop=0;}));
const apiSource = document.getElementById('api-source');
const updateApiSource = () => {
    const supported = [...document.querySelectorAll('[data-api-source-panel]')].some((panel) => panel.dataset.apiSourcePanel === apiSource.value);
    document.querySelectorAll('[data-api-source-panel]').forEach((panel) => { panel.hidden = panel.dataset.apiSourcePanel !== apiSource.value; });
    document.querySelectorAll('[data-api-sources]').forEach((section) => { section.hidden = !section.dataset.apiSources.split(' ').includes(apiSource.value); });
    document.querySelector('[data-api-source-fallback]').hidden = supported;
    document.querySelector('.api-settings-scroll').scrollTop = 0;
};
apiSource.addEventListener('change', updateApiSource);
updateApiSource();
document.querySelector('[data-connect-api]').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const status = document.querySelector('[data-native-api-status]');
    const activeKey = document.querySelector('[data-api-source-panel]:not([hidden]) [data-api-key]');
    if (activeKey) activeKey.type = 'password';
    button.disabled = true;
    button.querySelector('span').textContent = '連線中…';
    status.textContent = '連線中……';
    window.setTimeout(() => {
        button.disabled = false;
        button.querySelector('span').textContent = '連線';
        status.textContent = '已連線';
        status.closest('.native-status').classList.add('is-connected');
    }, 650);
});
document.querySelector('[data-test-message]').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const status = document.querySelector('[data-native-api-status]');
    button.disabled = true;
    button.textContent = '測試中…';
    status.textContent = '正在測試 API……';
    window.setTimeout(() => {
        button.disabled = false;
        button.textContent = '測試訊息';
        status.textContent = 'API 測試成功';
    }, 800);
});
document.querySelector('[data-cancel-api]').addEventListener('click', () => {
    document.querySelector('[data-native-api-status]').textContent = '已取消';
});
document.querySelector('[data-authorize-api]').addEventListener('click', () => {
    document.querySelector('[data-native-api-status]').textContent = '預覽模式不會開啟 OAuth 授權';
});
document.querySelectorAll('[data-manage-api-key]').forEach((button) => button.addEventListener('click', () => {
    document.querySelector('[data-native-api-status]').textContent = '已開啟金鑰管理預覽';
}));
document.querySelector('[data-view-api-keys]').addEventListener('click', () => {
    document.querySelector('[data-native-api-status]').textContent = '已開啟隱藏金鑰預覽';
});
document.querySelectorAll('[data-settings-tab]').forEach((button) => {
    button.addEventListener('click', () => {
        settingsScroll.dataset.activeView = button.dataset.settingsTab;
        settingsScroll.scrollTop = 0;
        document.querySelectorAll('[data-settings-tab]').forEach((item) => {
            const active = item === button;
            item.classList.toggle('is-active', active);
            item.setAttribute('aria-pressed', String(active));
        });
    });
});
document.querySelectorAll('.settings-panel input[type="range"]').forEach((input) => {
    const output = document.querySelector(`[data-output-for="${input.id}"]`);
    if (!output) return;
    input.addEventListener('input', () => {
        const precision = (input.step.split('.')[1] || '').length;
        output.value = precision ? Number(input.value).toFixed(precision) : input.value;
    });
});
document.querySelectorAll('.prompt-summary').forEach((button) => {
    button.addEventListener('click', () => button.closest('.prompt-item').classList.toggle('is-expanded'));
});
document.querySelectorAll('.mini-toggle input').forEach((input) => {
    input.addEventListener('change', () => input.closest('.prompt-item').classList.toggle('is-disabled', !input.checked));
});
document.getElementById('send_form').addEventListener('submit', (event) => event.preventDefault());
