// ۱. مقداردهی اولیه تلگرام (اگر صفحه داخل ربات باز شده باشد)
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.expand(); // باز کردن صفحه به صورت تمام‌صفحه در گوشی
}

// بستن صفحه با دکمه ضربدر هدر (با شرط بررسی وجود دکمه برای جلوگیری از توقف کدها)
const closeBtn = document.getElementById('close-btn');
if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // بررسی اینکه آیا داخل محیط تلگرام هستیم یا خیر
        if (tg && tg.platform !== "unknown" && tg.platform !== "") {
            tg.close(); // بستن مینی‌اپ در تلگرام
        } else {
            window.location.href = 'index.html'; // بازگشت به صفحه اصلی در مرورگر عادی
        }
    });
}

// ۲. هندل کردن ارسال فرم
const form = document.getElementById('video-form');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('success-message');

// لینک Google Apps Script
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
    
    // اضافه کردن تگ حیاتی برای شناسایی نوع فرم در بک‌اند Google Apps Script
    const dataObj = { 
        formType: "video",
        timestamp: new Date().toLocaleString('fa-IR')
    };

    // مدیریت چک‌باکس‌های چندگانه (مانند پلتفرم‌های انتشار)
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

    // تبدیل آرایه‌ها به رشته متنی جهت ثبت یکپارچه در جدول گوگل شیت
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
                'Content-Type': 'text/plain;charset=utf-8' // جلوگیری از خطای CORS در Apps Script
            },
            body: JSON.stringify(dataObj),
            redirect: 'follow'
        });
        
        const result = await response.json();
        
        if (result.result === 'success') {
            successMsg.classList.remove('hidden');
            form.reset();
            
            // بستن خودکار مینی‌اپ تلگرام بعد از ۲ ثانیه در صورت باز بودن در تلگرام
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



// ==========================================
// توابع مدیریت هدر (اسکرول، منوی موبایل و اسپسر)
// ==========================================

// ۱. تنظیم خودکار ارتفاع فاصله‌ی زیر هدر ثابت
function adjustHeaderSpacer() {
    const header = document.getElementById('window-header') || document.getElementById('header') || document.getElementById('elevator-header');
    const spacer = document.getElementById('header-spacer');
    if (header && spacer) {
        spacer.style.height = header.offsetHeight + 'px';
    }
}

// ۲. مقداردهی و مدیریت کشوی منوی موبایل
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('mobile-menu-icon');
    if (!btn || !menu) return;

    function closeMenu() {
        menu.classList.add('hidden');
        btn.setAttribute('aria-expanded', 'false');
        if (icon) { 
            icon.classList.remove('fa-times'); 
            icon.classList.add('fa-bars'); 
        }
        adjustHeaderSpacer();
    }

    function openMenu() {
        menu.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
        if (icon) { 
            icon.classList.remove('fa-bars'); 
            icon.classList.add('fa-times'); 
        }
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

// ۳. تغییر حالت هدر هنگام اسکرول (تبدیل از سرمه‌ای/دارک به سفید/لایت)
function initHeaderScroll() {
    const header = document.getElementById('window-header') || document.getElementById('header') || document.getElementById('elevator-header');
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

            if (logoDark && logoLight) { 
                logoLight.classList.add('hidden'); 
                logoDark.classList.remove('hidden'); 
            }
            if (desktopMenu) { 
                desktopMenu.classList.remove('text-white'); 
                desktopMenu.classList.add('text-slate-800'); 
            }
            if (mobileMenuBtn) { 
                mobileMenuBtn.classList.remove('bg-white/20', 'text-white', 'border-white/30'); 
                mobileMenuBtn.classList.add('bg-slate-100', 'text-slate-800', 'border-slate-300'); 
            }
            if (homeBtn) { 
                homeBtn.classList.remove('bg-white/10', 'text-white'); 
                homeBtn.classList.add('bg-slate-100', 'text-slate-800'); 
            }
            if (title) { title.style.setProperty('color', '#0f172a', 'important'); }
            if (subtitle) { subtitle.style.setProperty('color', '#64748b', 'important'); }

        } else {
            header.style.cssText = 'background-color: #0f172a !important; backdrop-filter: blur(12px) !important;';
            header.classList.remove('text-slate-800', 'shadow-md');
            header.classList.add('text-white');

            if (logoDark && logoLight) { 
                logoDark.classList.add('hidden'); 
                logoLight.classList.remove('hidden'); 
            }
            if (desktopMenu) { 
                desktopMenu.classList.remove('text-slate-800'); 
                desktopMenu.classList.add('text-white'); 
            }
            if (mobileMenuBtn) { 
                mobileMenuBtn.classList.remove('bg-slate-100', 'text-slate-800', 'border-slate-300'); 
                mobileMenuBtn.classList.add('bg-white/20', 'text-white', 'border-white/30'); 
            }
            if (homeBtn) { 
                homeBtn.classList.remove('bg-slate-100', 'text-slate-800'); 
                homeBtn.classList.add('bg-white/10', 'text-white'); 
            }
            if (title) { title.style.setProperty('color', '#ffffff', 'important'); }
            if (subtitle) { subtitle.style.setProperty('color', '#d1d5db', 'important'); }
        }
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();
}

// ۴. فراخوانی اولیه در هنگام بارگذاری صفحه
document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    adjustHeaderSpacer();
});

window.addEventListener('load', adjustHeaderSpacer);
window.addEventListener('resize', adjustHeaderSpacer);