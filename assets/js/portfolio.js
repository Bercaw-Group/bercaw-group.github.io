document.addEventListener("DOMContentLoaded", function () {
    // آدرس CSV گوگل شیت
    const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=378766511&single=true&output=csv";

    const portfolioGridContainer = document.getElementById("full-portfolio-grid");
    const portfolioContainer = document.getElementById("portfolio-container");
    const portfolioLoading = document.getElementById("portfolio-loading");
    const emptyState = document.getElementById("empty-state");
    const resultsCount = document.getElementById("results-count");
    const categoryFilters = document.getElementById("category-filters");
    const searchInput = document.getElementById("portfolio-search");
    const lastUpdateSpan = document.getElementById("last-update");

    let allProjects = [];
    let filteredProjects = [];
    let currentCategory = "all";
    let searchQuery = "";

    window.cardImageIndices = {};
    window.currentModalProject = null;
    window.currentModalImgIndex = 0;

    initPortfolio();

    async function initPortfolio() {
        try {
            const response = await fetch(SHEET_CSV_URL);
            if (!response.ok) throw new Error("خطا در دریافت CSV");

            const csvText = await response.text();
            allProjects = parseCSV(csvText);

            if (lastUpdateSpan) {
                const now = new Date();
                lastUpdateSpan.textContent = now.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
            }

            if (portfolioLoading) portfolioLoading.style.display = "none";
            if (portfolioContainer) portfolioContainer.style.display = "block";

            if (portfolioGridContainer) {
                setupCategories(allProjects);
                setupSearch();
                renderPortfolioGrid();
            }

        } catch (error) {
            console.error("خطا در دریافت داده‌ها:", error);
            if (portfolioLoading) {
                portfolioLoading.innerHTML = `
                    <div class="text-red-500 text-center py-8">
                        <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                        <p class="text-lg font-bold">خطا در دریافت اطلاعات</p>
                    </div>
                `;
            }
        }
    }

    function parseCSV(text) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length <= 1) return [];

        const projects = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = parseCSVLine(lines[i]);
            if (cols.length >= 2) {
                const rawImages = [cols[3], cols[4], cols[5], cols[6], cols[7]];
                const validImages = rawImages.filter(img => img && img.trim().length > 0);

                projects.push({
                    id: i,
                    category: cols[1] || 'پروژه',
                    title: cols[2] || 'بدون عنوان',
                    images: validImages.length > 0 ? validImages : ['assets/images/logo.png'],
                    city: cols[8] || '',
                    description: cols[9] || ''
                });
            }
        }
        return projects;
    }

    function parseCSVLine(line) {
        const result = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') inQuotes = !inQuotes;
            else if (c === ',' && !inQuotes) {
                result.push(cur.replace(/^"|"$/g, '').trim());
                cur = '';
            } else cur += c;
        }
        result.push(cur.replace(/^"|"$/g, '').trim());
        return result;
    }

    function setupCategories(projects) {
        if (!categoryFilters) return;
        const categories = ['all', ...new Set(projects.map(p => p.category).filter(Boolean))];

        categoryFilters.innerHTML = categories.map(cat => {
            const isAll = cat === 'all';
            const label = isAll ? 'همه پروژه‌ها' : cat;
            return `
                <button class="filter-btn ${isAll ? 'active bg-teal text-white' : 'bg-gray-100 text-gray-700 hover:bg-teal hover:text-white'} px-6 py-2.5 rounded-full font-medium transition duration-200" data-category="${cat}">
                    ${isAll ? '<i class="fas fa-th ml-2"></i>' : ''}${label}
                </button>
            `;
        }).join('');

        categoryFilters.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;

            categoryFilters.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-teal', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-700');
            });

            btn.classList.add('active', 'bg-teal', 'text-white');
            btn.classList.remove('bg-gray-100', 'text-gray-700');

            currentCategory = btn.getAttribute('data-category');
            renderPortfolioGrid();
        });
    }

    function setupSearch() {
        if (!searchInput) return;
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            renderPortfolioGrid();
        });
    }

    function renderPortfolioGrid() {
        if (!portfolioGridContainer) return;

        filteredProjects = allProjects.filter(p => {
            const matchesCat = currentCategory === 'all' || p.category === currentCategory;
            const matchesSearch = p.title.toLowerCase().includes(searchQuery) ||
                                  p.description.toLowerCase().includes(searchQuery) ||
                                  p.city.toLowerCase().includes(searchQuery) ||
                                  p.category.toLowerCase().includes(searchQuery);
            return matchesCat && matchesSearch;
        });

        if (resultsCount) resultsCount.textContent = filteredProjects.length;

        if (filteredProjects.length === 0) {
            portfolioGridContainer.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        } else {
            if (emptyState) emptyState.classList.add('hidden');
        }

        cardImageIndices = {};

        portfolioGridContainer.innerHTML = filteredProjects.map((project, index) => {
            cardImageIndices[index] = 0;
            const hasMultipleImages = project.images.length > 1;

            return `
                <div onclick="openProjectModal(${index})" class="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition duration-300 flex flex-col group cursor-pointer">
                    
                    <!-- بخش اسلایدر روی کارت (افزایش ارتفاع به h-96 برای عکس‌های عمودی) -->
                    <div class="relative h-96 bg-gray-100 overflow-hidden select-none">
                        <img id="card-img-${index}" src="${project.images[0]}" alt="${project.title}" 
                             class="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                             onerror="this.src='assets/images/logo.png'; this.classList.add('p-8','object-contain');">

                        ${hasMultipleImages ? `
                            <button onclick="event.stopPropagation(); changeCardImg(${index}, -1)" class="absolute right-2 top-1/2 -translate-y-1/2 bg-navy/60 hover:bg-teal text-white w-9 h-9 rounded-full flex items-center justify-center transition shadow-md z-10">
                                <i class="fas fa-chevron-right text-xs"></i>
                            </button>

                            <button onclick="event.stopPropagation(); changeCardImg(${index}, 1)" class="absolute left-2 top-1/2 -translate-y-1/2 bg-navy/60 hover:bg-teal text-white w-9 h-9 rounded-full flex items-center justify-center transition shadow-md z-10">
                                <i class="fas fa-chevron-left text-xs"></i>
                            </button>

                            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 bg-navy/70 text-white text-[11px] px-3 py-0.5 rounded-full font-sans dir-ltr" id="card-img-counter-${index}">
                                1 / ${project.images.length}
                            </div>
                        ` : ''}
                    </div>

                    <!-- بخش اطلاعات روی کارت -->
                    <div class="p-6 flex flex-col flex-grow">
                        <div class="flex items-center justify-between gap-2 mb-3">
                            <span class="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-semibold">${project.category}</span>
                            ${project.city ? `
                                <span class="text-xs text-gray-500 flex items-center">
                                    <i class="fas fa-map-marker-alt text-teal ml-1"></i>${project.city}
                                </span>
                            ` : ''}
                        </div>

                        <h3 class="text-xl font-bold text-navy mb-2 group-hover:text-teal transition">${project.title}</h3>
                        <p class="text-gray-600 text-sm line-clamp-2 leading-relaxed mt-1">${project.description || 'برای مشاهده جزئیات کلیک کنید'}</p>
                    </div>

                </div>
            `;
        }).join('');
    }

    // تغییر عکس روی کارت
    window.changeCardImg = function(cardIndex, direction) {
        const project = filteredProjects[cardIndex];
        if (!project || !project.images || project.images.length <= 1) return;

        let currentIdx = cardImageIndices[cardIndex] || 0;
        currentIdx += direction;

        if (currentIdx < 0) currentIdx = project.images.length - 1;
        else if (currentIdx >= project.images.length) currentIdx = 0;

        cardImageIndices[cardIndex] = currentIdx;

        const imgEl = document.getElementById(`card-img-${cardIndex}`);
        const counterEl = document.getElementById(`card-img-counter-${cardIndex}`);

        if (imgEl) imgEl.src = project.images[currentIdx];
        if (counterEl) counterEl.textContent = `${currentIdx + 1} / ${project.images.length}`;
    };

    // باز کردن پاپ‌آپ دو بخشی پروژه
    window.openProjectModal = function(index) {
        const project = filteredProjects[index];
        if (!project) return;

        currentModalProject = project;
        currentModalImgIndex = 0;

        updateModalUI();

        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    };

    // بستن پاپ‌آپ
    window.closeProjectModal = function() {
        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = 'auto';
        }
    };

    // تغییر عکس داخل پاپ‌آپ
    window.changeModalImg = function(direction) {
        if (!currentModalProject || !currentModalProject.images.length) return;

        currentModalImgIndex += direction;
        if (currentModalImgIndex < 0) {
            currentModalImgIndex = currentModalProject.images.length - 1;
        } else if (currentModalImgIndex >= currentModalProject.images.length) {
            currentModalImgIndex = 0;
        }

        updateModalUI();
    };

    // بروزرسانی عناصر پاپ‌آپ
    function updateModalUI() {
        if (!currentModalProject) return;

        const imgEl = document.getElementById('modal-img');
        const counterEl = document.getElementById('modal-counter');
        const titleEl = document.getElementById('modal-title');
        const categoryEl = document.getElementById('modal-category');
        const cityEl = document.getElementById('modal-city');
        const descEl = document.getElementById('modal-description');
        const prevBtn = document.getElementById('modal-prev-btn');
        const nextBtn = document.getElementById('modal-next-btn');

        if (imgEl) imgEl.src = currentModalProject.images[currentModalImgIndex];
        if (counterEl) counterEl.textContent = `${currentModalImgIndex + 1} / ${currentModalProject.images.length}`;
        if (titleEl) titleEl.textContent = currentModalProject.title;
        if (categoryEl) categoryEl.textContent = currentModalProject.category;
        if (cityEl) {
            cityEl.innerHTML = currentModalProject.city ? `<i class="fas fa-map-marker-alt text-teal ml-1"></i>${currentModalProject.city}` : '';
        }
        if (descEl) descEl.textContent = currentModalProject.description || 'توضیحات تکمیلی برای این پروژه ثبت نشده است.';

        const hasMultiple = currentModalProject.images.length > 1;
        if (prevBtn) prevBtn.style.display = hasMultiple ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = hasMultiple ? 'flex' : 'none';
        if (counterEl) counterEl.style.display = hasMultiple ? 'block' : 'none';
    }

    // بستن پاپ‌آپ با کلیک روی کلید Esc
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
});