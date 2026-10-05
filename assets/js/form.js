// ===== Cloudflare Worker Web App URL =====
const FORM_SCRIPT_URL = 'https://flat-fire-a0d0.zeya-hashemi.workers.dev/api/submit';

function closeConsultationModal() {}

// ===== ۱. تنظیم خودکار ارتفاع فاصله‌ی زیر هدر ثابت =====
function adjustHeaderSpacer() {
    const header = document.getElementById("brick-header") || document.getElementById("header") || document.getElementById("main-header");
    const spacer = document.getElementById("header-spacer");
    if (header && spacer) {
        spacer.style.height = header.offsetHeight + "px";
    }
}

// ===== ۲. مدیریت منوی موبایل =====
function initMobileMenu() {
    const btn = document.getElementById("mobile-menu-btn");
    const menu = document.getElementById("mobile-menu");
    const icon = document.getElementById("mobile-menu-icon");
    if (!btn || !menu) return;

    function closeMenu() {
        menu.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
        if (icon) { icon.classList.remove("fa-times"); icon.classList.add("fa-bars"); }
        adjustHeaderSpacer();
    }

    function openMenu() {
        menu.classList.remove("hidden");
        btn.setAttribute("aria-expanded", "true");
        if (icon) { icon.classList.remove("fa-bars"); icon.classList.add("fa-times"); }
        adjustHeaderSpacer();
    }

    btn.addEventListener("click", () => {
        const isOpen = !menu.classList.contains("hidden");
        isOpen ? closeMenu() : openMenu();
    });

    menu.querySelectorAll(".mobile-menu-link").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 1024) closeMenu();
    });
}

// ===== ۳. تغییر حالت هدر هنگام اسکرول =====
function initHeaderScroll() {
    const header = document.getElementById("brick-header") || document.getElementById("header") || document.getElementById("main-header");
    const logoDark = document.getElementById("header-logo-dark");
    const logoLight = document.getElementById("header-logo-light");
    const title = document.getElementById("header-title");
    const subtitle = document.getElementById("header-subtitle") || document.getElementById("header-sub");
    const desktopMenu = document.getElementById("desktop-menu");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const homeBtn = document.getElementById("header-home-btn");
    const smartBackBtn = document.getElementById("smart-back-btn");

    if (!header) return;

    function handleScroll() {
        if (window.scrollY > 30) {
            header.style.cssText = "background-color: #ffffff !important; backdrop-filter: none;";
            header.classList.remove("text-white", "bg-navy");
            header.classList.add("text-slate-800", "shadow-md");

            if (logoDark && logoLight) { logoLight.classList.add("hidden"); logoDark.classList.remove("hidden"); }
            if (desktopMenu) { desktopMenu.classList.remove("text-white"); desktopMenu.classList.add("text-slate-800"); }

            if (mobileMenuBtn) {
                mobileMenuBtn.classList.remove("bg-white/10", "bg-white/20", "text-white", "border-transparent");
                mobileMenuBtn.classList.add("bg-slate-100", "text-slate-800", "border", "border-slate-300");
            }
            if (homeBtn) { homeBtn.classList.remove("bg-white/10", "text-white"); homeBtn.classList.add("bg-slate-100", "text-slate-800"); }
            if (smartBackBtn) { smartBackBtn.classList.remove("bg-white/10", "text-white"); smartBackBtn.classList.add("bg-slate-100", "text-slate-800"); }

            if (title) title.style.setProperty("color", "#0f172a", "important");
            if (subtitle) subtitle.style.setProperty("color", "#64748b", "important");

        } else {
            header.style.cssText = "background-color: #0a192f !important; backdrop-filter: blur(12px) !important;";
            header.classList.remove("text-slate-800", "shadow-md");
            header.classList.add("text-white", "bg-navy");

            if (logoDark && logoLight) { logoDark.classList.add("hidden"); logoLight.classList.remove("hidden"); }
            if (desktopMenu) { desktopMenu.classList.remove("text-slate-800"); desktopMenu.classList.add("text-white"); }

            if (mobileMenuBtn) {
                mobileMenuBtn.classList.remove("bg-slate-100", "text-slate-800", "border", "border-slate-300");
                mobileMenuBtn.classList.add("bg-white/10", "text-white", "border-transparent");
            }
            if (homeBtn) { homeBtn.classList.remove("bg-slate-100", "text-slate-800"); homeBtn.classList.add("bg-white/10", "text-white"); }
            if (smartBackBtn) { smartBackBtn.classList.remove("bg-slate-100", "text-slate-800"); smartBackBtn.classList.add("bg-white/10", "text-white"); }

            if (title) title.style.setProperty("color", "#ffffff", "important");
            if (subtitle) subtitle.style.setProperty("color", "#d1d5db", "important");
        }
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();
}

// ===== ۴. بازگشت هوشمند به صفحه قبل =====
function initBackButton() {
    const backBtn = document.getElementById("back-to-previous-btn");
    if (backBtn) {
        backBtn.addEventListener("click", function (e) {
            e.preventDefault();
            if (document.referrer && document.referrer.includes(window.location.host)) {
                window.history.back();
            } else {
                window.location.href = "index.html";
            }
        });
    }
}

// ===== ۵. اعتبارسنجی شماره تلفن =====
function initPhoneValidation() {
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value;
            const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
            const englishDigits = '0123456789';

            for (let i = 0; i < persianDigits.length; i++) {
                value = value.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
            }

            value = value.replace(/[^0-9]/g, '');
            if (value.length > 11) value = value.slice(0, 11);

            e.target.value = value;
        });
    }
}

// ===== ۶. استایل‌دهی اعتبارسنجی ورودی‌ها =====
function initInputValidationStyles() {
    const formInputs = document.querySelectorAll('#consultation-form input, #consultation-form select, #consultation-form textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                input.classList.add('border-red-500');
                input.classList.remove('border-gray-200');
            } else {
                input.classList.remove('border-red-500');
                input.classList.add('border-gray-200');
            }
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('border-red-500') && input.value.trim()) {
                input.classList.remove('border-red-500');
                input.classList.add('border-gray-200');
            }
        });
    });
}

// ===== ۷. ارسال فرم مشاوره =====
function initConsultationForm() {
    const consultationForm = document.getElementById('consultation-form');
    if (!consultationForm) return;

    consultationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const consultationAreas = formData.getAll('consultationAreas');
        if (consultationAreas.length === 0) {
            alert('لطفاً حداقل یک حوزه مشاوره را انتخاب کنید');
            return;
        }

        const data = {
            formType: 'consultation',
            timestamp: new Date().toLocaleString('fa-IR'),
            fullName: formData.get('fullName'),
            phone: formData.get('phone'),
            projectType: formData.get('projectType'),
            executedBy: formData.get('executedBy'),
            consultationAreas: consultationAreas,
            description: formData.get('description') || '-'
        };

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        const successMsg = document.getElementById('form-success');
        const errorMsg = document.getElementById('form-error');

        if (successMsg) successMsg.classList.add('hidden');
        if (errorMsg) errorMsg.classList.add('hidden');

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> در حال ارسال...';

        try {
            const response = await fetch(FORM_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('خطا در پاسخ سرور');
            }

            if (successMsg) {
                successMsg.innerHTML = `
                    <i class="fas fa-check-circle text-2xl mb-1 block text-green-600"></i>
                    درخواست شما با موفقیت ثبت شد. <br>
                    همکاران ما در اسرع وقت با شما تماس می‌گیرند. <br>
                    از صبوری شما سپاسگزاریم 🌿
                `;
                successMsg.classList.remove('hidden');
                successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            form.reset();
            submitBtn.innerHTML = '<i class="fas fa-check ml-2"></i> ارسال شد ✅';
            submitBtn.classList.remove('bg-teal');
            submitBtn.classList.add('bg-green-600');

            setTimeout(() => {
                closeConsultationModal();
                submitBtn.innerHTML = originalBtnText;
                submitBtn.classList.remove('bg-green-600');
                submitBtn.classList.add('bg-teal');
                submitBtn.disabled = false;
            }, 5000);

        } catch (error) {
            console.error('❌ Form error:', error);
            if (errorMsg) {
                errorMsg.textContent = 'خطا در ارسال درخواست. لطفاً دوباره تلاش کنید.';
                errorMsg.classList.remove('hidden');
            }
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// ===== تابع دکمه هوشمند بازگشت به صفحه قبل =====
function initSmartBackButton() {
    const backBtns = document.querySelectorAll(".smart-back-btn");
    if (!backBtns.length) return;

    backBtns.forEach(backBtn => {
        backBtn.addEventListener("click", function (e) {
            e.preventDefault();

            const hasHistory = window.history.length > 1;
            const isInternalReferrer = document.referrer && document.referrer.includes(window.location.host);

            if (isInternalReferrer && hasHistory) {
                window.history.back();
            } else {
                window.location.href = backBtn.getAttribute("href") || "../index.html";
            }
        });
    });
}

// ===== مدیریت اجرای توابع هنگام آماده‌سازی DOM =====
document.addEventListener("DOMContentLoaded", () => {
    adjustHeaderSpacer();
    initMobileMenu();
    initHeaderScroll();
    initBackButton();
    initPhoneValidation();
    initInputValidationStyles();
    initConsultationForm();
    initSmartBackButton();
});

window.addEventListener("load", adjustHeaderSpacer);
window.addEventListener("resize", adjustHeaderSpacer);