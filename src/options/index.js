import { STORAGE_KEY } from '../utils';
const jsonTextarea = document.getElementById('db_json');
const statusEl = document.getElementById('status');
const setStatus = (text, type = 'success') => {
    statusEl.innerText = text;
    statusEl.className = `status ${type}`;
    setTimeout(() => (statusEl.className = 'status'), 3000);
};
const readHashMap = async () => {
    const data = await chrome.storage.local.get(STORAGE_KEY);
    return data[STORAGE_KEY] || {};
};
const writeHashMap = async (hashMap) => {
    await chrome.storage.local.set({ [STORAGE_KEY]: hashMap });
};
const parseJsonObject = (rawText) => {
    const value = (rawText || '').trim() || '{}';
    const parsed = JSON.parse(value);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('必须是 JSON 对象');
    }
    return parsed;
};
// 读取存储
document.getElementById('export').onclick = async () => {
    const hashMap = await readHashMap();
    jsonTextarea.value = JSON.stringify(hashMap, null, 4);
    setStatus('数据已加载', 'success');
};
// 保存并覆盖
document.getElementById('import').onclick = async () => {
    try {
        const hashMap = parseJsonObject(jsonTextarea.value);
        await writeHashMap(hashMap);
        setStatus('保存完毕', 'success');
    }
    catch (e) {
        setStatus(`JSON 格式错误: ${e.message}`, 'error');
    }
};
// 清空
document.getElementById('clear').onclick = async () => {
    if (!confirm('确定要删除所有关联记录吗？'))
        return;
    await writeHashMap({});
    jsonTextarea.value = '{}';
    setStatus('已重置为空', 'success');
};
