document.addEventListener("DOMContentLoaded", () => {
    const dateEl = document.getElementById("print-date");
    if(dateEl) dateEl.textContent = "تاریخ: " + new Date().toLocaleDateString('fa-IR');
    addNewWindow();
});

let windowCount = 0;
const windowsContainer = document.getElementById('windows-container');

// وضعیت هر پنجره: انتخاب‌های پیش‌فرض در سطح پنجره + override های اختصاصی هر المان + المان انتخاب‌شده فعلی
const windowState = {};

/* =====================================================================
   کاتالوگ پروفیل‌ها (نمونه و قابل ویرایش)
   این آرایه‌ها، سایزها و رنگ‌های متعارف و پرمصرف بازار را نمایندگی می‌کنند.
   برای تطبیق دقیق با کاتالوگ تامین‌کننده خودتان، فقط همین چند آرایه را
   ویرایش کنید؛ بقیه موتور رسم به‌صورت خودکار از آن‌ها استفاده می‌کند.
   depth = ضخامت/عرض نمایشی پروفیل در نقشه (واحد نسبی، نه اندازه واقعی mm)
   ===================================================================== */
const PROFILE_CATALOG = {
    frame: [
        { id: 'fr60', name: 'فریم 60mm (دو کاناله)',                depth: 11 },
        { id: 'fr70', name: 'فریم 70mm (چهار کاناله) - پرمصرف',     depth: 14 },
        { id: 'fr80', name: 'فریم 80mm (پنج کاناله)',                depth: 17 },
        { id: 'fr88', name: 'فریم 88mm (شش کاناله - عایق حرارتی)',   depth: 19 },
    ],
    mullion: [
        { id: 'ml_std',   name: 'وادار استاندارد (~60mm) - پرمصرف',   depth: 10 },
        { id: 'ml_wide',  name: 'وادار تقویتی (~80mm) - دهانه بزرگ',  depth: 14 },
        { id: 'ml_steel', name: 'وادار با آرماتور فولادی داخلی',      depth: 14 },
    ],
    sash: [
        { id: 'sa_std',   name: 'لنگه استاندارد بازشو - پرمصرف',      depth: 16 },
        { id: 'sa_heavy', name: 'لنگه تقویت‌شده (بازشوی سنگین/بزرگ)', depth: 20 },
        { id: 'sa_slim',  name: 'لنگه اسلیم مدرن',                    depth: 12 },
    ],
    bead: [
        { id: 'bd_18', name: 'زهوار 18mm (شیشه دوجداره 4-16-4) - پرمصرف', depth: 4 },
        { id: 'bd_20', name: 'زهوار 20mm (شیشه دوجداره 5-16-5)',          depth: 5 },
        { id: 'bd_24', name: 'زهوار 24mm (شیشه سه‌جداره)',                depth: 6 },
    ],
};

// رنگ/روکش‌های پرمصرف. برای "سفید" و "سفید مات"، هر خانواده پروفیل رنگ
// اختصاصی خودش را حفظ می‌کند تا در نقشه کاملاً از هم تفکیک بمانند.
// برای رنگ‌ها/روکش‌های چوبی یا تیره، رنگ به‌صورت یکدست روی پروفیل اعمال می‌شود
// (دقیقاً مطابق واقعیت تولید - کل ست رنگ واحد اجرا می‌شود).
const FINISH_OPTIONS = [
    { id: 'white',        name: 'سفید براق (پیش‌فرض)', fill: null,       edgeTint: null },
    { id: 'white_matte',  name: 'سفید مات',            fill: null,       edgeTint: null },
    { id: 'golden_oak',   name: 'روکش طلایی (Golden Oak)', fill: '#d3a15a', edgeTint: '#7c4a12' },
    { id: 'walnut',       name: 'روکش گردویی',          fill: '#8b5e34', edgeTint: '#4a3216' },
    { id: 'anthracite',   name: 'آنتراسیت (خاکستری تیره)', fill: '#54606e', edgeTint: '#1f2937' },
    { id: 'dual_color',   name: 'دورنگ (سفید داخل / رنگی بیرون)', fill: '#eef2f7', edgeTint: '#334155' },
];

// رنگ پایه هر خانواده پروفیل زمانی که رنگ «سفید» انتخاب شده - این چهار رنگ
// عمداً کاملاً از هم متفاوتند تا فریم/وادار/لنگه بازشو/زهوار در نقشه به‌وضوح
// از هم تفکیک شوند (مشکل اصلی نسخه قبلی همین یکسان بودن رنگ‌ها بود).
const TYPE_BASE_COLOR = {
    frame:   { fill: '#eef2f7', edge: '#334155' }, // آبی-خاکستری بسیار روشن
    mullion: { fill: '#94a3b8', edge: '#1e293b' }, // خاکستری متوسط، به‌وضوح تیره‌تر از فریم
    sash:    { fill: '#dcfce7', edge: '#166534' }, // سبز ملایم (لنگه بازشو)
    bead:    { fill: '#fbbf24', edge: '#92400e' }, // کهربایی/طلایی، کاملاً متفاوت از فریم/وادار
};

const STATIC_COLORS = {
    glass: '#bae6fd',
    panel: '#cbd5e1',
    lines: '#0f172a',
    cadBlue: '#2563eb',
    hinge: '#94a3b8',
    hingeEdge: '#475569',
    handle: '#cbd5e1',
    handleEdge: '#334155',
    highlight: '#ec4899', // رنگ قاب انتخاب (صورتی) - عمداً با کل پالت تفاوت دارد
};

const TYPE_LABELS = {
    frame: 'پروفیل فریم',
    mullion: 'پروفیل وادار',
    sash: 'پروفیل لنگه بازشو',
    bead: 'پروفیل زهوار',
    glass: 'نوع پرکننده',
};

function profileOptions(family, selectedId) {
    return PROFILE_CATALOG[family].map(p =>
        `<option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${p.name}</option>`
    ).join('');
}
function finishOptions(selectedId) {
    return FINISH_OPTIONS.map(f =>
        `<option value="${f.id}" ${f.id === selectedId ? 'selected' : ''}>${f.name}</option>`
    ).join('');
}
function findProfile(family, id) {
    return PROFILE_CATALOG[family].find(p => p.id === id) || PROFILE_CATALOG[family][0];
}
function findFinish(id) {
    return FINISH_OPTIONS.find(f => f.id === id) || FINISH_OPTIONS[0];
}

function getState(winId) {
    if (!windowState[winId]) {
        windowState[winId] = {
            selected: null,      // { elId, family, label }
            overrides: {},       // elId -> { profileId?, finishId? }
            defaults: {
                frame: PROFILE_CATALOG.frame[1].id,
                mullion: PROFILE_CATALOG.mullion[0].id,
                sash: PROFILE_CATALOG.sash[0].id,
                bead: PROFILE_CATALOG.bead[0].id,
                finish: FINISH_OPTIONS[0].id,
            }
        };
    }
    return windowState[winId];
}

// رنگ و ضخامت نهایی یک المان را برمی‌گرداند: override اختصاصی > پیش‌فرض پنجره
function resolveStyle(winId, elId, family) {
    const st = getState(winId);
    const ov = st.overrides[elId] || {};
    const profId = ov.profileId || st.defaults[family];
    const finId = ov.finishId || st.defaults.finish;
    const prof = findProfile(family, profId);
    const fin = findFinish(finId);
    const keepTypeColor = (finId === 'white' || finId === 'white_matte');
    const base = TYPE_BASE_COLOR[family];
    return {
        profileId: prof.id,
        profileName: prof.name,
        finishId: fin.id,
        finishName: fin.name,
        depth: prof.depth,
        fill: keepTypeColor ? base.fill : fin.fill,
        edge: keepTypeColor ? base.edge : fin.edgeTint,
        isOverridden: !!(ov.profileId || ov.finishId),
    };
}

function setDefault(winId, family, value) {
    getState(winId).defaults[family] = value;
    updateDrawing(winId);
}

function selectElement(winId, elId, family, label, evt) {
    if (evt) evt.stopPropagation();
    getState(winId).selected = { elId, family, label };
    updateDrawing(winId);
}
function deselectElement(winId) {
    getState(winId).selected = null;
    updateDrawing(winId);
}
function setOverrideProfile(winId, elId, value) {
    const st = getState(winId);
    if (!st.overrides[elId]) st.overrides[elId] = {};
    st.overrides[elId].profileId = value;
    updateDrawing(winId);
}
function setOverrideFinish(winId, elId, value) {
    const st = getState(winId);
    if (!st.overrides[elId]) st.overrides[elId] = {};
    st.overrides[elId].finishId = value;
    updateDrawing(winId);
}
function clearOverride(winId, elId) {
    delete getState(winId).overrides[elId];
    updateDrawing(winId);
}

// خواندن ورودی‌های یک «چشمه» (ستون) بر اساس مختصات ردیف/ستون - برای
// همگام کردن نوار ابزار روی تصویر با پنل سازنده در سمت چپ
function getColNode(winId, rowIndex, colIndex) {
    const winEl = document.getElementById(`window-${winId}`);
    if (!winEl) return null;
    const rows = winEl.querySelectorAll('.row-container');
    const row = rows[rowIndex];
    if (!row) return null;
    const cols = row.querySelectorAll('.col-item');
    return cols[colIndex] || null;
}
function setColField(winId, rowIndex, colIndex, field, value) {
    const col = getColNode(winId, rowIndex, colIndex);
    if (!col) return;
    if (field === 'fill') col.querySelector('.col-fill').value = value;
    if (field === 'screen') col.querySelector('.col-screen').checked = value;
    if (field === 'dir') col.querySelector('.col-dir').value = value;
    updateDrawing(winId);
}

function addNewWindow() {
    windowCount++;
    const winId = windowCount;
    const st = getState(winId);

    const wrapper = document.createElement('div');
    wrapper.id = `window-${winId}`;
    wrapper.className = 'window-item print-card border-b-4 border-slate-300 pb-10 mb-10';

    const swatch = (family) => `<span class="inline-block w-2.5 h-2.5 rounded-sm" style="background:${TYPE_BASE_COLOR[family].fill};border:1.5px solid ${TYPE_BASE_COLOR[family].edge}"></span>`;

    wrapper.innerHTML = `
        <div class="flex justify-between items-center mb-4 border-b pb-2 no-print">
            <h3 class="font-bold text-lg text-slate-800">نقشه مونتاژ کد W-${winId}</h3>
            <button type="button" onclick="document.getElementById('window-${winId}').remove(); updateAllDrawings();" class="text-red-500 text-sm font-bold"><i class="fas fa-trash"></i> حذف این آیتم</button>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 print-grid">
            <!-- تنظیمات ماتریکس -->
            <div class="xl:col-span-8 builder-ui">
                <div class="flex flex-wrap gap-4 mb-3 bg-slate-200 p-4 rounded-lg border border-slate-300 items-end">
                    <div>
                        <label class="block text-xs font-bold mb-1">عرض کل (W - cm)</label>
                        <input type="number" id="total-w-${winId}" value="200" oninput="updateDrawing(${winId})" class="w-24 p-2 border rounded text-center font-bold">
                    </div>
                    <div>
                        <label class="block text-xs font-bold mb-1">ارتفاع کل (H - cm)</label>
                        <input type="number" id="total-h-${winId}" value="200" oninput="updateDrawing(${winId})" class="w-24 p-2 border rounded text-center font-bold">
                    </div>
                    <div class="flex-1 min-w-[170px]">
                        <label class="text-xs font-bold mb-1 flex items-center gap-1">${swatch('frame')} پروفیل فریم (پیش‌فرض)</label>
                        <select id="frame-prof-${winId}" onchange="setDefault(${winId},'frame',this.value)" class="w-full p-2 border rounded font-bold text-slate-700 text-xs">
                            ${profileOptions('frame', st.defaults.frame)}
                        </select>
                    </div>
                    <div class="flex-1 min-w-[170px]">
                        <label class="text-xs font-bold mb-1 flex items-center gap-1">${swatch('mullion')} پروفیل وادار (پیش‌فرض)</label>
                        <select id="mullion-prof-${winId}" onchange="setDefault(${winId},'mullion',this.value)" class="w-full p-2 border rounded font-bold text-slate-700 text-xs">
                            ${profileOptions('mullion', st.defaults.mullion)}
                        </select>
                    </div>
                    <div class="flex-1 min-w-[170px]">
                        <label class="text-xs font-bold mb-1 flex items-center gap-1">${swatch('sash')} پروفیل بازشو (پیش‌فرض)</label>
                        <select id="sash-prof-${winId}" onchange="setDefault(${winId},'sash',this.value)" class="w-full p-2 border rounded font-bold text-slate-700 text-xs">
                            ${profileOptions('sash', st.defaults.sash)}
                        </select>
                    </div>
                    <div class="flex-1 min-w-[170px]">
                        <label class="text-xs font-bold mb-1 flex items-center gap-1">${swatch('bead')} زهوار (پیش‌فرض)</label>
                        <select id="bead-prof-${winId}" onchange="setDefault(${winId},'bead',this.value)" class="w-full p-2 border rounded font-bold text-slate-700 text-xs">
                            ${profileOptions('bead', st.defaults.bead)}
                        </select>
                    </div>
                    <div class="flex-1 min-w-[170px]">
                        <label class="text-xs font-bold mb-1 flex items-center gap-1"><i class="fas fa-palette text-slate-500"></i> رنگ / روکش (پیش‌فرض)</label>
                        <select id="finish-${winId}" onchange="setDefault(${winId},'finish',this.value)" class="w-full p-2 border rounded font-bold text-slate-700 text-xs">
                            ${finishOptions(st.defaults.finish)}
                        </select>
                    </div>
                    <div>
                        <button type="button" onclick="addRow(${winId})" class="bg-slate-700 text-white px-4 py-2 rounded text-sm hover:bg-slate-800 transition"><i class="fas fa-plus"></i> ردیف جدید (افقی)</button>
                    </div>
                </div>
                <p class="text-[11px] text-slate-500 mb-4 no-print">
                    <i class="fas fa-hand-pointer ml-1"></i>
                    برای تغییر پروفیل، سایز یا رنگ یک المان خاص (مثلاً فقط یک وادار یا یک زهوار)، روی همان قسمت در تصویر سمت راست کلیک کنید.
                </p>

                <div id="rows-container-${winId}" class="space-y-4"></div>
            </div>

            <!-- خروجی نقشه CAD -->
            <div class="xl:col-span-4 bg-white border-2 border-slate-300 rounded-xl p-4 flex flex-col svg-wrapper" style="min-height: 550px;">
                <div id="element-toolbar-${winId}" class="mb-3 no-print"></div>
                <div id="svg-container-${winId}" class="w-full flex justify-center"></div>
                <div id="legend-${winId}" class="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1.5 justify-center"></div>
            </div>
        </div>
    `;

    windowsContainer.appendChild(wrapper);
    addRow(winId, 60, true);
    addRow(winId, 140, false);
}

function addRow(winId, defaultHeight = 100, isTop = false) {
    const rowsContainer = document.getElementById(`rows-container-${winId}`);
    const rowId = Date.now() + Math.floor(Math.random() * 1000);

    const rowDiv = document.createElement('div');
    rowDiv.className = 'row-container flex flex-col gap-3 relative shadow-sm';
    rowDiv.dataset.rowId = rowId;

    rowDiv.innerHTML = `
        <div class="flex justify-between items-center border-b border-slate-300 pb-2">
            <div class="flex items-center gap-2">
                <label class="text-xs font-bold text-slate-700">ارتفاع ردیف (cm):</label>
                <input type="number" class="row-h-input w-20 p-1 border rounded text-center font-bold" value="${defaultHeight}" oninput="updateDrawing(${winId})">
                <span class="text-[10px] text-slate-400 row-auto-label hidden">(محاسبه خودکار)</span>
            </div>
            <div class="flex gap-2">
                <button type="button" onclick="addCol(${winId}, ${rowId})" class="text-white bg-teal px-3 py-1 rounded text-xs font-bold">+ ستون (چشمه)</button>
                <button type="button" onclick="this.closest('.row-container').remove(); updateDrawing(${winId});" class="text-red-500 bg-red-50 px-2 py-1 rounded text-xs">حذف ردیف</button>
            </div>
        </div>
        <div class="cols-container flex flex-wrap gap-2" id="cols-${rowId}"></div>
    `;

    rowsContainer.appendChild(rowDiv);

    if(isTop) { addCol(winId, rowId, 200); }
    else { addCol(winId, rowId, 100, 'turn'); addCol(winId, rowId, 100, 'fixed'); }

    updateDrawing(winId);
}

function addCol(winId, rowId, defaultWidth = 100, defaultMech = 'fixed') {
    const colsContainer = document.getElementById(`cols-${rowId}`);

    const colDiv = document.createElement('div');
    colDiv.className = 'col-item col-container space-y-2 relative shadow-sm';

    colDiv.innerHTML = `
        <button type="button" onclick="this.closest('.col-item').remove(); updateDrawing(${winId});" class="absolute top-1 left-1 text-red-400 hover:text-red-600"><i class="fas fa-times"></i></button>

        <div class="flex justify-between items-center mb-1 pr-4">
            <label class="text-[10px] font-bold text-slate-700">عرض (cm)</label>
            <input type="number" class="col-w-input w-16 p-1 border rounded text-center text-xs font-bold" value="${defaultWidth}" oninput="updateDrawing(${winId})">
        </div>

        <select class="col-mech w-full p-1 border border-slate-300 rounded text-xs font-bold bg-slate-50" onchange="updateDrawing(${winId})">
            <option value="fixed" ${defaultMech === 'fixed' ? 'selected' : ''}>شیشه ثابت</option>
            <option value="turn" ${defaultMech === 'turn' ? 'selected' : ''}>بازشو تک‌حالته</option>
            <option value="tilt_turn" ${defaultMech === 'tilt_turn' ? 'selected' : ''}>بازشو دوحالته</option>
            <option value="awning">بازشو کلنگی</option>
        </select>

        <div class="flex gap-1">
            <select class="col-dir w-1/2 p-1 border rounded text-[10px]" onchange="updateDrawing(${winId})">
                <option value="right">راست‌بازشو (دستگیره چپ)</option>
                <option value="left">چپ‌بازشو (دستگیره راست)</option>
            </select>
            <select class="col-fill w-1/2 p-1 border rounded text-[10px]" onchange="updateDrawing(${winId})">
                <option value="glass">شیشه دوجداره</option>
                <option value="panel">پنل عایق</option>
            </select>
        </div>

        <label class="flex items-center gap-1 text-[11px] font-bold cursor-pointer mt-1 text-slate-700 bg-slate-100 p-1 rounded border">
            <input type="checkbox" class="col-screen" onchange="updateDrawing(${winId})"> + افزودن توری پلیسه
        </label>
    `;

    colsContainer.appendChild(colDiv);
    updateDrawing(winId);
}

// توزیع و محاسبه خودکار ابعاد باقیمانده برای جلوگیری از خروج از فریم
function autoCalculateRemainders(winId) {
    const winEl = document.getElementById(`window-${winId}`);
    if (!winEl) return;

    const totalW = parseFloat(document.getElementById(`total-w-${winId}`).value) || 0;
    const totalH = parseFloat(document.getElementById(`total-h-${winId}`).value) || 0;
    const rows = winEl.querySelectorAll('.row-container');

    winEl.querySelectorAll('.row-h-input, .col-w-input').forEach(input => {
        input.readOnly = false;
        input.classList.remove('readonly-input');
    });
    winEl.querySelectorAll('.row-auto-label').forEach(lbl => lbl.classList.add('hidden'));

    if (rows.length > 0) {
        let sumH = 0;
        for (let i = 0; i < rows.length - 1; i++) {
            sumH += parseFloat(rows[i].querySelector('.row-h-input').value) || 0;
        }
        const lastRowInput = rows[rows.length - 1].querySelector('.row-h-input');
        lastRowInput.value = Math.max(0, totalH - sumH);
        lastRowInput.readOnly = true;
        lastRowInput.classList.add('readonly-input');
        rows[rows.length - 1].querySelector('.row-auto-label').classList.remove('hidden');
    }

    rows.forEach(row => {
        const cols = row.querySelectorAll('.col-item');
        if (cols.length > 0) {
            let sumW = 0;
            for (let i = 0; i < cols.length - 1; i++) {
                sumW += parseFloat(cols[i].querySelector('.col-w-input').value) || 0;
            }
            const lastColInput = cols[cols.length - 1].querySelector('.col-w-input');
            lastColInput.value = Math.max(0, totalW - sumW);
            lastColInput.readOnly = true;
            lastColInput.classList.add('readonly-input');
        }
    });
}

function updateAllDrawings() {
    document.querySelectorAll('.window-item').forEach(win => {
        updateDrawing(win.id.replace('window-', ''));
    });
}

function updateDrawing(winId) {
    autoCalculateRemainders(winId);

    const winEl = document.getElementById(`window-${winId}`);
    if(!winEl) return;

    const totalW = parseFloat(document.getElementById(`total-w-${winId}`).value) || 100;
    const totalH = parseFloat(document.getElementById(`total-h-${winId}`).value) || 100;

    const svgMaxDim = 500;
    const scale = svgMaxDim / Math.max(totalW, totalH);
    const canvasW = totalW * scale;
    const canvasH = totalH * scale;
    const offsetX = 80;
    const offsetY = 60;

    const st = getState(winId);
    const isSel = (elId) => st.selected && st.selected.elId === elId;

    let svgShapes = '';
    let highlightOverlay = '';
    const addHighlight = (x, y, w, h, elId, pad = 2) => {
        if (isSel(elId)) {
            highlightOverlay += `<rect x="${x - pad}" y="${y - pad}" width="${w + 2*pad}" height="${h + 2*pad}" fill="none" stroke="${STATIC_COLORS.highlight}" stroke-width="2.5" stroke-dasharray="6 4" rx="2"/>`;
        }
    };

    // رسم فریم بیرونی (کلیک‌پذیر - المان "frame")
    const frameStyle = resolveStyle(winId, 'frame', 'frame');
    const frameThick = frameStyle.depth;
    svgShapes += `<rect x="0" y="0" width="${canvasW}" height="${canvasH}" fill="${frameStyle.fill}" stroke="${frameStyle.edge}" stroke-width="2" style="cursor:pointer" onclick="selectElement(${winId},'frame','frame','دور تا دور',event)"/>`;
    svgShapes += `<rect x="${frameThick}" y="${frameThick}" width="${canvasW - 2*frameThick}" height="${canvasH - 2*frameThick}" fill="none" stroke="${frameStyle.edge}" stroke-width="1" opacity="0.6" style="pointer-events:none"/>`;
    addHighlight(0, 0, canvasW, canvasH, 'frame');

    const rows = winEl.querySelectorAll('.row-container');
    let currentY = frameThick;

    rows.forEach((row, rowIndex) => {
        const rowHeight = (parseFloat(row.querySelector('.row-h-input').value) || 0) * scale;

        // وادار افقی (کلیک‌پذیر)
        if (rowIndex > 0) {
            const elId = `mullion-h-${rowIndex}`;
            const mStyle = resolveStyle(winId, elId, 'mullion');
            const t = mStyle.depth;
            svgShapes += `<rect x="${frameThick}" y="${currentY}" width="${canvasW - 2*frameThick}" height="${t}" fill="${mStyle.fill}" stroke="${mStyle.edge}" stroke-width="1.5" style="cursor:pointer" onclick="selectElement(${winId},'${elId}','mullion','ردیف ${rowIndex}',event)"/>`;
            addHighlight(frameThick, currentY, canvasW - 2*frameThick, t, elId);
            currentY += t;
        }

        const cols = row.querySelectorAll('.col-item');
        let currentX = frameThick;

        cols.forEach((col, colIndex) => {
            const colWidth = (parseFloat(col.querySelector('.col-w-input').value) || 0) * scale;

            // وادار عمودی (کلیک‌پذیر)
            if (colIndex > 0) {
                const elId = `mullion-v-${rowIndex}-${colIndex}`;
                const mStyle = resolveStyle(winId, elId, 'mullion');
                const t = mStyle.depth;
                svgShapes += `<rect x="${currentX}" y="${currentY}" width="${t}" height="${rowHeight}" fill="${mStyle.fill}" stroke="${mStyle.edge}" stroke-width="1.5" style="cursor:pointer" onclick="selectElement(${winId},'${elId}','mullion','ستون ${colIndex} - ردیف ${rowIndex+1}',event)"/>`;
                addHighlight(currentX, currentY, t, rowHeight, elId);
                currentX += t;
            }

            const mech = col.querySelector('.col-mech').value;
            const dir = col.querySelector('.col-dir').value;
            const fill = col.querySelector('.col-fill').value;
            const hasScreen = col.querySelector('.col-screen').checked;

            svgShapes += drawCell(winId, rowIndex, colIndex, currentX, currentY, colWidth, rowHeight, mech, dir, fill, hasScreen, addHighlight);
            currentX += colWidth;
        });
        currentY += rowHeight;
    });

    const svgHTML = `
        <svg width="${canvasW + (offsetX*2)}" height="${canvasH + (offsetY*2)}" viewBox="0 0 ${canvasW + (offsetX*2)} ${canvasH + (offsetY*2)}" xmlns="http://www.w3.org/2000/svg" style="font-family: Vazirmatn, sans-serif;">
            <defs>
                <marker id="arrow-${winId}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#0f172a"/></marker>
                <pattern id="hatch-${winId}" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#334155" stroke-width="1" />
                </pattern>
            </defs>
            <g transform="translate(${offsetX}, ${offsetY})">
                ${svgShapes}
                ${highlightOverlay}
                <!-- خطوط اندازه کلی -->
                <line x1="0" y1="-20" x2="${canvasW}" y2="-20" stroke="#0f172a" stroke-width="1" marker-start="url(#arrow-${winId})" marker-end="url(#arrow-${winId})"/>
                <text x="${canvasW/2}" y="-28" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="middle">${totalW} cm</text>

                <line x1="-20" y1="0" x2="-20" y2="${canvasH}" stroke="#0f172a" stroke-width="1" marker-start="url(#arrow-${winId})" marker-end="url(#arrow-${winId})"/>
                <text x="-28" y="${canvasH/2}" fill="#0f172a" font-size="14" font-weight="bold" text-anchor="end" dominant-baseline="middle" transform="rotate(-90, -28, ${canvasH/2})">${totalH} cm</text>
            </g>
        </svg>
    `;

    document.getElementById(`svg-container-${winId}`).innerHTML = svgHTML;
    renderToolbar(winId);
    renderLegend(winId);
}

// رسم دقیق جزئیات هر چشمه: لنگه بازشو، شیشه/پنل، زهوار و ترسیمات فنی
function drawCell(winId, rowIndex, colIndex, x, y, w, h, mech, dir, fill, hasScreen, addHighlight) {
    let elements = '';
    let innerX = x, innerY = y, innerW = w, innerH = h;

    const sashElId = `sash-${rowIndex}-${colIndex}`;
    const beadElId = `bead-${rowIndex}-${colIndex}`;
    const glassElId = `glass-${rowIndex}-${colIndex}`;
    const cellLabel = `ردیف ${rowIndex+1} - ستون ${colIndex+1}`;

    // رسم لنگه بازشو (کلیک‌پذیر - المان "sash")
    if (mech !== 'fixed') {
        const sashStyle = resolveStyle(winId, sashElId, 'sash');
        const sashThick = sashStyle.depth;
        elements += `<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="${sashStyle.fill}" stroke="${sashStyle.edge}" stroke-width="2" style="cursor:pointer" onclick="selectElement(${winId},'${sashElId}','sash','${cellLabel}',event)"/>`;
        elements += `<rect x="${innerX+4}" y="${innerY+4}" width="${innerW-8}" height="${innerH-8}" fill="none" stroke="${sashStyle.edge}" stroke-width="0.5" opacity="0.5" style="pointer-events:none"/>`;
        addHighlight(x, y, w, h, sashElId);

        innerX += sashThick; innerY += sashThick;
        innerW -= 2*sashThick; innerH -= 2*sashThick;
    }

    // شیشه یا پنل (کلیک‌پذیر - المان "glass")
    let fillColor = fill === 'panel' ? STATIC_COLORS.panel : STATIC_COLORS.glass;
    let fillOpacity = fill === 'panel' ? '1' : '0.4';
    elements += `<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="${fillColor}" opacity="${fillOpacity}" style="cursor:pointer" onclick="selectElement(${winId},'${glassElId}','glass','${cellLabel}',event)"/>`;
    addHighlight(innerX, innerY, innerW, innerH, glassElId);

    // زهوار (کلیک‌پذیر - المان "bead") + لایه نامرئی برای راحتی کلیک روی خط باریک
    const beadStyle = resolveStyle(winId, beadElId, 'bead');
    const bt = beadStyle.depth;
    elements += `<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="none" stroke="${beadStyle.fill}" stroke-width="${bt}" style="cursor:pointer" onclick="selectElement(${winId},'${beadElId}','bead','${cellLabel}',event)"/>`;
    elements += `<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="none" stroke="transparent" stroke-width="${bt + 10}" style="cursor:pointer" onclick="selectElement(${winId},'${beadElId}','bead','${cellLabel}',event)"/>`;
    addHighlight(innerX - bt/2, innerY - bt/2, innerW + bt, innerH + bt, beadElId, 2);

    // توری پلیسه
    if (hasScreen) {
        elements += `<rect x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" fill="url(#hatch-${winId})" opacity="0.3" style="pointer-events:none"/>`;
    }

    // ترسیمات فنی (لولا، دستگیره و خطوط CAD بازشو) - غیرقابل کلیک، فقط نمایشی
    if (mech !== 'fixed') {
        const hgX = dir === 'right' ? x : x + w - 4;
        const hgY_top = y + h*0.15;
        const hgY_bot = y + h*0.85 - 15;

        elements += `<rect x="${hgX}" y="${hgY_top}" width="4" height="15" fill="${STATIC_COLORS.hinge}" rx="2" stroke="${STATIC_COLORS.hingeEdge}" stroke-width="0.5" style="pointer-events:none"/>`;
        elements += `<rect x="${hgX}" y="${hgY_bot}" width="4" height="15" fill="${STATIC_COLORS.hinge}" rx="2" stroke="${STATIC_COLORS.hingeEdge}" stroke-width="0.5" style="pointer-events:none"/>`;

        const hdX = dir === 'right' ? x + w - 10 : x + 2;
        const hdY = y + h/2 - 15;
        elements += `<rect x="${hdX}" y="${hdY}" width="8" height="30" fill="${STATIC_COLORS.handle}" rx="3" stroke="${STATIC_COLORS.handleEdge}" stroke-width="1" style="pointer-events:none"/>`;

        const leftX = innerX; const rightX = innerX + innerW;
        const topY = innerY;  const botY = innerY + innerH;
        const midY = innerY + innerH/2; const midX = innerX + innerW/2;

        if (mech === 'turn' || mech === 'tilt_turn') {
            if (dir === 'right') {
                elements += `<polyline points="${rightX},${topY} ${leftX},${midY} ${rightX},${botY}" fill="none" stroke="${STATIC_COLORS.cadBlue}" stroke-width="1" style="pointer-events:none"/>`;
            } else {
                elements += `<polyline points="${leftX},${topY} ${rightX},${midY} ${leftX},${botY}" fill="none" stroke="${STATIC_COLORS.cadBlue}" stroke-width="1" style="pointer-events:none"/>`;
            }
        }
        if (mech === 'tilt_turn' || mech === 'awning') {
            elements += `<polyline points="${leftX},${topY} ${midX},${botY} ${rightX},${topY}" fill="none" stroke="${STATIC_COLORS.cadBlue}" stroke-width="1" style="pointer-events:none"/>`;
        }
    }

    return elements;
}

// نوار ابزار بالای تصویر: بر اساس المان انتخاب‌شده، کنترل‌های مرتبط را نشان می‌دهد
function renderToolbar(winId) {
    const el = document.getElementById(`element-toolbar-${winId}`);
    if (!el) return;
    const st = getState(winId);

    if (!st.selected) {
        el.innerHTML = `
            <div class="text-[11px] text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-lg p-2.5 text-center">
                <i class="fas fa-hand-pointer ml-1"></i> برای ویرایش، روی هر بخش از تصویر (فریم، وادار، لنگه بازشو، زهوار یا شیشه) کلیک کنید
            </div>`;
        return;
    }

    const { elId, family, label } = st.selected;
    const ov = st.overrides[elId] || {};
    const typeColor = TYPE_BASE_COLOR[family] ? TYPE_BASE_COLOR[family].edge : '#334155';

    let body = '';
    if (family === 'glass') {
        const [, r, c] = elId.split('-');
        const col = getColNode(winId, +r, +c);
        const curFill = col ? col.querySelector('.col-fill').value : 'glass';
        const curScreen = col ? col.querySelector('.col-screen').checked : false;
        body = `
            <select class="p-1.5 border rounded text-xs font-bold" onchange="setColField(${winId},${r},${c},'fill',this.value)">
                <option value="glass" ${curFill === 'glass' ? 'selected' : ''}>شیشه دوجداره</option>
                <option value="panel" ${curFill === 'panel' ? 'selected' : ''}>پنل عایق</option>
            </select>
            <label class="flex items-center gap-1 text-xs font-bold bg-white px-2 py-1.5 rounded border cursor-pointer">
                <input type="checkbox" ${curScreen ? 'checked' : ''} onchange="setColField(${winId},${r},${c},'screen',this.checked)"> توری پلیسه
            </label>`;
    } else {
        const profSel = `<select class="p-1.5 border rounded text-xs font-bold" onchange="setOverrideProfile(${winId},'${elId}',this.value)">
            ${profileOptions(family, ov.profileId || st.defaults[family])}
        </select>`;
        const finSel = `<select class="p-1.5 border rounded text-xs font-bold" onchange="setOverrideFinish(${winId},'${elId}',this.value)">
            ${finishOptions(ov.finishId || st.defaults.finish)}
        </select>`;

        let extra = '';
        if (family === 'sash') {
            const [, r, c] = elId.split('-');
            const col = getColNode(winId, +r, +c);
            const curDir = col ? col.querySelector('.col-dir').value : 'right';
            extra = `<select class="p-1.5 border rounded text-xs font-bold" onchange="setColField(${winId},${r},${c},'dir',this.value)">
                <option value="right" ${curDir === 'right' ? 'selected' : ''}>راست‌بازشو</option>
                <option value="left" ${curDir === 'left' ? 'selected' : ''}>چپ‌بازشو</option>
            </select>`;
        }

        const resetBtn = (ov.profileId || ov.finishId)
            ? `<button type="button" onclick="clearOverride(${winId},'${elId}')" class="text-[10px] text-teal font-bold underline whitespace-nowrap">بازگشت به پیش‌فرض</button>`
            : '';

        body = profSel + finSel + extra + resetBtn;
    }

    el.innerHTML = `
        <div class="bg-slate-800 text-white rounded-lg p-3 flex flex-wrap items-center gap-2" style="border-right:5px solid ${typeColor}">
            <span class="text-xs font-bold ml-1 whitespace-nowrap">${TYPE_LABELS[family] || family}${label ? ` · ${label}` : ''}</span>
            ${body}
            <button type="button" onclick="deselectElement(${winId})" class="mr-auto text-slate-300 hover:text-white text-sm" title="بستن">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

// راهنمای رنگ زیر تصویر - برای تفکیک بصری سریع هر خانواده پروفیل
function renderLegend(winId) {
    const el = document.getElementById(`legend-${winId}`);
    if (!el) return;

    const frame = resolveStyle(winId, '__legend_frame__', 'frame');
    const mullion = resolveStyle(winId, '__legend_mullion__', 'mullion');
    const sash = resolveStyle(winId, '__legend_sash__', 'sash');
    const bead = resolveStyle(winId, '__legend_bead__', 'bead');

    const items = [
        { c: frame.fill,  b: frame.edge,  t: 'فریم' },
        { c: mullion.fill, b: mullion.edge, t: 'وادار' },
        { c: sash.fill,   b: sash.edge,   t: 'لنگه بازشو' },
        { c: bead.fill,   b: bead.edge,   t: 'زهوار' },
        { c: STATIC_COLORS.glass, b: '#0369a1', t: 'شیشه' },
        { c: STATIC_COLORS.panel, b: '#475569', t: 'پنل عایق' },
    ];

    el.innerHTML = items.map(i =>
        `<span class="flex items-center gap-1 text-[10px] font-bold text-slate-600">
            <span class="inline-block w-3 h-3 rounded-sm" style="background:${i.c};border:1.5px solid ${i.b}"></span>${i.t}
        </span>`
    ).join('');
}