import { STORAGE_KEY, normalizeHash } from '../utils';

const hashInput = document.getElementById('hash_input') as HTMLInputElement;
const statusEl = document.getElementById('status') as HTMLElement;
const openBtn = document.getElementById('open_detail') as HTMLButtonElement;
const optionsLink = document.getElementById('go_options') as HTMLAnchorElement;

const setStatus = (text: string, type: 'success' | 'error' = 'success') => {
    statusEl.innerText = text;
    statusEl.className = `status ${type}`;
    setTimeout(() => (statusEl.className = 'status'), 3000);
};

openBtn.onclick = async () => {
    const raw = (hashInput.value || '').trim();
    if (!raw) {
        setStatus('请输入 hash', 'error');
        return;
    }

    const target = normalizeHash(raw);
    const data = await chrome.storage.local.get(STORAGE_KEY);
    const hashMap = (data[STORAGE_KEY] || {}) as Record<string, string>;

    const found = Object.entries(hashMap).find(([, hash]) => normalizeHash(hash) === target);

    if (!found) {
        setStatus('未找到对应的 id', 'error');
        return;
    }

    const id = found[0];
    const url = `https://u2.dmhy.org/details.php?id=${encodeURIComponent(id)}`;
    await chrome.tabs.create({ url });
    window.close(); // 打开后关闭 popup
};

optionsLink.onclick = (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
};

// 聚焦输入框
hashInput.focus();

// 支持回车
hashInput.onkeydown = (e) => {
    if (e.key === 'Enter') {
        openBtn.click();
    }
};
