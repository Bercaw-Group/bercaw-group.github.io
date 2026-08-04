console.log('🚀 full-prices.js loaded');

const PRICE_LIST_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=0&single=true&output=csv";

// متغیرهای سراسری
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentBrand = 'all'; 

// متغیرهای مربوط به بارگذاری بیشتر
const ITEMS_PER_LOAD = 20; 
let visibleCount = ITEMS_PER_LOAD; 

function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];
    
    const headers = parseCSVLine(lines[0]);
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

function formatPrice(price) {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getStatusClass(status) {
    if (!status) return 'info';
    const trimmedStatus = status.trim();
    if (trimmedStatus === 'موجود') return 'success';
    if (trimmedStatus === 'ناموجود') return 'warning';
    return 'info';
}

// تابع کمکی برای تشخیص معتبر بودن قیمت
function getNumericPrice(priceStr) {
    if (!priceStr) return -1;
    const cleanStr = priceStr.toString().replace(/,/g, '').trim();
    const num = Number(cleanStr);
    return (!isNaN(num) && num > 0) ? num : -1;
}

// تابع مرتب‌سازی محصولات: ابتدا محصولات دارای قیمت معتبر، سپس بقیه
function sortProductsByPrice(products) {
    return products.sort((a, b) => {
        const priceA = getNumericPrice(a.Price);
        const priceB = getNumericPrice(b.Price);

        // اگر هر دو دارای قیمت معتبر هستند
        if (priceA !== -1 && priceB !== -1) {
            return 0; // حفظ ترتیب اولیه یا می‌توانید بر اساس گرانی/ارزانی مرتب کنید
        }
        // اگر فقط A قیمت دارد، بیاید بالا (-1)
        if (priceA !== -1 && priceB === -1) {
            return -1;
        }
        // اگر فقط B قیمت دارد، بیاید بالا (1)
        if (priceA === -1 && priceB !== -1) {
            return 1;
        }
        // اگر هیچ‌کدام قیمت ندارند
        return 0;
    });
}

async function fetchProducts() {
    const loading = document.getElementById('prices-loading');
    const container = document.getElementById('price-table-container');
    
    try {
        if (loading) loading.style.display = 'block';
        
        const response = await fetch(PRICE_LIST_CSV + '&t=' + Date.now());
        const text = await response.text();
        
        let rawProducts = parseCSV(text);
        
        // مرتب‌سازی اولیه محصولات برای اینکه قیمت‌دارها در ابتدا قرار گیرند
        allProducts = sortProductsByPrice(rawProducts);
        filteredProducts = allProducts;
        
        if (loading) loading.style.display = 'none';
        
        if (allProducts.length === 0) {
            showEmptyState();
            return;
        }
        
        const latestDate = allProducts.reduce((latest, p) => {
            return (p.LastUpdated && p.LastUpdated > latest) ? p.LastUpdated : latest;
        }, allProducts[0]?.LastUpdated || 'نامشخص');
        
        const lastUpdate = document.getElementById('last-update');
        if (lastUpdate) lastUpdate.textContent = latestDate;
        
        if (container) container.style.display = 'block';
        
        renderCategoryFilters();
        renderBrandFilters(); 
        renderPriceTable(filteredProducts);
        
    } catch (error) {
        console.error('Error:', error);
        if (loading) {
            loading.innerHTML = `<div class="text-center py-20"><i class="fas fa-times-circle text-6xl text-red-500 mb-4"></i><p class="text-xl">خطا: ${error.message}</p></div>`;
        }
    }
}

function renderCategoryFilters() {
    const container = document.getElementById('category-filters');
    if (!container) return;
    
    container.innerHTML = ''; 

    const uniqueCategories = [...new Set(allProducts.map(p => p.Category).filter(c => c && c.trim()))];
    const categories = ['all', ...uniqueCategories];
    
    categories.forEach(cat => {
        const isAll = cat === 'all';
        const label = isAll ? 'همه محصولات' : cat;
        const icon = isAll ? 'fa-th' : 'fa-tag';
        const isSelected = currentCategory === cat;

        const btn = document.createElement('button');
        btn.className = `filter-btn px-6 py-2.5 rounded-full font-medium transition duration-200 ${
            isSelected 
                ? 'active bg-teal text-white' 
                : 'bg-gray-200 text-navy hover:bg-teal hover:text-white'
        }`;
        btn.setAttribute('data-category', cat);
        btn.innerHTML = `<i class="fas ${icon} ml-2"></i>${label}`;
        
        btn.addEventListener('click', () => {
            currentCategory = cat;
            visibleCount = ITEMS_PER_LOAD; 
            
            document.querySelectorAll('#category-filters .filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-teal', 'text-white');
                b.classList.add('bg-gray-200', 'text-navy');
            });
            
            btn.classList.add('active', 'bg-teal', 'text-white');
            btn.classList.remove('bg-gray-200', 'text-navy');
            
            renderBrandFilters(); 
            filterProducts();
        });
        
        container.appendChild(btn);
    });
}

function renderBrandFilters() {
    const container = document.getElementById('brand-filters');
    if (!container) return;

    const productsInCurrentCategory = currentCategory === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.Category === currentCategory);

    const brands = [...new Set(productsInCurrentCategory.map(p => p.Brand).filter(b => b && b.trim()))];
    
    if (currentBrand !== 'all' && !brands.includes(currentBrand)) {
        currentBrand = 'all';
    }

    container.innerHTML = '';

    const allBrandBtn = document.createElement('button');
    allBrandBtn.className = `filter-btn px-6 py-2.5 rounded-full font-medium transition duration-200 ${currentBrand === 'all' ? 'active bg-teal text-white' : 'bg-gray-200 text-navy hover:bg-teal hover:text-white'}`;
    allBrandBtn.setAttribute('data-brand', 'all');
    allBrandBtn.innerHTML = `<i class="fas fa-check-circle ml-2"></i>همه برندها`;
    
    allBrandBtn.addEventListener('click', () => {
        currentBrand = 'all';
        visibleCount = ITEMS_PER_LOAD; 
        updateBrandButtonsUI();
        filterProducts();
    });
    container.appendChild(allBrandBtn);

    brands.forEach(brand => {
        const btn = document.createElement('button');
        btn.className = `filter-btn px-6 py-2.5 rounded-full font-medium transition duration-200 ${currentBrand === brand ? 'active bg-teal text-white' : 'bg-gray-200 text-navy hover:bg-teal hover:text-white'}`;
        btn.setAttribute('data-brand', brand);
        btn.innerHTML = brand;
        
        btn.addEventListener('click', () => {
            currentBrand = brand;
            visibleCount = ITEMS_PER_LOAD; 
            updateBrandButtonsUI();
            filterProducts();
        });
        
        container.appendChild(btn);
    });
}

function updateBrandButtonsUI() {
    document.querySelectorAll('#brand-filters .filter-btn').forEach(btn => {
        if (btn.getAttribute('data-brand') === currentBrand) {
            btn.classList.add('active', 'bg-teal', 'text-white');
            btn.classList.remove('bg-gray-200', 'text-navy');
        } else {
            btn.classList.remove('active', 'bg-teal', 'text-white');
            btn.classList.add('bg-gray-200', 'text-navy');
        }
    });
}

function filterProducts() {
    const searchInput = document.getElementById('price-search');
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    let tempFiltered = allProducts.filter(p => {
        const matchesCategory = currentCategory === 'all' || p.Category === currentCategory;
        const matchesBrand = currentBrand === 'all' || p.Brand === currentBrand;
        const matchesSearch = searchQuery === '' || 
            (p.Title && p.Title.toLowerCase().includes(searchQuery)) ||
            (p.Brand && p.Brand.toLowerCase().includes(searchQuery));
        
        return matchesCategory && matchesBrand && matchesSearch;
    });
    
    // مرتب‌سازی نتایج فیلترشده برای اینکه محصولاتی که قیمت دارند باز هم در ابتدا باشند
    filteredProducts = sortProductsByPrice(tempFiltered);
    
    visibleCount = ITEMS_PER_LOAD; 
    renderPriceTable(filteredProducts);
}

const searchInput = document.getElementById('price-search');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        visibleCount = ITEMS_PER_LOAD;
        filterProducts();
    });
}

function renderPriceTable(products) {
    const tbody = document.getElementById('full-price-body');
    const container = document.getElementById('price-table-container');
    const emptyState = document.getElementById('empty-state');
    const resultsCount = document.getElementById('results-count');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (resultsCount) resultsCount.textContent = products.length;
    
    if (products.length === 0) {
        if (container) container.style.display = 'none';
        if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (container) container.style.display = 'block';
    if (emptyState) emptyState.classList.add('hidden');
    
    const visibleProducts = products.slice(0, visibleCount);
    
    visibleProducts.forEach((p, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-teal/5 transition border-b border-gray-100';
        
        const imageCell = p.ImageLink && p.ImageLink.trim()
            ? `<td class="px-4 py-4"><img src="${p.ImageLink}" alt="${p.Title}" class="w-16 h-16 object-cover rounded-lg cursor-pointer hover:scale-110 transition" onclick="openLightbox('${p.ImageLink}')"></td>`
            : `<td class="px-4 py-4"><div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"><i class="fas fa-image text-gray-400"></i></div></td>`;
        
        const rawPrice = p.Price ? p.Price.toString().replace(/,/g, '').trim() : '';
        const isNumeric = rawPrice !== '' && !isNaN(rawPrice);

        const priceDisplay = isNumeric 
            ? `${formatPrice(p.Price)} <span class="text-sm font-normal">تومان</span>` 
            : (p.Price || 'تماس بگیرید');

        row.innerHTML = `
            <td class="px-4 py-4 font-bold text-gray-500">${index + 1}</td>
            ${imageCell}
            <td class="px-4 py-4">${p.Category ? `<span class="bg-teal/10 text-teal px-3 py-1 rounded-full text-sm font-semibold">${p.Category}</span>` : '-'}</td>
            <td class="px-4 py-4 font-semibold text-navy">${p.Title || '-'}</td>
            <td class="px-4 py-4 text-gray-600">${p.Brand || '-'}</td>
            <td class="px-4 py-4 text-gray-600">${p.Unit || '-'}</td>
            <td class="px-4 py-4 font-bold text-teal text-lg">${priceDisplay}</td>
            <td class="px-4 py-4">${p.Status ? `<span class="badge badge-${getStatusClass(p.Status)}">${p.Status}</span>` : '-'}</td>
        `;
        
        tbody.appendChild(row);
    });

    if (loadMoreContainer) {
        if (visibleCount < products.length) {
            loadMoreContainer.classList.remove('hidden');
        } else {
            loadMoreContainer.classList.add('hidden');
        }
    }
}

function showEmptyState() {
    const container = document.getElementById('price-table-container');
    const emptyState = document.getElementById('empty-state');
    const loading = document.getElementById('prices-loading');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    if (loading) loading.style.display = 'none';
    if (container) container.style.display = 'none';
    if (loadMoreContainer) loadMoreContainer.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
}

function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (lightbox && lightboxImg) {
        lightboxImg.src = imageSrc;
        lightbox.classList.remove('hidden');
        lightbox.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.add('hidden');
        lightbox.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }
}

const lightbox = document.getElementById('lightbox');
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') closeLightbox();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing prices page...');
    fetchProducts();

    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            visibleCount += ITEMS_PER_LOAD; 
            renderPriceTable(filteredProducts); 
        });
    }
});