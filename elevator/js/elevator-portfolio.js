document.addEventListener("DOMContentLoaded", function () {
    const FIXED_CATEGORY = "آسانسور";
    const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=378766511&single=true&output=csv";

    const portfolioGridContainer = document.getElementById("full-portfolio-grid");
    const portfolioContainer = document.getElementById("portfolio-container");
    const portfolioLoading = document.getElementById("portfolio-loading");
    const emptyState = document.getElementById("empty-state");
    const resultsCount = document.getElementById("results-count");
    const searchInput = document.getElementById("portfolio-search");
    const lastUpdateSpan = document.getElementById("last-update");

    let categoryProjects = [];
    let filteredProjects = [];
    let searchQuery = "";
    let zoomScale = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    window.cardImageIndices = {};
    window.currentModalProject = null;
    window.currentModalImgIndex = 0;

    initPortfolio();
    initMobileMenu();
    initHeaderScroll();
    initFloatingActions();

    // ===== تشخیص ویدیو پیشرفته =====
    function isVideoUrl(url) {
        if (!url) return false;
        const cleanUrl = url.trim().split('?')[0].toLowerCase();
        const videoExts = ['.mp4', '.mov', '.webm', '.mkv', '.avi', '.m4v'];
        return videoExts.some(ext => cleanUrl.endsWith(ext)) || cleanUrl.includes('/video/upload/');
    }

    // ===== تولید کاور خودکار ویدیو و فشرده‌سازی عکس =====
    function getCloudinaryThumbnail(url) {
        if (!url) return '../assets/images/logo.png';
        const cleanUrl = url.trim();

        if (cleanUrl.includes('res.cloudinary.com')) {
            if (isVideoUrl(cleanUrl)) {
                return cleanUrl
                    .replace('/video/upload/', '/video/upload/w_500,q_auto,f_auto/')
                    .replace(/\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/i, '.jpg');
            } else {
                return cleanUrl.replace('/image/upload/', '/image/upload/w_500,q_auto,f_auto/');
            }
        }
        return cleanUrl;
    }

    async function initPortfolio() {
        try {
            const response = await fetch(SHEET_CSV_URL);
            if (!response.ok) throw new Error("خطا در دریافت CSV");

            const csvText = await response.text();
            const allProjects = parseCSV(csvText);
            categoryProjects = allProjects.filter(p => p.category === FIXED_CATEGORY);

            if (lastUpdateSpan) {
                const now = new Date();
                lastUpdateSpan.textContent = now.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
            }

            if (portfolioLoading) portfolioLoading.style.display = "none";
            if (portfolioContainer) portfolioContainer.style.display = "block";

            if (portfolioGridContainer) {
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
                // دریافت لینک‌های موجود در ستون‌های ۴ تا ۸
                const rawImages = [cols[3], cols[4], cols[5], cols[6], cols[7]];
                const validImages = rawImages
                    .map(img => img ? img.trim() : '')
                    .filter(img => img.length > 0 && img !== 'undefined' && img !== 'null');

                projects.push({
                    id: i,
                    category: cols[1] || 'پروژه',
                    title: cols[2] || 'بدون عنوان',
                    images: validImages.length > 0 ? validImages : ['../assets/images/logo.png'],
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

    function adjustHeaderSpacer() {
        const header = document.getElementById('elevator-header') || document.getElementById('header');
        const spacer = document.getElementById('header-spacer');
        if (header && spacer) {
            spacer.style.height = header.offsetHeight + 'px';
        }
    }
    window.addEventListener('load', adjustHeaderSpacer);
    window.addEventListener('resize', adjustHeaderSpacer);
    adjustHeaderSpacer();

    let currentPage = 1;
    const itemsPerPage = 12;

    function setupSearch() {
        if (!searchInput) return;
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            currentPage = 1;
            renderPortfolioGrid();
        });
    }

    function renderPortfolioGrid() {
        if (!portfolioGridContainer) return;

        filteredProjects = categoryProjects.filter(p => {
            return p.title.toLowerCase().includes(searchQuery) ||
                   p.description.toLowerCase().includes(searchQuery) ||
                   p.city.toLowerCase().includes(searchQuery);
        });

        if (resultsCount) resultsCount.textContent = filteredProjects.length;

        const paginationContainer = document.getElementById('pagination-container');

        if (filteredProjects.length === 0) {
            portfolioGridContainer.innerHTML = '';
            if (paginationContainer) paginationContainer.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        } else {
            if (emptyState) emptyState.classList.add('hidden');
        }

        const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        const currentProjects = filteredProjects.slice(startIndex, endIndex);

        window.cardImageIndices = {};

        portfolioGridContainer.innerHTML = currentProjects.map((project, index) => {
            const actualIndex = startIndex + index;
            window.cardImageIndices[actualIndex] = 0;
            const hasMultipleImages = project.images.length > 1;

            const firstMedia = project.images[0];
            const thumbnailUrl = getCloudinaryThumbnail(firstMedia);
            const isVideo = isVideoUrl(firstMedia);

            return `
                <div onclick="openProjectModal(${actualIndex})" class="bg-white rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden">

                    <div class="relative h-96 bg-slate-100 overflow-hidden select-none">
                        <img id="card-img-${actualIndex}" src="${thumbnailUrl}" alt="${project.title}"
                             class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                             onerror="this.src='../assets/images/logo.png'; this.classList.add('p-6','object-contain');">

                        ${isVideo ? `
                            <div class="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none z-10">
                                <div class="w-12 h-12 rounded-full bg-teal text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                                    <i class="fas fa-play mr-0.5 text-lg"></i>
                                </div>
                            </div>
                        ` : ''}

                        ${hasMultipleImages ? `
                            <button onclick="event.stopPropagation(); changeCardImg(${actualIndex}, -1)" class="absolute right-2 top-1/2 -translate-y-1/2 bg-navy/60 hover:bg-teal text-white w-7 h-7 rounded-full flex items-center justify-center transition shadow-md z-20 backdrop-blur-sm">
                                <i class="fas fa-chevron-right text-[10px]"></i>
                            </button>

                            <button onclick="event.stopPropagation(); changeCardImg(${actualIndex}, 1)" class="absolute left-2 top-1/2 -translate-y-1/2 bg-navy/60 hover:bg-teal text-white w-7 h-7 rounded-full flex items-center justify-center transition shadow-md z-20 backdrop-blur-sm">
                                <i class="fas fa-chevron-left text-[10px]"></i>
                            </button>

                            <div class="absolute bottom-2 left-1/2 -translate-x-1/2 bg-navy/75 text-white text-[10px] px-2.5 py-0.5 rounded-full font-sans dir-ltr backdrop-blur-sm z-20" id="card-img-counter-${actualIndex}">
                                1 / ${project.images.length}
                            </div>
                        ` : ''}
                    </div>

                    <div class="p-4 flex flex-col flex-grow">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <span class="bg-teal/10 text-teal px-2.5 py-0.5 rounded-full text-[11px] font-semibold">${project.category}</span>
                            ${project.city ? `
                                <span class="text-[11px] text-slate-500 flex items-center">
                                    <i class="fas fa-map-marker-alt text-teal ml-1"></i>${project.city}
                                </span>
                            ` : ''}
                        </div>

                        <h3 class="text-base font-bold text-navy mb-1.5 group-hover:text-teal transition line-clamp-1">${project.title}</h3>
                        <p class="text-slate-500 text-xs line-clamp-2 leading-relaxed">${project.description || 'برای مشاهده جزئیات کلیک کنید'}</p>
                    </div>

                </div>
            `;
        }).join('');

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let html = '';
        const prevDisabled = currentPage === 1;
        html += `<button onclick="changePage(${currentPage - 1})" ${prevDisabled ? 'disabled' : ''} class="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 transition-colors ${prevDisabled ? 'text-slate-300 cursor-not-allowed bg-slate-50' : 'text-slate-600 hover:bg-teal hover:text-white hover:border-teal bg-white'}"><i class="fas fa-chevron-right"></i></button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === currentPage) {
                html += `<button class="w-10 h-10 rounded-xl flex items-center justify-center bg-teal text-white border-teal shadow-md font-bold">${i}</button>`;
            } else {
                html += `<button onclick="changePage(${i})" class="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:bg-teal hover:text-white hover:border-teal transition-colors font-medium">${i}</button>`;
            }
        }

        const nextDisabled = currentPage === totalPages;
        html += `<button onclick="changePage(${currentPage + 1})" ${nextDisabled ? 'disabled' : ''} class="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 transition-colors ${nextDisabled ? 'text-slate-300 cursor-not-allowed bg-slate-50' : 'text-slate-600 hover:bg-teal hover:text-white hover:border-teal bg-white'}"><i class="fas fa-chevron-left"></i></button>`;

        paginationContainer.innerHTML = html;
    }

    window.changePage = function(page) {
        const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        renderPortfolioGrid();
        
        const container = document.getElementById('portfolio-container');
        if (container) {
            const headerOffset = 120;
            const elementPosition = container.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    window.changeCardImg = function(cardIndex, direction) {
        const project = filteredProjects[cardIndex];
        if (!project || !project.images || project.images.length <= 1) return;

        let currentIdx = window.cardImageIndices[cardIndex] || 0;
        currentIdx += direction;

        if (currentIdx < 0) currentIdx = project.images.length - 1;
        else if (currentIdx >= project.images.length) currentIdx = 0;

        window.cardImageIndices[cardIndex] = currentIdx;

        const imgEl = document.getElementById(`card-img-${cardIndex}`);
        const counterEl = document.getElementById(`card-img-counter-${cardIndex}`);

        const currentMedia = project.images[currentIdx];
        if (imgEl) imgEl.src = getCloudinaryThumbnail(currentMedia);
        if (counterEl) counterEl.textContent = `${currentIdx + 1} / ${project.images.length}`;
    };

    window.openProjectModal = function(index) {
        const project = filteredProjects[index];
        if (!project) return;

        window.currentModalProject = project;
        window.currentModalImgIndex = 0;

        updateModalUI();

        const modal = document.getElementById('project-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeProjectModal = function() {
        const modal = document.getElementById('project-modal');
        const videoEl = document.getElementById('modal-video');

        if (videoEl) {
            videoEl.pause();
            videoEl.src = '';
        }

        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = 'auto';
        }
    };

    window.changeModalImg = function(direction) {
        if (!window.currentModalProject || !window.currentModalProject.images.length) return;

        window.currentModalImgIndex += direction;
        if (window.currentModalImgIndex < 0) {
            window.currentModalImgIndex = window.currentModalProject.images.length - 1;
        } else if (window.currentModalImgIndex >= window.currentModalProject.images.length) {
            window.currentModalImgIndex = 0;
        }

        updateModalUI();
    };

    function updateModalUI() {
        if (!window.currentModalProject) return;

        const imgEl = document.getElementById('modal-img');
        let videoEl = document.getElementById('modal-video');

        const counterEl = document.getElementById('modal-counter');
        const titleEl = document.getElementById('modal-title');
        const categoryEl = document.getElementById('modal-category');
        const cityEl = document.getElementById('modal-city');
        const descEl = document.getElementById('modal-description');
        const prevBtn = document.getElementById('modal-prev-btn');
        const nextBtn = document.getElementById('modal-next-btn');

        const project = window.currentModalProject;
        const mediaUrl = project.images[window.currentModalImgIndex];
        const isVideo = isVideoUrl(mediaUrl);

        zoomScale = 1;
        panX = 0;
        panY = 0;
        if (imgEl) updateImageTransform(imgEl);

        if (isVideo) {
            if (imgEl) imgEl.classList.add('hidden');
            if (videoEl) {
                videoEl.classList.remove('hidden');
                videoEl.src = mediaUrl;
            }
        } else {
            if (videoEl) {
                videoEl.pause();
                videoEl.classList.add('hidden');
                videoEl.src = '';
            }
            if (imgEl) {
                imgEl.classList.remove('hidden');
                imgEl.src = mediaUrl;
            }
        }

        if (counterEl) counterEl.textContent = `${window.currentModalImgIndex + 1} / ${project.images.length}`;
        if (titleEl) titleEl.textContent = project.title;
        if (categoryEl) categoryEl.textContent = project.category;
        if (cityEl) {
            cityEl.innerHTML = project.city ? `<i class="fas fa-map-marker-alt text-teal ml-1"></i>${project.city}` : '';
        }
        if (descEl) descEl.textContent = project.description || 'توضیحات تکمیلی برای این پروژه ثبت نشده است.';

        const hasMultiple = project.images.length > 1;
        if (prevBtn) prevBtn.style.display = hasMultiple ? 'flex' : 'none';
        if (nextBtn) nextBtn.style.display = hasMultiple ? 'flex' : 'none';
        if (counterEl) counterEl.style.display = hasMultiple ? 'block' : 'none';
    }

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

    function initHeaderScroll() {
    const header = document.getElementById('elevator-header') || document.getElementById('header');
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
            
            // نمایش بوردر و تغییر پس‌زمینه دکمه ساندویچی در اسکرول
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
            
            // حالت شفاف در بالای صفحه
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

    function initFloatingActions() {
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
        }

        if (scrollTopBtn) {
            scrollTopBtn.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    const modalImg = document.getElementById('modal-img');

    function getRenderedSize() {
        if (!modalImg || !modalImg.parentElement) return { w: 0, h: 0, cw: 0, ch: 0 };
        const container = modalImg.parentElement;
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        const nw = modalImg.naturalWidth || cw;
        const nh = modalImg.naturalHeight || ch;

        const imgAspect = nw / nh;
        const containerAspect = cw / ch;

        let w, h;
        if (imgAspect > containerAspect) {
            w = cw;
            h = cw / imgAspect;
        } else {
            h = ch;
            w = ch * imgAspect;
        }
        return { w, h, cw, ch };
    }

    function clampPan() {
        if (!modalImg) return;
        const { w, h, cw, ch } = getRenderedSize();

        const scaledW = w * zoomScale;
        const scaledH = h * zoomScale;

        const maxPanX = scaledW > cw ? (scaledW - cw) / 2 : 0;
        const maxPanY = scaledH > ch ? (scaledH - ch) / 2 : 0;

        panX = Math.min(Math.max(panX, -maxPanX), maxPanX);
        panY = Math.min(Math.max(panY, -maxPanY), maxPanY);
    }

    function updateImageTransform(imgEl) {
        if (!imgEl) return;
        const { w, h, cw, ch } = getRenderedSize();
        const canPan = (w * zoomScale > cw) || (h * zoomScale > ch);

        imgEl.style.transition = isDragging ? 'none' : 'transform 0.15s ease-out';
        imgEl.style.transformOrigin = 'center center';
        imgEl.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoomScale})`;
        imgEl.style.cursor = canPan ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in';
    }

    if (modalImg) {
        modalImg.addEventListener('load', function() {
            clampPan();
            updateImageTransform(modalImg);
        });

        modalImg.addEventListener('wheel', function(e) {
            e.preventDefault();

            const container = modalImg.parentElement;
            if (!container) return;
            const rect = container.getBoundingClientRect();

            const mouseX = e.clientX - (rect.left + rect.width / 2);
            const mouseY = e.clientY - (rect.top + rect.height / 2);

            const zoomStep = 0.25;
            let newScale = e.deltaY < 0 ? zoomScale + zoomStep : zoomScale - zoomStep;

            newScale = Math.min(Math.max(newScale, 1), 4);

            if (newScale === 1) {
                zoomScale = 1;
                panX = 0;
                panY = 0;
            } else {
                const ratio = newScale / zoomScale;
                panX = mouseX - ratio * (mouseX - panX);
                panY = mouseY - ratio * (mouseY - panY);
                zoomScale = newScale;
                clampPan();
            }

            updateImageTransform(modalImg);
        }, { passive: false });

        modalImg.addEventListener('mousedown', function(e) {
            e.preventDefault();
            const { w, h, cw, ch } = getRenderedSize();
            const canPan = (w * zoomScale > cw) || (h * zoomScale > ch);

            if (canPan) {
                isDragging = true;
                startX = e.clientX - panX;
                startY = e.clientY - panY;
                updateImageTransform(modalImg);
            }
        });

        modalImg.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });

        window.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            panX = e.clientX - startX;
            panY = e.clientY - startY;

            clampPan();
            updateImageTransform(modalImg);
        });

        window.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                updateImageTransform(modalImg);
            }
        });

        modalImg.addEventListener('dblclick', function(e) {
            if (zoomScale === 1) {
                const container = modalImg.parentElement;
                if (!container) return;
                const rect = container.getBoundingClientRect();

                const mouseX = e.clientX - (rect.left + rect.width / 2);
                const mouseY = e.clientY - (rect.top + rect.height / 2);

                const newScale = 2.5;
                const ratio = newScale / zoomScale;
                panX = mouseX - ratio * (mouseX - panX);
                panY = mouseY - ratio * (mouseY - panY);
                zoomScale = newScale;

                clampPan();
            } else {
                zoomScale = 1;
                panX = 0;
                panY = 0;
            }
            updateImageTransform(modalImg);
        });
    }

});


// سیستم جامع زوم و جابه‌جایی (سازگار با لمس گوشی و موس DevTools)
const imgModal = document.getElementById('modal-img');
let scale = 1;
let posX = 0, posY = 0;
let startX = 0, startY = 0;
let isDragging = false;
let initialDistance = 0;
let initialScale = 1;

if (imgModal) {
    // ۱. زوم با چرخ موس (عالی برای تست سریع در DevTools)
    imgModal.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.3 : -0.3;
        scale = Math.min(Math.max(1, scale + delta), 4);
        if (scale === 1) { posX = 0; posY = 0; }
        updateTransform();
    }, { passive: false });

    // ۲. دبل کلیک / دبل تپ برای زوم و خروج سریع
    imgModal.addEventListener('dblclick', (e) => {
        e.preventDefault();
        if (scale > 1) {
            resetZoom();
        } else {
            scale = 2.5;
            updateTransform();
        }
    });

    // ۳. توابع مشترک جابه‌جایی (Pan)
    const startPan = (clientX, clientY) => {
        if (scale > 1) {
            isDragging = true;
            startX = clientX - posX;
            startY = clientY - posY;
        }
    };

    const movePan = (clientX, clientY) => {
        if (isDragging && scale > 1) {
            posX = clientX - startX;
            posY = clientY - startY;
            updateTransform();
        }
    };

    const endPan = () => {
        isDragging = false;
    };

    // رویدادهای موس (مخصوص دسکتاپ و F12)
    imgModal.addEventListener('mousedown', (e) => startPan(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => movePan(e.clientX, e.clientY));
    window.addEventListener('mouseup', endPan);

    // رویدادهای لمسی (مخصوص گوشی واقعی)
    imgModal.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            startPan(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2) {
            isDragging = false;
            initialDistance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            initialScale = scale;
        }
    }, { passive: false });

    imgModal.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            if (scale > 1) e.preventDefault();
            movePan(e.touches[0].clientX, e.touches[0].clientY);
        } else if (e.touches.length === 2) {
            e.preventDefault();
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            if (initialDistance > 0) {
                scale = Math.min(Math.max(1, initialScale * (dist / initialDistance)), 4);
                if (scale === 1) { posX = 0; posY = 0; }
                updateTransform();
            }
        }
    }, { passive: false });

    imgModal.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
            isDragging = false;
            initialDistance = 0;
        }
    });
}

function updateTransform() {
    if (!imgModal) return;
    imgModal.style.transition = isDragging ? 'none' : 'transform 0.1s ease-out';
    imgModal.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

function resetZoom() {
    scale = 1; posX = 0; posY = 0; isDragging = false;
    if (imgModal) {
        imgModal.style.transition = 'transform 0.2s ease-out';
        imgModal.style.transform = 'translate(0px, 0px) scale(1)';
    }
}



// تابع محدودکننده جابه‌جایی تصویر در محدوده کادر
function clampPosition() {
    if (!imgModal || !imgModal.parentElement) return;

    const container = imgModal.parentElement;
    // محاسبه حداکثر فاصله مجاز جابه‌جایی بر اساس میزان زوم
    const maxPosX = Math.max(0, (container.clientWidth * (scale - 1)) / 2);
    const maxPosY = Math.max(0, (container.clientHeight * (scale - 1)) / 2);

    // قفل کردن مختصات درون بازه مجاز
    posX = Math.min(Math.max(posX, -maxPosX), maxPosX);
    posY = Math.min(Math.max(posY, -maxPosY), maxPosY);
}

function updateTransform() {
    if (!imgModal) return;
    clampPosition(); // اعمال محدودیت کادر قبل از تغییر استایل
    imgModal.style.transition = isDragging ? 'none' : 'transform 0.1s ease-out';
    imgModal.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}