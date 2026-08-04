console.log('🚀 full-products.js loaded');

const PRICE_LIST_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=0&single=true&output=csv";

// متغیرهای سراسری
let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';
let currentBrand = 'all'; 
let currentPage = 1; 
const itemsPerPage = 12; 

function getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('category');
}

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

async function fetchProducts() {
    const loading = document.getElementById('products-loading');
    const grid = document.getElementById('products-grid');
    
    if (!grid) return;
    
    try {
        if (loading) loading.style.display = 'block';
        
        const response = await fetch(PRICE_LIST_CSV + '&t=' + Date.now());
        const text = await response.text();
        
        allProducts = parseCSV(text);
        filteredProducts = allProducts;
        
        if (loading) loading.style.display = 'none';
        
        if (allProducts.length === 0) {
            showEmptyState();
            return;
        }
        
        grid.style.display = 'grid';
        
        renderCategoryFilters();
        renderBrandFilters();
        renderProducts(filteredProducts);
        
    } catch (error) {
        console.error('Error:', error);
        if (loading) {
            loading.innerHTML = `<div class="text-center py-20"><i class="fas fa-times-circle text-6xl text-red-500 mb-4"></i><p class="text-xl">خطا: ${error.message}</p></div>`;
        }
    }
}

function renderCategoryFilters() {
    const categories = [...new Set(allProducts.map(p => p.Category).filter(c => c && c.trim()))];
    const container = document.getElementById('category-filters');
    
    if (!container) return;
    
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn px-6 py-2.5 rounded-full bg-gray-200 text-navy font-medium transition hover:bg-teal hover:text-white';
        btn.innerHTML = `<i class="fas fa-tag ml-2"></i>${cat}`;
        
        btn.addEventListener('click', () => {
            currentCategory = cat;
            currentPage = 1; 
            
            // بازنویسی ظاهر دکمه‌های دسته‌بندی
            document.querySelectorAll('#category-filters .filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-teal', 'text-white');
                b.classList.add('bg-gray-200', 'text-navy');
            });
            btn.classList.add('active', 'bg-teal', 'text-white');
            btn.classList.remove('bg-gray-200', 'text-navy');
            
            // آپدیت کردن برندها بر اساس دسته‌بندی جدید
            renderBrandFilters();
            filterProducts();
        });
        
        container.appendChild(btn);
    });
}

// تابع جدید و هوشمند برای برندها
function renderBrandFilters() {
    const container = document.getElementById('brand-filters');
    if (!container) return;

    // فیلتر کردن محصولات فقط برای دسته‌بندی انتخاب شده
    const productsInCurrentCategory = currentCategory === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.Category === currentCategory);

    // استخراج برندهای موجود در این دسته‌بندی
    const brands = [...new Set(productsInCurrentCategory.map(p => p.Brand).filter(b => b && b.trim()))];
    
    // اگر برند فعلی در دسته‌بندی جدید وجود ندارد، آن را ریست کن
    if (currentBrand !== 'all' && !brands.includes(currentBrand)) {
        currentBrand = 'all';
    }

    // پاک کردن دکمه‌های قبلی برند
    container.innerHTML = '';

    // دکمه "همه برندها"
    const allBrandBtn = document.createElement('button');
    allBrandBtn.className = `filter-btn px-6 py-2.5 rounded-full font-medium transition hover:bg-teal hover:text-white ${currentBrand === 'all' ? 'active bg-teal text-white' : 'bg-gray-200 text-navy'}`;
    allBrandBtn.setAttribute('data-brand', 'all');
    allBrandBtn.innerHTML = `<i class="fas fa-check-circle ml-2"></i>همه برندها`;
    
    allBrandBtn.addEventListener('click', () => {
        currentBrand = 'all';
        currentPage = 1;
        updateBrandButtonsUI();
        filterProducts();
    });
    container.appendChild(allBrandBtn);

    // ساخت دکمه برای برندهای مربوط به این دسته‌بندی
    brands.forEach(brand => {
        const btn = document.createElement('button');
        btn.className = `filter-btn px-6 py-2.5 rounded-full font-medium transition hover:bg-teal hover:text-white ${currentBrand === brand ? 'active bg-teal text-white' : 'bg-gray-200 text-navy'}`;
        btn.setAttribute('data-brand', brand);
        btn.innerHTML = brand;
        
        btn.addEventListener('click', () => {
            currentBrand = brand;
            currentPage = 1; 
            updateBrandButtonsUI();
            filterProducts();
        });
        
        container.appendChild(btn);
    });
}

// تابع کمکی برای تغییر استایل دکمه‌های برند هنگام کلیک
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
    const searchQuery = document.getElementById('product-search').value.toLowerCase().trim();
    
    filteredProducts = allProducts.filter(p => {
        const matchesCategory = currentCategory === 'all' || p.Category === currentCategory;
        const matchesBrand = currentBrand === 'all' || p.Brand === currentBrand;
        const matchesSearch = searchQuery === '' || 
            (p.Title && p.Title.toLowerCase().includes(searchQuery)) ||
            (p.Brand && p.Brand.toLowerCase().includes(searchQuery));
        
        return matchesCategory && matchesBrand && matchesSearch;
    });
    
    currentPage = 1; 
    renderProducts(filteredProducts);
}

const searchInput = document.getElementById('product-search');
if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    const resultsCount = document.getElementById('results-count');
    const paginationContainer = document.getElementById('pagination-container');
    
    if (!grid) return;
    grid.innerHTML = '';
    
    if (resultsCount) resultsCount.textContent = products.length;
    
    if (products.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.classList.remove('hidden');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }
    
    grid.style.display = 'grid';
    if (emptyState) emptyState.classList.add('hidden');
    
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    paginatedProducts.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer';

        const imageHtml = p.ImageLink && p.ImageLink.trim()
            ? `<img src="${p.ImageLink}" alt="${p.Title}" class="w-full h-48 object-cover">`
            : `<div class="w-full h-48 bg-gradient-to-br from-teal/10 to-navy/10 flex items-center justify-center">
                   <i class="fas fa-box text-5xl text-gray-300"></i>
               </div>`;

        card.innerHTML = `
            ${imageHtml}
            <div class="p-5">
                ${p.Category ? `<span class="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-semibold mb-3 inline-block">${p.Category}</span>` : ''}
                <h3 class="text-lg font-bold text-navy mb-2 line-clamp-2 min-h-[3.5rem]">${p.Title || 'محصول'}</h3>
                ${p.Brand ? `<p class="text-gray-600 text-sm mb-3"><i class="fas fa-tag ml-1 text-teal"></i>${p.Brand}</p>` : ''}
                <div class="flex justify-between items-center flex-wrap gap-2 mb-3">
                    <span class="text-xl font-bold text-teal">
                        ${!isNaN(p.Price) && p.Price.trim() !== '' ? `${formatPrice(p.Price)} <span class="text-xs">تومان</span>` : p.Price}
                    </span>
                    ${p.Unit ? `<span class="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">${p.Unit}</span>` : ''}
                </div>
                ${p.Status ? `<div><span class="badge badge-${getStatusClass(p.Status)} text-xs">${p.Status}</span></div>` : ''}
            </div>
        `;

        card.addEventListener('click', () => { openProductModal(p); });
        grid.appendChild(card);
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    container.innerHTML = '';

    if (totalPages <= 1) return;

    if (currentPage > 2) {
        container.appendChild(createPageButton(1, '۱'));
        if (currentPage > 3) {
            const dots = document.createElement('span');
            dots.innerHTML = '...';
            dots.className = 'px-2 text-gray-500';
            container.appendChild(dots);
        }
    }

    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createPageButton(i, i.toLocaleString('fa-IR')));
    }

    if (currentPage < totalPages - 1) {
        if (currentPage < totalPages - 2) {
            const dots = document.createElement('span');
            dots.innerHTML = '...';
            dots.className = 'px-2 text-gray-500';
            container.appendChild(dots);
        }
        container.appendChild(createPageButton(totalPages, totalPages.toLocaleString('fa-IR')));
    }
}

function createPageButton(pageNumber, text) {
    const btn = document.createElement('button');
    btn.innerHTML = text;
    
    btn.className = `w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all ${
        pageNumber === currentPage
            ? 'bg-teal text-white shadow-md'
            : 'bg-white text-navy border border-gray-200 hover:bg-teal/10'
    }`;
    
    btn.addEventListener('click', () => {
        currentPage = pageNumber;
        renderProducts(filteredProducts);
        document.getElementById('products-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    
    return btn;
}

function showEmptyState() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    const loading = document.getElementById('products-loading');
    
    if (loading) loading.style.display = 'none';
    if (grid) grid.style.display = 'none';
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

function openProductModal(product) {
    const modal = document.getElementById('product-modal');

    document.getElementById('modal-product-image').src =
        product.ImageLink && product.ImageLink.trim()
            ? product.ImageLink
            : 'assets/images/placeholder.jpg';

    document.getElementById('modal-product-title').textContent =
        product.Title || 'بدون عنوان';

    document.getElementById('modal-product-brand').textContent =
        product.Brand ? `برند: ${product.Brand}` : '';

    document.getElementById('modal-product-unit').textContent =
        product.Unit ? `واحد: ${product.Unit}` : '';

    const numericPrice = Number(product.Price?.toString().replace(/,/g, ''));

    if (!isNaN(numericPrice) && numericPrice > 0) {
        document.getElementById('modal-product-price').innerHTML =
            `${formatPrice(numericPrice)} <span class="text-sm">تومان</span>`;
    } else {
        document.getElementById('modal-product-price').textContent =
            product.Price || '';
    }
    
    document.getElementById('modal-product-status').innerHTML =
        product.Status
            ? `<span class="badge badge-${getStatusClass(product.Status)}">${product.Status}</span>`
            : '';

    document.getElementById('modal-product-description').textContent =
        product.Description || 'توضیحاتی ثبت نشده است.';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
}

const productModal = document.getElementById('product-modal');
if (productModal) {
    productModal.addEventListener('click', (e) => {
        if (e.target.id === 'product-modal') {
            closeProductModal();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

const lightbox = document.getElementById('lightbox');
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') closeLightbox();
    });
}

const allFilterBtn = document.querySelector('[data-category="all"]');
if (allFilterBtn) {
    allFilterBtn.addEventListener('click', () => {
        currentCategory = 'all';
        const search = document.getElementById('product-search');
        if (search) search.value = '';

        document.querySelectorAll('#category-filters .filter-btn').forEach(btn => {
            btn.classList.remove('active', 'bg-teal', 'text-white');
            btn.classList.add('bg-gray-200', 'text-navy');
        });

        allFilterBtn.classList.add('active', 'bg-teal', 'text-white');
        allFilterBtn.classList.remove('bg-gray-200', 'text-navy');

        // آپدیت کردن برندها (چون به "همه محصولات" برگشتیم)
        renderBrandFilters();
        filterProducts();
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing products page...');
    
    await fetchProducts();

    const params = new URLSearchParams(window.location.search);
    const categoryFromURL = params.get('category');

    if (categoryFromURL) {
        currentCategory = categoryFromURL;
        
        // وقتی از URL وارد دسته خاصی می‌شویم، لیست برندها باید آپدیت شود
        renderBrandFilters();
        filterProducts();

        const allButtons = document.querySelectorAll('#category-filters .filter-btn');
        allButtons.forEach(btn => {
            btn.classList.remove('active', 'bg-teal', 'text-white');
            btn.classList.add('bg-gray-200', 'text-navy');
        });

        allButtons.forEach(btn => {
            if (btn.textContent.trim() === categoryFromURL) {
                btn.classList.add('active', 'bg-teal', 'text-white');
                btn.classList.remove('bg-gray-200', 'text-navy');
            }
        });
    }
});