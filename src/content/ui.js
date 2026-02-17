import { normalizeHash } from '../utils';
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
export const getStateUI = (state) => STATE_UI[state] || { i: 'fa-question-circle', c: '#bdc3c7', act: 'start', ci: 'fa-play' };
export const updateTorrentRowUI = (torrent) => {
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
export const renderBox = (tid, hashMap) => {
    const box = document.getElementById(`qb-box-${tid}`);
    if (!box)
        return;
    const hash = hashMap[tid];
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
