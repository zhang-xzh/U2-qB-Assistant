// U2-OneKeyFree 放魔功能模块

interface MagicState {
    totalCount: number;
    currentCount: number;
    successCount: number;
    magicRangeStart: number;
    magicRangeEnd: number;
}

const state: MagicState = {
    totalCount: 0,
    currentCount: 0,
    successCount: 0,
    magicRangeStart: 0,
    magicRangeEnd: 0,
};

function castMagicWarning(all = false): boolean {
    const confirmText = '确定要' + (all ? '全部' : '') + '施放魔法吗？';
    if ((all && prompt(confirmText + ' (输入 YES 以确认)') === 'YES') || (!all && confirm(confirmText))) {
        return true;
    }
    return false;
}

function castMagic(form: HTMLFormElement) {
    if (castMagicWarning()) {
        form.submit();
    }
}

function getCheckedValue(name: string): string | undefined {
    const checked = document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
    return checked?.value;
}

function getValue(name: string): string {
    const el = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
    return el?.value || '';
}

function castMagicByClick(torrentID: string, useXHR = false, warning = true) {
    if (warning && !castMagicWarning()) {
        return;
    }

    const magicTargetValue = getCheckedValue('magicTarget');
    const magicTypeValue = getCheckedValue('magicType');
    const magicTimeValue = getValue('magicTime');
    const magicType_OtherUR = getValue('magicType_OtherUR');
    const magicType_OtherDR = getValue('magicType_OtherDR');

    const linkEl = document.querySelector(`a[href^="details.php?id=${torrentID}"]`);
    if (!linkEl) return;

    const parentCell = linkEl.parentElement?.parentElement?.children[1] as HTMLElement;
    if (!parentCell) return;

    addMagicForm(
        parentCell,
        torrentID,
        '',
        'OneKeyFree_Magic_PromotionFormFor' + torrentID,
        magicTypeValue,
        magicTimeValue,
        magicTargetValue,
        magicType_OtherUR,
        magicType_OtherDR
    );

    const f = document.querySelector<HTMLFormElement>(`form[name="OneKeyFree_Magic_PromotionFormFor${torrentID}"]`);
    if (!f) return;

    if (useXHR) {
        submitByXHR(f);
    } else {
        f.submit();
    }
}

function castMagicAll() {
    if (castMagicWarning(true)) {
        const al = document.querySelectorAll<HTMLAnchorElement>('a[name^="OneKeyFree_Magic_PromotionButton"]');
        state.totalCount = al.length;
        let magicRangeValue = getValue('magicRange');
        state.magicRangeStart = 1;
        state.magicRangeEnd = al.length;

        if (isNaN(Number(magicRangeValue))) {
            const magicRangeValueSplit = magicRangeValue.split('-');
            if (magicRangeValueSplit.length > 1 && !isNaN(Number(magicRangeValueSplit[0])) && !isNaN(Number(magicRangeValueSplit[1]))) {
                state.magicRangeStart = Number(magicRangeValueSplit[0]);
                state.magicRangeEnd = Number(magicRangeValueSplit[1]);
            }
        } else {
            const magicRangeNum = parseInt(magicRangeValue);
            if (magicRangeNum > 0) {
                state.magicRangeEnd = magicRangeNum;
            } else if (magicRangeNum < 0) {
                state.magicRangeStart = state.magicRangeEnd + magicRangeNum + 1;
            }
        }

        let ai = 0;
        al.forEach(function (el) {
            ai++;
            if (ai > state.magicRangeEnd || ai < state.magicRangeStart) {
                return;
            }
            const n = el.name.split('_');
            castMagicByClick(n[n.length - 1], true, false);
        });

        state.currentCount = 0;
        state.successCount = 0;
    }
}

function castMagicAllCallback(res: string) {
    state.currentCount++;
    if (typeof res === 'string' && res.indexOf('location.href') !== -1) {
        state.successCount++;
    }
    const setValue = state.magicRangeEnd - state.magicRangeStart + 1;
    if (state.totalCount <= state.currentCount || setValue <= state.currentCount) {
        alert(`施放完成，总 ${state.totalCount} 个，设定值 ${setValue} (${state.magicRangeStart}-${state.magicRangeEnd}) 个，已施放 ${state.currentCount} 个，已成功 ${state.successCount} 个，已失败 ${state.currentCount - state.successCount} 个.`);
    }
}

function submitByXHR(form: HTMLFormElement) {
    const formData = new FormData(form);
    const params = new URLSearchParams();
    formData.forEach((value, key) => {
        params.append(key, value as string);
    });
    fetch('/promotion.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    })
        .then((res) => res.text())
        .then(castMagicAllCallback)
        .catch(castMagicAllCallback);
}

function addMagicForm(
    l: HTMLElement,
    torrentID: string,
    name: string,
    formName: string,
    promotion: string | number = 2,
    hours: string | number = 24,
    user: string = 'SELF',
    ur: string | null = null,
    dr: string | null = null
) {
    // 移除已存在的同名表单
    const existingForm = document.querySelector(`form[name="${formName}"]`);
    if (existingForm) {
        existingForm.remove();
    }

    switch (parseInt(promotion.toString())) {
        case 2:
            ur = '1.00';
            dr = '0.00';
            break;
        case 3:
            ur = '2.00';
            dr = '1.00';
            break;
        case 4:
            ur = '2.00';
            dr = '0.00';
            break;
        default:
            break;
    }

    const html =
        (name !== '' ? `<a href="javascript:window.castMagic(${formName})" class="faqlink">${name}</a>` : '') +
        `<form name="${formName}" method="post" style="display: none;" action="https://u2.dmhy.org/promotion.php">` +
        `<input type="hidden" name="action" value="magic">` +
        `<input type="hidden" name="torrent" value="${torrentID}">` +
        `<input type="hidden" name="user" value="${user}">` +
        `<input type="hidden" name="start">` +
        `<input type="hidden" name="hours" value="${hours}">` +
        `<input type="hidden" name="promotion" value="${promotion}">` +
        `<input type="hidden" name="ur" value="${ur}">` +
        `<input type="hidden" name="dr" value="${dr}">` +
        `</form>`;

    l.insertAdjacentHTML('beforeend', html);
}

function showHidePromotionOther() {
    const otherChecked = document.querySelector<HTMLInputElement>('input[name="magicType_Other"]:checked');
    const rateText = document.getElementById('promotionRateText');
    if (rateText) {
        rateText.style.display = otherChecked ? 'inline' : 'none';
    }
}

function initDetailsPage() {
    const torrentID = new URLSearchParams(window.location.search).get('id');
    if (!torrentID || isNaN(Number(torrentID))) return;

    const rowhead = Array.from(document.querySelectorAll('.rowhead')).find(el => el.textContent?.includes('流量优惠'));
    if (!rowhead) return;

    const target = rowhead.parentElement?.children[1] as HTMLElement;
    if (!target) return;

    target.setAttribute('valign', 'bottom');
    target.insertAdjacentHTML('beforeend', '<br> 恢复系 (一天): ');

    addMagicForm(target, torrentID, 'Free', 'OneKeyFree_Magic_FreePromotionForSelfForm');
    addMagicForm(target, torrentID, '2X', 'OneKeyFree_Magic_2XPromotionForSelfForm', 3);
    addMagicForm(target, torrentID, '2.33X', 'OneKeyFree_Magic_233XPromotionForSelfForm', 8, 24, 'SELF', '2.33', '1.00');
    addMagicForm(target, torrentID, '2X/Free', 'OneKeyFree_Magic_2XFreePromotionForSelfForm', 4);
    addMagicForm(target, torrentID, '2.33X/Free', 'OneKeyFree_Magic_233XFreePromotionForSelfForm', 8, 24, 'SELF', '2.33', '0.00');

    target.insertAdjacentHTML('beforeend', '<br>地图炮 (一天): ');

    addMagicForm(target, torrentID, 'Free', 'OneKeyFree_Magic_FreePromotionForAllForm', 2, 24, 'ALL');
    addMagicForm(target, torrentID, '2X', 'OneKeyFree_Magic_2XPromotionForAllForm', 3, 24, 'ALL');
    addMagicForm(target, torrentID, '2.33X', 'OneKeyFree_Magic_233XPromotionForAllForm', 8, 24, 'ALL', '2.33', '1.00');
    addMagicForm(target, torrentID, '2X/Free', 'OneKeyFree_Magic_2XFreePromotionForAllForm', 4, 24, 'ALL');
    addMagicForm(target, torrentID, '2.33X/Free', 'OneKeyFree_Magic_233XFreePromotionForAllForm', 8, 24, 'ALL', '2.33', '0.00');
}

function initListPage() {
    const torrentsTable = document.querySelector('.torrents');
    if (!torrentsTable) return;

    const magicBarHtml =
        `<div id="magicBar">` +
        `<div id="magicRangeDiv">放魔范围 (默认无限): <input type="text" name="magicRange" style="width: 50px" value="0"></div> ` +
        `<div id="magicTargetDiv" style="display: inline;">放魔对象：` +
        `<input type="radio" name="magicTarget" id="magicTarget_SELF" value="SELF" checked><label for="magicTarget_SELF">恢复系</label>` +
        `<input type="radio" name="magicTarget" id="magicTarget_ALL" value="ALL"><label for="magicTarget_ALL">地图炮</label>` +
        `</div> ` +
        `<div id="magicTimeDiv" style="display: inline;">放魔期限：<input type="text" name="magicTime" style="width: 50px" value="24"></div> ` +
        `<div id="magicTypeDiv" style="display: inline;">放魔类型：` +
        `<input type="radio" name="magicType" id="magicType_Free" value="2" checked><label for="magicType_Free">Free</label>` +
        `<input type="radio" name="magicType" id="magicType_2X" value="3"><label for="magicType_2X">2X</label>` +
        `<input type="radio" name="magicType" id="magicType_2XFree" value="4"><label for="magicType_2XFree">2X/Free</label>` +
        `<input type="radio" name="magicType" id="magicType_Other" value="8"><label for="magicType_Other">其它</label>` +
        `</div> ` +
        `<div id="promotionRateText" style="display: none;">上传比率：<input type="text" name="magicType_OtherUR" style="width: 50px" value="1.00"> 下载比率：<input type="text" name="magicType_OtherDR" style="width: 50px" value="1.00"></div>` +
        `<button type="button" id="castMagicAllBtn" style="float: right;">放魔!</button>` +
        `</div><br>`;

    torrentsTable.insertAdjacentHTML('beforebegin', magicBarHtml);

    // 绑定放魔按钮事件
    document.getElementById('castMagicAllBtn')?.addEventListener('click', () => {
        (window as any).castMagicAll();
    });

    // 绑定 magicType_Other 变化事件
    document.getElementById('magicType_Other')?.addEventListener('change', showHidePromotionOther);

    // 遍历表格行添加放魔按钮
    const torrentRows = document.querySelectorAll<HTMLTableRowElement>('.torrentname tr');
    torrentRows.forEach((row) => {
        const lastCell = row.lastElementChild as HTMLTableCellElement;
        if (!lastCell) return;

        lastCell.style.width = '59.2px';

        const detailsLink = lastCell.querySelector('a[href^="details.php"]');
        if (!detailsLink) return;

        const href = detailsLink.getAttribute('href');
        if (!href) return;

        const urlParams = new URLSearchParams(href.split('?')[1]);
        const torrentID = urlParams.get('id');

        if (!torrentID || isNaN(Number(torrentID))) return;

        const buttonHtml =
            `<a name="OneKeyFree_Magic_PromotionButton_${torrentID}" href="javascript:window.castMagicByClick('${torrentID}')">` +
            `<img width="19.2" height="24" src="/pic/smilies/48.gif"></a>`;

        lastCell.insertAdjacentHTML('beforeend', buttonHtml);
    });
}

export function initMagic() {
    // 暴露全局函数到 window 对象
    (window as any).castMagic = castMagic;
    (window as any).castMagicByClick = castMagicByClick;
    (window as any).castMagicAll = castMagicAll;
    (window as any).showHidePromotionOther = showHidePromotionOther;

    if (location.pathname === '/details.php') {
        initDetailsPage();
    } else {
        initListPage();
    }
}
