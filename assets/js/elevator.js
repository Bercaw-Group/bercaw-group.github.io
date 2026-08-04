
        // ۱. مقداردهی اولیه تلگرام (اگر صفحه داخل ربات باز شده باشد)
        const tg = window.Telegram ? window.Telegram.WebApp : null;
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

        // ۲. هندل کردن ارسال فرم
        const form = document.getElementById('elevator-form');
        const submitBtn = document.getElementById('submit-btn');
        const successMsg = document.getElementById('success-message');

        // ⚠️ مهم: لینک Google Apps Script خود را که در مرحله قبل Deploy کردید اینجا قرار دهید ⚠️
        const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbztx9C3R5Mm3VBnMU9OPGXbb7RIgZMcX8K6yUtuLeYaQ6ai-mtyJWIQu-joQws1CtLO/exec'; 

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // تغییر ظاهر دکمه هنگام ارسال
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ارسال...';
            submitBtn.disabled = true;
            submitBtn.classList.replace('bg-teal', 'bg-gray-400');

            // جمع‌آوری اطلاعات فرم
            const formData = new FormData(form);
            
            // اضافه کردن تگ حیاتی برای شناسایی در اسکریپت بک‌اند
            const dataObj = { 
                formType: "elevator",
                timestamp: new Date().toLocaleString('fa-IR')
            };

            // مدیریت چک‌باکس‌های چندگانه (مثل وضعیت اجرا)
            formData.forEach((value, key) => {
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

            // تبدیل آرایه‌ها به رشته متنی برای ثبت در اکسل
            for (let key in dataObj) {
                if (Array.isArray(dataObj[key])) {
                    dataObj[key] = dataObj[key].join('، ');
                }
            }

            try {
                // ارسال به گوگل شیت
const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain;charset=utf-8' // برای جلوگیری از خطای پیش‌درخواست CORS
    },
    body: JSON.stringify(dataObj),
    redirect: 'follow' // بسیار مهم برای Google Apps Script
});
                
                const result = await response.json();
                
                if (result.result === 'success') {
                    successMsg.classList.remove('hidden');
                    form.reset();
                    
                    // اگر در تلگرام هستیم، بعد از ۲ ثانیه پاپ‌آپ را ببند
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
                // بازگردانی دکمه به حالت اول
                submitBtn.innerHTML = originalBtnHtml;
                submitBtn.disabled = false;
                submitBtn.classList.replace('bg-gray-400', 'bg-teal');
            }
        });