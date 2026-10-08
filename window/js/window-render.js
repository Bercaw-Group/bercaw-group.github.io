// ==========================================
// متغیرهای سراسری و مدیریت وضعیت (State)
// ==========================================
let windowCount = 0;
const windowsState = {};

const STATIC_COLORS = {
    highlight: '#3b82f6',
    cadBlue: '#0ea5e9',
    hinge: '#94a3b8',
    hingeEdge: '#64748b',
    handle: '#f1f5f9',
    handleEdge: '#cbd5e1'
};

function getState(winId) {
    if (!windowsState[winId]) windowsState[winId] = { selected: null };
    return windowsState[winId];
}

// ==========================================
// توابع تغییر ابعاد از طریق کلیک روی نقشه
// ==========================================
window.promptDimension = function(winId, type, rIdx, cIdx) {
    let newVal = prompt("لطفاً اندازه جدید را بر حسب سانتی‌متر وارد کنید:");
    if (newVal && !isNaN(newVal)) {
        if (type === 'totalW') document.getElementById(`total-w-${winId}`).value = newVal;
        if (type === 'totalH') document.getElementById(`total-h-${winId}`).value = newVal;
        if (type === 'archH') {
            const archInp = document.getElementById(`arch-h-${winId}`);
            if (archInp) archInp.value = newVal;
        }
        if (type === 'row' && rIdx !== null) {
            const rows = document.getElementById(`window-${winId}`).querySelectorAll('.row-container');
            if (rows[rIdx]) rows[rIdx].querySelector('.row-h-input').value = newVal;
        }
        if (type === 'col' && rIdx !== null && cIdx !== null) {
            const rows = document.getElementById(`window-${winId}`).querySelectorAll('.row-container');
            if (rows[rIdx]) {
                const cols = rows[rIdx].querySelectorAll('.col-item');
                if (cols[cIdx]) cols[cIdx].querySelector('.col-w-input').value = newVal;
            }
        }
        updateDrawing(winId);
    }
};

window.toggleArchInput = function(winId) {
    const isArched = document.getElementById(`is-arched-${winId}`).checked;
    const container = document.getElementById(`arch-h-container-${winId}`);
    if (container) {
        container.style.display = isArched ? 'flex' : 'none';
    }
};

// ==========================================
// ایجاد صفحه اول (شناسنامه و مشخصات ثابت پروژه)
// ==========================================
function ensureProjectSummary() {
    if (document.getElementById('project-summary-sheet')) return;
    const container = document.getElementById('windows-container');
    if (!container) return;
    
    const div = document.createElement('div');
    div.id = 'project-summary-sheet';
    div.className = 'window-item print-card bg-white p-6 rounded-xl mb-10 flex flex-col justify-between border-2 border-slate-200 shadow-sm';
    div.style.minHeight = '185mm'; 
    
    div.innerHTML = `
        <div>
            <div class="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-center">
                <div>
                    <h1 class="text-2xl font-black text-slate-900"><i class="fas fa-industry text-blue-600 ml-2"></i>گزارش جامع و شناسنامه فنی پروژه UPVC</h1>
                    <p class="text-xs text-slate-500 mt-1">سامانه طراحی، محاسبات مهندسی، برش پروفیل و گزارشات تولید</p>
                </div>
                <div class="text-left text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div><strong>تاریخ گزارش:</strong> ${new Date().toLocaleDateString('fa-IR')}</div>
                    <div><strong>وضعیت:</strong> نسخه رسمی و قابل استناد تولید</div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h3 class="font-bold text-sm text-slate-800 border-b border-slate-200 pb-2"><i class="fas fa-info-circle text-blue-600 ml-1"></i> مشخصات عمومی و استانداردهای پروژه</h3>
                    <div class="flex justify-between text-xs text-slate-700"><span>نوع سازه / کاربری:</span> <span class="font-bold">پروژه ساختمانی / مسکونی</span></div>
                    <div class="flex justify-between text-xs text-slate-700"><span>استاندارد مرجع تولید:</span> <span class="font-bold">RAL GZ 716 / استاندارد ملی</span></div>
                    <div class="flex justify-between text-xs text-slate-700"><span>تقویت‌کننده گالوانیزه:</span> <span class="font-bold">ضخامت 1.5 میلی‌متر فرم‌داده‌شده سراسری</span></div>
                    <div class="flex justify-between text-xs text-slate-700"><span>سیستم واشراب‌بندی:</span> <span class="font-bold">لاستیک EPDM ضد اشعه UV</span></div>
                </div>

                <div class="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
                    <h3 class="font-bold text-sm text-indigo-900 border-b border-indigo-200 pb-2"><i class="fas fa-layer-group text-indigo-600 ml-1"></i> مشخصات ثابت پروفیل‌ها و متریال</h3>
                    <div class="flex justify-between text-xs text-indigo-900"><span>پروفیل فریم اصلی:</span> <span class="font-bold">سری 60 و 70 (پودری سفید الکترواستاتیک)</span></div>
                    <div class="flex justify-between text-xs text-indigo-900"><span>پروفیل وادار (مولیون):</span> <span class="font-bold">وادار T-1201 پودری سفید</span></div>
                    <div class="flex justify-between text-xs text-indigo-900"><span>نوع زهوار شیشه:</span> <span class="font-bold">زهوار دوجداره T-1902 پودری سفید</span></div>
                    <div class="flex justify-between text-xs text-indigo-900"><span>شیشه پیش‌فرض:</span> <span class="font-bold">دوجداره صنعتی 4-12-4 ساده با تزریق آرگون</span></div>
                </div>
            </div>

            <div class="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-900 space-y-1.5">
                <div class="font-bold flex items-center"><i class="fas fa-exclamation-triangle ml-1 text-amber-600"></i> راهنمای کنترل کیفیت و اجرای خط تولید:</div>
                <ul class="list-disc list-inside space-y-1 text-amber-800 pr-2">
                    <li>تمامی ابعاد بر حسب سانتی‌متر بوده و تلرانس‌های بادخور و نصب در نقشه‌های تفکیکی اعمال گردیده‌است.</li>
                    <li>برای ویرایش ابعاد روی نقشه، می‌توانید مستقیماً روی اعداد (ابعاد) کلیک نمایید.</li>
                </ul>
            </div>
        </div>

        <div class="border-t border-slate-200 pt-4 mt-4 flex justify-between items-center text-[10px] text-slate-400">
            <span>سیستم جامع اتوماسیون و محاسبه‌گر UPVC</span>
            <span>صفحه 1 (شناسنامه پروژه)</span>
        </div>
    `;
    container.insertBefore(div, container.firstChild);
}

// ==========================================
// توابع ساخت رابط کاربری (UI)
// ==========================================
function addNewWindow() {
    ensureProjectSummary();
    windowCount++;
    const winId = windowCount;
    
    const wrapper = document.createElement('div');
    wrapper.id = `window-${winId}`;
    wrapper.className = 'window-item print-card border-b-4 border-slate-300 pb-10 mb-10';

    wrapper.innerHTML = `
        <input type="hidden" id="frame-type-${winId}" value="T-1101">
        
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 print-grid">
            <!-- پنل مشخصات ابعادی و ساخت -->
            <div class="lg:col-span-3 builder-ui bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center border-b border-slate-300 pb-3 mb-4 no-print">
                        <h3 class="font-bold text-sm text-slate-800"><i class="fas fa-ruler-combined ml-1 text-slate-500"></i> مشخصات ابعادی و ساخت</h3>
                        <button type="button" onclick="document.getElementById('window-${winId}').remove(); updateAllDrawings();" class="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-2 py-1 rounded transition cursor-pointer"><i class="fas fa-trash"></i> حذف</button>
                    </div>
                    
                    <div class="flex justify-between items-center mb-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm no-print">
                        <label class="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-2 select-none">
                            <input type="checkbox" id="is-arched-${winId}" onchange="toggleArchInput(${winId}); updateDrawing(${winId})" class="w-4 h-4 text-blue-600 rounded">
                            کتیبه هلالی در بالا
                        </label>
                        <div id="arch-h-container-${winId}" style="display: none;" class="flex-row items-center gap-1">
                            <span class="text-[10px] text-slate-500">ارتفاع:</span>
                            <input type="number" id="arch-h-${winId}" value="50" oninput="updateDrawing(${winId})" class="w-10 p-1 border border-slate-300 rounded text-xs text-center font-bold">
                        </div>
                    </div>

                    <div id="general-summary-${winId}" class="mb-4 print-show"></div>
                    
                    <div class="flex gap-2 mb-4 no-print">
                        <div class="flex-1">
                            <label class="block text-[10px] font-bold text-slate-500 mb-1 text-center">عرض کل (W) - cm</label>
                            <input type="number" id="total-w-${winId}" value="150" oninput="updateDrawing(${winId})" class="w-full p-2 border border-slate-300 rounded-lg font-bold text-sm text-center shadow-inner focus:outline-none focus:border-blue-500 transition">
                        </div>
                        <div class="flex-1">
                            <label class="block text-[10px] font-bold text-slate-500 mb-1 text-center">ارتفاع کل (H) - cm</label>
                            <input type="number" id="total-h-${winId}" value="200" oninput="updateDrawing(${winId})" class="w-full p-2 border border-slate-300 rounded-lg font-bold text-sm text-center shadow-inner focus:outline-none focus:border-blue-500 transition">
                        </div>
                    </div>

                    <div class="flex justify-between items-center mb-2 bg-slate-200 p-2 rounded-lg no-print">
                        <span class="text-xs font-bold text-slate-700">ساختار شبکه‌ها</span>
                        <button type="button" onclick="addRow(${winId}, 0, true, true)" class="bg-navy text-white px-2 py-1 rounded text-[10px] font-bold hover:bg-slate-700 transition shadow cursor-pointer"><i class="fas fa-plus"></i> ردیف</button>
                    </div>
                    
                    <div id="rows-container-${winId}" class="space-y-2.5 mb-4 no-print"></div>
                </div>
                
                <div id="production-report-container-${winId}" class="mt-2 print-show"></div>
            </div>

            <!-- پنل نمایش نقشه -->
            <div class="lg:col-span-9 bg-white border-2 border-slate-300 rounded-xl p-3 relative shadow-sm svg-wrapper flex flex-col justify-between" style="min-height: 480px; max-height: 760px;">
                <div class="absolute top-2 right-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-slate-200 shadow-sm pointer-events-none no-print">
                    <i class="fas fa-info-circle text-blue-500"></i> برای ویرایش مشخصات، روی یک پروفیل یا شیشه در نقشه کلیک کنید.
                </div>
                
                <div id="element-toolbar-${winId}" class="absolute top-2 left-0 right-0 z-20 flex justify-center px-2 no-print pointer-events-auto"></div>
                
                <div id="svg-container-${winId}" class="flex-1 flex justify-center items-center overflow-hidden p-2 pt-14"></div>
                
                <div id="col-summaries-${winId}" class="mt-2 border-t border-slate-200 pt-2 space-y-1.5 print-show"></div>
            </div>
        </div>
    `;

    document.getElementById('windows-container').appendChild(wrapper);
    
    addRow(winId, 200, false, false);
    const firstRow = document.getElementById(`rows-container-${winId}`).firstElementChild;
    if (firstRow) {
        addCol(winId, firstRow.id, 75, 'fixed', 'left', false); 
        addCol(winId, firstRow.id, 75, 'turn', 'left', false);  
    }
}

function addRow(winId, defaultHeight = 0, autoAddCol = true, isUserAction = false) {
    const container = document.getElementById(`rows-container-${winId}`);
    if (!container) return;
    
    if (isUserAction) {
        defaultHeight = 50;
        const totalHInp = document.getElementById(`total-h-${winId}`);
        if (totalHInp) totalHInp.value = (parseFloat(totalHInp.value) || 0) + 50;
    }

    const uniqueRowId = `r-${winId}-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    
    const rowDiv = document.createElement('div');
    // تغییر کلاس‌ها برای فشرده‌سازی ظاهر ردیف‌ها
    rowDiv.className = 'row-container border-b border-slate-200 pb-2 mb-2 bg-white relative';
    rowDiv.id = uniqueRowId;
    
    rowDiv.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1.5 bg-slate-50 p-1 rounded">
            <div class="flex items-center gap-1.5">
                <button type="button" onclick="this.closest('.row-container').remove(); updateDrawing(${winId});" class="text-red-400 hover:text-red-600 px-1 transition cursor-pointer"><i class="fas fa-times text-[10px]"></i></button>
                <span class="text-[10px] text-slate-500 font-bold">ارتفاع ردیف:</span>
                <input type="number" class="row-h-input w-12 p-0.5 border border-slate-300 rounded text-[10px] text-center font-bold bg-white" value="${defaultHeight || ''}" oninput="updateDrawing(${winId})" placeholder="خودکار">
            </div>
            <button type="button" onclick="addCol(${winId}, '${uniqueRowId}', 50, 'turn', 'left', true)" class="text-blue-500 hover:text-blue-700 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded transition cursor-pointer text-[10px] font-bold"><i class="fas fa-plus"></i> ستون</button>
        </div>
        <div class="cols-wrapper flex flex-wrap gap-1"></div>
    `;
    container.appendChild(rowDiv);
    
    if (autoAddCol) {
        // تغییر عرض پیش‌فرض ستونِ اولیه از 0 به 50
        addCol(winId, uniqueRowId, 50, 'turn', 'left', false); 
    }
    if (isUserAction) updateDrawing(winId);
}

function addCol(winId, rowId, defaultWidth = 0, defaultMech = 'turn', defaultDir = 'left', isUserAction = false) {
    const rowEl = document.getElementById(rowId);
    if (!rowEl) return;
    
    if (isUserAction) {
        defaultWidth = 50;
        const totalWInp = document.getElementById(`total-w-${winId}`);
        if (totalWInp) totalWInp.value = (parseFloat(totalWInp.value) || 0) + 50;
    }

    const wrapper = rowEl.querySelector('.cols-wrapper');
    const colDiv = document.createElement('div');
    // تغییر کلاس‌ها برای فشرده‌سازی ظاهر ستون‌ها
    colDiv.className = 'col-item bg-white border border-slate-200 rounded px-1.5 py-1 flex-1 flex items-center gap-1 min-w-[70px] shadow-sm';
    
    colDiv.innerHTML = `
        <button type="button" onclick="this.closest('.col-item').remove(); updateDrawing(${winId});" class="text-red-300 hover:text-red-500 transition cursor-pointer"><i class="fas fa-times text-[9px]"></i></button>
        <span class="text-[9px] text-slate-400">عرض:</span>
        <input type="number" class="col-w-input w-full p-0.5 border-none bg-transparent rounded text-[10px] text-center font-bold focus:ring-0 focus:outline-none" value="${defaultWidth || ''}" oninput="updateDrawing(${winId})" placeholder="خودکار">
        <input type="hidden" class="col-mech" value="${defaultMech}">
        <input type="hidden" class="col-dir" value="${defaultDir}">
        <input type="hidden" class="col-fill" value="glass">
        <input type="hidden" class="col-screen-type" value="none">
    `;
    wrapper.appendChild(colDiv);
    updateDrawing(winId);
}

// ==========================================
// منطق ریاضی و محاسبه اتوماتیک فواصل
// ==========================================
function autoCalculateRemainders(winId) {
    const winEl = document.getElementById(`window-${winId}`);
    if (!winEl) return;
    
    const totalW = parseFloat(document.getElementById(`total-w-${winId}`).value) || 0;
    const totalH = parseFloat(document.getElementById(`total-h-${winId}`).value) || 0;

    const rows = winEl.querySelectorAll('.row-container');
    let usedH = 0; let autoRows = [];
    rows.forEach(r => {
        const hInp = r.querySelector('.row-h-input');
        const h = parseFloat(hInp.value);
        if (h > 0) usedH += h; else autoRows.push(hInp);
    });
    
    if (autoRows.length > 0) {
        const remH = Math.max(0, totalH - usedH);
        const eachH = (remH / autoRows.length).toFixed(1);
        autoRows.forEach(inp => { inp.dataset.autoVal = eachH; });
    }

    rows.forEach(r => {
        const cols = r.querySelectorAll('.col-w-input');
        let usedW = 0; let autoCols = [];
        cols.forEach(c => {
            const w = parseFloat(c.value);
            if (w > 0) usedW += w; else autoCols.push(c);
        });
        if (autoCols.length > 0) {
            const remW = Math.max(0, totalW - usedW);
            const eachW = (remW / autoCols.length).toFixed(1);
            autoCols.forEach(inp => { inp.dataset.autoVal = eachW; });
        }
    });
}

function drawDimLine(x1, y1, x2, y2, text, isVertical, onClickStr) {
    let svg = '';
    const groupTag = onClickStr ? `<g class="interactive-svg cursor-pointer hover:opacity-60 transition-opacity" onclick="${onClickStr}">` : '<g>';
    svg += groupTag;
    
    if (isVertical) {
        svg += `<rect x="${x1-15}" y="${y1}" width="30" height="${y2-y1}" fill="transparent" stroke="none"/>`;
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="0.8" />`;
        svg += `<line x1="${x1-3}" y1="${y1}" x2="${x1+3}" y2="${y1}" stroke="#64748b" stroke-width="1.2" />`;
        svg += `<line x1="${x1-3}" y1="${y2}" x2="${x1+3}" y2="${y2}" stroke="#64748b" stroke-width="1.2" />`;
        svg += `<text x="${x1-6}" y="${(y1+y2)/2}" fill="#334155" font-size="9" font-weight="bold" font-family="Vazirmatn" text-anchor="middle" direction="ltr" unicode-bidi="embed" transform="rotate(-90 ${x1-6},${(y1+y2)/2})">${text}</text>`;
    } else {
        svg += `<rect x="${x1}" y="${y1-5}" width="${x2-x1}" height="25" fill="transparent" stroke="none"/>`;
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#64748b" stroke-width="0.8" />`;
        svg += `<line x1="${x1}" y1="${y1-3}" x2="${x1}" y2="${y1+3}" stroke="#64748b" stroke-width="1.2" />`;
        svg += `<line x1="${x2}" y1="${y2-3}" x2="${x2}" y2="${y2+3}" stroke="#64748b" stroke-width="1.2" />`;
        svg += `<text x="${(x1+x2)/2}" y="${y1+12}" fill="#334155" font-size="9" font-weight="bold" font-family="Vazirmatn" text-anchor="middle" direction="ltr" unicode-bidi="embed">${text}</text>`;
    }
    svg += `</g>`;
    return svg;
}

// ==========================================
// توابع رندر گزارشات و مشخصات فنی
// ==========================================
function renderGeneralSummary(winId) {
    const frameInput = document.getElementById(`frame-type-${winId}`);
    if (!frameInput) return;
    const frameVal = frameInput.value;
    const container = document.getElementById(`general-summary-${winId}`);
    if (!container) return;
    
    let frameName = 'سری 60 مقطع T-1101 (سفید)';
    let mullionName = 'وادار T-1201 پودری سفید';
    let beadName = 'زهوار دوجداره T-1902 پودری سفید';

    if (frameVal === 'T-1102') {
        frameName = 'سری 70 مقطع T-1102 (سفید)';
    } else if (frameVal === 'T-1103') {
        frameName = 'بازسازی لبه‌دار T-1103 (سفید)';
    }

    container.innerHTML = `
        <div class="text-[10px] bg-indigo-50 border border-indigo-100 p-2 rounded-lg text-indigo-900 shadow-sm space-y-1">
            <div class="font-bold border-b border-indigo-200 pb-1 mb-1 text-indigo-800"><i class="fas fa-layer-group ml-1"></i> مشخصات مقاطع این آیتم:</div>
            <div class="flex justify-between items-center"><span class="opacity-80">فریم اصلی:</span> <span class="font-bold">${frameName}</span></div>
            <div class="flex justify-between items-center"><span class="opacity-80">وادار (مولیون):</span> <span class="font-bold">${mullionName}</span></div>
            <div class="flex justify-between items-center"><span class="opacity-80">زهوار شیشه:</span> <span class="font-bold">${beadName}</span></div>
        </div>
    `;
}

function renderColSummaries(winId) {
    const winEl = document.getElementById(`window-${winId}`);
    if(!winEl) return;
    const sumContainer = document.getElementById(`col-summaries-${winId}`);
    let html = '';
    const rows = winEl.querySelectorAll('.row-container');
    
    rows.forEach((r, idx) => {
        let colsHtml = '';
        const cols = Array.from(r.querySelectorAll('.col-item'));
        
        cols.forEach((c, cIdx) => {
            let m = c.querySelector('.col-mech').value;
            let dir = c.querySelector('.col-dir').value;
            let screen = c.querySelector('.col-screen-type').value;
            let wInput = c.querySelector('.col-w-input');
            let w = wInput.value || wInput.dataset.autoVal || 0;
            let fill = c.querySelector('.col-fill').value;
            
            let text = `<span class="bg-white px-1 py-0.5 rounded border border-slate-200 shadow-sm ml-1 text-slate-800">${w} cm</span> `;
            
            if (m === 'empty') {
                text += 'فضای خالی (بدون فریم)';
            } else if (m === 'fixed') {
                text += 'ثابت';
            } else {
                text += m === 'turn' ? 'تک‌حالته' : (m === 'tilt_turn' ? 'دوحالته' : 'کلنگی');
                if (m !== 'awning') {
                    text += dir === 'left' ? ' <span class="text-blue-600">(چپ‌بازشو)</span>' : ' <span class="text-blue-600">(راست‌بازشو)</span>';
                }
            }
            
            if (m !== 'empty') {
                text += fill === 'glass' ? ' - شیشه دوجداره' : ' - پنل UPVC';
            }
            
            if (m !== 'fixed' && m !== 'empty' && screen !== 'none') {
                const screenNames = { fixed: 'توری ثابت', pleated: 'توری پلیسه', sliding: 'توری کشویی', rolling: 'توری رولینگ', hardware: 'توری یراق‌خور' };
                text += ` <span class="text-orange-600 font-bold">+ ${screenNames[screen]}</span>`;
            }
            
            let posLabel = (cIdx === 0) ? '(لنگه چپ)' : (cIdx === cols.length - 1) ? '(لنگه راست)' : '(لنگه میانی)';
            if (cols.length === 1) posLabel = '(تک لنگه)';

            colsHtml += `
                <div class="flex items-center text-[10px] mb-0.5">
                    <span class="text-slate-500 w-24 flex-shrink-0"><i class="fas fa-caret-left ml-1"></i>لنگه ${cIdx + 1} ${posLabel}:</span>
                    <span class="flex-1 text-slate-700 font-medium">${text}</span>
                </div>
            `;
        });

        html += `
            <div class="bg-slate-50 border border-slate-200 p-2 rounded-lg shadow-sm">
                <div class="text-xs font-bold border-b border-slate-200 pb-1 mb-1 text-slate-800">
                    <i class="fas fa-bars ml-1 text-slate-400"></i> ابعاد و مشخصات ردیف ${idx+1} <span class="text-[9px] text-slate-400 font-normal">(از چپ به راست)</span>
                </div>
                ${colsHtml}
            </div>
        `;
    });
    sumContainer.innerHTML = html;
}

function renderProductionReport(winId) {
    const winEl = document.getElementById(`window-${winId}`);
    if (!winEl) return;
    const container = document.getElementById(`production-report-container-${winId}`);
    if (!container) return;

    const totalW = parseFloat(document.getElementById(`total-w-${winId}`).value) || 0;
    const totalH = parseFloat(document.getElementById(`total-h-${winId}`).value) || 0;
    const frameType = document.getElementById(`frame-type-${winId}`).value;

    const rows = winEl.querySelectorAll('.row-container');
    let totalSashCount = 0;
    let totalFixedCount = 0;
    let screensList = [];
    let glassDetails = [];

    let framePerimeter = ((totalW + totalH) * 2) / 100;

    rows.forEach((r, rIdx) => {
        let rowHInp = r.querySelector('.row-h-input');
        let rowH = parseFloat(rowHInp.value || rowHInp.dataset.autoVal) || 0;
        let cols = r.querySelectorAll('.col-item');

        cols.forEach((c, cIdx) => {
            let wInp = c.querySelector('.col-w-input');
            let w = parseFloat(wInp.value || wInp.dataset.autoVal) || 0;
            let mech = c.querySelector('.col-mech').value;
            let fill = c.querySelector('.col-fill').value;
            let screen = c.querySelector('.col-screen-type').value;

            if (mech === 'empty') return; // نادیده گرفتن در محاسبات تولید

            if (mech === 'fixed') totalFixedCount++;
            else totalSashCount++;

            if (screen !== 'none' && mech !== 'fixed') {
                const sNames = { fixed: 'توری ثابت', pleated: 'توری پلیسه', sliding: 'توری کشویی', rolling: 'توری رولینگ', hardware: 'توری یراق‌خور' };
                screensList.push(`ردیف ${rIdx+1} ستون ${cIdx+1}: ${sNames[screen]} (${w}×${rowH} cm)`);
            }

            let glassW = Math.max(0, w - (mech === 'fixed' ? 7 : 12)).toFixed(1);
            let glassH = Math.max(0, rowH - (mech === 'fixed' ? 7 : 12)).toFixed(1);

            let fillTitle = fill === 'glass' ? 'شیشه دوجداره' : 'پنل UPVC';
            glassDetails.push(`قطعه [${rIdx+1}, ${cIdx+1}]: ${fillTitle} ≈ (${glassW} × ${glassH} cm)`);
        });
    });

    let reportHTML = `
        <div class="bg-white border border-slate-300 rounded-lg p-2 shadow-sm text-[11px] space-y-1.5">
            <div class="font-bold text-slate-800 border-b border-slate-200 pb-1 flex items-center justify-between">
                <span><i class="fas fa-file-invoice text-indigo-600 ml-1"></i> مشخصات فنی و گزارش برش آیتم</span>
                <span class="text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">کد آیتم: #${winId}</span>
            </div>

            <div class="grid grid-cols-2 gap-2 text-slate-700 bg-slate-50 p-1.5 rounded">
                <div><strong>ابعاد کل:</strong> ${totalW} × ${totalH} cm</div>
                <div><strong>نوع فریم:</strong> ${frameType}</div>
                <div><strong>بازشو / ثابت:</strong> ${totalSashCount} لنگه / ${totalFixedCount} ثابت</div>
                <div><strong>محیط فریم:</strong> ~${framePerimeter.toFixed(2)} متر</div>
            </div>

            <div>
                <div class="font-bold text-slate-700 mb-0.5"><i class="fas fa-window-maximize text-slate-400 ml-1"></i> ابعاد تقریبی برش شیشه/پنل:</div>
                <div class="space-y-0.5 pl-2 text-slate-600 text-[10px]">
                    ${glassDetails.length > 0 ? glassDetails.map(g => `<div>• ${g}</div>`).join('') : '<span class="text-slate-400">فضای کاملا خالی</span>'}
                </div>
            </div>
    `;

    if (screensList.length > 0) {
        reportHTML += `
            <div>
                <div class="font-bold text-slate-700 mb-0.5"><i class="fas fa-shield-alt text-orange-500 ml-1"></i> توری‌ها:</div>
                <div class="space-y-0.5 pl-2 text-slate-600 text-[10px]">
                    ${screensList.map(s => `<div>• ${s}</div>`).join('')}
                </div>
            </div>
        `;
    }

    reportHTML += `</div>`;
    container.innerHTML = reportHTML;
}

// ==========================================
// موتور رندر اصلی نقشه SVG
// ==========================================
function updateDrawing(winId) {
    autoCalculateRemainders(winId);

    const winEl = document.getElementById(`window-${winId}`);
    if(!winEl) return;

    const totalW = parseFloat(document.getElementById(`total-w-${winId}`).value) || 100;
    const totalH = parseFloat(document.getElementById(`total-h-${winId}`).value) || 100;
    const isArched = document.getElementById(`is-arched-${winId}`)?.checked;

    const svgMaxDim = 450; 
    const scale = svgMaxDim / Math.max(totalW, totalH);
    const W = totalW * scale;
    const H = totalH * scale;
    
    // دریافت ارتفاع هلال
    const archHInput = parseFloat(document.getElementById(`arch-h-${winId}`)?.value) || 50;
    const archH = isArched ? (archHInput * scale) : 0; 

    const frameTypeInput = document.getElementById(`frame-type-${winId}`);
    const frameVal = frameTypeInput ? frameTypeInput.value : 'T-1101';
    
    let frameThickness = 6; 
    if (frameVal === 'T-1102') frameThickness = 7; 
    if (frameVal === 'T-1103') frameThickness = 8; 

    const Tf = frameThickness * scale; 
    const mullionThickness = 6; 
    const Tmullion = mullionThickness * scale;

    const Tm = 4 * scale;              
    const Ts = 6 * scale;              
    const Tb = 3.5 * scale;            

    const offsetX = 50; 
    let offsetYToUse = Math.max(35, archH + 20); 

    const st = getState(winId);
    const isSel = (elId) => st.selected && st.selected.elId === elId;

    const rows = winEl.querySelectorAll('.row-container');
    let yOffsets = [0]; let rowHeights = []; let currentY = 0; let rawHs = [];
    rows.forEach(r => { 
        let hInp = r.querySelector('.row-h-input');
        let rawH = hInp.value || hInp.dataset.autoVal || 0;
        let h = parseFloat(rawH) * scale; 
        rowHeights.push(h); rawHs.push(rawH); currentY += h; yOffsets.push(currentY); 
    });
    
    let grid = [];
    rows.forEach((r, rIdx) => {
        let cols = r.querySelectorAll('.col-item');
        let xOffsets = [0]; let colWidths = []; let currentX = 0; let rawWs = [];
        cols.forEach(c => { 
            let wInp = c.querySelector('.col-w-input');
            let rawW = wInp.value || wInp.dataset.autoVal || 0;
            let w = parseFloat(rawW) * scale; 
            colWidths.push(w); rawWs.push(rawW); currentX += w; xOffsets.push(currentX); 
        });
        grid.push({ colWidths, rawWs, xOffsets, cols });
    });

    let shapes = '';
    let hardwareShapes = ''; 
    let dimensions = '';
    let highlight = '';
    let mechLines = ''; 

    // رسم هلال در صورت فعال بودن
    // رسم هلال در صورت فعال بودن
    if (isArched) {
        // ایجاد متغیر مخفی برای ذخیره وضعیت شیشه/پنل هلال در صورت عدم وجود
        let archFillInput = document.getElementById(`arch-fill-${winId}`);
        if (!archFillInput) {
            archFillInput = document.createElement('input');
            archFillInput.type = 'hidden';
            archFillInput.id = `arch-fill-${winId}`;
            archFillInput.value = 'glass';
            document.getElementById(`window-${winId}`).appendChild(archFillInput);
        }
        
        const archFillType = archFillInput.value;
        const archFill = archFillType === 'glass' ? `url(#glassGrad-${winId})` : `url(#pvcPanel-${winId})`;

        // شناسه های تعاملی هلال
        const archFrameId = `arch-frame`;
        const archBeadId = `arch-bead`;
        const archGlassId = `arch-glass`;

        // فریم اصلی هلال (همباد با عرض خارجی پروفیل اصلی از -Tm تا W+Tm)
        shapes += `<path d="M ${-Tm} 0 Q ${W/2} ${-2*archH - Tm} ${W+Tm} 0 Z" fill="#e4e4e7" stroke="#71717a" stroke-width="2" class="interactive-svg cursor-pointer" onclick="selectElement(${winId},'${archFrameId}','frame','پروفیل فریم هلال',event)"/>`;
        if(isSel(archFrameId)) highlight += `<path d="M ${-Tm} 0 Q ${W/2} ${-2*archH - Tm} ${W+Tm} 0 Z" fill="none" stroke="${STATIC_COLORS.highlight}" stroke-width="2.5" stroke-dasharray="6 4"/>`;

        // زهوار هلال
        shapes += `<path d="M 0 0 Q ${W/2} ${-2*archH + Tf} ${W} 0 Z" fill="#ffffff" stroke="#52525b" stroke-width="1.5" class="interactive-svg cursor-pointer" onclick="selectElement(${winId},'${archBeadId}','bead','زهوار هلال',event)"/>`;
        if(isSel(archBeadId)) highlight += `<path d="M 0 0 Q ${W/2} ${-2*archH + Tf} ${W} 0 Z" fill="none" stroke="${STATIC_COLORS.highlight}" stroke-width="2.5" stroke-dasharray="6 4"/>`;

        // شیشه یا پنل هلال
        shapes += `<path d="M ${Tf} 0 Q ${W/2} ${-2*archH + Tf*2.5} ${W-Tf} 0 Z" fill="${archFill}" stroke="#cbd5e1" stroke-width="1.5" class="interactive-svg cursor-pointer" onclick="selectElement(${winId},'${archGlassId}','arch-glass','شیشه / پنل هلال',event)"/>`;
        if(isSel(archGlassId)) highlight += `<path d="M ${Tf} 0 Q ${W/2} ${-2*archH + Tf*2.5} ${W-Tf} 0 Z" fill="none" stroke="${STATIC_COLORS.highlight}" stroke-width="2.5" stroke-dasharray="6 4"/>`;
    }

    // فریم اصلی
    shapes += `<rect x="${-Tm}" y="${-Tm}" width="${W + 2*Tm}" height="${H + 2*Tm}" fill="#e4e4e7" stroke="#71717a" stroke-width="2"/>`;
    shapes += `<rect x="0" y="0" width="${W}" height="${H}" fill="none" stroke="#52525b" stroke-width="1.5"/>`; 
    shapes += `<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff" class="interactive-svg cursor-pointer" onclick="selectElement(${winId},'frame','frame','پروفیل اصلی/فریم',event)"/>`;
    if (isSel('frame')) highlight += `<rect x="-3" y="-3" width="${W+6}" height="${H+6}" fill="none" stroke="${STATIC_COLORS.highlight}" stroke-width="2.5" stroke-dasharray="6 4" rx="2"/>`;

    // رسم وادارها
    rows.forEach((r, i) => {
        if (i > 0) {
            const mId = `mullion-h-${i}`; const my = yOffsets[i];
            shapes += `<rect x="0" y="${my - Tmullion/2}" width="${W}" height="${Tmullion}" fill="#ffffff" stroke="#94a3b8" stroke-width="0.5" class="interactive-svg cursor-pointer" onclick="selectElement(${winId},'${mId}','mullion','وادار افقی',event)"/>`;
            if(isSel(mId)) highlight += `<rect x="-2" y="${my - Tmullion/2 - 2}" width="${W+4}" height="${Tmullion+4}" fill="none" stroke="${STATIC_COLORS.highlight}" stroke-width="2.5" stroke-dasharray="6 4"/>`;
        }
        grid[i].cols.forEach((c, j) => {
            if (j > 0) {
                const mId = `mullion-v-${i}-${j}`; const mx = grid[i].xOffsets[j];
                shapes += `<rect x="${mx - Tmullion/2}" y="${yOffsets[i]}" width="${Tmullion}" height="${rowHeights[i]}" fill="#ffffff" stroke="#94a3b8" stroke-width="0.5" class="interactive-svg cursor-pointer" onclick="selectElement(${winId},'${mId}','mullion','وادار عمودی',event)"/>`;
                if(isSel(mId)) highlight += `<rect x="${mx - Tmullion/2 - 2}" y="${yOffsets[i]-2}" width="${Tmullion+4}" height="${rowHeights[i]+4}" fill="none" stroke="${STATIC_COLORS.highlight}" stroke-width="2.5" stroke-dasharray="6 4"/>`;
            }
        });
    });

    // رسم محتویات سلول‌ها
    rows.forEach((r, i) => {
        grid[i].cols.forEach((c, j) => {
            const cellId = `${i}-${j}`;
            const mech = c.querySelector('.col-mech').value;
            
            const leftInset = (j === 0) ? Tf : Tmullion / 2;
            const rightInset = (j === grid[i].cols.length - 1) ? Tf : Tmullion / 2;
            const topInset = (i === 0) ? Tf : Tmullion / 2;
            const bottomInset = (i === rows.length - 1) ? Tf : Tmullion / 2;

            const ax = grid[i].xOffsets[j] + leftInset;
            const ay = yOffsets[i] + topInset;
            const aw = grid[i].colWidths[j] - leftInset - rightInset;
            const ah = rowHeights[i] - topInset - bottomInset;

            if (mech === 'empty') {
                let maskX = grid[i].xOffsets[j];
                let maskY = yOffsets[i];
                let maskW = grid[i].colWidths[j];
                let maskH = rowHeights[i];
                
                let mExt = 3; 
                if (j === 0) { maskX -= Tf + mExt; maskW += Tf + mExt; }
                if (j === grid[i].cols.length - 1) { maskW += Tf + mExt; }
                if (i === 0) { maskY -= Tf + mExt; maskH += Tf + mExt; }
                if (i === rows.length - 1) { maskH += Tf + mExt; }

                shapes += `<rect x="${maskX}" y="${maskY}" width="${maskW}" height="${maskH}" fill="#ffffff" pointer-events="auto" class="interactive-svg cursor-pointer" onclick="selectElement(${winId},'glass-${cellId}','glass','فضای خالی (فرورفتگی)',event, ${i}, ${j})"/>`;
                shapes += `<rect x="${maskX+5}" y="${maskY+5}" width="${Math.max(0,maskW-10)}" height="${Math.max(0,maskH-10)}" fill="none" stroke="#e2e8f0" stroke-width="1.5" stroke-dasharray="4 4" pointer-events="none"/>`;
                shapes += `<text x="${maskX + maskW/2}" y="${maskY + maskH/2}" fill="#94a3b8" font-size="10" font-family="Vazirmatn" text-anchor="middle" pointer-events="none">بدون پروفیل</text>`;
                
                if(isSel(`glass-${cellId}`)) highlight += `<rect x="${maskX}" y="${maskY}" width="${maskW}" height="${maskH}" fill="none" stroke="${STATIC_COLORS.highlight}" stroke-width="2.5" stroke-dasharray="6 4" rx="1"/>`;
                return;
            }

            if (aw > 0 && ah > 0) {
                shapes += `<rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="none" stroke="#94a3b8" stroke-width="1.5" pointer-events="none"/>`;
            }

            const dir = c.querySelector('.col-dir').value;
            const fill = c.querySelector('.col-fill').value;
            const screenType = c.querySelector('.col-screen-type').value;
            const hasScreen = (screenType !== 'none' && mech !== 'fixed');
            
            let beadX = ax, beadY = ay, beadW = aw, beadH = ah;

            if (mech !== 'fixed' && aw > 0 && ah > 0) {
                const sashElId = `sash-${cellId}`;
                
                shapes += `<rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="#f8fafc" class="interactive-svg cursor-pointer" onclick="selectElement(${winId},'${sashElId}','sash','پروفیل لنگه بازشو',event, ${i}, ${j})"/>`;
                shapes += `<rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="none" stroke="#64748b" stroke-width="1" pointer-events="none"/>`;
                
                shapes += `<line x1="${ax}" y1="${ay}" x2="${ax+Ts}" y2="${ay+Ts}" stroke="#94a3b8" stroke-width="0.75" pointer-events="none"/>`;
                shapes += `<line x1="${ax+aw}" y1="${ay}" x2="${ax+aw-Ts}" y2="${ay+Ts}" stroke="#94a3b8" stroke-width="0.75" pointer-events="none"/>`;
                shapes += `<line x1="${ax}" y1="${ay+ah}" x2="${ax+Ts}" y2="${ay+ah-Ts}" stroke="#94a3b8" stroke-width="0.75" pointer-events="none"/>`;
                shapes += `<line x1="${ax+aw}" y1="${ay+ah}" x2="${ax+aw-Ts}" y2="${ay+ah-Ts}" stroke="#94a3b8" stroke-width="0.75" pointer-events="none"/>`;

                if(isSel(sashElId)) highlight += `<rect x="${ax-2}" y="${ay-2}" width="${aw+4}" height="${ah+4}" fill="none" stroke="${STATIC_COLORS.highlight}" stroke-width="2.5" stroke-dasharray="6 4" rx="1"/>`;
            
                const mx = ax + aw/2, my = ay + ah/2;
                
                let hgX_left = ax; 
                let hgX_right = ax + aw - 5;
                let hdX_left = ax + Math.min(Ts + 16, aw / 2);
                let hdX_right = ax + aw - Math.min(Ts + 24, aw / 2);

                if (mech === 'awning') {
                    hardwareShapes += `<rect x="${ax + aw*0.15}" y="${ay + ah - 5}" width="20" height="5" fill="${STATIC_COLORS.hinge}" rx="1" stroke="${STATIC_COLORS.hingeEdge}" stroke-width="0.5" pointer-events="none"/>`;
                    hardwareShapes += `<rect x="${ax + aw*0.85 - 20}" y="${ay + aw*0.85 > 20 ? 0 : 0}" width="20" height="5" fill="${STATIC_COLORS.hinge}" rx="1" stroke="${STATIC_COLORS.hingeEdge}" stroke-width="0.5" pointer-events="none"/>`;
                    hardwareShapes += `<rect x="${mx - 15}" y="${ay + Ts + 8}" width="30" height="6" fill="${STATIC_COLORS.handle}" rx="2" stroke="${STATIC_COLORS.handleEdge}" stroke-width="1" pointer-events="none"/>`;
                } 
                else {
                    if (dir === 'right') {
                        hardwareShapes += `<rect x="${hgX_right}" y="${ay + ah*0.15}" width="5" height="20" fill="${STATIC_COLORS.hinge}" rx="1" stroke="${STATIC_COLORS.hingeEdge}" stroke-width="0.5" pointer-events="none"/>`;
                        hardwareShapes += `<rect x="${hgX_right}" y="${ay + ah*0.85 - 20}" width="5" height="20" fill="${STATIC_COLORS.hinge}" rx="1" stroke="${STATIC_COLORS.hingeEdge}" stroke-width="0.5" pointer-events="none"/>`;
                        hardwareShapes += `<rect x="${hdX_left}" y="${my - 15}" width="6" height="30" fill="${STATIC_COLORS.handle}" rx="2" stroke="${STATIC_COLORS.handleEdge}" stroke-width="1" pointer-events="none"/>`;
                    } else {
                        hardwareShapes += `<rect x="${hgX_left}" y="${ay + ah*0.15}" width="5" height="20" fill="${STATIC_COLORS.hinge}" rx="1" stroke="${STATIC_COLORS.hingeEdge}" stroke-width="0.5" pointer-events="none"/>`;
                        hardwareShapes += `<rect x="${hgX_left}" y="${ay + ah*0.85 - 20}" width="5" height="20" fill="${STATIC_COLORS.hinge}" rx="1" stroke="${STATIC_COLORS.hingeEdge}" stroke-width="0.5" pointer-events="none"/>`;
                        hardwareShapes += `<rect x="${hdX_right}" y="${my - 15}" width="6" height="30" fill="${STATIC_COLORS.handle}" rx="2" stroke="${STATIC_COLORS.handleEdge}" stroke-width="1" pointer-events="none"/>`;
                    }
                }

                if (mech === 'turn' || mech === 'tilt_turn') {
                    if (dir === 'right') {
                        mechLines += `<polyline points="${ax+aw},${ay} ${ax},${my} ${ax+aw},${ay+ah}" fill="none" stroke="${STATIC_COLORS.cadBlue}" stroke-width="1.5" stroke-dasharray="8 6" pointer-events="none"/>`;
                    } else {
                        mechLines += `<polyline points="${ax},${ay} ${ax+aw},${my} ${ax},${ay+ah}" fill="none" stroke="${STATIC_COLORS.cadBlue}" stroke-width="1.5" stroke-dasharray="8 6" pointer-events="none"/>`;
                    }
                }
                
                if (mech === 'tilt_turn' || mech === 'awning') {
                    mechLines += `<polyline points="${ax},${ay+ah} ${mx},${ay} ${ax+aw},${ay+ah}" fill="none" stroke="${STATIC_COLORS.cadBlue}" stroke-width="1.5" stroke-dasharray="8 6" pointer-events="none"/>`;
                }

                beadX = ax + Ts; beadY = ay + Ts; beadW = aw - 2*Ts; beadH = ah - 2*Ts;
                if (beadW > 0 && beadH > 0) {
                    shapes += `<rect x="${beadX}" y="${beadY}" width="${beadW}" height="${beadH}" fill="none" stroke="#64748b" stroke-width="1" pointer-events="none"/>`;
                }
            }

            if (beadW > 0 && beadH > 0) {
                const beadElId = `bead-${cellId}`;
                shapes += `<rect x="${beadX}" y="${beadY}" width="${beadW}" height="${beadH}" fill="#ffffff" class="interactive-svg cursor-pointer" onclick="selectElement(${winId},'${beadElId}','bead','زهوار',event)"/>`;
                shapes += `<rect x="${beadX + Tb}" y="${beadY + Tb}" width="${beadW - 2*Tb}" height="${beadH - 2*Tb}" fill="none" stroke="#cbd5e1" stroke-width="1.5" pointer-events="none"/>`;
                
                shapes += `<line x1="${beadX}" y1="${beadY}" x2="${beadX+Tb}" y2="${beadY+Tb}" stroke="#cbd5e1" stroke-width="1" pointer-events="none"/>`;
                shapes += `<line x1="${beadX+beadW}" y1="${beadY}" x2="${beadX+beadW-Tb}" y2="${beadY+Tb}" stroke="#cbd5e1" stroke-width="1" pointer-events="none"/>`;
                shapes += `<line x1="${beadX}" y1="${beadY+beadH}" x2="${beadX+Tb}" y2="${beadY+beadH-Tb}" stroke="#cbd5e1" stroke-width="1" pointer-events="none"/>`;
                shapes += `<line x1="${beadX+beadW}" y1="${beadY+beadH}" x2="${beadX+beadW-Tb}" y2="${beadY+beadH-Tb}" stroke="#cbd5e1" stroke-width="1" pointer-events="none"/>`;

                if(isSel(beadElId)) highlight += `<rect x="${beadX-1}" y="${beadY-1}" width="${beadW+2}" height="${beadH+2}" fill="none" stroke="${STATIC_COLORS.highlight}" stroke-width="2.5" stroke-dasharray="6 4" rx="1"/>`;

                const glassId = `glass-${cellId}`;
                const gX = beadX + Tb; const gY = beadY + Tb; const gW = beadW - 2*Tb; const gH = beadH - 2*Tb;
                
                if (gW > 0 && gH > 0) {
                    const gFill = fill === 'glass' ? `url(#glassGrad-${winId})` : `url(#pvcPanel-${winId})`;
                    
                    shapes += `<rect x="${gX}" y="${gY}" width="${gW}" height="${gH}" fill="${gFill}" class="interactive-svg cursor-pointer" onclick="selectElement(${winId},'${glassId}','glass','شیشه / پنل',event, ${i}, ${j})"/>`;
                    if(isSel(glassId)) highlight += `<rect x="${gX-2}" y="${gY-2}" width="${gW+4}" height="${gH+4}" fill="none" stroke="${STATIC_COLORS.highlight}" stroke-width="2.5" stroke-dasharray="6 4" rx="1"/>`;
                }
            }

            if (hasScreen && aw > 0 && ah > 0) {
                shapes += `<rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="url(#hatch-${winId})" opacity="0.35" pointer-events="none"/>`;
            }
        });
    });

    shapes += hardwareShapes;

    // ----------------------------------------------------
    // رسم خطوط اندازه (Dimensions)
    // ----------------------------------------------------
    
    // ۱. دایمنشن کلی عرض و ارتفاع (روی خط بیرونی)
    dimensions += drawDimLine(0, H + Tm + 28, W, H + Tm + 28, `${totalW} cm`, false, `promptDimension(${winId}, 'totalW', null, null)`); 
    dimensions += drawDimLine(-Tm - 30, 0, -Tm - 30, H, `${totalH} cm`, true, `promptDimension(${winId}, 'totalH', null, null)`); 
    
    // ۲. دایمنشن جزئی ارتفاع هلال (در صورت فعال بودن)
    if (isArched) {
        dimensions += drawDimLine(-Tm - 12, -archH, -Tm - 12, 0, `${archHInput} cm`, true, `promptDimension(${winId}, 'archH', null, null)`);
    }

    // ۳. دایمنشن جزئی عرض برای ستون‌ها
    let maxColsRowIdx = 0; let maxColsCount = 0;
    grid.forEach((r, idx) => {
        if (r.cols.length > maxColsCount) {
            maxColsCount = r.cols.length;
            maxColsRowIdx = idx;
        }
    });
    
    let lx = 0;
    grid[maxColsRowIdx].colWidths.forEach((cw, idx) => {
        const rawW = grid[maxColsRowIdx].rawWs[idx];
        dimensions += drawDimLine(lx, H + Tm + 10, lx+cw, H + Tm + 10, `${rawW || 0} cm`, false, `promptDimension(${winId}, 'col', ${maxColsRowIdx}, ${idx})`);
        lx += cw;
    });

    // ۴. دایمنشن جزئی ارتفاع برای تک‌تک ردیف‌ها (روی خط داخلی سمت چپ)
    let ly = 0;
    rowHeights.forEach((rh, idx) => {
        dimensions += drawDimLine(-Tm - 12, ly, -Tm - 12, ly+rh, `${rawHs[idx] || 0} cm`, true, `promptDimension(${winId}, 'row', ${idx}, null)`);
        ly += rh;
    });

    // افزایش viewBox برای نمایش کامل عرض در پایین نقشه
    const svgHTML = `
        <svg width="100%" height="100%" viewBox="${-offsetX} ${-offsetYToUse} ${W + offsetX*2} ${H + offsetYToUse + 85}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" style="font-family: Vazirmatn, sans-serif; display: block; width: 100%; height: 100%;">
            <defs>
                <pattern id="hatch-${winId}" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="6" stroke="#475569" stroke-width="1" /></pattern>
                
                <pattern id="pvcPanel-${winId}" width="${10 * scale}" height="10" patternUnits="userSpaceOnUse">
                    <rect width="${10 * scale}" height="10" fill="#f8fafc" />
                    <line x1="1" y1="0" x2="1" y2="10" stroke="#cbd5e1" stroke-width="1.5" />
                </pattern>

                <linearGradient id="glassGrad-${winId}" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
                    <stop offset="40%" stop-color="#e0f2fe" stop-opacity="0.5"/>
                    <stop offset="50%" stop-color="#bae6fd" stop-opacity="0.8"/>
                    <stop offset="60%" stop-color="#e0f2fe" stop-opacity="0.5"/>
                    <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.8"/>
                </linearGradient>
            </defs>
            <g>
                ${shapes}
                ${mechLines} 
                ${highlight}
                ${dimensions}
            </g>
        </svg>
    `;

    // ایجاد دکمه‌های شناور (Overlay Buttons)
    const overlayButtons = `
        <div class="absolute bottom-3 right-3 flex flex-col gap-1.5 z-20">
            <button type="button" onclick="addColToLastRow(${winId})" class="flex items-center justify-center gap-1.5 bg-white/90 hover:bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1.5 rounded shadow-sm text-[10px] font-bold cursor-pointer transition backdrop-blur-sm" title="افزودن ستون به آخرین ردیف">
                <i class="fas fa-plus"></i> ستون
            </button>
            <button type="button" onclick="addRow(${winId}, 0, true, true)" class="flex items-center justify-center gap-1.5 bg-white/90 hover:bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-1.5 rounded shadow-sm text-[10px] font-bold cursor-pointer transition backdrop-blur-sm" title="افزودن ردیف جدید">
                <i class="fas fa-plus"></i> ردیف
            </button>
        </div>
    `;

    // قرار دادن SVG و دکمه‌های شناور داخل ظرف رندر
    const renderContainer = document.getElementById(`svg-container-${winId}`);
    
    if (renderContainer) {
        // حتماً مطمئن شوید که ظرف رندر کلاس relative را داشته باشد تا دکمه‌ها از کادر بیرون نزنند
        renderContainer.classList.add('relative'); 
        
        // svgHTML متغیری است که در خطوط بالاترِ همین تابع ساخته شده است
        renderContainer.innerHTML = svgHTML + overlayButtons;
    }
    renderToolbar(winId);
    renderGeneralSummary(winId);
    renderColSummaries(winId);
    renderProductionReport(winId);
}

// ==========================================
// ابزارها و رویدادهای تعاملی
// ==========================================
function selectElement(winId, elId, elType, elName, event, rIdx = null, cIdx = null) {
    if(event) event.stopPropagation();
    const st = getState(winId);
    
    if (st.selected && st.selected.elId === elId) st.selected = null;
    else st.selected = { elId, type: elType, name: elName, rIdx, cIdx };
    
    updateDrawing(winId);
}

function renderToolbar(winId) {
    const st = getState(winId);
    const tb = document.getElementById(`element-toolbar-${winId}`);
    if (!st.selected) {
        tb.innerHTML = '';
        return;
    }

    const sel = st.selected;
    let html = `<div class="bg-slate-900 text-white px-3 py-2 rounded-xl shadow-2xl flex flex-wrap items-center justify-center gap-2 animate-fade-in border border-slate-700 max-w-full mx-2 text-xs" onclick="event.stopPropagation()" ontouchstart="event.stopPropagation()">`;
    html += `<div class="font-bold text-xs border-l border-slate-700 pl-2 text-slate-200">${sel.name}</div>`;

    if (sel.type === 'glass' || sel.type === 'arch-glass') {
        
        // اگر المان انتخاب شده شیشه هلال بود
        if (sel.type === 'arch-glass') {
            const curArchFill = document.getElementById(`arch-fill-${winId}`)?.value || 'glass';
            html += `<select onchange="changeArchFill(${winId}, this.value)" class="bg-slate-800 text-white text-xs p-1.5 rounded border border-slate-600 focus:outline-none cursor-pointer">
                <option value="glass" ${curArchFill==='glass'?'selected':''}>شیشه دوجداره</option>
                <option value="panel" ${curArchFill==='panel'?'selected':''}>پنل UPVC</option>
            </select>`;
        } 
        // اگر شیشه شبکه‌های معمولی بود
        else {
            const winEl = document.getElementById(`window-${winId}`);
            if(!winEl) return;
            const rows = winEl.querySelectorAll('.row-container');
            if (!rows[sel.rIdx]) return;
            const cols = rows[sel.rIdx].querySelectorAll('.col-item');
            if (!cols[sel.cIdx]) return;
            
            const cEl = cols[sel.cIdx];
            const curMech = cEl.querySelector('.col-mech').value;
            const curDir = cEl.querySelector('.col-dir').value;
            const curFill = cEl.querySelector('.col-fill').value;
            const curScreen = cEl.querySelector('.col-screen-type').value;

            html += `<select onchange="changeMech(${winId}, ${sel.rIdx}, ${sel.cIdx}, this.value)" class="bg-slate-800 text-white text-xs p-1.5 rounded border border-slate-600 focus:outline-none cursor-pointer">
                <option value="fixed" ${curMech==='fixed'?'selected':''}>ثابت</option>
                <option value="turn" ${curMech==='turn'?'selected':''}>تک‌حالته</option>
                <option value="tilt_turn" ${curMech==='tilt_turn'?'selected':''}>دوحالته</option>
                <option value="awning" ${curMech==='awning'?'selected':''}>کلنگی</option>
                <option value="empty" ${curMech==='empty'?'selected':''}>فضای خالی / فرورفتگی</option>
            </select>`;

            if (curMech !== 'fixed' && curMech !== 'empty') {
                if (curMech !== 'awning') {
                    html += `<select onchange="changeDir(${winId}, ${sel.rIdx}, ${sel.cIdx}, this.value)" class="bg-slate-800 text-white text-xs p-1.5 rounded border border-slate-600 focus:outline-none cursor-pointer">
                        <option value="left" ${curDir==='left'?'selected':''}>چپ‌بازشو</option>
                        <option value="right" ${curDir==='right'?'selected':''}>راست‌بازشو</option>
                    </select>`;
                }
                
                html += `<select onchange="changeScreen(${winId}, ${sel.rIdx}, ${sel.cIdx}, this.value)" class="bg-slate-800 text-white text-xs p-1.5 rounded border border-slate-600 focus:outline-none cursor-pointer">
                    <option value="none" ${curScreen==='none'?'selected':''}>بدون توری</option>
                    <option value="fixed" ${curScreen==='fixed'?'selected':''}>توری ثابت</option>
                    <option value="pleated" ${curScreen==='pleated'?'selected':''}>توری پلیسه</option>
                    <option value="sliding" ${curScreen==='sliding'?'selected':''}>توری کشویی</option>
                    <option value="rolling" ${curScreen==='rolling'?'selected':''}>توری رولینگ</option>
                    <option value="hardware" ${curScreen==='hardware'?'selected':''}>توری یراق‌خور</option>
                </select>`;
            }

            if (curMech !== 'empty') {
                html += `<select onchange="changeFill(${winId}, ${sel.rIdx}, ${sel.cIdx}, this.value)" class="bg-slate-800 text-white text-xs p-1.5 rounded border border-slate-600 focus:outline-none cursor-pointer">
                    <option value="glass" ${curFill==='glass'?'selected':''}>شیشه دوجداره</option>
                    <option value="panel" ${curFill==='panel'?'selected':''}>پنل UPVC</option>
                </select>`;
            }
        }

    } else if (sel.type === 'frame' || sel.type === 'sash') {
        const frameInput = document.getElementById(`frame-type-${winId}`);
        const curFrame = frameInput ? frameInput.value : 'T-1101';
        html += `<select onchange="changeFrameType(${winId}, this.value)" class="bg-slate-800 text-white text-xs p-1.5 rounded border border-slate-600 focus:outline-none cursor-pointer">
            <option value="T-1101" ${curFrame==='T-1101'?'selected':''}>فریم T-1101 سفید (سری 60)</option>
            <option value="T-1102" ${curFrame==='T-1102'?'selected':''}>فریم T-1102 سفید (سری 70)</option>
            <option value="T-1103" ${curFrame==='T-1103'?'selected':''}>فریم بازسازی T-1103 سفید</option>
        </select>`;
    } else {
        html += `<div class="text-[10px] text-slate-300">امکان تغییر مشخصات این قطعه وجود ندارد.</div>`;
    }

    html += `<button type="button" onclick="selectElement(${winId}, null)" class="text-slate-400 hover:text-white p-1 transition cursor-pointer"><i class="fas fa-times text-sm"></i></button>`;
    html += `</div>`;
    tb.innerHTML = html;
}

function changeFrameType(wId, val) { document.getElementById(`frame-type-${wId}`).value = val; updateDrawing(wId); }
function changeMech(wId, rIdx, cIdx, val) { 
    const winEl = document.getElementById(`window-${wId}`);
    if (!winEl) return;
    const rEl = winEl.querySelectorAll('.row-container')[rIdx];
    if (!rEl) return;
    const cEl = rEl.querySelectorAll('.col-item')[cIdx];
    if (!cEl) return;

    cEl.querySelector('.col-mech').value = val;
    const st = getState(wId);
    
    if (st.selected && st.selected.type === 'glass' && val !== 'fixed' && val !== 'empty') {
    } else if (st.selected && (st.selected.type === 'sash' || st.selected.type === 'glass') && (val === 'fixed' || val === 'empty')) {
        st.selected.type = 'glass';
        cEl.querySelector('.col-screen-type').value = 'none';
    }
    updateDrawing(wId); 
}
function changeDir(wId, rIdx, cIdx, val) { 
    const cEl = document.getElementById(`window-${wId}`).querySelectorAll('.row-container')[rIdx].querySelectorAll('.col-item')[cIdx];
    if(cEl) { cEl.querySelector('.col-dir').value = val; updateDrawing(wId); }
}
function changeFill(wId, rIdx, cIdx, val) { 
    const cEl = document.getElementById(`window-${wId}`).querySelectorAll('.row-container')[rIdx].querySelectorAll('.col-item')[cIdx];
    if(cEl) { cEl.querySelector('.col-fill').value = val; updateDrawing(wId); }
}
function changeScreen(wId, rIdx, cIdx, val) { 
    const cEl = document.getElementById(`window-${wId}`).querySelectorAll('.row-container')[rIdx].querySelectorAll('.col-item')[cIdx];
    if(cEl) { cEl.querySelector('.col-screen-type').value = val; updateDrawing(wId); }
}

function updateAllDrawings() {
    document.querySelectorAll('.window-item').forEach(win => {
        const id = win.id.replace('window-', '');
        if (id !== 'project-summary-sheet') {
            updateDrawing(id);
        }
    });
}

window.changeArchFill = function(wId, val) { 
    const inp = document.getElementById(`arch-fill-${wId}`);
    if(inp) { inp.value = val; updateDrawing(wId); }
}

// ==========================================
// تزریق استایل‌های مخصوص چاپ A4 Landscape
// ==========================================
function injectPrintStyles() {
    if (document.getElementById('a4-print-styles')) return;
    const style = document.createElement('style');
    style.id = 'a4-print-styles';
    style.innerHTML = `
        @media print {
            @page {
                size: A4 landscape;
                margin: 6mm;
            }
            body {
                background: #ffffff !important;
                color: #000000 !important;
                font-family: 'Vazirmatn', Tahoma, sans-serif !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print, 
            button, 
            input, 
            select, 
            [id^="element-toolbar-"],
            header,
            nav,
            footer {
                display: none !important;
            }

            .window-item {
                page-break-before: always;
                page-break-inside: avoid;
                break-inside: avoid;
                border: none !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                height: 195mm !important;
                box-sizing: border-box;
                display: flex !important;
                flex-direction: column !important;
            }
            
            #project-summary-sheet {
                page-break-before: avoid !important;
            }

            .print-grid {
                display: grid !important;
                grid-template-columns: 220px 1fr !important;
                gap: 10px !important;
                flex: 1 !important;
                align-items: stretch !important;
                height: 100% !important;
            }
            
            .builder-ui {
                background: #ffffff !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
            }

            .svg-wrapper {
                border: 1px solid #94a3b8 !important;
                background: #ffffff !important;
                box-shadow: none !important;
                min-height: unset !important;
                height: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                padding: 4px !important;
            }

            .svg-wrapper div[id^="svg-container-"] {
                flex: 1 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
                height: 100% !important;
            }

            .svg-wrapper svg {
                max-height: none !important;
                width: 100% !important;
                height: 100% !important;
            }

            .print-show, 
            [id^="general-summary-"], 
            [id^="production-report-container-"], 
            [id^="col-summaries-"] {
                display: block !important;
                background: #f8fafc !important;
                border: 1px solid #cbd5e1 !important;
                border-radius: 6px !important;
                padding: 4px !important;
                margin-top: 3px !important;
                font-size: 8.5pt !important;
                page-break-inside: avoid;
            }
        }
    `;
    document.head.appendChild(style);
}

// ==========================================
// اجرای اولیه
// ==========================================
function initApp() {
    injectPrintStyles();
    ensureProjectSummary();

    document.addEventListener('click', (e) => {
        if (e.target.closest('[id^="element-toolbar"]') || e.target.closest('.builder-ui') || e.target.closest('.interactive-svg') || e.target.closest('svg')) {
            return;
        }
        Object.keys(windowsState).forEach(winId => {
            if (windowsState[winId].selected) {
                windowsState[winId].selected = null;
                updateDrawing(winId);
            }
        });
    });
    
    if (document.querySelectorAll('.window-item:not(#project-summary-sheet)').length === 0) {
        addNewWindow();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ==========================================
// توابع اختصاصی هدر (تغییر استایل و منوی موبایل)
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHeaderScroll();
    adjustHeaderSpacer();
});

function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');
    if (!btn || !menu) return;

    function closeMenu() {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
        adjustHeaderSpacer();
    }

    function openMenu() {
        menu.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        if (icon) { icon.classList.remove('fa-bars'); icon.classList.add('fa-times'); }
        adjustHeaderSpacer();
    }

    btn.addEventListener('click', () => {
        const isOpen = !menu.classList.contains('hidden');
        isOpen ? closeMenu() : openMenu();
    });

    menu.querySelectorAll('.mobile-menu-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) closeMenu();
    });
}

function initHeaderScroll() {
    const header = document.getElementById('window-header') || document.getElementById('header');
    const logoDark = document.getElementById('header-logo-dark');
    const logoLight = document.getElementById('header-logo-light');
    const title = document.getElementById('header-title');
    const subtitle = document.getElementById('header-subtitle');
    const desktopMenu = document.getElementById('desktop-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const homeBtn = document.getElementById('header-home-btn');

    if (!header) return;

    function handleScroll() {
        if (window.scrollY > 50) {
            header.style.cssText = 'background-color: #ffffff !important; backdrop-filter: none;';
            header.classList.remove('text-white');
            header.classList.add('text-slate-800', 'shadow-md');

            if (logoDark && logoLight) { logoLight.classList.add('hidden'); logoDark.classList.remove('hidden'); }
            if (desktopMenu) { desktopMenu.classList.remove('text-white'); desktopMenu.classList.add('text-slate-800'); }
            
            if (mobileMenuBtn) { 
                mobileMenuBtn.classList.remove('bg-white/10', 'bg-white/20', 'text-white', 'border-transparent'); 
                mobileMenuBtn.classList.add('bg-slate-100', 'text-slate-800', 'border', 'border-slate-300'); 
            }
            if (homeBtn) { homeBtn.classList.remove('bg-white/10', 'text-white'); homeBtn.classList.add('bg-slate-100', 'text-slate-800'); }
            
            if (title) { title.style.setProperty('color', '#0f172a', 'important'); }
            if (subtitle) { subtitle.style.setProperty('color', '#64748b', 'important'); }

        } else {
            header.style.cssText = 'background-color: #0a192f !important; backdrop-filter: blur(12px) !important;';
            header.classList.remove('text-slate-800', 'shadow-md');
            header.classList.add('text-white');

            if (logoDark && logoLight) { logoDark.classList.add('hidden'); logoLight.classList.remove('hidden'); }
            if (desktopMenu) { desktopMenu.classList.remove('text-slate-800'); desktopMenu.classList.add('text-white'); }
            
            if (mobileMenuBtn) { 
                mobileMenuBtn.classList.remove('bg-slate-100', 'text-slate-800', 'border', 'border-slate-300'); 
                mobileMenuBtn.classList.add('bg-white/10', 'text-white', 'border-transparent'); 
            }
            if (homeBtn) { homeBtn.classList.remove('bg-slate-100', 'text-slate-800'); homeBtn.classList.add('bg-white/10', 'text-white'); }
            
            if (title) { title.style.setProperty('color', '#ffffff', 'important'); }
            if (subtitle) { subtitle.style.setProperty('color', '#d1d5db', 'important'); }
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();
}

function adjustHeaderSpacer() {
    const header = document.getElementById('window-header') || document.getElementById('header');
    const spacer = document.getElementById('header-spacer');
    if (header && spacer) {
        spacer.style.height = header.offsetHeight + 'px';
    }
}
window.addEventListener('load', adjustHeaderSpacer);
window.addEventListener('resize', adjustHeaderSpacer);

// آکاردئون حوزه‌های فعالیت منوی موبایل
const mobileCategoriesBtn = document.getElementById('mobile-categories-btn');
const mobileCategoriesSubmenu = document.getElementById('mobile-categories-submenu');
const mobileArrow = document.getElementById('mobile-arrow');

if (mobileCategoriesBtn && mobileCategoriesSubmenu) {
    mobileCategoriesBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = !mobileCategoriesSubmenu.classList.contains('hidden');

        if (!isOpen) {
            mobileCategoriesSubmenu.classList.remove('hidden');
            mobileCategoriesSubmenu.classList.add('flex');
            if (mobileArrow) mobileArrow.classList.add('rotate-180');
        } else {
            mobileCategoriesSubmenu.classList.add('hidden');
            mobileCategoriesSubmenu.classList.remove('flex');
            if (mobileArrow) mobileArrow.classList.remove('rotate-180');
        }
    });
}


window.addColToLastRow = function(winId) {
    // پیدا کردن ظرف ردیف‌های این پنجره
    const container = document.getElementById(`rows-container-${winId}`);
    if (!container) return;
    
    const rows = container.querySelectorAll('.row-container');
    if (rows.length === 0) {
        // اگر هیچ ردیفی وجود نداشت، اول یک ردیف می‌سازد
        addRow(winId, 0, true, true);
        return;
    }
    
    // گرفتن ID آخرین ردیف
    const lastRow = rows[rows.length - 1];
    const rowId = lastRow.id;
    
    // افزودن ستون به آخرین ردیف
    addCol(winId, rowId, 50, 'turn', 'left', true);
};