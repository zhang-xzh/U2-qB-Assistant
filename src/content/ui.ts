import { normalizeHash } from '../utils';

export interface StateUI {
    i: string;
    c: string;
    act: 'start' | 'stop';
    ci: string;
}

const STATE_UI: Record<string, StateUI> = {
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

export const getStateUI = (state: string): StateUI =>
    STATE_UI[state] || { i: 'fa-circle-question', c: '#bdc3c7', act: 'start', ci: 'fa-play' };

export const updateTorrentRowUI = (torrent: any) => {
    const hash = normalizeHash(torrent.hash);
    const ui = getStateUI(torrent.state);

    const iconEl = document.getElementById(`icon-${hash}`);
    const progressEl = document.getElementById(`prog-${hash}`);
    const controlEl = document.getElementById(`ctrl-${hash}`);
    const infoEl = document.getElementById(`info-${hash}`);

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
    if (infoEl) {
        // 格式化展示所有 API 信息
        const details = Object.entries(torrent)
            .map(([key, val]) => `${key}: ${val}`)
            .join('\n');
        infoEl.title = details;
        
        // 详情页额外显示：category, name（不再显示速度）
        const category = torrent.category ? `[${torrent.category}] ` : '';
        const name = torrent.name || '';
        
        infoEl.innerHTML = `<b>${category}${name}</b>`;
    }
};

const formatSpeed = (bytes: number) => {
    if (bytes === 0) return '0';
    if (bytes < 1024) return `${bytes}B/s`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
    return `${(bytes / 1024 / 1024).toFixed(1)}M`;
};

export const renderBox = (tid: string, hashMap: Record<string, string>, isDetails: boolean = false) => {
    const box = document.getElementById(`qb-box-${tid}`);
    if (!box) return;

    const hash = hashMap[tid];
    if (hash) {
        const h = normalizeHash(hash);
        let html = ''
        if (isDetails) {
            html += `<span class="qb-info" id="info-${h}" style="margin:0 12px 0 4px;cursor:help"></span>`;
        }
        html += `<span id="icon-${h}"></span>` +
            `<span class="qb-prog" id="prog-${h}">--%</span>` +
            `<span class="qb-ctrl" id="ctrl-${h}"></span>`;
        html += `<button class="qb-unbind" data-tid="${tid}"><i class="fa-solid fa-xmark"></i></button>`;
        box.innerHTML = html;
        return;
    }

    box.innerHTML =
        `<button class="qb-bind-btn" data-tid="${tid}">关联</button>` +
        `<button class="qb-add-btn" data-tid="${tid}">添加</button>`;
};

export const renderDetailsRow = (tid: string, hashMap: Record<string, string>) => {
    // 限制在 #outer 内查找，避免匹配到外部布局表格
    const container = document.getElementById('outer');
    if (!container) return;

    const downloadRow = Array.from(container.querySelectorAll('tr')).find(tr =>
        tr.querySelector(':scope > td.rowhead')?.textContent === '下载'
    );

    if (!downloadRow) return;

    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td class="rowhead" width="13%" valign="middle" style="vertical-align: middle;">客户端</td>
        <td class="rowfollow" width="87%">
            <div class="qb-box" id="qb-box-${tid}" style="justify-content: flex-start;"></div>
        </td>
    `;
    downloadRow.parentNode?.insertBefore(newRow, downloadRow);
    renderBox(tid, hashMap, true);
};
