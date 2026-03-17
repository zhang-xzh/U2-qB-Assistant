import {
    DEFAULT_FRONTEND_SYNC_INTERVAL_SECONDS,
    FRONTEND_SYNC_INTERVAL_SECONDS_KEY,
    HashMap,
    STORAGE_KEY,
    getErrorMessage,
    normalizeFrontendSyncIntervalSeconds,
    normalizeHash
} from '../utils';

const jsonTextarea = document.getElementById('db_json') as HTMLTextAreaElement;
const statusEl = document.getElementById('status') as HTMLElement;
const hashInput = document.getElementById('hash_input') as HTMLInputElement | null;
const syncIntervalInput = document.getElementById('sync_interval_seconds') as HTMLInputElement | null;

const setStatus = (text: string, type: 'success' | 'error' = 'success') => {
    statusEl.innerText = text;
    statusEl.className = `status ${type}`;
    setTimeout(() => (statusEl.className = 'status'), 3000);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const readHashMap = async () => {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    return (data[STORAGE_KEY] || {}) as HashMap;
};

const writeHashMap = async (hashMap: HashMap) => {
    await chrome.storage.local.set({ [STORAGE_KEY]: hashMap });
};

const readSyncIntervalSeconds = async () => {
    const data = await chrome.storage.local.get(FRONTEND_SYNC_INTERVAL_SECONDS_KEY);
    return normalizeFrontendSyncIntervalSeconds(data[FRONTEND_SYNC_INTERVAL_SECONDS_KEY]);
};

const writeSyncIntervalSeconds = async (seconds: number) => {
    await chrome.storage.local.set({
        [FRONTEND_SYNC_INTERVAL_SECONDS_KEY]: normalizeFrontendSyncIntervalSeconds(seconds)
    });
};

const parseJsonObject = (rawText: string): HashMap => {
    const value = (rawText || '').trim() || '{}';
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) {
        throw new Error('必须是 JSON 对象');
    }

    return Object.fromEntries(
        Object.entries(parsed).map(([key, val]) => [key, String(val)])
    );
};

const loadSyncIntervalSeconds = async () => {
    const seconds = await readSyncIntervalSeconds();
    if (syncIntervalInput) {
        syncIntervalInput.value = String(seconds || DEFAULT_FRONTEND_SYNC_INTERVAL_SECONDS);
    }
};

// 读取存储
document.getElementById('export')!.onclick = async () => {
    const hashMap = await readHashMap();
    jsonTextarea.value = JSON.stringify(hashMap, null, 4);
    setStatus('数据已加载', 'success');
};

// 保存并覆盖
document.getElementById('import')!.onclick = async () => {
    try {
        const hashMap = parseJsonObject(jsonTextarea.value);
        await writeHashMap(hashMap);
        setStatus('保存完毕', 'success');
    } catch (e) {
        setStatus(`JSON 格式错误: ${getErrorMessage(e)}`, 'error');
    }
};

// Hash 查询并跳转
document.getElementById('open_detail')?.addEventListener('click', async () => {
    const raw = (hashInput?.value || '').trim();
    if (!raw) {
        setStatus('请输入 hash', 'error');
        return;
    }
    const target = normalizeHash(raw);
    const hashMap = await readHashMap();
    const found = Object.entries(hashMap).find(([, hash]) => normalizeHash(hash) === target);
    if (!found) {
        setStatus('未找到对应的 id', 'error');
        return;
    }
    const id = found[0];
    const url = `https://u2.dmhy.org/details.php?id=${encodeURIComponent(id)}`;
    await chrome.tabs.create({ url });
    setStatus(`已打开详情页：${id}`, 'success');
});

document.getElementById('save_sync_interval')?.addEventListener('click', async () => {
    try {
        const seconds = normalizeFrontendSyncIntervalSeconds(syncIntervalInput?.value);
        await writeSyncIntervalSeconds(seconds);
        if (syncIntervalInput) {
            syncIntervalInput.value = String(seconds);
        }
        setStatus(`前端刷新间隔已设置为 ${seconds} 秒`, 'success');
    } catch (e) {
        setStatus(`保存刷新间隔失败: ${getErrorMessage(e)}`, 'error');
    }
});

void loadSyncIntervalSeconds();
