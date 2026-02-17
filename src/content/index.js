import '@fortawesome/fontawesome-free/js/all.js';
(async () => {
    const LOG_PREFIX = '%c[qB-5.0]';
    const QB_BASE_URL = 'http://localhost:18000';
    const STORAGE_KEY = 'qb_hash_map';
    const QB_FORM_HEADERS = { 'Content-Type': 'application/x-www-form-urlencoded' };
    const STATE_UI = {
        uploading: { i: 'fa-circle-arrow-up', c: '#27ae60', act: 'stop', ci: 'fa-pause' },
        downloading: { i: 'fa-circle-arrow-down', c: '#e67e22', act: 'stop', ci: 'fa-pause' },
        queuedUP: { i: 'fa-clock', c: '#2980b9', act: 'stop', ci: 'fa-pause' },
        queuedDL: { i: 'fa-clock', c: '#2980b9', act: 'stop', ci: 'fa-pause' },
        stalledUP: { i: 'fa-circle-arrow-up', c: '#1b639e', act: 'stop', ci: 'fa-pause' },
        stalledDL: { i: 'fa-circle-arrow-down', c: '#2c3e50', act: 'stop', ci: 'fa-pause' },
        forcedUP: { i: 'fa-bolt-lightning', c: '#27ae60', act: 'stop', ci: 'fa-pause' },
        forcedDL: { i: 'fa-bolt-lightning', c: '#e67e22', act: 'stop', ci: 'fa-pause' },
        checkingUP: { i: 'fa-arrows-rotate fa-spin', c: '#27ae60', act: 'stop', ci: 'fa-pause' },
        checkingDL: { i: 'fa-arrows-rotate fa-spin', c: '#e67e22', act: 'stop', ci: 'fa-pause' },
        moving: { i: 'fa-truck-moving', c: '#9b59b6', act: 'stop', ci: 'fa-pause' },
        pausedUP: { i: 'fa-circle-check', c: '#7f8c8d', act: 'start', ci: 'fa-play' },
        pausedDL: { i: 'fa-circle-pause', c: '#7f8c8d', act: 'start', ci: 'fa-play' },
        stoppedUP: { i: 'fa-circle-check', c: '#7f8c8d', act: 'start', ci: 'fa-play' },
        stoppedDL: { i: 'fa-circle-pause', c: '#7f8c8d', act: 'start', ci: 'fa-play' },
        checkingResumeData: { i: 'fa-arrows-rotate fa-spin', c: '#9b59b6', act: 'stop', ci: 'fa-pause' }
    };
    const getStateUI = (state) => STATE_UI[state] || { i: 'fa-question-circle', c: '#bdc3c7', act: 'start', ci: 'fa-play' };
    const normalizeHash = (hash) => String(hash || '').toLowerCase();
    const qbFetch = async (path, options = { method: 'GET' }) => {
        const res = await chrome.runtime.sendMessage({
            type: 'QB_API',
            url: `${QB_BASE_URL}${path}`,
            options
        });
        if (!res.success)
            throw new Error(res.error);
        return res.data;
    };
    const blobToBase64 = (blob) => new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
        reader.readAsDataURL(blob);
    });
    const getTorrentHashFromDetailsHtml = (html) => {
        const match = html.match(/种子散列值:<\/b>&nbsp;([a-f0-9]{40})/i);
        if (!match)
            throw new Error('HashNotFound');
        return normalizeHash(match[1]);
    };
    const getDownloadUrlFromDetailsHtml = (html) => {
        const match = html.match(/href="(download\.php\?id=\d+[^"]*)"/i);
        if (!match)
            throw new Error('DownloadUrlNotFound');
        return new URL(match[1], window.location.origin).href;
    };
    const updateTorrentRowUI = (torrent) => {
        const hash = normalizeHash(torrent.hash);
        const ui = getStateUI(torrent.state);
        const iconEl = document.getElementById(`icon-${hash}`);
        const progressEl = document.getElementById(`prog-${hash}`);
        const controlEl = document.getElementById(`ctrl-${hash}`);
        if (iconEl) {
            iconEl.innerHTML = `<i class="fa-solid ${ui.i}" style="color:${ui.c}" title="${torrent.state}"></i>`;
        }
        if (progressEl) {
            progressEl.innerText = `${(torrent.progress * 100).toFixed(0)}%`;
            progressEl.style.color = ui.c;
        }
        if (controlEl) {
            controlEl.innerHTML = `<i class="fa-solid ${ui.ci}"></i>`;
            controlEl.style.color = ui.act === 'start' ? '#27ae60' : '#e67e22';
            Object.assign(controlEl.dataset, { hash, action: ui.act });
        }
    };
    let { [STORAGE_KEY]: hashMap = {} } = (await chrome.storage.local.get(STORAGE_KEY));
    async function sync() {
        const hashes = Object.values(hashMap);
        if (!hashes.length)
            return;
        try {
            const data = await qbFetch(`/api/v2/torrents/info?hashes=${hashes.join('|')}`);
            const list = JSON.parse(data);
            list.forEach(updateTorrentRowUI);
        }
        catch (e) {
            console.error(`${LOG_PREFIX} Sync Error`, e);
        }
    }
    const renderBox = (tid, hash = null) => {
        const box = document.getElementById(`qb-box-${tid}`);
        if (!box)
            return;
        if (hash) {
            const h = normalizeHash(hash);
            box.innerHTML =
                `<span id="icon-${h}"></span>` +
                    `<span class="qb-prog" id="prog-${h}">--%</span>` +
                    `<span class="qb-ctrl" id="ctrl-${h}"></span>` +
                    `<button class="qb-unbind" data-tid="${tid}"><i class="fa-solid fa-xmark"></i></button>`;
            return;
        }
        box.innerHTML =
            `<button class="qb-bind-btn" data-tid="${tid}">关联</button>` +
                `<button class="qb-add-btn" data-tid="${tid}">添加</button>`;
    };
    document.querySelectorAll('table.torrents > tbody > tr').forEach((tr, i) => {
        const tableRow = tr;
        let cell = tableRow.cells[0];
        if (!cell.classList.contains('qb-col')) {
            cell = tableRow.insertCell(0);
            cell.className = i === 0 ? 'colhead qb-col' : 'rowfollow qb-col';
        }
        if (i === 0) {
            cell.innerHTML = '<b>客户端</b><i class="fa-solid fa-bolt qb-batch-btn" id="qb-batch-trigger"></i>';
            return;
        }
        const tid = tableRow.querySelector('a[href*="details.php?id="]')?.getAttribute('href')?.match(/id=(\d+)/)?.[1];
        if (!tid)
            return;
        const box = document.createElement('div');
        box.className = 'qb-box';
        box.id = `qb-box-${tid}`;
        cell.appendChild(box);
        renderBox(tid, hashMap[tid]);
    });
    document.addEventListener('click', async (e) => {
        const target = e.target;
        const controlEl = target.closest('.qb-ctrl');
        if (controlEl) {
            const { action, hash } = controlEl.dataset;
            controlEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            await qbFetch(`/api/v2/torrents/${action}`, {
                method: 'POST',
                body: `hashes=${hash}`,
                headers: QB_FORM_HEADERS
            });
            setTimeout(sync, 1000);
            return;
        }
        const batchTrigger = target.closest('#qb-batch-trigger');
        if (batchTrigger) {
            document.querySelectorAll('.qb-bind-btn').forEach((btn) => btn.click());
            return;
        }
        const unbindBtn = target.closest('.qb-unbind');
        if (unbindBtn) {
            const tid = unbindBtn.dataset.tid;
            delete hashMap[tid];
            await chrome.storage.local.set({ [STORAGE_KEY]: hashMap });
            renderBox(tid);
            return;
        }
        const bindBtn = target.closest('.qb-bind-btn');
        const addBtn = target.closest('.qb-add-btn');
        if (!bindBtn && !addBtn)
            return;
        const btn = (bindBtn || addBtn);
        const tid = btn.dataset.tid;
        const rename = btn.closest('tr')?.querySelector('.embedded a[title]')?.title || '';
        btn.disabled = true;
        btn.innerText = '抓取';
        try {
            const detailsHtml = await (await fetch(`details.php?id=${tid}`)).text();
            const torrentHash = getTorrentHashFromDetailsHtml(detailsHtml);
            if (bindBtn) {
                try {
                    await qbFetch(`/api/v2/torrents/properties?hash=${torrentHash}`);
                }
                catch {
                    btn.innerText = '未找到';
                    setTimeout(() => {
                        btn.disabled = false;
                        btn.innerText = '关联';
                    }, 2000);
                    return;
                }
            }
            if (addBtn) {
                btn.innerText = '下载';
                const downloadUrl = getDownloadUrlFromDetailsHtml(detailsHtml);
                const torrentBlob = await (await fetch(downloadUrl)).blob();
                const b64 = await blobToBase64(torrentBlob);
                btn.innerText = '推送';
                await chrome.runtime.sendMessage({
                    type: 'QB_UPLOAD',
                    url: `${QB_BASE_URL}/api/v2/torrents/add`,
                    data: { b64, fileName: `${tid}.torrent`, rename }
                });
            }
            hashMap[tid] = torrentHash;
            await chrome.storage.local.set({ [STORAGE_KEY]: hashMap });
            renderBox(tid, torrentHash);
            sync();
        }
        catch (e) {
            btn.innerText = '错误';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerText = bindBtn ? '关联' : '添加';
            }, 2000);
        }
    });
    sync();
    setInterval(sync, 10000);
})();
