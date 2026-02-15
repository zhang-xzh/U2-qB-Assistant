(async () => {
    'use strict';
    const Q = 'http://localhost:18000';

    // 异步获取缓存数据
    const result = await chrome.storage.local.get("qb_hash_map");
    let M = result.qb_hash_map || {};

    const S = (s) => {
        const c = {
            'uploading': { i: 'fa-circle-arrow-up', c: '#27ae60', p: 0 },
            'downloading': { i: 'fa-circle-arrow-down', c: '#27ae60', p: 0 },
            'pausedUP': { i: 'fa-circle-check', c: '#7f8c8d', p: 1 },
            'pausedDL': { i: 'fa-circle-pause', c: '#7f8c8d', p: 1 },
            'unknown': { i: 'fa-question-circle', c: '#bdc3c7', p: 1 }
        };
        return c[s] || c['unknown'];
    };

    // 此处插入原有的 GM_addStyle (或改为原生 JS 注入 style)
    // 以及 renderBound, renderUnbound 逻辑

    async function sync() {
        const hs = Object.values(M);
        if (!hs.length) return;
        try {
            const res = await fetch(`${Q}/api/v2/torrents/info?hashes=${hs.join('|')}`);
            const list = await res.json();
            list.forEach(t => {
                const h = t.hash.toLowerCase(), ui = S(t.state);
                // 更新 UI 逻辑...
            });
        } catch (e) {}
    }

    // 列表页初始化
    const trs = document.querySelectorAll('table.torrents > tbody > tr');
    trs.forEach((tr, i) => {
        if (i === 0) return; // 处理表头
        const tid = tr.querySelector('a[href*="details.php?id="]')?.href.match(/id=(\d+)/)?.[1];
        if (!tid) return;

        const box = document.createElement('div');
        box.className = 'qb-box'; box.id = `qb-box-${tid}`;
        M[tid] ? renderBound(box, tid, M[tid]) : renderUnbound(box, tid);
        // 插入 DOM...
    });

    // 绑定事件监听 (点击关联等)
    document.addEventListener('click', async (e) => {
        // ... 原有逻辑，只需将 GM_xmlhttpRequest 替换为 fetch ...
    });

    sync();
    setInterval(sync, 10000);
})();