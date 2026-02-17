import { handleQBAPI } from './api';
import { handleQBUpload } from './upload';
import { setupAlarms } from './alarms';
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { type } = message;
    if (type === 'QB_API') {
        return handleQBAPI(message, sendResponse);
    }
    if (type === 'QB_UPLOAD') {
        return handleQBUpload(message, sendResponse);
    }
    return false;
});
// 初始化闹钟
setupAlarms();
