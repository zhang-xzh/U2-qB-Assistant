chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // 处理常规 API
    if (request.type === 'QB_API') {
        fetch(request.url, request.options)
            .then(res => res.ok ? res.text() : Promise.reject(res.status))
            .then(data => sendResponse({ success: true, data }))
            .catch(err => sendResponse({ success: false, error: err }));
        return true;
    }

    // 处理种子文件二进制上传
    if (request.type === 'QB_UPLOAD') {
        const { url, data } = request;
        const bytes = atob(data.b64);
        const arr = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
        const blob = new Blob([arr], { type: 'application/x-bittorrent' });

        const fd = new FormData();
        fd.append('torrents', blob, data.fileName);
        fd.append('rename', data.rename);
        fd.append('tags', 'U2');

        fetch(url, { method: 'POST', body: fd })
            .then(res => res.text())
            .then(resText => sendResponse({ success: true, data: resText }))
            .catch(err => sendResponse({ success: false, error: err.message }));
        return true;
    }
    return false;
});