/**
 * U2 一键施放魔法功能
 * 源自 U2-OneKeyFree 用户脚本
 */

import { MessageType } from '../utils';

interface MagicSettings {
    target: 'SELF' | 'ALL';
    hours: number;
    promotion: number;
    ur: string;
    dr: string;
}

const MAGIC_PROMOTION_TYPES: Record<number, { ur: string; dr: string; label: string }> = {
    2: { ur: '1.00', dr: '0.00', label: 'Free' },
    3: { ur: '2.00', dr: '1.00', label: '2X' },
    4: { ur: '2.00', dr: '0.00', label: '2X/Free' },
    8: { ur: '1.00', dr: '1.00', label: '自定义' }
};

let totalCount = 0;
let currentCount = 0;
let successCount = 0;
let magicRangeStart = 0;
let magicRangeEnd = 0;

/**
 * 获取当前魔法设置
 */
function getMagicSettings(): MagicSettings {
    return {
        target: (document.querySelector('input[name="magicTarget"]:checked') as HTMLInputElement)?.value as 'SELF' | 'ALL' || 'SELF',
        hours: parseInt((document.querySelector('input[name="magicTime"]') as HTMLInputElement)?.value || '120'),
        promotion: parseInt((document.querySelector('input[name="magicType"]:checked') as HTMLInputElement)?.value || '2'),
        ur: (document.querySelector('input[name="magicType_OtherUR"]') as HTMLInputElement)?.value || '1.00',
        dr: (document.querySelector('input[name="magicType_OtherDR"]') as HTMLInputElement)?.value || '1.00'
    };
}

/**
 * 确认对话框
 */
function confirmMagic(all = false): boolean {
    const confirmText = '确定要' + (all ? '全部' : '') + '施放魔法吗？';
    if (all) {
        return prompt(confirmText + ' (输入 YES 以确认)') === 'YES';
    }
    return confirm(confirmText);
}

/**
 * 添加隐藏表单
 */
function addMagicForm(
    container: Element,
    torrentID: string,
    formName: string,
    promotion = 2,
    hours = 24,
    user: 'SELF' | 'ALL' = 'SELF',
    ur: string | null = null,
    dr: string | null = null
): HTMLFormElement {
    // 移除已存在的表单
    container.querySelector(`form[name="${formName}"]`)?.remove();

    // 根据 promotion 类型设置 ur/dr
    const promoConfig = MAGIC_PROMOTION_TYPES[promotion];
    if (promoConfig && promotion !== 8) {
        ur = promoConfig.ur;
        dr = promoConfig.dr;
    }

    const formHtml = `
        <form name="${formName}" method="post" style="display: none;" action="/promotion.php">
            <input type="hidden" name="action" value="magic">
            <input type="hidden" name="torrent" value="${torrentID}">
            <input type="hidden" name="user" value="${user}">
            <input type="hidden" name="start">
            <input type="hidden" name="hours" value="${hours}">
            <input type="hidden" name="promotion" value="${promotion}">
            <input type="hidden" name="ur" value="${ur || '1.00'}">
            <input type="hidden" name="dr" value="${dr || '1.00'}">
        </form>
    `;

    container.insertAdjacentHTML('beforeend', formHtml);
    return container.querySelector(`form[name="${formName}"]`) as HTMLFormElement;
}

/**
 * 提交表单（通过后台脚本）
 */
function submitViaBackground(form: HTMLFormElement): Promise<void> {
    return new Promise((resolve, reject) => {
        const formData = new FormData(form);
        const data = {
            torrent: formData.get('torrent') as string,
            user: formData.get('user') as string,
            hours: formData.get('hours') as string,
            promotion: formData.get('promotion') as string,
            ur: formData.get('ur') as string,
            dr: formData.get('dr') as string
        };

        chrome.runtime.sendMessage(
            {
                type: MessageType.MAGIC,
                action: 'cast',
                formData: data
            },
            (response) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }
                if (response?.success) {
                    successCount++;
                    resolve();
                } else {
                    reject(new Error(response?.error || '魔法施放失败'));
                }
            }
        );
    });
}

/**
 * 施放魔法回调
 */
function magicCallback() {
    currentCount++;
    const setValue = magicRangeEnd - magicRangeStart + 1;
    
    if (totalCount <= currentCount || setValue <= currentCount) {
        const msg = `施放完成，总 ${totalCount} 个，设定值 ${setValue} 个，已施放 ${currentCount} 个，已成功 ${successCount} 个，已失败 ${currentCount - successCount} 个。`;
        setTimeout(() => {
            alert(msg);
            // 完成后重新绑定事件
            bindMagicButtonEvents();
        }, 100);
    }
}

/**
 * 对单个种子施放魔法
 */
export function castMagicOnTorrent(torrentID: string, useXHR = false, warning = true): void {
    if (warning && !confirmMagic()) {
        return;
    }

    const formName = `Magic_PromotionFormFor${torrentID}`;

    // 查找魔法按钮所在的单元格，作为表单容器
    const magicBtn = document.querySelector(`.magic-btn-single[data-torrent-id="${torrentID}"]`);
    const container = magicBtn?.closest('td.embedded');
    
    if (!container) {
        alert('未找到种子信息');
        return;
    }

    const form = addMagicForm(container, torrentID, formName, 2, 120, 'SELF');

    if (useXHR) {
        submitViaBackground(form).then(magicCallback).catch(magicCallback);
    } else {
        form.submit();
    }
}

/**
 * 批量施放魔法
 */
export function castMagicAll(): void {
    if (!confirmMagic(true)) {
        return;
    }

    const magicButtons = document.querySelectorAll('a[name^="OneKeyFree_Magic_PromotionButton"]');
    totalCount = magicButtons.length;
    
    if (totalCount === 0) {
        alert('当前页面没有可施放魔法的种子');
        return;
    }

    magicRangeStart = 1;
    magicRangeEnd = totalCount;

    currentCount = 0;
    successCount = 0;

    // 遍历并施放魔法
    magicButtons.forEach((btn) => {
        const torrentID = (btn as HTMLElement).dataset.torrentId;
        if (torrentID) {
            castMagicOnTorrent(torrentID, true, false);
        }
    });
}

/**
 * 初始化魔法工具栏（列表页）
 */
export function initMagicToolbar(): void {
    // 检查是否已存在
    if (document.getElementById('magicBar')) {
        return;
    }

    const toolbarHtml = `
        <div id="magicBar">
            <div id="magicTargetDiv">
                <span class="magic-label">放魔对象:</span>
                <input type="radio" name="magicTarget" id="magicTarget_SELF" value="SELF" checked>
                <label for="magicTarget_SELF">恢复系</label>
                <input type="radio" name="magicTarget" id="magicTarget_ALL" value="ALL">
                <label for="magicTarget_ALL">地图炮</label>
            </div>
            <div id="magicTimeDiv">
                <span class="magic-label">放魔期限:</span>
                <input type="text" name="magicTime" class="magic-input" value="120">
            </div>
            <div id="magicTypeDiv">
                <span class="magic-label">放魔类型:</span>
                <input type="radio" name="magicType" id="magicType_Free" value="2" checked>
                <label for="magicType_Free">Free</label>
                <input type="radio" name="magicType" id="magicType_2X" value="3">
                <label for="magicType_2X">2X</label>
                <input type="radio" name="magicType" id="magicType_2XFree" value="4">
                <label for="magicType_2XFree">2X/Free</label>
                <input type="radio" name="magicType" id="magicType_Other" value="8">
                <label for="magicType_Other">其它</label>
            </div>
            <div id="promotionRateText" style="display: none;">
                <span class="magic-label">上传比率:</span>
                <input type="text" name="magicType_OtherUR" class="magic-input magic-rate" value="1.00">
                <span class="magic-label">下载比率:</span>
                <input type="text" name="magicType_OtherDR" class="magic-input magic-rate" value="1.00">
            </div>
            <button type="button" id="magicCastAllBtn" class="magic-btn"><i class="fa-solid fa-wand-magic-sparkles"></i> 批量施放!</button>
        </div>
    `;

    const torrentsTable = document.querySelector('table.torrents');
    if (torrentsTable) {
        torrentsTable.insertAdjacentHTML('beforebegin', toolbarHtml);

        // 绑定事件
        document.getElementById('magicCastAllBtn')?.addEventListener('click', castMagicAll);
        
        // 监听"其它"选项切换
        document.getElementById('magicType_Other')?.addEventListener('change', () => {
            const rateText = document.getElementById('promotionRateText');
            if (rateText) {
                rateText.style.display = (document.getElementById('magicType_Other') as HTMLInputElement).checked ? 'inline' : 'none';
            }
        });
    }
}

/**
 * 为种子列表添加魔法按钮 - 已废弃，改用独立列
 * 保留此函数用于兼容性
 */
export function addMagicButtonsToTorrents(): void {
    // 不再在收藏按钮旁添加，魔法按钮已在独立列中
    return;
}

/**
 * 绑定魔法按钮点击事件
 */
function bindMagicButtonEvents(): void {
    document.querySelectorAll('.magic-btn-single').forEach((btn) => {
        // 检查是否已绑定过事件（通过 data 属性标记）
        if ((btn as HTMLElement).dataset.bound === 'true') {
            return;
        }
        
        // 标记为已绑定
        (btn as HTMLElement).dataset.bound = 'true';
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const torrentID = (btn as HTMLElement).dataset.torrentId;
            if (torrentID) {
                castMagicOnTorrent(torrentID, false, true);
            }
        });
    });
}

/**
 * 初始化详情页魔法按钮
 */
export function initMagicOnDetailsPage(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const torrentID = urlParams.get('id');
    
    if (!torrentID || isNaN(parseInt(torrentID))) {
        return;
    }

    // 查找"流量优惠"行（遍历所有.rowhead 找到包含"流量优惠"文本的）
    const rowheads = Array.from(document.querySelectorAll('.rowhead'));
    const promotionRowhead = rowheads.find(el => el.textContent?.includes('流量优惠'));
    
    if (!promotionRowhead) return;
    
    const container = promotionRowhead.parentElement?.children[1] as HTMLElement;
    if (!container) return;

    container.setAttribute('valign', 'bottom');

    // 恢复系按钮
    container.insertAdjacentHTML('beforeend', '<br><strong>恢复系 (五天):</strong> ');
    addMagicForm(container, torrentID, 'Magic_FreePromotionForSelfForm', 2, 120, 'SELF');
    addMagicForm(container, torrentID, 'Magic_2XPromotionForSelfForm', 3, 120, 'SELF');
    addMagicForm(container, torrentID, 'Magic_233XPromotionForSelfForm', 8, 120, 'SELF', '2.33', '1.00');
    addMagicForm(container, torrentID, 'Magic_2XFreePromotionForSelfForm', 4, 120, 'SELF');
    addMagicForm(container, torrentID, 'Magic_233XFreePromotionForSelfForm', 8, 120, 'SELF', '2.33', '0.00');

    // 地图炮按钮
    container.insertAdjacentHTML('beforeend', '<br><strong>地图炮 (五天):</strong> ');
    addMagicForm(container, torrentID, 'Magic_FreePromotionForAllForm', 2, 120, 'ALL');
    addMagicForm(container, torrentID, 'Magic_2XPromotionForAllForm', 3, 120, 'ALL');
    addMagicForm(container, torrentID, 'Magic_233XPromotionForAllForm', 8, 120, 'ALL', '2.33', '1.00');
    addMagicForm(container, torrentID, 'Magic_2XFreePromotionForAllForm', 4, 120, 'ALL');
    addMagicForm(container, torrentID, 'Magic_233XFreePromotionForAllForm', 8, 120, 'ALL', '2.33', '0.00');

    // 为所有表单添加提交按钮
    container.querySelectorAll('form').forEach((form) => {
        const formName = form.getAttribute('name');
        const promoMatch = formName?.match(/Magic_(.+?)Promotion/);
        if (promoMatch) {
            let label = promoMatch[1];
            // 美化标签名称
            label = label.replace('PromotionForSelfForm', '').replace('PromotionForAllForm', '');
            label = label.replace('Free', '免费').replace('2X', '2 倍').replace('233X', '2.33 倍');
            
            const isAll = formName?.includes('AllForm');
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'magic-detail-btn';
            btn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ${label}${isAll ? ' (全体)' : ''}`;
            btn.addEventListener('click', () => {
                if (confirmMagic()) {
                    form.submit();
                }
            });
            form.parentElement?.insertBefore(btn, form.nextSibling);
        }
    });
    
    // 绑定按钮事件
    bindMagicButtonEvents();
}

// 暴露到全局作用域供列表页使用
if (typeof window !== 'undefined') {
    (window as any).castMagicOnTorrent = castMagicOnTorrent;
    (window as any).getMagicSettings = getMagicSettings;
}
