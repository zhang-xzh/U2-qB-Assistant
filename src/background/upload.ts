import { fetchTextOrThrow, base64ToUint8Array, TORRENT_MIME, UPLOAD_TAG } from '../utils';
import { sendOk, sendError } from './api';

export const handleQBUpload = (message: any, sendResponse: (response: any) => void) => {
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
};
