console.log('🚀 full-prices.js loaded');

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
    const loading = document.getElementById('prices-loading');
    const container = document.getElementById('price-table-container');
    
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
        
        const latestDate = allProducts.reduce((latest, p) => {
            return (p.LastUpdated && p.LastUpdated > latest) ? p.LastUpdated : latest;
        }, allProducts[0]?.LastUpdated || 'نامشخص');
        
        const lastUpdate = document.getElementById('last-update');
        if (lastUpdate) lastUpdate.textContent = latestDate;
        
        if (container) container.style.display = 'block';
        
        renderCategoryFilters();
        renderPriceTable(filteredProducts);
        
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
    const searchQuery = document.getElementById('price-search').value.toLowerCase().trim();
    
    filteredProducts = allProducts.filter(p => {
        const matchesCategory = currentCategory === 'all' || p.Category === currentCategory;
        const matchesSearch = searchQuery === '' || 
            (p.Title && p.Title.toLowerCase().includes(searchQuery)) ||
            (p.Brand && p.Brand.toLowerCase().includes(searchQuery));
        
        return matchesCategory && matchesSearch;
    });
    
    renderPriceTable(filteredProducts);
}

const searchInput = document.getElementById('price-search');
if (searchInput) {
    searchInput.addEventListener('input', filterProducts);
}

function renderPriceTable(products) {
    const tbody = document.getElementById('full-price-body');
    const container = document.getElementById('price-table-container');
    const emptyState = document.getElementById('empty-state');
    const resultsCount = document.getElementById('results-count');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (resultsCount) resultsCount.textContent = products.length;
    
    if (products.length === 0) {
        if (container) container.style.display = 'none';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }
    
    if (container) container.style.display = 'block';
    if (emptyState) emptyState.classList.add('hidden');
    
    products.forEach((p, index) => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-teal/5 transition border-b border-gray-100';
        
        const imageCell = p.ImageLink && p.ImageLink.trim()
            ? `<td class="px-4 py-4"><img src="${p.ImageLink}" alt="${p.Title}" class="w-16 h-16 object-cover rounded-lg cursor-pointer hover:scale-110 transition" onclick="openLightbox('${p.ImageLink}')"></td>`
            : `<td class="px-4 py-4"><div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"><i class="fas fa-image text-gray-400"></i></div></td>`;
        
        row.innerHTML = `
            <td class="px-4 py-4 font-bold text-gray-500">${index + 1}</td>
            ${imageCell}
            <td class="px-4 py-4">${p.Category ? `<span class="bg-teal/10 text-teal px-3 py-1 rounded-full text-sm font-semibold">${p.Category}</span>` : '-'}</td>
            <td class="px-4 py-4 font-semibold text-navy">${p.Title || '-'}</td>
            <td class="px-4 py-4 text-gray-600">${p.Brand || '-'}</td>
            <td class="px-4 py-4 text-gray-600">${p.Unit || '-'}</td>
            <td class="px-4 py-4 font-bold text-teal text-lg">${formatPrice(p.Price)} <span class="text-sm">تومان</span></td>
            <td class="px-4 py-4">${p.Status ? `<span class="badge badge-${getStatusClass(p.Status)}">${p.Status}</span>` : '-'}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function showEmptyState() {
    const container = document.getElementById('price-table-container');
    const emptyState = document.getElementById('empty-state');
    const loading = document.getElementById('prices-loading');
    
    if (loading) loading.style.display = 'none';
    if (container) container.style.display = 'none';
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
        const search = document.getElementById('price-search');
        if (search) search.value = '';
        filterProducts();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing prices page...');
    fetchProducts();
});