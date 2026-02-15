const box = document.getElementById('db_json');
const st = document.getElementById('status');

const msg = (t, isErr) => {
    st.innerText = t;
    st.className = `status ${isErr ? 'error' : 'success'}`;
    setTimeout(() => st.className = 'status', 3000);
};

// 读取存储
document.getElementById('export').onclick = async () => {
    const { qb_hash_map = {} } = await chrome.storage.local.get("qb_hash_map");
    box.value = JSON.stringify(qb_hash_map, null, 4);
    msg("数据已加载");
};

// 保存并覆盖
document.getElementById('import').onclick = async () => {
    try {
        const val = box.value.trim() || '{}';
        const data = JSON.parse(val);
        if (typeof data !== 'object' || Array.isArray(data)) throw new Error("必须是 JSON 对象");
        await chrome.storage.local.set({ "qb_hash_map": data });
        msg("保存完毕");
    } catch (e) {
        msg("JSON 格式错误: " + e.message, true);
    }
};

// 清空
document.getElementById('clear').onclick = async () => {
    if (confirm("确定要删除所有关联记录吗？")) {
        await chrome.storage.local.set({ "qb_hash_map": {} });
        box.value = "{}";
        msg("已重置为空");
    }
};