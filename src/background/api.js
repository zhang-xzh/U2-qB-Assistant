import { fetchTextOrThrow } from '../utils';
export const sendOk = (sendResponse, data) => sendResponse({ success: true, data });
export const sendError = (sendResponse, error) => sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });
export const handleQBAPI = (message, sendResponse) => {
    fetchTextOrThrow(message.url, message.options)
        .then((text) => sendOk(sendResponse, text))
        .catch((err) => sendError(sendResponse, err));
    return true;
};
