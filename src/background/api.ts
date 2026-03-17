import { fetchTextOrThrow, getErrorMessage, type QBApiMessage, type ResponseSender } from '../utils';

export const sendOk = <T>(sendResponse: ResponseSender<T>, data: T) => 
    sendResponse({ success: true, data });

export const sendError = <T>(sendResponse: ResponseSender<T>, error: unknown) =>
    sendResponse({ success: false, error: getErrorMessage(error) });

export const handleQBAPI = (message: QBApiMessage, sendResponse: ResponseSender<string>) => {
    fetchTextOrThrow(message.url, message.options)
        .then((text) => sendOk(sendResponse, text))
        .catch((err) => sendError(sendResponse, err));
    return true;
};
