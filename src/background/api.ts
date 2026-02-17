import { fetchTextOrThrow } from '../utils';

export const sendOk = (sendResponse: (response: any) => void, data: any) => 
    sendResponse({ success: true, data });

export const sendError = (sendResponse: (response: any) => void, error: any) =>
    sendResponse({ success: false, error: error instanceof Error ? error.message : String(error) });

export const handleQBAPI = (message: any, sendResponse: (response: any) => void) => {
    fetchTextOrThrow(message.url, message.options)
        .then((text) => sendOk(sendResponse, text))
        .catch((err) => sendError(sendResponse, err));
    return true;
};
