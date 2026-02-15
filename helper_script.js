(async () => {
    'use strict';

    // 1. 从 URL 获取种子 ID
    const tid = new URLSearchParams(window.location.search).get('id');
    if (!tid) return;

    // 2. 提取散列值 (Hash)
    // 依然采用高性能字符串正则，避开 DOM 树解析
    const bodyText = document.body.innerHTML;
    const hashMatch = bodyText.match(/种子散列值:<\/b>&nbsp;([a-f0-9]{40})/i);

    if (hashMatch) {
        const hash = hashMatch[1].toLowerCase();

        // 3. 异步读取并更新存储
        // chrome.storage.local.get 在 V3 中支持 Promise 语法
        const result = await chrome.storage.local.get("qb_hash_map");
        let M = result.qb_hash_map || {};

        // 只有数据不同时才触发写入，保护闪存寿命
        if (M[tid] !== hash) {
            M[tid] = hash;
            await chrome.storage.local.set({ "qb_hash_map": M });

            // WebStorm 控制台输出，方便调试
            console.log(`[U2 Helper] 种子 ${tid} 已入库: ${hash}`);
        }
    }
})();