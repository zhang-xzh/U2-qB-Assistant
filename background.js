chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'QB_API') {
        const { url, options } = request;

        console.log(`%c[Net-Req] %c${options.method || 'GET'} %c${url}`, 'color: #3498db; font-weight: bold', 'color: #fff', 'color: #f1c40f');

        // 核心修复：确保 fetch 的所有分支都能触发 sendResponse
        fetch(url, options)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.text();
            })
            .then(data => {
                // 成功分支
                sendResponse({ success: true, data });
                console.log(`%c[Net-Res] %cSuccess`, 'color: #27ae60; font-weight: bold', 'color: #fff');
            })
            .catch(err => {
                // 失败分支：必须显式返回成功标识为 false 的响应，而不是让通道挂起
                console.error(`%c[Net-Err] %c${err.message}`, 'color: #e74c3c; font-weight: bold', 'color: #fff');
                sendResponse({ success: false, error: err.message });
            });

        return true; // 保持通道开启，直到上述异步操作执行 sendResponse
    }

    // 如果不是 QB_API 类型的消息，直接返回 false 释放通道
    return false;
});