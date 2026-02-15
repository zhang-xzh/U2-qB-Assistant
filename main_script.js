(async () => {
    const LOG_PRE = '%c[qB-5.0]';
    const QB_BASE = 'http://localhost:18000';

    const storage = await chrome.storage.local.get("qb_hash_map");
    let M = storage.qb_hash_map || {};

    const qbFetch = async (url, opts = { method: 'GET' }) => {
        const res = await chrome.runtime.sendMessage({ type: 'QB_API', url: `${QB_BASE}${url}`, options: opts });
        if (!res.success) throw new Error(res.error);
        return res.data;
    };

    /**
     * 针对 qB 5.0 优化的状态映射
     * act: 动作 (start/stop) | ci: 按钮图标 (play/pause)
     */
    const getUI = (s) => {
        const cfg = {
            // 运行状态：显示暂停按钮 (ci: fa-pause)，点击执行 stop (act: stop)
            'uploading':          { i: 'fa-circle-arrow-up', c: '#27ae60', act: 'stop',  ci: 'fa-pause' },
            'downloading':        { i: 'fa-circle-arrow-down', c: '#e67e22', act: 'stop',  ci: 'fa-pause' },
            'stalledUP':          { i: 'fa-circle-arrow-up', c: '#1b639e', act: 'stop',  ci: 'fa-pause' },
            'stalledDL':          { i: 'fa-circle-arrow-down', c: '#2c3e50', act: 'stop',  ci: 'fa-pause' },
            'forcedUP':           { i: 'fa-bolt-lightning', c: '#27ae60', act: 'stop',  ci: 'fa-pause' },
            'forcedDL':           { i: 'fa-bolt-lightning', c: '#e67e22', act: 'stop',  ci: 'fa-pause' },
            'checkingUP':         { i: 'fa-arrows-rotate fa-spin', c: '#27ae60', act: 'stop', ci: 'fa-pause' },
            'checkingDL':         { i: 'fa-arrows-rotate fa-spin', c: '#e67e22', act: 'stop', ci: 'fa-pause' },
            'moving':             { i: 'fa-truck-moving', c: '#9b59b6', act: 'stop', ci: 'fa-pause' },

            // 停止/暂停状态：显示播放按钮 (ci: fa-play)，点击执行 start (act: start)
            'pausedUP':           { i: 'fa-circle-check', c: '#7f8c8d', act: 'start', ci: 'fa-play' },
            'pausedDL':           { i: 'fa-circle-pause', c: '#7f8c8d', act: 'start', ci: 'fa-play' },
            'stoppedUP':          { i: 'fa-circle-check', c: '#7f8c8d', act: 'start', ci: 'fa-play' }, // qB 5.0 新状态
            'stoppedDL':          { i: 'fa-circle-pause', c: '#7f8c8d', act: 'start', ci: 'fa-play' }, // qB 5.0 新状态
            'queuedUP':           { i: 'fa-clock', c: '#2980b9', act: 'start', ci: 'fa-play' },
            'queuedDL':           { i: 'fa-clock', c: '#2980b9', act: 'start', ci: 'fa-play' },
            'checkingResumeData': { i: 'fa-arrows-rotate fa-spin', c: '#9b59b6', act: 'stop', ci: 'fa-pause' }
        };
        return cfg[s] || { i: 'fa-question-circle', c: '#bdc3c7', act: 'start', ci: 'fa-play' };
    };

    async function sync() {
        const hs = Object.values(M);
        if (!hs.length) return;
        try {
            const data = await qbFetch(`/api/v2/torrents/info?hashes=${hs.join('|')}`);
            const list = JSON.parse(data);
            list.forEach(t => {
                const h = t.hash.toLowerCase(), ui = getUI(t.state);
                const iE = document.getElementById(`icon-${h}`),
                    pE = document.getElementById(`prog-${h}`),
                    cE = document.getElementById(`ctrl-${h}`);
                if (iE) iE.innerHTML = `<i class="fa-solid ${ui.i}" style="color:${ui.c}" title="${t.state}"></i>`;
                if (pE) { pE.innerText = (t.progress * 100).toFixed(0) + '%'; pE.style.color = ui.c; }
                if (cE) {
                    cE.innerHTML = `<i class="fa-solid ${ui.ci}"></i>`;
                    cE.style.color = ui.act === 'start' ? '#27ae60' : '#e67e22';
                    Object.assign(cE.dataset, { hash: h, action: ui.act });
                }
            });
        } catch (e) { console.error(`${LOG_PRE} Sync Error`, e); }
    }

    // 初始化表格注入
    document.querySelectorAll('table.torrents > tbody > tr').forEach((tr, i) => {
        let c = tr.cells[0];
        if (!c.classList.contains('qb-col')) {
            c = tr.insertCell(0);
            c.className = i === 0 ? 'colhead qb-col' : 'rowfollow qb-col';
        }
        if (i === 0) { c.innerHTML = '<b>客户端</b><i class="fa-solid fa-bolt qb-batch-btn" id="qb-batch-trigger" title="全部批量关联"></i>'; return; }
        const tidMatch = tr.querySelector('a[href*="details.php?id="]')?.href.match(/id=(\d+)/);
        if (!tidMatch) return;
        const tid = tidMatch[1];
        const box = document.createElement('div');
        box.className = 'qb-box'; box.id = `qb-box-${tid}`;
        if (M[tid]) {
            const h = M[tid].toLowerCase();
            box.innerHTML = `<span id="icon-${h}"></span><span class="qb-prog" id="prog-${h}">--%</span><span class="qb-ctrl" id="ctrl-${h}"></span><button class="qb-unbind" data-tid="${tid}"><i class="fa-solid fa-xmark"></i></button>`;
        } else {
            box.innerHTML = `<button class="qb-bind-btn" data-tid="${tid}">关联</button>`;
        }
        c.appendChild(box);
    });

    document.addEventListener('click', async e => {
        const t = e.target, ctrl = t.closest('.qb-ctrl'), b = t.closest('.qb-bind-btn'), un = t.closest('.qb-unbind'), batch = t.closest('#qb-batch-trigger');

        if (ctrl) {
            const { action, hash } = ctrl.dataset;
            ctrl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            // qB 5.0 依然支持 /api/v2/torrents/start 和 /api/v2/torrents/stop
            await qbFetch(`/api/v2/torrents/${action}`, {
                method: 'POST', body: `hashes=${hash}`,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            setTimeout(sync, 1000);
        }

        if (b) {
            const tid = b.dataset.tid;
            b.disabled = true; b.innerText = 'Search';
            const name = b.closest('tr').querySelector('.embedded a[title]')?.title || '';
            const list = JSON.parse(await qbFetch('/api/v2/torrents/info'));
            const match = list.find(x => x.name === name);
            if (match) {
                M[tid] = match.hash.toLowerCase();
                await chrome.storage.local.set({ "qb_hash_map": M });
                const box = document.getElementById(`qb-box-${tid}`);
                const h = M[tid];
                box.innerHTML = `<span id="icon-${h}"></span><span class="qb-prog" id="prog-${h}">--%</span><span class="qb-ctrl" id="ctrl-${h}"></span><button class="qb-unbind" data-tid="${tid}"><i class="fa-solid fa-xmark"></i></button>`;
                await sync();
            } else {
                b.innerText = 'Scraping';
                const html = await (await fetch(`details.php?id=${tid}`)).text();
                const ha = html.match(/种子散列值:<\/b>&nbsp;([a-f0-9]{40})/i);
                if (ha) {
                    M[tid] = ha[1].toLowerCase();
                    await chrome.storage.local.set({ "qb_hash_map": M });
                    const box = document.getElementById(`qb-box-${tid}`);
                    const h = M[tid];
                    box.innerHTML = `<span id="icon-${h}"></span><span class="qb-prog" id="prog-${h}">--%</span><span class="qb-ctrl" id="ctrl-${h}"></span><button class="qb-unbind" data-tid="${tid}"><i class="fa-solid fa-xmark"></i></button>`;
                    sync();
                } else {
                    b.innerText = 'Failed';
                    setTimeout(() => { b.disabled = false; b.innerText = '关联'; }, 2000);
                }
            }
        }

        if (batch) document.querySelectorAll('.qb-bind-btn').forEach(btn => btn.click());

        if (un) {
            const tid = un.dataset.tid;
            delete M[tid];
            await chrome.storage.local.set({ "qb_hash_map": M });
            document.getElementById(`qb-box-${tid}`).innerHTML = `<button class="qb-bind-btn" data-tid="${tid}">关联</button>`;
        }
    });

    await sync(); setInterval(sync, 10000);
})();