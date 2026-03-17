import { MessageType, type BackgroundMessage, type MagicResponse, type ResponseSender } from '../utils';
import { setupAlarms } from './alarms';
import { handleQBAPI } from './api';
import { handleMagic } from './magic';
import { handleQBUpload } from './upload';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type } = message as BackgroundMessage;

    if (type === MessageType.QB_API) {
        return handleQBAPI(message as BackgroundMessage & { type: MessageType.QB_API }, sendResponse as ResponseSender<string>);
    }

    if (type === MessageType.QB_UPLOAD) {
        return handleQBUpload(message as BackgroundMessage & { type: MessageType.QB_UPLOAD }, sendResponse as ResponseSender<string>);
    }

    if (type === MessageType.MAGIC) {
        return handleMagic(message as BackgroundMessage & { type: MessageType.MAGIC }, sendResponse as (response: MagicResponse) => void);
    }

    return false;
});

// 初始化闹钟
setupAlarms();
