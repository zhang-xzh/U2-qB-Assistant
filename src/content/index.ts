import { initIcons } from '../utils/icons';
import '../assets/style.css';
import { LOG_PREFIX, QB_BASE_URL, STORAGE_KEY, QB_FORM_HEADERS, qbFetch, blobToBase64, getTorrentHashFromDetailsHtml, getDownloadUrlFromDetailsHtml } from '../utils';
import { updateTorrentRowUI, renderBox, renderDetailsRow } from './ui';

(async () => {
    let { [STORAGE_KEY]: hashMap = {} } = (await chrome.storage.local.get(STORAGE_KEY)) as Record<string, any>;
    initIcons();

    const isDetailsPage = window.location.pathname.includes('details.php');

    chrome.runtime.onMessage.addListener((message) => {
        if (message.type === 'QB_STATUS_UPDATE') {
            message.data.forEach(updateTorrentRowUI);
        }
    });

    async function sync() {
        const hashes = Object.values(hashMap);
        if (!hashes.length) return;

        try {
            const data = await qbFetch(`/api/v2/torrents/info?hashes=${hashes.join('|')}`);
            const list = JSON.parse(data);
            list.forEach(updateTorrentRowUI);
        } catch (e) {
            console.error(`${LOG_PREFIX} Sync Error`, e);
        }
    }

    if (isDetailsPage) {
        const tid = new URLSearchParams(window.location.search).get('id');
        if (tid) {
            renderDetailsRow(tid, hashMap);
        }
    } else {
        // 初始化表格列
        document.querySelectorAll('table.torrents > tbody > tr').forEach((tr, i) => {
            const tableRow = tr as HTMLTableRowElement;
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
            if (!tid) return;

            const box = document.createElement('div');
            box.className = 'qb-box';
            box.id = `qb-box-${tid}`;
            cell.appendChild(box);

            renderBox(tid, hashMap, isDetailsPage);
        });
    }

    // 事件委托
    document.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement;

        const controlEl = target.closest('.qb-ctrl') as HTMLElement | null;
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
            document.querySelectorAll<HTMLButtonElement>('.qb-bind-btn').forEach((btn) => btn.click());
            return;
        }

        const unbindBtn = target.closest('.qb-unbind') as HTMLElement | null;
        if (unbindBtn) {
            const tid = unbindBtn.dataset.tid!;
            delete hashMap[tid];
            await chrome.storage.local.set({ [STORAGE_KEY]: hashMap });
            renderBox(tid, hashMap, isDetailsPage);
            return;
        }

        const bindBtn = target.closest('.qb-bind-btn') as HTMLButtonElement | null;
        const addBtn = target.closest('.qb-add-btn') as HTMLButtonElement | null;
        if (!bindBtn && !addBtn) return;

        const btn = (bindBtn || addBtn)!;
        const tid = btn.dataset.tid!;
        const rename = (btn.closest('tr')?.querySelector('.embedded a[title]') as HTMLElement | null)?.title || '';

        btn.disabled = true;
        btn.innerText = '抓取';

        try {
            const detailsHtml = await (await fetch(`details.php?id=${tid}`)).text();
            const torrentHash = getTorrentHashFromDetailsHtml(detailsHtml);

            if (bindBtn) {
                try {
                    await qbFetch(`/api/v2/torrents/properties?hash=${torrentHash}`);
                } catch {
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

            renderBox(tid, hashMap, isDetailsPage);
            sync();
        } catch (e) {
            btn.innerText = '错误';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerText = bindBtn ? '关联' : '添加';
            }, 2000);
        }
    });

    sync();
})();
