import type { Torrent } from '@ctrl/qbittorrent';

export const QB_BASE_URL = 'http://localhost:18000';
export const STORAGE_KEY = 'qb_hash_map';
export const ALARM_NAME = 'QB_SYNC_ALARM';
export const FRONTEND_SYNC_INTERVAL_SECONDS_KEY = 'qb_frontend_sync_interval_seconds';
export const DEFAULT_FRONTEND_SYNC_INTERVAL_SECONDS = 1;
export const MIN_FRONTEND_SYNC_INTERVAL_SECONDS = 1;
export const MAX_FRONTEND_SYNC_INTERVAL_SECONDS = 60;
export const UPLOAD_TAG = 'U2';
export const TORRENT_MIME = 'application/x-bittorrent';
export const LOG_PREFIX = '%c[U2X]';
export const QB_FORM_HEADERS = { 'Content-Type': 'application/x-www-form-urlencoded' };

export enum MessageType {
    QB_API = 'QB_API',
    QB_UPLOAD = 'QB_UPLOAD',
    MAGIC = 'MAGIC',
    QB_STATUS_UPDATE = 'QB_STATUS_UPDATE'
}

export type HashMap = Record<string, string>;

export interface QBApiMessage {
    type: MessageType.QB_API;
    url: string;
    options: RequestInit;
}

export interface QBUploadPayload {
    b64: string;
    fileName: string;
    rename: string;
}

export interface QBUploadMessage {
    type: MessageType.QB_UPLOAD;
    url: string;
    data: QBUploadPayload;
}

export interface MagicFormPayload {
    torrent: string;
    user: 'SELF' | 'ALL';
    hours: string;
    promotion: string;
    ur: string;
    dr: string;
}

export interface MagicMessage {
    type: MessageType.MAGIC;
    action: 'cast';
    formData: MagicFormPayload;
}

export interface QBStatusUpdateMessage {
    type: MessageType.QB_STATUS_UPDATE;
    data: Torrent[];
}

export type BackgroundMessage = QBApiMessage | QBUploadMessage | MagicMessage;

export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export interface ApiErrorResponse {
    success: false;
    error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface MagicResponse {
    success: boolean;
    error?: string;
}

export type ResponseSender<T> = (response: ApiResponse<T>) => void;

export const normalizeHash = (hash: string | undefined) => String(hash || '').toLowerCase();

export const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

export const normalizeFrontendSyncIntervalSeconds = (value: unknown) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return DEFAULT_FRONTEND_SYNC_INTERVAL_SECONDS;

    return Math.min(
        MAX_FRONTEND_SYNC_INTERVAL_SECONDS,
        Math.max(MIN_FRONTEND_SYNC_INTERVAL_SECONDS, Math.round(parsed))
    );
};

export const base64ToUint8Array = (b64: string) => {
    const bytes = atob(b64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return arr;
};

export const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result).split(',')[1]);
        reader.readAsDataURL(blob);
    });

export const fetchTextOrThrow = async (url: string, options: RequestInit) => {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    return res.text();
};

export const getTorrentHashFromDetailsHtml = (html: string) => {
    const match = html.match(/种子散列值:<\/b>&nbsp;([a-f0-9]{40})/i);
    if (!match) throw new Error('HashNotFound');
    return normalizeHash(match[1]);
};

export const getDownloadUrlFromDetailsHtml = (html: string) => {
    const match = html.match(/href="(download\.php\?id=\d+[^"]*)"/i);
    if (!match) throw new Error('DownloadUrlNotFound');
    return new URL(match[1], window.location.origin).href;
};

export const qbFetch = async (path: string, options: RequestInit = { method: 'GET' }) => {
    const res = await chrome.runtime.sendMessage<QBApiMessage, ApiResponse<string>>({
        type: MessageType.QB_API,
        url: `${QB_BASE_URL}${path}`,
        options
    });
    if (!res.success) throw new Error(res.error);
    return res.data;
};
