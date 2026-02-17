import { STORAGE_KEY, normalizeHash } from '../utils';

const jsonTextarea = document.getElementById('db_json') as HTMLTextAreaElement;
const statusEl = document.getElementById('status') as HTMLElement;
const hashInput = document.getElementById('hash_input') as HTMLInputElement | null;

const setStatus = (text: string, type: 'success' | 'error' = 'success') => {
    statusEl.innerText = text;
    statusEl.className = `status ${type}`;
    setTimeout(() => (statusEl.className = 'status'), 3000);
};

const readHashMap = async () => {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    return data[STORAGE_KEY] || {};
};

const writeHashMap = async (hashMap: Record<string, string>) => {
    await chrome.storage.local.set({ [STORAGE_KEY]: hashMap });
};

const parseJsonObject = (rawText: string) => {
    const value = (rawText || '').trim() || '{}';
    const parsed = JSON.parse(value);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('必须是 JSON 对象');
    }
    return parsed;
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
    } catch (e: any) {
        setStatus(`JSON 格式错误: ${e.message}`, 'error');
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
