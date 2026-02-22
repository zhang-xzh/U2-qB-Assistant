import { STORAGE_KEY, QB_BASE_URL, fetchTextOrThrow, MessageType } from '../utils';

export async function syncQBStatus() {
    try {
        const { [STORAGE_KEY]: hashMap = {} } = await chrome.storage.local.get(STORAGE_KEY);
        const hashes = Object.values(hashMap as Record<string, string>);
        if (!hashes.length) return;

        const data = await fetchTextOrThrow(`${QB_BASE_URL}/api/v2/torrents/info?hashes=${hashes.join('|')}`, { method: 'GET' });
        const list = JSON.parse(data);

        // 获取所有打开了 U2 页面的标签页，并发送更新数据
        const tabs = await chrome.tabs.query({ url: '*://u2.dmhy.org/*' });
        for (const tab of tabs) {
            if (tab.id && (tab.url?.includes('torrents.php') || tab.url?.includes('details.php'))) {
                chrome.tabs.sendMessage(tab.id, { type: MessageType.QB_STATUS_UPDATE, data: list }).catch(() => {
                    // 忽略发送失败（例如标签页正在加载中）
                });
            }
        }
    } catch (e) {
        console.error('[qB Background] Sync Error:', e);
    }
}
