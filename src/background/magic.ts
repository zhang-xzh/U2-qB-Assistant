/**
 * 处理魔法请求
 */
export async function handleMagic(message: any, sendResponse: (response: any) => void): Promise<boolean> {
    const { action, formData } = message;

    if (action === 'cast') {
        try {
            const params = new URLSearchParams();
            params.append('action', 'magic');
            params.append('torrent', formData.torrent);
            params.append('user', formData.user);
            params.append('hours', formData.hours);
            params.append('promotion', formData.promotion);
            params.append('ur', formData.ur);
            params.append('dr', formData.dr);

            const response = await fetch('https://u2.dmhy.org/promotion.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            });

            const text = await response.text();
            const success = text.indexOf('location.href') !== -1;
            sendResponse({ success });
        } catch (error) {
            console.error('Magic request failed:', error);
            sendResponse({ success: false, error: String(error) });
        }
        return true;
    }

    return false;
}
