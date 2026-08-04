// ۱. مقداردهی اولیه تلگرام (فقط وقتی واقعاً داخل تلگرام باز شده باشد)
// نکته مهم: اسکریپت telegram-web-app.js همیشه یک آبجکت window.Telegram.WebApp
// می‌سازد، حتی در مرورگر معمولی. برای تشخیص درست، initData را چک می‌کنیم که
// فقط داخل تلگرام واقعی مقدار غیرخالی دارد.
const tgRaw = window.Telegram ? window.Telegram.WebApp : null;
const tg = (tgRaw && tgRaw.initData) ? tgRaw : null;
if (tg) {
    tg.expand(); // باز کردن صفحه به صورت تمام‌صفحه در گوشی
}

// بستن صفحه با دکمه ضربدر هدر
document.getElementById('close-btn').addEventListener('click', (e) => {
    e.preventDefault();
    
    // بررسی می‌کنیم که آیا واقعاً داخل محیط تلگرام هستیم یا خیر
    if (tg && tg.platform !== "unknown" && tg.platform !== "") {
        tg.close(); // بستن مینی‌اپ در تلگرام
    } else {
        window.location.href = 'index.html'; // بازگشت به صفحه اصلی در مرورگر عادی
    }
});


// ===== ۲. ساخت ردیف‌های پویا برای هر درب/پنجره =====
const quantityInput = document.getElementById('item-quantity');
const itemsContainer = document.getElementById('items-container');
const itemsHeader = document.getElementById('items-header');
const itemsEmptyMsg = document.getElementById('items-empty-msg');

const ITEM_TYPES = ['پنجره', 'درب', 'درب بالکن', 'نورگیر ثابت'];
const MAX_ITEMS = 60;

function readExistingItemValues(count) {
    const values = {};
    for (let i = 1; i <= count; i++) {
        const typeEl = itemsContainer.querySelector(`[name="item-type-${i}"]`);
        const widthEl = itemsContainer.querySelector(`[name="item-width-${i}"]`);
        const heightEl = itemsContainer.querySelector(`[name="item-height-${i}"]`);
        const locationEl = itemsContainer.querySelector(`[name="item-location-${i}"]`);
        values[i] = {
            type: typeEl ? typeEl.value : ITEM_TYPES[0],
            width: widthEl ? widthEl.value : '',
            height: heightEl ? heightEl.value : '',
            location: locationEl ? locationEl.value : ''
        };
    }
    return values;
}

function buildTypeOptions(selectedType) {
    return ITEM_TYPES.map(t => `<option value="${t}" ${t === selectedType ? 'selected' : ''}>${t}</option>`).join('');
}

function renderItemRows() {
    if (!quantityInput || !itemsContainer) return;

    let qty = parseInt(quantityInput.value, 10);
    if (isNaN(qty) || qty < 0) qty = 0;
    if (qty > MAX_ITEMS) {
        qty = MAX_ITEMS;
        quantityInput.value = MAX_ITEMS;
    }

    // مقادیر قبلی را قبل از پاک کردن ذخیره می‌کنیم تا با تغییر تعداد از بین نروند
    const currentRowCount = itemsContainer.children.length;
    const existingValues = readExistingItemValues(Math.max(currentRowCount, qty));

    itemsContainer.innerHTML = '';

    if (qty === 0) {
        if (itemsHeader) itemsHeader.classList.add('hidden');
        if (itemsEmptyMsg) itemsEmptyMsg.classList.remove('hidden');
        return;
    }

    if (itemsHeader) itemsHeader.classList.remove('hidden');
    if (itemsEmptyMsg) itemsEmptyMsg.classList.add('hidden');

    for (let i = 1; i <= qty; i++) {
        const prev = existingValues[i] || {};
        const row = document.createElement('div');
        row.className = 'grid grid-cols-2 md:grid-cols-12 gap-3 items-center border border-gray-200 rounded-lg p-3';
        row.innerHTML = `
            <div class="col-span-2 md:col-span-1 text-sm font-bold text-navy">ردیف ${i}</div>
            <div class="col-span-2 md:col-span-3">
                <select name="item-type-${i}" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-teal outline-none text-sm">
                    ${buildTypeOptions(prev.type || ITEM_TYPES[0])}
                </select>
            </div>
            <div class="md:col-span-2">
                <input type="number" name="item-width-${i}" placeholder="عرض (cm)" value="${prev.width || ''}" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-teal outline-none text-sm text-center" dir="ltr">
            </div>
            <div class="md:col-span-2">
                <input type="number" name="item-height-${i}" placeholder="ارتفاع (cm)" value="${prev.height || ''}" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-teal outline-none text-sm text-center" dir="ltr">
            </div>
            <div class="col-span-2 md:col-span-4">
                <input type="text" name="item-location-${i}" placeholder="محل نصب (اختیاری)" value="${prev.location || ''}" class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-teal outline-none text-sm">
            </div>
        `;
        itemsContainer.appendChild(row);
    }
}

if (quantityInput) {
    quantityInput.addEventListener('input', renderItemRows);
    renderItemRows(); // اجرای اولیه (برای حالتی که مرورگر مقدار قبلی را نگه داشته)
}

function collectItemsSummary(qty) {
    const lines = [];
    for (let i = 1; i <= qty; i++) {
        const type = itemsContainer.querySelector(`[name="item-type-${i}"]`)?.value || '';
        const width = itemsContainer.querySelector(`[name="item-width-${i}"]`)?.value || '';
        const height = itemsContainer.querySelector(`[name="item-height-${i}"]`)?.value || '';
        const location = itemsContainer.querySelector(`[name="item-location-${i}"]`)?.value || '';
        let line = `${i}) ${type} - ${width || '؟'}×${height || '؟'} سانتی‌متر`;
        if (location) line += ` - ${location}`;
        lines.push(line);
    }
    return lines.join('\n');
}

// ===== ۳. هندل کردن ارسال فرم =====
const form = document.getElementById('upvc-form');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('success-message');

// ⚠️ مهم: همان لینک Google Apps Script که در elevator.js استفاده شده است ⚠️
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztx9C3R5Mm3VBnMU9OPGXbb7RIgZMcX8K6yUtuLeYaQ6ai-mtyJWIQu-joQws1CtLO/exec';

if (form && submitBtn) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ارسال...';
        submitBtn.disabled = true;
        submitBtn.classList.replace('bg-teal', 'bg-gray-400');

        const formData = new FormData(form);
        const dataObj = {
            formType: "upvc",
            timestamp: new Date().toLocaleString('fa-IR')
        };

        formData.forEach((value, key) => {
            // فیلدهای مربوط به هر ردیف (item-type-1, item-width-1, ...) را اینجا نادیده می‌گیریم
            // چون به‌صورت خلاصه در itemsDetails فرستاده می‌شوند
            if (key.startsWith('item-')) return;

            if (dataObj[key]) {
                if (Array.isArray(dataObj[key])) {
                    dataObj[key].push(value);
                } else {
                    dataObj[key] = [dataObj[key], value];
                }
            } else {
                dataObj[key] = value;
            }
        });

        for (let key in dataObj) {
            if (Array.isArray(dataObj[key])) {
                dataObj[key] = dataObj[key].join('، ');
            }
        }

        const qty = parseInt(dataObj.quantity, 10) || 0;
        dataObj.itemsDetails = qty > 0 ? collectItemsSummary(qty) : '';

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify(dataObj)
            });

            const result = await response.json();

            if (result.result === 'success') {
                if (successMsg) successMsg.classList.remove('hidden');
                form.reset();
                renderItemRows();

                if (tg) {
                    setTimeout(() => {
                        tg.close();
                    }, 2000);
                }
            } else {
                alert('خطا در ثبت اطلاعات: ' + result.message);
            }
        } catch (error) {
            console.error('Error!', error.message);
            alert('خطا در برقراری ارتباط با سرور.');
        } finally {
            submitBtn.innerHTML = originalBtnHtml;
            submitBtn.disabled = false;
            submitBtn.classList.replace('bg-gray-400', 'bg-teal');
        }
    });
}
