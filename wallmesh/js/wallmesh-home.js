console.log('🚀 wallmesh/wallmesh-home.js loaded');

const FIXED_CATEGORY = 'والمش';

function getCloudinaryThumbnail(url, width = 500) {
    if (!url || typeof url !== 'string') return url;
    if (!url.includes('cloudinary.com')) return url;

    const isVideo = url.includes('/video/upload/') || /\.(mp4|webm|mov|mkv)($|\?)/i.test(url);

    // اگر لینک مربوط به ویدیو باشد
    if (isVideo) {
        let cleanUrl = url.replace(/\.(mp4|webm|mov|mkv)($|\?)/i, '.jpg$2');
        if (cleanUrl.includes('/video/upload/')) {
            cleanUrl = cleanUrl.replace('/video/upload/', '/video/upload/so_0/');
        }
        if (!cleanUrl.includes('/upload/w_')) {
            cleanUrl = cleanUrl.replace('/upload/', `/upload/w_${width},c_limit,q_auto,f_auto/`);
        }
        return cleanUrl;
    }

    // برای تصاویر معمولی
    if (!url.includes('/upload/')) return url;
    if (url.includes('/upload/w_') || url.includes('/upload/c_') || url.includes('/upload/q_auto')) return url;
    return url.replace('/upload/', `/upload/w_${width},c_limit,q_auto,f_auto/`);
}

// نرمال‌سازی متن: حذف فاصله‌های اضافه/کاراکترهای نامرئی و یکسان‌سازی
function normalizeText(text) {
    if (!text) return '';
    return text
        .toString()
        .trim()
        .replace(/[\u200B-\u200F\uFEFF]/g, '')
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک')
        .replace(/\s+/g, ' ');
}

const FIXED_CATEGORY_NORMALIZED = normalizeText(FIXED_CATEGORY);

const PRICE_LIST_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=0&single=true&output=csv";
const CATALOGS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=820346513&single=true&output=csv";
const SAMPLES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=378766511&single=true&output=csv";

const PRODUCTS_PREVIEW_COUNT = 4;
const PORTFOLIO_PREVIEW_COUNT = 4;

function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, idx) => { row[header] = values[idx]; });
            data.push(row);
        }
    }
    return data;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') { current += '"'; i++; }
            else { inQuotes = !inQuotes; }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function formatPrice(price) {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ===== تنظیم خودکار ارتفاع فاصله‌ی زیر هدر ثابت =====
function adjustHeaderSpacer() {
    const header = document.getElementById('wallmesh-header') || document.getElementById('header');
    const spacer = document.getElementById('header-spacer');
    if (header && spacer) {
        spacer.style.height = header.offsetHeight + 'px';
    }
}

window.addEventListener('load', adjustHeaderSpacer);
window.addEventListener('resize', adjustHeaderSpacer);
adjustHeaderSpacer();

// ===== منوی موبایل =====
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

// ===== پیش‌نمایش محصولات =====
async function loadProductsPreview() {
    const loading = document.getElementById('products-loading');
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    try {
        const response = await fetch(PRICE_LIST_CSV + '&t=' + Date.now());
        const text = await response.text();
        const all = parseCSV(text);

        const categoryProducts = all.filter(p => normalizeText(p.Category) === FIXED_CATEGORY_NORMALIZED);

        if (loading) loading.style.display = 'none';

        const countEl = document.getElementById('products-count');
        if (countEl) countEl.textContent = categoryProducts.length;

        if (categoryProducts.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">هنوز محصولی برای این دسته ثبت نشده است</div>';
            return;
        }

        grid.innerHTML = categoryProducts.slice(0, PRODUCTS_PREVIEW_COUNT).map(p => {
            const thumbUrl = getCloudinaryThumbnail(p.ImageLink, 450);
            const imageHtml = p.ImageLink && p.ImageLink.trim()
                ? `<img src="${thumbUrl}" alt="${p.Title}" class="w-full h-48 object-cover">`
                : `<div class="w-full h-48 bg-gradient-to-br from-teal/10 to-navy/10 flex items-center justify-center"><i class="fas fa-box text-5xl text-gray-300"></i></div>`;

            return `
                <a href="wallmesh-products.html" class="product-card block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                    ${imageHtml}
                    <div class="p-5">
                        <h3 class="text-lg font-bold text-navy mb-2 line-clamp-2 min-h-[3.5rem]">${p.Title || 'محصول'}</h3>
                        ${p.Brand ? `<p class="text-gray-600 text-sm mb-3"><i class="fas fa-tag ml-1 text-teal"></i>${p.Brand}</p>` : ''}
                        <span class="text-xl font-bold text-teal">
                            ${!isNaN(p.Price) && p.Price && p.Price.trim() !== '' ? `${formatPrice(p.Price)} <span class="text-xs">تومان</span>` : (p.Price || '')}
                        </span>
                    </div>
                </a>
            `;
        }).join('');

    } catch (error) {
        console.error('❌ خطا در دریافت محصولات:', error);
        if (loading) loading.style.display = 'none';
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">خطا در دریافت محصولات</div>';
    }
}

// ===== FAQ Accordion =====
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
            const answer = item.querySelector('.faq-answer');
            if (answer) answer.classList.add('hidden');
        });
        
        if (!isActive) {
            faqItem.classList.add('active');
            const answer = faqItem.querySelector('.faq-answer');
            if (answer) answer.classList.remove('hidden');
        }
    });
});

// ===== کاتالوگ‌های همین دسته =====
async function loadCatalogs() {
    const loading = document.getElementById('catalogs-loading');
    const grid = document.getElementById('catalogs-grid');
    const section = document.getElementById('catalogs');
    if (!grid) return;

    try {
        const response = await fetch(CATALOGS_CSV + '&t=' + Date.now());
        const text = await response.text();
        const all = parseCSV(text);

        const categoryCatalogs = all.filter(c => normalizeText(c.Category) === FIXED_CATEGORY_NORMALIZED);

        if (loading) loading.style.display = 'none';

        if (categoryCatalogs.length === 0) {
            if (section) section.style.display = 'none';
            return;
        }

        grid.innerHTML = categoryCatalogs.map(c => {
            const thumbUrl = getCloudinaryThumbnail(c.CoverImage, 500);
            const imageHtml = c.CoverImage && c.CoverImage.trim()
                ? `<div class="relative h-72 overflow-hidden"><img src="${thumbUrl}" alt="${c.Title}" class="w-full h-full object-cover hover:scale-110 transition duration-500"></div>`
                : `<div class="h-72 bg-gradient-to-br from-navy to-teal flex items-center justify-center"><i class="fas fa-file-pdf text-white text-6xl opacity-30"></i></div>`;

            return `
                <div class="catalog-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                    ${imageHtml}
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-navy mb-3">${c.Title || 'بدون عنوان'}</h3>
                        ${c.Description ? `<p class="text-gray-600 mb-4 line-clamp-2">${c.Description}</p>` : ''}
                        ${c.PdfUrl ? `<a href="${c.PdfUrl}" target="_blank" class="inline-flex items-center gap-2 bg-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy transition w-full justify-center"><i class="fas fa-download"></i>دانلود کاتالوگ PDF</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('❌ خطا در دریافت کاتالوگ‌ها:', error);
        if (loading) loading.style.display = 'none';
        if (section) section.style.display = 'none';
    }
}

// ===== پیش‌نمایش نمونه‌کارها =====
async function loadPortfolioPreview() {
    const loading = document.getElementById('portfolio-loading');
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    try {
        const response = await fetch(SAMPLES_CSV + '&t=' + Date.now());
        const text = await response.text();
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        const projects = [];

        for (let i = 1; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i]);
            if (cols.length >= 2 && normalizeText(cols[1]) === FIXED_CATEGORY_NORMALIZED) {
                const rawImages = [cols[3], cols[4], cols[5], cols[6], cols[7]];
                const validImages = rawImages.filter(img => img && img.trim().length > 0);
                projects.push({
                    category: cols[1] || '',
                    title: cols[2] || 'بدون عنوان',
                    image: validImages[0] || '../assets/images/logo.png',
                    city: cols[8] || '',
                    description: cols[9] || ''
                });
            }
        }

        if (loading) loading.style.display = 'none';

        if (projects.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">هنوز نمونه‌کاری برای این دسته ثبت نشده است</div>';
            return;
        }

        grid.innerHTML = projects.slice(0, PORTFOLIO_PREVIEW_COUNT).map(p => {
            const thumbUrl = getCloudinaryThumbnail(p.image, 500);
            return `
                <a href="wallmesh-portfolio.html" class="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition duration-300 flex flex-col group">
                    <div class="relative h-72 bg-gray-100 overflow-hidden">
                        <img src="${thumbUrl}" alt="${p.title}" class="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                             onerror="this.src='../assets/images/logo.png'; this.classList.add('p-8','object-contain');">
                    </div>
                    <div class="p-6 flex flex-col flex-grow">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-semibold">${p.category}</span>
                            ${p.city ? `<span class="text-xs text-gray-500 flex items-center"><i class="fas fa-map-marker-alt text-teal ml-1"></i>${p.city}</span>` : ''}
                        </div>
                        <h3 class="text-xl font-bold text-navy mb-2 group-hover:text-teal transition">${p.title}</h3>
                        <p class="text-gray-600 text-sm line-clamp-2 leading-relaxed mt-1">${p.description || 'برای مشاهده جزئیات کلیک کنید'}</p>
                    </div>
                </a>
            `;
        }).join('');

    } catch (error) {
        console.error('❌ خطا در دریافت نمونه‌کارها:', error);
        if (loading) loading.style.display = 'none';
        grid.innerHTML = '<div class="col-span-full text-center py-8 text-red-500">خطا در دریافت نمونه‌کارها</div>';
    }
}

// ===== Scroll to Top & Floating Actions Container =====
const floatingActions = document.getElementById('floating-actions');
const scrollTopBtn = document.getElementById('scroll-top');

if (floatingActions) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            floatingActions.classList.remove('opacity-0', 'pointer-events-none');
            floatingActions.classList.add('opacity-100', 'pointer-events-auto');
        } else {
            floatingActions.classList.remove('opacity-100', 'pointer-events-auto');
            floatingActions.classList.add('opacity-0', 'pointer-events-none');
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ===== تغییر حالت هدر (دارک به لایت با اسکرول) =====
function initHeaderScroll() {
    const header = document.getElementById('wallmesh-header') || document.getElementById('header');
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

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    loadProductsPreview();
    loadCatalogs();
    loadPortfolioPreview();
});