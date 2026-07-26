console.log('🚀 full-products.js loaded');

const PRICE_LIST_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=0&single=true&output=csv";

let allProducts = [];
let filteredProducts = [];
let currentCategory = 'all';

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
    if (status.includes('موجود')) return 'success';
    if (status.includes('ناموجود')) return 'warning';
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
            document.querySelectorAll('#category-filters .filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-teal', 'text-white');
                b.classList.add('bg-gray-200', 'text-navy');
            });
            btn.classList.add('active', 'bg-teal', 'text-white');
            filterProducts();
        });
        
        container.appendChild(btn);
    });
}

function filterProducts() {
    const searchQuery = document.getElementById('product-search').value.toLowerCase().trim();
    
    filteredProducts = allProducts.filter(p => {
        const matchesCategory = currentCategory === 'all' || p.Category === currentCategory;
        const matchesSearch = searchQuery === '' || 
            (p.Title && p.Title.toLowerCase().includes(searchQuery)) ||
            (p.Brand && p.Brand.toLowerCase().includes(searchQuery));
        
        return matchesCategory && matchesSearch;
    });
    
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
    
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (resultsCount) resultsCount.textContent = products.length;
    
    if (products.length === 0) {
        grid.style.display = 'none';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    grid.style.display = 'grid';
    if (emptyState) emptyState.classList.add('hidden');
    
    products.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2';
        
        const imageHtml = p.ImageLink && p.ImageLink.trim()
            ? `<img src="${p.ImageLink}" alt="${p.Title}" class="w-full h-48 object-cover cursor-pointer" onclick="openLightbox('${p.ImageLink}')">`
            : `<div class="w-full h-48 bg-gradient-to-br from-teal/10 to-navy/10 flex items-center justify-center"><i class="fas fa-box text-5xl text-gray-300"></i></div>`;
        
        card.innerHTML = `
            ${imageHtml}
            <div class="p-5">
                ${p.Category ? `<span class="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-semibold mb-3 inline-block">${p.Category}</span>` : ''}
                <h3 class="text-lg font-bold text-navy mb-2 line-clamp-2 min-h-[3.5rem]">${p.Title || 'محصول'}</h3>
                ${p.Brand ? `<p class="text-gray-600 text-sm mb-3"><i class="fas fa-tag ml-1 text-teal"></i>${p.Brand}</p>` : ''}
                <div class="flex justify-between items-center flex-wrap gap-2 mb-3">
                    <span class="text-xl font-bold text-teal">${formatPrice(p.Price)} <span class="text-xs">تومان</span></span>
                    ${p.Unit ? `<span class="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded">${p.Unit}</span>` : ''}
                </div>
                ${p.Status ? `<div><span class="badge badge-${getStatusClass(p.Status)} text-xs">${p.Status}</span></div>` : ''}
            </div>
        `;
        
        grid.appendChild(card);
    });
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

const lightbox = document.getElementById('lightbox');
if (lightbox) {
    lightbox.addEventListener('click', (e) => {
        if (e.target.id === 'lightbox') closeLightbox();
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeLightbox();
});

const allFilterBtn = document.querySelector('[data-category="all"]');
if (allFilterBtn) {
    allFilterBtn.addEventListener('click', () => {
        currentCategory = 'all';
        const search = document.getElementById('product-search');
        if (search) search.value = '';
        filterProducts();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing products page...');
    fetchProducts();
});