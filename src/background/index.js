"use strict";
const UPLOAD_TAG = 'U2';
const TORRENT_MIME = 'application/x-bittorrent';
const sendOk = (sendResponse, data) => sendResponse({ success: true, data });
const sendError = (sendResponse, error) => sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
const fetchTextOrThrow = async (url, options) => {
    const res = await fetch(url, options);
    if (!res.ok)
        throw new Error(`HTTP_${res.status}`);
    return res.text();
};
const base64ToUint8Array = (b64) => {
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++)
        arr[i] = bytes.charCodeAt(i);
    return arr;
};
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type } = message;
    if (type === 'QB_API') {
        fetchTextOrThrow(message.url, message.options)
            .then((text) => sendOk(sendResponse, text))
            .catch((err) => sendError(sendResponse, err));
        return true;
    }
    if (type === 'QB_UPLOAD') {
        const { url, data: payload } = message;
        const torrentBytes = base64ToUint8Array(payload.b64);
        const torrentBlob = new Blob([torrentBytes], { type: TORRENT_MIME });
        const formData = new FormData();
        formData.append('torrents', torrentBlob, payload.fileName);
        formData.append('rename', payload.rename);
        formData.append('tags', UPLOAD_TAG);
        fetchTextOrThrow(url, { method: 'POST', body: formData })
            .then((text) => sendOk(sendResponse, text))
            .catch((err) => sendError(sendResponse, err));
        return true;
    }
    return false;
});
