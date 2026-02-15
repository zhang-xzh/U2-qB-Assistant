const area = document.getElementById('dbText');

// 初始化：读取存储并转为文本显示
chrome.storage.local.get("qb_hash_map", (res) => {
    area.value = JSON.stringify(res.qb_hash_map || {}, null, 2);
});

// 保存：将文本解析回对象并存入
document.getElementById('save').addEventListener('click', () => {
    try {
        const map = JSON.parse(area.value);
        chrome.storage.local.set({ "qb_hash_map": map }, () => {
            alert('数据已更新！');
        });
    } catch (e) {
        alert('JSON 格式错误，请检查！');
    }
});

// 复制
document.getElementById('copy').addEventListener('click', () => {
    area.select();
    document.execCommand('copy');
    alert('已复制到剪贴板');
});