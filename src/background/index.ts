import { handleQBAPI } from './api';
import { handleQBUpload } from './upload';
import { handleMagic } from './magic';
import { setupAlarms } from './alarms';
import { MessageType } from '../utils';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type } = message;

    if (type === MessageType.QB_API) {
        return handleQBAPI(message, sendResponse);
    }

    if (type === MessageType.QB_UPLOAD) {
        return handleQBUpload(message, sendResponse);
    }

    if (type === MessageType.MAGIC) {
        return handleMagic(message, sendResponse);
    }

    return false;
});

// 初始化闹钟
setupAlarms();
