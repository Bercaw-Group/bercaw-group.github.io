console.log('🚀 elevator.js loaded');

/* =====================================================================
   فرم برآورد و مشخصات فنی آسانسور — به‌رچاو
   این فایل تمام ساختار، لیست‌های کشویی و منطق فرم را نگه می‌دارد.
   برای افزودن/ویرایش گزینه‌های هر پارامتر، فقط آرایه‌های داده در پایین
   همین فایل را ویرایش کنید؛ نیازی به تغییر elevator.html نیست.
   ===================================================================== */

/* ---------------------- بخش ۱: اطلاعات کارفرما ---------------------- */
const CLIENT_FIELDS = [
    { id: 'clientName',  label: 'نام و نام خانوادگی کارفرما', type: 'text', required: true,  icon: 'fa-user',        placeholder: 'مثال: علی محمدی' },
    { id: 'clientPhone', label: 'شماره تماس',                 type: 'tel',  required: true,  icon: 'fa-phone',       placeholder: '09xxxxxxxxx' },
    { id: 'fillerName',  label: 'نام پرکننده فرم',             type: 'text', required: true,  icon: 'fa-pen-to-square', placeholder: 'نام کارشناس فروش' },
    { id: 'nationalId',  label: 'کد ملی کارفرما',              type: 'text', required: false, icon: 'fa-id-card',     placeholder: 'اختیاری' },
    { id: 'address',     label: 'آدرس پروژه',                  type: 'text', required: false, icon: 'fa-location-dot', placeholder: 'اختیاری', full: true },
];

/* ------------------- مشخصات کلی پروژه و آسانسور -------------------- */
const PROJECT_FIELDS = [
    { id: 'projectNumber',      label: 'شماره پروژه',                    type: 'text',   required: false },
    { id: 'formDate',           label: 'تاریخ تنظیم فرم',                type: 'date',   required: false },
    { id: 'doorType',           label: 'نوع درب',                        type: 'select', options: ['اتوماتیک', 'لولایی'] },
    { id: 'elevatorType',       label: 'نوع آسانسور',                    type: 'select', options: ['کششی', 'هیدرولیک'] },
    { id: 'stopsCount',         label: 'تعداد توقف',                     type: 'number' },
    { id: 'systemType',         label: 'سیستم',                          type: 'select', options: ['گیرلس1:1', 'گیرلس2:1', 'گیربکس', 'MRL'] },
    { id: 'peopleCount',        label: 'تعداد نفرات (ظرفیت)',            type: 'number' },
    { id: 'hasReferrer',        label: 'پروژه معرف دارد؟',               type: 'select', options: ['ندارد', 'همکاران شرکت', 'مشتریان قدیمی', 'خارج از شرکت', 'غیره'] },
    { id: 'envAds',             label: 'تبلیغات محیطی',                  type: 'select', options: ['دارد', 'ندارد'] },
    { id: 'commercialUnit',     label: 'واحد تجاری دارد؟',               type: 'select', options: ['دارد', 'ندارد'] },
    { id: 'extraLaborPercent',  label: 'درصد مازاد نیرو شهرستان',        type: 'select', options: ['%50', '%60', '%70', '%80', '%90', '%100'] },
];

/* ------------- بخش ۲: مرحله اول — ریل‌گذاری و نصب درب --------------- */
/* گزینه‌های هر پارامتر مطابق ستون A شیت «به‌روز رسانی قیمت» */
const STAGE1_ITEMS = [{"id": "rail", "label": "ریل", "options": ["ریل کششی سرد  T5&T9 ایتالیا / مارازی", "ریل کششی سرد  T5&T9 چین / MF", "ریل کششی سرد  T5&T9 چین / MOF", "ریل کششی سرد  T5&T9 ترکیه / ترکعلی", "ریل کششی سرد  T5&T9 ترکیه / چیلک", "ریل کششی سرد  T5&T9 چین/سوپر ساورا", "ریل کششی سرد  T5&T9 ترکیه/چیلک", "ریل کششی سرد  T5&T16 ایتالیا / مارازی", "ریل کششی سرد  T5&T16 چین / MF", "ریل کششی سرد  T5&T16 چین / MOF", "ریل کششی سرد  T5&T16 ترکیه / ترکعلی", "ریل کششی سرد  T5&T16 ترکیه / چیلک", "ریل کششی سرد  T5&T16 چین/سوپر ساورا", "ریل کششی سرد  T5&T16 ترکیه/چیلک"]}, {"id": "bracket", "label": "براکت", "options": ["براکت از نوع آبکاری شده -T5&T9", "براکت از نوع آبکاری شده -T5&T16"]}, {"id": "boltnut1", "label": "پیچ و مهره ۱", "options": ["پیچ و مهره  نمره 12 مخصوص براکت و پشت بند ایران", "پیچ و مهره  نمره 10 مخصوص براکت  ایران", "پیچ و مهره  نمره 8 مخصوص پشت بند ایران"]}, {"id": "boltnut2", "label": "پیچ و مهره ۲", "options": ["پیچ و مهره  نمره 12 مخصوص براکت و پشت بند ایران", "پیچ و مهره  نمره 10 مخصوص براکت  ایران", "پیچ و مهره  نمره 8 مخصوص پشت بند ایران"]}, {"id": "boltnut3", "label": "پیچ و مهره ۳", "options": ["پیچ و مهره  نمره 12 مخصوص براکت و پشت بند ایران", "پیچ و مهره  نمره 10 مخصوص براکت  ایران", "پیچ و مهره  نمره 8 مخصوص پشت بند ایران"]}, {"id": "loghme", "label": "لقمه", "options": ["لقمه  از نوع چدن - T5&T9 ایران / مبین", "لقمه  از نوع چدن - T5&T16 ایران / مبین"]}, {"id": "floordoor", "label": "درب طبقات", "options": ["درب طبقات اتوماتیک ایران / روانکار", "درب طبقات اتوماتیک ایران / غدیر", "درب طبقات اتوماتیک ایران / یاران", "درب طبقات اتوماتیک ایران / پارسیان", "درب طبقات اتوماتیک ایران/طرح دار", "درب طبقات اتوماتیک ایران/بهران", "درب طبقات  لولایی ایران/بهران", "درب طبقات  لولایی ایران/طرح دار"]}, {"id": "floorcover", "label": "روکش درب طبقات", "options": ["روکش درب طبقات رنگ ایران", "روکش درب طبقات استیل دودی آینه ای ایران", "روکش درب طبقات استیل طلائی خشدار ایران", "روکش درب طبقات استیل نقره ای آینه ای ایران", "روکش درب طبقات استیل نقره ای خشدار ایران", "روکش درب طبقات استیل نقره ای خش دار آنتی فینگر ایران"]}];

const STAGE1_EXTRA = { id: 'floorCoverCount', label: 'تعداد درب‌هایی که مدنظر است روکش شوند', type: 'number' };

/* ----------------- بخش ۳: مرحله دوم — نصب مکانیکال ------------------ */
const STAGE2_ITEMS = [{"id": "mech_0", "label": "گیربکس", "spec": {"type": "select", "options": ["6 .1kw - دو سرعته", "6 .1kw - تک سرعته", "5.5kw - دو سرعته", "5.5kw - تک سرعته", "7.3kw-دو سرعته", "7.3kw-تک سرعته", "2.9kw-9A پنج شیار", "(یک به یک)", "(دو به یک)", "هیدرولیکی"]}, "brand": {"type": "select", "options": ["ایران / بهران", "اسپانیا/فوردر", "چین / مگا درایو", "چین / مونو درایو", "ایتالیا / ساسی", "ایران/ABB", "ایران / الکو", "ایران / روسانی"]}}, {"id": "mech_1", "label": "انکودر", "spec": {"type": "select", "options": ["هایدن هاین", "فناک", "اتونیکس", "ندارد"]}, "brand": {"type": "text", "default": "آلمان"}}, {"id": "mech_2", "label": "کابین", "spec": {"type": "select", "options": ["استیل خشدار / نقره ای", "استیل خشدار / طلایی", "استیل آینه ای / نقره ای", "استیل آینه ای / طلایی", "استیل دودی ترکیبی", "استیل MDF"]}, "brand": {"type": "select", "options": ["همدان", "تهران", "سنندج / ماد", "ملایر / خدادادی"]}}, {"id": "mech_3", "label": "ترمز اضطراری", "spec": {"type": "select", "options": ["تدریجی یک طرفه T9", "تدریجی دو طرفه T9", "تدریجی T16"]}, "brand": {"type": "text", "default": "ایران"}}, {"id": "mech_4", "label": "فلکه هرزگرد", "spec": {"type": "select", "options": ["40سانت 4 شیار", "32سانت 4 شیار", "32سانت 5 شیار", "40سانت 5شیار", "35سانت 5شیار"]}, "brand": {"type": "text", "default": "ایران"}}, {"id": "mech_5", "label": "سیم بکسل", "spec": {"type": "select", "options": ["نمره  10", "نمره 8", "نمره 11", "نمره 12"]}, "brand": {"type": "select", "options": ["ایران / بهران", "چین / گوستاوولف", "آلمان / گوستاوولف"]}}, {"id": "mech_6", "label": "قلاب بکسل", "spec": {"type": "text", "default": "فولادی"}, "brand": {"type": "text", "default": "ایران / پرشیا"}}, {"id": "mech_7", "label": "وزنه تعادل", "spec": {"type": "text", "default": "بتنی روکش گالوانیزه"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "mech_8", "label": "لاستیک تخت", "spec": {"type": "text", "default": "استاندارد"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "mech_9", "label": "گاورنر", "spec": {"type": "select", "options": ["دوجهته بالا و پایین", "تک جهته بالا و پایین"]}, "brand": {"type": "text", "default": "ایران / آسان شایان"}}];

/* ------------------ بخش ۴: مرحله سوم — راه‌اندازی ------------------- */
const STAGE3_ITEMS = [{"id": "setup_0", "label": "تابلو کنترل", "spec": {"type": "select", "options": ["گیرلس1:1", "گیرلس2:1", "گیربکس", "MRL"]}, "brand": {"type": "select", "options": ["ایران / پار کنترل", "ایران / پایا", "ایران / دانین", "ایران / آریان آسانسور", "ترکیه / آرکل", "ایران /آتیس"]}}, {"id": "setup_1", "label": "UPS", "spec": {"type": "select", "options": ["1.5 K.V.A", "2 K.V.A", "3 K.V.A", "ندارد"]}, "brand": {"type": "text", "default": ""}}, {"id": "setup_2", "label": "درایو کنترل سرعت", "spec": {"type": "select", "options": ["7.5 KW", "11 KW", "15 KW"]}, "brand": {"type": "select", "options": ["چین/qma", "ایران / Hp", "چین / Hp Mount", "ترکیه / آرکیوب", "ایتالیا / حفران", "ایران/بتا"]}}, {"id": "setup_3", "label": "درب کابین", "spec": {"type": "select", "options": ["اتوماتیک", "نیمه اتوماتیک", "اتوبوسی"]}, "brand": {"type": "select", "options": ["ایران / روانکار", "ایران / غدیر", "ایران / یاران", "ایران / پارسیان", "ایران/طرح دار", "ایران/بهران"]}}, {"id": "setup_4", "label": "روکش درب کابین", "spec": {"type": "select", "options": ["رنگ", "استیل دودی آینه ای", "استیل طلائی خشدار", "استیل نقره ای آینه ای", "استیل نقره ای خشدار", "استیل نقره ای خش دار آنتی فینگر"]}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_5", "label": "تابلوی سه فاز", "spec": {"type": "text", "default": "25 آمپر"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_6", "label": "چراغ تونلی", "spec": {"type": "text", "default": "24 ولت"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_7", "label": "کلید استپ قارچی", "spec": {"type": "text", "default": "معمولی"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_8", "label": "بست تراول", "spec": {"type": "text", "default": "معمولی"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_9", "label": "روغن دان", "spec": {"type": "text", "default": "بهران"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_10", "label": "سیستم تشخیص اضافه بار", "spec": {"type": "select", "options": ["دیجیتالی", "مغناطیسی"]}, "brand": {"type": "select", "options": ["ایران", "ترکیه"]}}, {"id": "setup_11", "label": "ضربه گیر زیر کابین و وزنه", "spec": {"type": "text", "default": "پلی اورتان"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_12", "label": "شالتر", "spec": {"type": "select", "options": ["NF", "پروانه ای"]}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_13", "label": "سنسور آهنربایی", "spec": {"type": "text", "default": "فلزی"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_14", "label": "سیم نمره 1", "spec": {"type": "text", "default": "جنس مرغوب"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_15", "label": "سیم 10 زوجی", "spec": {"type": "text", "default": "جنس مرغوب"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_16", "label": "سیم نمره 4", "spec": {"type": "text", "default": "جنس مرغوب"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_17", "label": "خرطومی", "spec": {"type": "text", "default": "پلاستیکی"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_18", "label": "شستی داخل کابین", "spec": {"type": "select", "options": ["1m / استیل طلائی", "1m / استیل نقره ای", "2m / استیل طلائی", "2m / استیل نقره ای"]}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_19", "label": "تلفن داخل کابین", "spec": {"type": "select", "options": ["معمولی", "نصب بر روی شاسی کابین"]}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_20", "label": "شستی طبقات", "spec": {"type": "select", "options": ["طلائی", "نقره ای"]}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_21", "label": "داکت", "spec": {"type": "text", "default": "مرغوب"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_22", "label": "سیم بکسل گاورنر", "spec": {"type": "text", "default": "نمره ی 6"}, "brand": {"type": "text", "default": "چین"}}, {"id": "setup_23", "label": "سیستم تشخیص مانع درب", "spec": {"type": "select", "options": ["ندارد", "پرده ای", "نقطه ای"]}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_24", "label": "تراول کابل", "spec": {"type": "text", "default": "24رشته"}, "brand": {"type": "select", "options": ["ایران", "دات وایلر / چک", "نرگیز کابل / ترکیه"]}}, {"id": "setup_25", "label": "پلاک مشخصات آسانسور", "spec": {"type": "text", "default": "معمولی"}, "brand": {"type": "text", "default": "ایران"}}, {"id": "setup_26", "label": "سیم جوش و صفحه برش", "spec": {"type": "text", "default": "معمولی"}, "brand": {"type": "text", "default": "ایران"}}];

/* --------------- بخش ۵: خدمات و شرایط مدنظر (چک‌لیست) --------------- */
const SCOPE_ITEMS = ["حمل، بارگیری و تخلیه بار", "جرثقیل", "طراحی نقشه و مهندسی", "آرماتوربندی", "اجرای آهنکشی", "آهنکشی U", "اجرای ریل", "نایلون‌پیچی ریل", "اجرای درب", "اجرای مکانیک", "اجرای راه‌اندازی", "استانداردسازی و کابل‌کشی", "نظافت و ضد زنگ", "اعزام نیرو به شهرستان", "مالیات ارزش‌افزوده دستمزد (۱۰٪)", "مالیات بر درآمد (۱۰٪)", "مسئول کارگاه", "خرید ورق و آهن‌آلات پایه موتور", "خرید آهن‌آلات جهت شاسی", "گارانتی یک سال پس از نصب", "سایر"];

/* ===================================================================== */

const COMPANY_PHONE_INTL = '989188797939';
const DRAFT_KEY = 'bercaw_elevator_form_draft_v1';

// 🔗 آدرس‌های ارسال داده (باید توسط کاربر تنظیم شوند)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztx9C3R5Mm3VBnMU9OPGXbb7RIgZMcX8K6yUtuLeYaQ6ai-mtyJWIQu-joQws1CtLO/exec'; // ← آدرس Google Apps Script خود را اینجا قرار دهید
const CLOUDFLARE_WORKER_URL = 'https://flat-fire-a0d0.zeya-hashemi.workers.dev'; // ← آدرس Cloudflare Worker خود را اینجا قرار دهید

/* رجیستری همه فیلدهای رندر شده، برای جمع‌آوری مقادیر هنگام ثبت فرم */
const fieldRegistry = [];

function el(tag, className, html) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (html !== undefined) e.innerHTML = html;
    return e;
}

function makeControl(field, controlId) {
    let control;
    if (field.type === 'select') {
        control = el('select', 'w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-teal outline-none transition bg-white text-navy');
        const empty = el('option', '', 'انتخاب کنید...');
        empty.value = '';
        control.appendChild(empty);
        field.options.forEach(opt => {
            const o = el('option', '', String(opt));
            o.value = opt;
            if (field.default !== undefined && String(opt) === String(field.default)) o.selected = true;
            control.appendChild(o);
        });
    } else if (field.type === 'textarea') {
        control = el('textarea', 'w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-teal outline-none transition');
        control.rows = 2;
    } else {
        control = el('input', 'w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 focus:border-teal outline-none transition');
        control.type = field.type || 'text';
        if (field.default !== undefined) control.value = field.default;
    }
    control.id = controlId;
    if (field.placeholder) control.placeholder = field.placeholder;
    if (field.required) control.required = true;
    return control;
}

function renderSimpleField(container, field) {
    const wrap = el('div', field.full ? 'md:col-span-2' : '');
    const label = el('label', 'block text-sm font-semibold text-gray-600 mb-1.5', '');
    label.setAttribute('for', field.id);
    if (field.icon) label.innerHTML += `<i class="fas ${field.icon} ml-1.5 text-teal"></i>`;
    label.innerHTML += field.label;
    if (field.required) label.innerHTML += ' <span class="text-red-400">*</span>';
    else label.innerHTML += ' <span class="text-gray-300 text-xs">(اختیاری)</span>';
    wrap.appendChild(label);
    const control = makeControl(field, field.id);
    wrap.appendChild(control);
    const err = el('p', 'field-error text-red-500 text-xs mt-1 hidden', 'این فیلد الزامی است');
    wrap.appendChild(err);
    container.appendChild(wrap);
    fieldRegistry.push({ id: field.id, label: field.label, el: control, required: !!field.required });
    return control;
}

/* ردیف پارامتر مرحله اول: یک چک‌باکس + یک لیست ترکیبی */
function renderStage1Row(container, item) {
    const row = el('div', 'tech-row border border-gray-100 rounded-xl p-4 hover:border-teal/40 transition');
    const labelWrap = el('label', 'flex items-center gap-2 font-semibold text-navy cursor-pointer mb-3');
    const cb = el('input', 'w-5 h-5 accent-teal rounded shrink-0');
    cb.type = 'checkbox';
    cb.checked = true;
    cb.id = 'inc_' + item.id;
    labelWrap.appendChild(cb);
    labelWrap.appendChild(el('span', '', item.label));
    row.appendChild(labelWrap);

    const select = makeControl({ type: 'select', options: item.options }, 'val_' + item.id);
    row.appendChild(select);
    container.appendChild(row);

    fieldRegistry.push({ id: 'val_' + item.id, label: item.label, el: select, includeEl: cb, required: false });
}

/* ردیف پارامتر مرحله دوم/سوم: چک‌باکس + عنوان + دو کنترل (مشخصات فنی / ساخت-برند) */
function renderTechRow(container, item) {
    const row = el('div', 'tech-row border border-gray-100 rounded-xl p-4 hover:border-teal/40 transition');
    const labelWrap = el('label', 'flex items-center gap-2 font-semibold text-navy cursor-pointer mb-3');
    const cb = el('input', 'w-5 h-5 accent-teal rounded shrink-0');
    cb.type = 'checkbox';
    cb.checked = true;
    cb.id = 'inc_' + item.id;
    labelWrap.appendChild(cb);
    labelWrap.appendChild(el('span', '', item.label));
    row.appendChild(labelWrap);

    const grid = el('div', 'grid grid-cols-1 md:grid-cols-2 gap-3');

    const specWrap = el('div', '');
    specWrap.appendChild(el('label', 'text-xs text-gray-500 mb-1 block', 'مشخصات فنی'));
    const specControl = makeControl(item.spec, 'spec_' + item.id);
    specWrap.appendChild(specControl);
    grid.appendChild(specWrap);
    fieldRegistry.push({ id: 'spec_' + item.id, label: item.label + ' — مشخصات فنی', el: specControl, includeEl: cb, required: false });

    const hasBrand = !(item.brand.type === 'text' && (!item.brand.default || item.brand.default.trim() === ''));
    if (hasBrand) {
        const brandWrap = el('div', '');
        brandWrap.appendChild(el('label', 'text-xs text-gray-500 mb-1 block', 'ساخت / برند'));
        const brandControl = makeControl(item.brand, 'brand_' + item.id);
        brandWrap.appendChild(brandControl);
        grid.appendChild(brandWrap);
        fieldRegistry.push({ id: 'brand_' + item.id, label: item.label + ' — ساخت/برند', el: brandControl, includeEl: cb, required: false });
    }

    row.appendChild(grid);
    container.appendChild(row);
}

function renderScopeChecklist(container, items) {
    const grid = el('div', 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3');
    items.forEach((label, idx) => {
        const wrap = el('label', 'flex items-center gap-2.5 bg-gray-50 hover:bg-teal/5 border border-gray-100 rounded-lg px-4 py-3 cursor-pointer transition');
        const cb = el('input', 'w-5 h-5 accent-teal rounded shrink-0');
        cb.type = 'checkbox';
        cb.id = 'scope_' + idx;
        wrap.appendChild(cb);
        wrap.appendChild(el('span', 'text-sm text-navy', label));
        grid.appendChild(wrap);
        fieldRegistry.push({ id: 'scope_' + idx, label: label, el: cb, isCheckbox: true });
    });
    container.appendChild(grid);
}

/* ===================== ساخت کامل فرم در صفحه ===================== */
function buildForm() {
    const clientGrid = document.getElementById('client-fields');
    CLIENT_FIELDS.forEach(f => renderSimpleField(clientGrid, f));

    const projectGrid = document.getElementById('project-fields');
    PROJECT_FIELDS.forEach(f => renderSimpleField(projectGrid, f));

    const stage1Grid = document.getElementById('stage1-fields');
    STAGE1_ITEMS.forEach(item => renderStage1Row(stage1Grid, item));
    renderSimpleField(stage1Grid, STAGE1_EXTRA);

    const stage2Grid = document.getElementById('stage2-fields');
    STAGE2_ITEMS.forEach(item => renderTechRow(stage2Grid, item));

    const stage3Grid = document.getElementById('stage3-fields');
    STAGE3_ITEMS.forEach(item => renderTechRow(stage3Grid, item));

    const scopeGrid = document.getElementById('scope-fields');
    renderScopeChecklist(scopeGrid, SCOPE_ITEMS);

    const dateInput = document.getElementById('formDate');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().slice(0, 10);
    }

    restoreDraft();
    wireAutosave();
}

/* ===================== ذخیره‌سازی پیش‌نویس محلی ===================== */
function wireAutosave() {
    const form = document.getElementById('elevator-form');
    if (!form) return;
    form.addEventListener('input', debounce(saveDraft, 400));
    form.addEventListener('change', debounce(saveDraft, 400));
}

function debounce(fn, wait) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

function saveDraft() {
    try {
        const data = {};
        fieldRegistry.forEach(f => {
            data[f.id] = f.isCheckbox ? f.el.checked : f.el.value;
            if (f.includeEl) data['inc_for_' + f.id] = f.includeEl.checked;
        });
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        const status = document.getElementById('draft-status');
        if (status) {
            status.textContent = 'پیش‌نویس در همین مرورگر ذخیره شد ✓';
            status.classList.remove('opacity-0');
            clearTimeout(window._draftStatusTimeout);
            window._draftStatusTimeout = setTimeout(() => status.classList.add('opacity-0'), 2000);
        }
    } catch (e) {
        console.warn('عدم امکان ذخیره پیش‌نویس:', e);
    }
}

function restoreDraft() {
    let data;
    try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (!raw) return;
        data = JSON.parse(raw);
    } catch (e) { return; }

    fieldRegistry.forEach(f => {
        if (data[f.id] === undefined) return;
        if (f.isCheckbox) f.el.checked = !!data[f.id];
        else f.el.value = data[f.id];
        if (f.includeEl && data['inc_for_' + f.id] !== undefined) {
            f.includeEl.checked = !!data['inc_for_' + f.id];
        }
    });
}

function clearDraft() {
    if (!confirm('آیا از پاک کردن تمام اطلاعات فرم مطمئن هستید؟')) return;
    localStorage.removeItem(DRAFT_KEY);
    document.getElementById('elevator-form').reset();
    fieldRegistry.forEach(f => {
        if (f.includeEl) f.includeEl.checked = true;
    });
    const dateInput = document.getElementById('formDate');
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
    document.getElementById('summary-panel').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ===================== اعتبارسنجی و ثبت فرم ===================== */
function validateForm() {
    let firstInvalid = null;
    let ok = true;
    fieldRegistry.forEach(f => {
        if (!f.required) return;
        const errEl = f.el.parentElement.querySelector('.field-error');
        const empty = !f.el.value || !f.el.value.trim();
        if (empty) {
            ok = false;
            f.el.classList.add('border-red-400');
            if (errEl) errEl.classList.remove('hidden');
            if (!firstInvalid) firstInvalid = f.el;
        } else {
            f.el.classList.remove('border-red-400');
            if (errEl) errEl.classList.add('hidden');
        }
    });
    if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstInvalid.focus();
    }
    return ok;
}

function buildSummaryText() {
    const lines = [];
    lines.push('فرم برآورد آسانسور — به‌رچاو');
    lines.push('----------------------------------------');

    function section(title, fields) {
        const rows = fields
            .map(f => {
                const val = f.isCheckbox ? (f.el.checked ? 'بله' : null) : (f.el.value || '').trim();
                if (!val) return null;
                if (f.includeEl && !f.includeEl.checked) return null;
                return `${f.label}: ${val}`;
            })
            .filter(Boolean);
        if (rows.length) {
            lines.push('');
            lines.push(`— ${title} —`);
            lines.push(...rows);
        }
    }

    const clientFs = fieldRegistry.filter(f => CLIENT_FIELDS.some(c => c.id === f.id));
    const projectFs = fieldRegistry.filter(f => PROJECT_FIELDS.some(c => c.id === f.id));
    const stage1Fs = fieldRegistry.filter(f => f.id.startsWith('val_') || f.id === 'floorCoverCount');
    const stage2Fs = fieldRegistry.filter(f => f.id.startsWith('spec_mech_') || f.id.startsWith('brand_mech_'));
    const stage3Fs = fieldRegistry.filter(f => f.id.startsWith('spec_setup_') || f.id.startsWith('brand_setup_'));
    const scopeFs = fieldRegistry.filter(f => f.isCheckbox);

    section('اطلاعات کارفرما', clientFs);
    section('مشخصات کلی پروژه', projectFs);
    section('مرحله اول: ریل‌گذاری و نصب درب', stage1Fs);
    section('مرحله دوم: نصب مکانیکال', stage2Fs);
    section('مرحله سوم: راه‌اندازی', stage3Fs);
    section('خدمات و شرایط مدنظر', scopeFs);

    lines.push('');
    lines.push('----------------------------------------');
    lines.push('ارسال شده از فرم برآورد آنلاین سایت به‌رچاو');
    return lines.join('\n');
}

async function submitFormAndShowSummary() {
    const text = buildSummaryText();
    const panel = document.getElementById('summary-panel');
    const pre = document.getElementById('summary-text');
    pre.textContent = text;
    panel.classList.remove('hidden');
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // جمع‌آوری تمام داده‌های فرم
    const formDataObj = {};
    fieldRegistry.forEach(f => {
        const val = f.isCheckbox ? (f.el.checked ? 'بله' : 'خیر') : (f.el.value || '').trim();
        if (val) {
            if (f.includeEl && !f.includeEl.checked) return;
            formDataObj[f.label] = val;
        }
    });

    // ارسال به سرور
    const result = await submitFormToServer(formDataObj);
    
    const successMsg = document.getElementById('success-message');
    if (result.googleSuccess || result.workerSuccess) {
        successMsg.classList.remove('hidden');
    } else {
        // در صورت خطا، پیام خطا نمایش داده شود
        successMsg.innerHTML = '<i class="fas fa-exclamation-circle text-2xl ml-2"></i><span class="text-red-600">خطا در ثبت اطلاعات. لطفاً مجدداً تلاش کنید یا با پشتیبانی تماس بگیرید.</span>';
        successMsg.classList.remove('hidden');
        successMsg.classList.remove('bg-green-50', 'border-green-200', 'text-green-800');
        successMsg.classList.add('bg-red-50', 'border-red-200', 'text-red-800');
    }

    document.getElementById('btn-copy').onclick = async () => {
        try {
            await navigator.clipboard.writeText(text);
            const btn = document.getElementById('btn-copy');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check ml-2"></i>کپی شد';
            setTimeout(() => btn.innerHTML = original, 1800);
        } catch (e) {
            alert('کپی خودکار ممکن نشد؛ متن را به صورت دستی انتخاب و کپی کنید.');
        }
    };
    document.getElementById('btn-print').onclick = () => window.print();
}

function showSummary() {
    submitFormAndShowSummary();
}

/* ===================== ارسال فرم به سرور (Google Sheets + Telegram) ===================== */
async function submitFormToServer(formDataObj) {
    const submitBtn = document.querySelector('#elevator-form button[type="submit"]');
    const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
    
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ارسال...';
        submitBtn.disabled = true;
        submitBtn.classList.replace('bg-teal', 'bg-gray-400');
    }

    // اضافه کردن تگ شناسایی فرم
    const dataObj = { 
        formType: "elevator",
        timestamp: new Date().toLocaleString('fa-IR'),
        ...formDataObj
    };

    // تبدیل آرایه‌ها به رشته متنی
    for (let key in dataObj) {
        if (Array.isArray(dataObj[key])) {
            dataObj[key] = dataObj[key].join('، ');
        }
    }

    let googleSuccess = false;
    let workerSuccess = false;

    try {
        // ۱. ارسال به Google Apps Script
        if (GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes('YOUR_SCRIPT_ID')) {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(dataObj),
                redirect: 'follow'
            });
            
            const result = await response.json();
            if (result.result === 'success') {
                googleSuccess = true;
            } else {
                console.warn('Google Apps Script error:', result.message);
            }
        }

        // ۲. ارسال به Cloudflare Worker (برای ربات تلگرام)
        if (CLOUDFLARE_WORKER_URL && !CLOUDFLARE_WORKER_URL.includes('your-worker')) {
            const workerResponse = await fetch(CLOUDFLARE_WORKER_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataObj)
            });
            
            const workerResult = await workerResponse.json();
            if (workerResult.success) {
                workerSuccess = true;
            } else {
                console.warn('Cloudflare Worker error:', workerResult.message);
            }
        }

        return { googleSuccess, workerSuccess };
    } catch (error) {
        console.error('Error submitting form:', error);
        return { googleSuccess: false, workerSuccess: false, error: error.message };
    } finally {
        if (submitBtn) {
            submitBtn.innerHTML = originalBtnHtml;
            submitBtn.disabled = false;
            submitBtn.classList.replace('bg-gray-400', 'bg-teal');
        }
    }
}

/* ===================== راه‌اندازی ===================== */
document.addEventListener('DOMContentLoaded', () => {
    buildForm();

    const form = document.getElementById('elevator-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        showSummary();
    });

    const clearBtn = document.getElementById('btn-clear-form');
    if (clearBtn) clearBtn.addEventListener('click', clearDraft);

    document.querySelectorAll('.section-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.getElementById(btn.dataset.target);
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
});