console.log('🚀 sheets.js - FINAL COMPLETE VERSION');

// ===== Google Sheets CSV URLs =====
const PRICE_LIST_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=0&single=true&output=csv";
const CATALOGS_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=820346513&single=true&output=csv";
const SAMPLES_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=378766511&single=true&output=csv";

let productsData = [];
let catalogsData = [];
let samplesData = [];

// ===== CSV Parser with Quote Support =====
function parseCSV(csvText) {
    console.log('📊 Parsing CSV, length:', csvText.length);
    
    try {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
        console.log('Total lines:', lines.length);
        
        if (lines.length < 2) {
            console.error('❌ Not enough lines in CSV');
            return [];
        }
        
        const headers = parseCSVLine(lines[0]);
        console.log('📋 Headers:', headers);
        
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, idx) => {
                    row[header] = values[idx];
                });
                data.push(row);
            }
        }
        
        console.log('✅ Parsed', data.length, 'rows');
        if (data.length > 0) console.log('First row:', data[0]);
        
        return data;
        
    } catch (error) {
        console.error('❌ Parse error:', error);
        return [];
    }
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
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

// ===== Utilities =====
function formatPrice(price) {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getStatusClass(status) {
    if (!status) return 'info';
    if (status.includes('موجود')) return 'success';
    if (status.includes('ناموجود')) return 'warning';
    return 'info';
}

// ===== Fetch Products =====
async function fetchProducts() {
    console.log('📦 fetchProducts started');
    
    const loading = document.getElementById('products-loading');
    const grid = document.getElementById('products-categories-grid');
    
    if (!grid) {
        console.error('❌ Grid element not found');
        return;
    }
    
    try {
        if (loading) loading.style.display = 'block';
        
        const url = PRICE_LIST_CSV + '&t=' + Date.now();
        console.log('📡 Fetching:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const text = await response.text();
        console.log('📥 Received:', text.length, 'chars');
        
        productsData = parseCSV(text);
        console.log('Products data:', productsData.length, 'items');
        
        if (loading) loading.style.display = 'none';
        
        if (productsData.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 bg-yellow-50 rounded-lg p-6">
                    <i class="fas fa-exclamation-triangle text-5xl text-yellow-500 mb-4"></i>
                    <p class="text-xl text-gray-700 font-bold">داده‌ای پارس نشد</p>
                    <p class="text-gray-600 mt-2">لطفاً ساختار Google Sheet را بررسی کنید</p>
                </div>
            `;
            return;
        }
        
        const count = document.getElementById('total-products-count');
        if (count) count.textContent = productsData.length;
        
        renderCategories(productsData);
        
    } catch (error) {
        console.error('❌ Error:', error);
        if (loading) loading.style.display = 'none';
        if (grid) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-12 bg-red-50 rounded-lg p-6">
                    <i class="fas fa-times-circle text-5xl text-red-500 mb-4"></i>
                    <p class="text-xl text-gray-700 font-bold">خطا در بارگذاری</p>
                    <p class="text-gray-600 mt-2">${error.message}</p>
                    <button onclick="fetchProducts()" class="mt-4 bg-teal text-white px-6 py-3 rounded-lg hover:bg-navy transition">
                        <i class="fas fa-redo ml-2"></i> تلاش مجدد
                    </button>
                </div>
            `;
        }
    }
}

// ===== Render Products =====
function renderProducts(products) {
    console.log('🎨 Rendering', products.length, 'products');
    
    const grid = document.getElementById('products-preview-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    products.forEach((p, i) => {
        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300';
        card.setAttribute('data-aos', 'fade-up');
        
        const imageHtml = p.ImageLink && p.ImageLink.trim()
            ? `<img src="${p.ImageLink}" alt="${p.Title}" class="w-full h-48 object-cover cursor-pointer" onclick="openLightbox('${p.ImageLink}')" onerror="this.parentElement.innerHTML='<div class=\\'w-full h-48 bg-gray-200 flex items-center justify-center\\'><i class=\\'fas fa-image text-4xl text-gray-400\\'></i></div>'">`
            : `<div class="w-full h-48 bg-gradient-to-br from-teal/10 to-navy/10 flex items-center justify-center">
                <i class="fas fa-box text-5xl text-gray-300"></i>
               </div>`;
        
        card.innerHTML = `
            ${imageHtml}
            <div class="p-6">
                ${p.Category ? `<span class="inline-block bg-teal/10 text-teal px-3 py-1 rounded-full text-sm font-semibold mb-3">${p.Category}</span>` : ''}
                <h3 class="text-xl font-bold text-navy mb-2 line-clamp-2">${p.Title || 'محصول ' + (i + 1)}</h3>
                ${p.Brand ? `<p class="text-gray-600 mb-3"><i class="fas fa-tag ml-2"></i>${p.Brand}</p>` : ''}
                <div class="flex justify-between items-center flex-wrap gap-2">
                    <span class="text-2xl font-bold text-teal">${formatPrice(p.Price)} <span class="text-sm">تومان</span></span>
                    ${p.Unit ? `<span class="text-gray-500 text-sm">${p.Unit}</span>` : ''}
                </div>
                ${p.Status ? `<div class="mt-3"><span class="badge badge-${getStatusClass(p.Status)}">${p.Status}</span></div>` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    console.log('✅ Render complete');
}

// ===== Fetch Catalogs =====
async function fetchCatalogs() {
    console.log('📚 fetchCatalogs started');
    
    const loading = document.getElementById('catalogs-loading');
    const grid = document.getElementById('catalogs-grid');
    
    if (!grid) return;
    
    try {
        if (loading) loading.style.display = 'block';
        
        const response = await fetch(CATALOGS_CSV + '&t=' + Date.now());
        const text = await response.text();
        
        catalogsData = parseCSV(text);
        console.log('Catalogs:', catalogsData.length);
        
        if (loading) loading.style.display = 'none';
        
        if (catalogsData.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">کاتالوگی یافت نشد</div>';
            return;
        }
        
        renderCatalogFilters();
        renderCatalogs(catalogsData);
        
    } catch (error) {
        console.error('❌ Catalogs error:', error);
        if (loading) loading.style.display = 'none';
    }
}

function renderCatalogFilters() {
    const categories = [...new Set(catalogsData.map(c => c.Category).filter(c => c && c.trim()))];
    const container = document.getElementById('catalog-filters');
    
    if (!container) return;
    
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn px-6 py-2 rounded-full bg-gray-200 text-navy font-medium transition hover:bg-teal hover:text-white';
        btn.textContent = cat;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('#catalog-filters .filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-teal', 'text-white');
                b.classList.add('bg-gray-200', 'text-navy');
            });
            btn.classList.add('active', 'bg-teal', 'text-white');
            
            renderCatalogs(catalogsData.filter(c => c.Category === cat));
        });
        
        container.appendChild(btn);
    });
}

function renderCatalogs(catalogs) {
    const grid = document.getElementById('catalogs-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (catalogs.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">کاتالوگی یافت نشد</div>';
        return;
    }
    
    catalogs.forEach(c => {
        const card = document.createElement('div');
        card.className = 'catalog-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300';
        card.setAttribute('data-aos', 'fade-up');
        
        const imageHtml = c.CoverImage && c.CoverImage.trim()
            ? `<div class="relative h-64 overflow-hidden">
                <img src="${c.CoverImage}" alt="${c.Title}" class="w-full h-full object-cover hover:scale-110 transition duration-500">
                ${c.Category ? `<span class="absolute top-4 right-4 bg-teal text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">${c.Category}</span>` : ''}
               </div>`
            : `<div class="h-64 bg-gradient-to-br from-navy to-teal flex items-center justify-center">
                <i class="fas fa-file-pdf text-white text-6xl opacity-30"></i>
               </div>`;
        
        card.innerHTML = `
            ${imageHtml}
            <div class="p-6">
                <h3 class="text-xl font-bold text-navy mb-3">${c.Title || 'بدون عنوان'}</h3>
                ${c.Description ? `<p class="text-gray-600 mb-4 line-clamp-2">${c.Description}</p>` : ''}
                ${c.PdfUrl ? `<a href="${c.PdfUrl}" target="_blank" class="inline-flex items-center gap-2 bg-teal text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy transition w-full justify-center"><i class="fas fa-download"></i>دانلود کاتالوگ PDF</a>` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// ===== Fetch Samples =====
async function fetchSamples() {
    console.log('🏗️ fetchSamples started');
    
    const loading = document.getElementById('portfolio-loading');
    const grid = document.getElementById('portfolio-grid');
    
    if (!grid) return;
    
    try {
        if (loading) loading.style.display = 'block';
        
        const response = await fetch(SAMPLES_CSV + '&t=' + Date.now());
        const text = await response.text();
        
        samplesData = parseCSV(text);
        console.log('Samples:', samplesData.length);
        
        if (loading) loading.style.display = 'none';
        
        if (samplesData.length === 0) {
            grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">نمونه کاری یافت نشد</div>';
            return;
        }
        
        renderPortfolioFilters();
        renderPortfolio(samplesData);
        
    } catch (error) {
        console.error('❌ Samples error:', error);
        if (loading) loading.style.display = 'none';
    }
}

function renderPortfolioFilters() {
    const categories = [...new Set(samplesData.map(s => s.Category).filter(c => c && c.trim()))];
    const container = document.getElementById('portfolio-filters');
    
    if (!container) return;
    
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn px-6 py-2 rounded-full bg-gray-200 text-navy font-medium transition hover:bg-teal hover:text-white';
        btn.textContent = cat;
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('#portfolio-filters .filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-teal', 'text-white');
                b.classList.add('bg-gray-200', 'text-navy');
            });
            btn.classList.add('active', 'bg-teal', 'text-white');
            
            renderPortfolio(samplesData.filter(s => s.Category === cat));
        });
        
        container.appendChild(btn);
    });
}

// ===== تابع کمکی جهت دریافت هوشمند لینک عکس =====
function getSampleImage(s) {
    // ۱. بررسی نام‌های متداول ستون عکس
    if (s.Image && s.Image.trim()) return s.Image.trim();
    if (s['Image 1'] && s['Image 1'].trim()) return s['Image 1'].trim();
    if (s.Image1 && s.Image1.trim()) return s.Image1.trim();
    if (s.ImageLink && s.ImageLink.trim()) return s.ImageLink.trim();
    
    // ۲. پشتیبانی از ترتیب ستون‌ها (اگر نام هدر متفاوت باشد)
    const keys = Object.keys(s);
    for (let i = 3; i <= 7; i++) {
        if (keys[i] && s[keys[i]] && s[keys[i]].trim()) {
            return s[keys[i]].trim();
        }
    }
    
    return 'assets/images/logo.png';
}

// ===== Render Portfolio Cards =====
function renderPortfolio(samples) {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (samples.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">نمونه کاری یافت نشد</div>';
        return;
    }
    
    samples.forEach((s) => {
        const card = document.createElement('div');
        card.className = 'bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition duration-300 flex flex-col group cursor-pointer';
        card.setAttribute('data-aos', 'fade-up');
        
        // دریافت هوشمند آدرس تصویر، موقعیت و توضیحات
        const imageSrc = getSampleImage(s);
        const keys = Object.keys(s);
        const location = s.Location || s.City || s.city || (keys[8] ? s[keys[8]] : '');
        const description = s.Description || (keys[9] ? s[keys[9]] : '');
        
        // بخش تصویر بالای کارت با ارتفاع h-96 (هم‌اندازه با صفحه portfolio)
        const imageHtml = `
            <div class="relative h-96 bg-gray-100 overflow-hidden select-none">
                <img src="${imageSrc}" alt="${s.Title || 'نمونه کار'}" 
                     class="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                     onerror="this.src='assets/images/logo.png'; this.classList.add('p-8','object-contain');">
            </div>
        `;
        
        // بخش اطلاعات زیر تصویر
        card.innerHTML = `
            ${imageHtml}
            <div class="p-6 flex flex-col flex-grow">
                <div class="flex items-center justify-between gap-2 mb-3">
                    ${s.Category ? `<span class="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-semibold">${s.Category}</span>` : ''}
                    ${location ? `
                        <span class="text-xs text-gray-500 flex items-center">
                            <i class="fas fa-map-marker-alt text-teal ml-1"></i>${location}
                        </span>
                    ` : ''}
                </div>

                <h3 class="text-xl font-bold text-navy mb-2 group-hover:text-teal transition">${s.Title || 'بدون عنوان'}</h3>
                <p class="text-gray-600 text-sm line-clamp-2 leading-relaxed mt-1">${description || 'برای مشاهده جزئیات کلیک کنید'}</p>
            </div>
        `;
        
        card.addEventListener('click', () => openPortfolioModal(s));
        grid.appendChild(card);
    });
}

function openPortfolioModal(sample) {
    const modal = document.getElementById('project-modal');
    if (!modal) {
        console.error('پاپ‌آپ اصلی یافت نشد. مطمئن شوید کدهای HTML در index.html قرار دارند.');
        return;
    }

    // ۱. استخراج تمامی عکس‌ها از ردیف گوگل شیت برای اسلایدر
    let images = [];
    const keys = Object.keys(sample);
    
    // الف) جستجو در ستون‌های رایج عکس
    const possibleImageKeys = ['Image', 'Image 1', 'Image1', 'ImageLink'];
    possibleImageKeys.forEach(key => {
        if (sample[key] && sample[key].trim()) images.push(sample[key].trim());
    });

    // ب) جستجو در ستون‌های ۳ تا ۷ (طبق منطق قبلی شما) برای عکس‌های چندگانه
    for (let i = 3; i <= 7; i++) {
        if (keys[i] && sample[keys[i]] && typeof sample[keys[i]] === 'string') {
            const val = sample[keys[i]].trim();
            // فقط مقادیری که شبیه به لینک عکس هستند را استخراج کن
            if (val.includes('http') || val.includes('assets/') || val.match(/\.(jpeg|jpg|gif|png)$/i)) {
                images.push(val);
            }
        }
    }
    
    // ج) حذف لینک‌های تکراری
    images = [...new Set(images)];
    
    // د) اگر هیچ عکسی پیدا نشد، از عکس اصلی یا لوگو استفاده کن
    if (images.length === 0) {
        images = [getSampleImage(sample)];
    }

    // ۲. جمع‌آوری داده‌های مکانی و توضیحات
    const location = sample.Location || sample.City || sample.city || (keys[8] ? sample[keys[8]] : '');
    const description = sample.Description || (keys[9] ? sample[keys[9]] : '');

    // ۳. مقداردهی متغیرهای سراسری برای کارکرد صحیح اسلایدر (موجود در main.js)
    window.currentModalProject = {
        title: sample.Title || 'بدون عنوان',
        category: sample.Category || '',
        city: location,
        description: description,
        images: images
    };
    window.currentModalImgIndex = 0;

    // ۴. آپدیت کردن محتوای المان‌های پاپ‌آپ جدید
    const imgEl = document.getElementById('modal-img');
    const counterEl = document.getElementById('modal-counter');
    const titleEl = document.getElementById('modal-title');
    const categoryEl = document.getElementById('modal-category');
    const cityEl = document.getElementById('modal-city');
    const descEl = document.getElementById('modal-description');
    const prevBtn = document.getElementById('modal-prev-btn');
    const nextBtn = document.getElementById('modal-next-btn');

    if (imgEl) imgEl.src = images[0];
    if (counterEl) counterEl.textContent = `1 / ${images.length}`;
    if (titleEl) titleEl.textContent = window.currentModalProject.title;
    
    if (categoryEl) {
        categoryEl.textContent = window.currentModalProject.category;
        categoryEl.style.display = window.currentModalProject.category ? 'inline-block' : 'none';
    }
    
    if (cityEl) {
        cityEl.innerHTML = window.currentModalProject.city ? `<i class="fas fa-map-marker-alt text-teal ml-1"></i>${window.currentModalProject.city}` : '';
    }
    
    if (descEl) descEl.textContent = window.currentModalProject.description || 'توضیحات تکمیلی برای این پروژه ثبت نشده است.';

    // کنترل نمایش دکمه‌های اسلایدر در صورتی که بیش از یک عکس وجود داشته باشد
    const hasMultiple = images.length > 1;
    if (prevBtn) prevBtn.style.display = hasMultiple ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = hasMultiple ? 'flex' : 'none';
    if (counterEl) counterEl.style.display = hasMultiple ? 'block' : 'none';

    // ۵. نمایش نهایی پاپ‌آپ
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closePortfolioModal() {
    // در صورت فراخوانی این تابع، پاپ‌آپ اصلی بسته می‌شود
    if (typeof window.closeProjectModal === 'function') {
        window.closeProjectModal();
    } else {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = 'auto';
        }
    }
}

function renderCategories(products) {
  const grid = document.getElementById('products-categories-grid');
  if (!grid) return;

  grid.innerHTML = '';

  // گرفتن دسته‌بندی‌های یکتا
  const categories = [...new Set(
    products
      .map(p => p.Category)
      .filter(c => c && c.trim() !== '')
  )];

  categories.forEach(category => {
    const card = document.createElement('div');
    card.className = `
      bg-white rounded-2xl shadow-lg p-8 text-center cursor-pointer
      hover:shadow-2xl transition-all duration-300 hover:-translate-y-2
      border-2 border-transparent hover:border-teal
    `;
    
    card.innerHTML = `
      <div class="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fas fa-layer-group text-2xl text-teal"></i>
      </div>
      <h3 class="text-xl font-bold text-navy">${category}</h3>
    `;

    card.addEventListener('click', () => {
      window.location.href = `products.html?category=${encodeURIComponent(category)}`;
    });

    grid.appendChild(card);
  });

  if (typeof AOS !== 'undefined') {
    AOS.refresh();
  }
}

// ===== Initialize =====
window.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 DOM loaded, starting fetch...');
    
    setTimeout(() => {
        fetchProducts();
        fetchCatalogs();
        fetchSamples();
    }, 1000);
});