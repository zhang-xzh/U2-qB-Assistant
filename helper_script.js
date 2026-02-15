(async () => {
    const tid = new URLSearchParams(window.location.search).get('id');
    const hashMatch = document.body.innerHTML.match(/种子散列值:<\/b>&nbsp;([a-f0-9]{40})/i);
    if (tid && hashMatch) {
        const hash = hashMatch[1].toLowerCase();
        let { qb_hash_map: M = {} } = await chrome.storage.local.get("qb_hash_map");
        if (M[tid] !== hash) {
            M[tid] = hash;
            await chrome.storage.local.set({ "qb_hash_map": M });
            console.log(`%c[qB-Helper] %c已同步 Hash: %c${hash}`, 'color: #27ae60; font-weight: bold', 'color: #fff', 'color: #f1c40f');
        }
    }
})();