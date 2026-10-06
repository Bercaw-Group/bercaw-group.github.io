document.addEventListener("DOMContentLoaded", function () {
    const FIXED_CATEGORY = "آسانسور";
    const PRICE_LIST_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTQNciOxkCC7kIao6OpjJXBKRumY0-BPwkIWLXbWQuivuznIAojhJiZ0M6OqTx6M3kt4fGSZJue7d37/pub?gid=0&single=true&output=csv";

    const productsGridContainer = document.getElementById("full-products-grid");
    const productsContainer = document.getElementById("products-container");
    const productsLoading = document.getElementById("products-loading");
    const emptyState = document.getElementById("empty-state");
    const resultsCount = document.getElementById("results-count");
    const searchInput = document.getElementById("product-search");
    const brandFiltersContainer = document.getElementById("brand-filters");
    const lastUpdateSpan = document.getElementById("last-update");

    let categoryProducts = [];
    let filteredProducts = [];
    let currentBrand = "all";
    let searchQuery = "";
    let currentPage = 1;
    const itemsPerPage = 12;

    // متغیرهای زوم و درگ تصویر پاپ‌آپ
    let zoomScale = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    window.currentModalProduct = null;

    initProducts();
    initMobileMenu();
    initHeaderScroll();
    initFloatingActions();

    // ===== نرمال‌سازی متن برای مقایسه دقیق =====
    function normalizeText(text) {
        if (!text) return "";
        return text
            .toString()
            .trim()
            .replace(/[\u200B-\u200F\uFEFF]/g, "")
            .replace(/ي/g, "ی")
            .replace(/ك/g, "ک")
            .replace(/\s+/g, " ");
    }

    const FIXED_CATEGORY_NORMALIZED = normalizeText(FIXED_CATEGORY);

    // ===== تشخیص رسانه ویدیو =====
    function isVideoUrl(url) {
        if (!url) return false;
        const cleanUrl = url.trim().split("?")[0].toLowerCase();
        const videoExts = [".mp4", ".mov", ".webm", ".mkv", ".avi", ".m4v"];
        return videoExts.some(ext => cleanUrl.endsWith(ext)) || cleanUrl.includes("/video/upload/");
    }

    // ===== بهینه‌سازی و کاور خودکار Cloudinary =====
    function getCloudinaryThumbnail(url) {
        if (!url || !url.trim()) return "../assets/images/logo.png";
        const cleanUrl = url.trim();

        if (cleanUrl.includes("res.cloudinary.com")) {
            if (isVideoUrl(cleanUrl)) {
                return cleanUrl
                    .replace("/video/upload/", "/video/upload/w_500,q_auto,f_auto/")
                    .replace(/\.(mp4|mov|webm|mkv|avi|m4v)(\?.*)?$/i, ".jpg");
            } else {
                return cleanUrl.replace("/image/upload/", "/image/upload/w_500,q_auto,f_auto/");
            }
        }
        return cleanUrl;
    }

    // ===== فرمت قیمت به تومان =====
    function formatPrice(price) {
        if (price === null || price === undefined || price === "") return "استعلام قیمت";
        const cleanStr = price.toString().replace(/,/g, "").trim();
        const num = Number(cleanStr);
        if (!isNaN(num) && num > 0) {
            return num.toLocaleString("fa-IR") + ' <span class="text-xs font-normal">تومان</span>';
        }
        return price;
    }

    async function initProducts() {
        try {
            const response = await fetch(PRICE_LIST_CSV + "&t=" + Date.now());
            if (!response.ok) throw new Error("خطا در دریافت فایل محصولات");

            const csvText = await response.text();
            const allProducts = parseCSV(csvText);

            categoryProducts = allProducts.filter(p => normalizeText(p.Category) === FIXED_CATEGORY_NORMALIZED);

            if (lastUpdateSpan) {
                const now = new Date();
                lastUpdateSpan.textContent = now.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
            }

            if (productsLoading) productsLoading.style.display = "none";
            if (productsContainer) productsContainer.style.display = "block";

            renderBrandFilters();
            setupSearch();
            renderProductsGrid();

        } catch (error) {
            console.error("خطا در بارگذاری محصولات:", error);
            if (productsLoading) {
                productsLoading.innerHTML = `
                    <div class="text-red-500 text-center py-8">
                        <i class="fas fa-exclamation-triangle text-4xl mb-3"></i>
                        <p class="text-lg font-bold">خطا در دریافت اطلاعات محصولات</p>
                    </div>
                `;
            }
        }
    }

    function parseCSV(text) {
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
        if (lines.length <= 1) return [];

        const headers = parseCSVLine(lines[0]);
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length === headers.length) {
                const row = {};
                headers.forEach((header, idx) => {
                    row[header] = values[idx] ? values[idx].trim() : "";
                });
                data.push({
                    id: i,
                    Category: row.Category || "",
                    Title: row.Title || "بدون عنوان",
                    Brand: row.Brand || "",
                    Unit: row.Unit || "",
                    Price: row.Price || "",
                    Status: row.Status || "موجود",
                    ImageLink: row.ImageLink || "",
                    Description: row.Description || ""
                });
            }
        }
        return data;
    }

    function parseCSVLine(line) {
        const result = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (c === '"') inQuotes = !inQuotes;
            else if (c === "," && !inQuotes) {
                result.push(cur.replace(/^"|"$/g, "").trim());
                cur = "";
            } else cur += c;
        }
        result.push(cur.replace(/^"|"$/g, "").trim());
        return result;
    }

    function adjustHeaderSpacer() {
        const header = document.getElementById("video-header") || document.getElementById("header");
        const spacer = document.getElementById("header-spacer");
        if (header && spacer) {
            spacer.style.height = header.offsetHeight + "px";
        }
    }
    window.addEventListener("load", adjustHeaderSpacer);
    window.addEventListener("resize", adjustHeaderSpacer);
    adjustHeaderSpacer();

    function renderBrandFilters() {
        if (!brandFiltersContainer) return;
        const brands = [...new Set(categoryProducts.map(p => p.Brand).filter(b => b && b.trim().length > 0))];

        let html = `
            <button onclick="setBrandFilter('all')" class="filter-btn px-4 py-2 rounded-xl text-xs font-semibold transition ${currentBrand === 'all' ? 'bg-teal text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                همه برندها
            </button>
        `;

        brands.forEach(brand => {
            const isActive = currentBrand === brand;
            html += `
                <button onclick="setBrandFilter('${brand}')" class="filter-btn px-4 py-2 rounded-xl text-xs font-semibold transition ${isActive ? 'bg-teal text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                    ${brand}
                </button>
            `;
        });

        brandFiltersContainer.innerHTML = html;
    }

    window.setBrandFilter = function (brand) {
        currentBrand = brand;
        currentPage = 1;
        renderBrandFilters();
        renderProductsGrid();
    };

    function setupSearch() {
        if (!searchInput) return;
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value.trim().toLowerCase();
            currentPage = 1;
            renderProductsGrid();
        });
    }

    function renderProductsGrid() {
        if (!productsGridContainer) return;

        filteredProducts = categoryProducts.filter(p => {
            const matchesBrand = currentBrand === "all" || p.Brand === currentBrand;
            const matchesSearch = searchQuery === "" ||
                p.Title.toLowerCase().includes(searchQuery) ||
                p.Brand.toLowerCase().includes(searchQuery) ||
                p.Description.toLowerCase().includes(searchQuery);

            return matchesBrand && matchesSearch;
        });

        if (resultsCount) resultsCount.textContent = filteredProducts.length;

        const paginationContainer = document.getElementById("pagination-container");

        if (filteredProducts.length === 0) {
            productsGridContainer.innerHTML = "";
            if (paginationContainer) paginationContainer.innerHTML = "";
            if (emptyState) emptyState.classList.remove("hidden");
            return;
        } else {
            if (emptyState) emptyState.classList.add("hidden");
        }

        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentProducts = filteredProducts.slice(startIndex, endIndex);

        productsGridContainer.innerHTML = currentProducts.map((product, index) => {
            const actualIndex = startIndex + index;
            const mediaUrl = product.ImageLink;
            const thumbnailUrl = getCloudinaryThumbnail(mediaUrl);
            const isVideo = isVideoUrl(mediaUrl);

            const isAvailable = product.Status !== "ناموجود";
            const statusClass = isAvailable ? "bg-teal/10 text-teal border-teal/20" : "bg-amber-100 text-amber-700 border-amber-200";

            return `
                <div onclick="openProductModal(${actualIndex})" class="bg-white rounded-2xl shadow-md border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden">
                    
                    <div class="relative h-72 bg-slate-100 overflow-hidden select-none">
                        <img src="${thumbnailUrl}" alt="${product.Title}" 
                             class="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                             onerror="this.src='../assets/images/logo.png'; this.classList.add('p-6','object-contain');">

                        ${isVideo ? `
                            <div class="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none z-10">
                                <div class="w-12 h-12 rounded-full bg-teal text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                                    <i class="fas fa-play mr-0.5 text-lg"></i>
                                </div>
                            </div>
                        ` : ''}

                        <div class="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                            ${product.Brand ? `<span class="bg-navy/80 backdrop-blur-md text-white text-[10px] px-2.5 py-1 rounded-full font-medium">${product.Brand}</span>` : ''}
                        </div>

                        <div class="absolute bottom-3 right-3 z-20">
                            <span class="border text-[10px] px-2.5 py-0.5 rounded-full font-bold backdrop-blur-md ${statusClass}">
                                ${product.Status || 'موجود'}
                            </span>
                        </div>
                    </div>

                    <div class="p-4 flex flex-col flex-grow justify-between">
                        <div>
                            <h3 class="text-base font-bold text-navy mb-2 group-hover:text-teal transition line-clamp-1">${product.Title}</h3>
                            <p class="text-slate-500 text-xs line-clamp-2 leading-relaxed mb-3">${product.Description || 'برای مشاهده مشخصات کامل کلیک کنید'}</p>
                        </div>

                        <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <div class="text-teal font-extrabold text-sm">
                                ${formatPrice(product.Price)}
                            </div>
                            ${product.Unit ? `<span class="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">${product.Unit}</span>` : ''}
                        </div>
                    </div>

                </div>
            `;
        }).join('');

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const paginationContainer = document.getElementById("pagination-container");
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = "";
            return;
        }

        let html = "";
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

    window.changePage = function (page) {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (page < 1 || page > totalPages) return;

        currentPage = page;
        renderProductsGrid();

        const container = document.getElementById("products-container");
        if (container) {
            const headerOffset = 120;
            const elementPosition = container.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
    };

    window.openProductModal = function (index) {
        const product = filteredProducts[index];
        if (!product) return;

        window.currentModalProduct = product;
        updateModalUI();

        const modal = document.getElementById("product-modal");
        if (modal) {
            modal.classList.remove("hidden");
            modal.classList.add("flex");
            document.body.style.overflow = "hidden";
        }
    };

    window.closeProductModal = function () {
        const modal = document.getElementById("product-modal");
        const videoEl = document.getElementById("modal-video");

        if (videoEl) {
            videoEl.pause();
            videoEl.src = "";
        }

        if (modal) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
            document.body.style.overflow = "auto";
        }
    };

    function updateModalUI() {
        if (!window.currentModalProduct) return;

        const imgEl = document.getElementById("modal-img");
        const videoEl = document.getElementById("modal-video");
        const titleEl = document.getElementById("modal-title");
        const brandEl = document.getElementById("modal-brand");
        const statusEl = document.getElementById("modal-status");
        const priceEl = document.getElementById("modal-price");
        const unitEl = document.getElementById("modal-unit");
        const descEl = document.getElementById("modal-description");

        const product = window.currentModalProduct;
        const mediaUrl = product.ImageLink;
        const isVideo = isVideoUrl(mediaUrl);

        zoomScale = 1;
        panX = 0;
        panY = 0;
        if (imgEl) updateImageTransform(imgEl);

        if (isVideo) {
            if (imgEl) imgEl.classList.add("hidden");
            if (videoEl) {
                videoEl.classList.remove("hidden");
                videoEl.src = mediaUrl;
            }
        } else {
            if (videoEl) {
                videoEl.pause();
                videoEl.classList.add("hidden");
                videoEl.src = "";
            }
            if (imgEl) {
                imgEl.classList.remove("hidden");
                imgEl.src = mediaUrl || "../assets/images/logo.png";
            }
        }

        if (titleEl) titleEl.textContent = product.Title;
        if (brandEl) brandEl.textContent = product.Brand ? `برند: ${product.Brand}` : "برند متفرقه";
        
        if (statusEl) {
            const isAvailable = product.Status !== "ناموجود";
            statusEl.textContent = product.Status || "موجود";
            statusEl.className = `text-xs px-3 py-1 rounded-full font-semibold ${isAvailable ? 'bg-teal/10 text-teal border border-teal/20' : 'bg-amber-100 text-amber-700 border border-amber-200'}`;
        }

        if (priceEl) priceEl.innerHTML = formatPrice(product.Price);
        if (unitEl) unitEl.textContent = product.Unit ? `/ ${product.Unit}` : "";
        if (descEl) descEl.textContent = product.Description || "توضیحات تکمیلی برای این محصول ثبت نشده است.";
    }

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

    function initHeaderScroll() {
        const header = document.getElementById("video-header") || document.getElementById("header");
        const logoDark = document.getElementById("header-logo-dark");
        const logoLight = document.getElementById("header-logo-light");
        const title = document.getElementById("header-title");
        const subtitle = document.getElementById("header-subtitle");
        const desktopMenu = document.getElementById("desktop-menu");
        const mobileMenuBtn = document.getElementById("mobile-menu-btn");
        const homeBtn = document.getElementById("header-home-btn");

        if (!header) return;

        function handleScroll() {
            if (window.scrollY > 50) {
                header.style.cssText = "background-color: #ffffff !important; backdrop-filter: none;";
                header.classList.remove("text-white");
                header.classList.add("text-slate-800", "shadow-md");

                if (logoDark && logoLight) { logoLight.classList.add("hidden"); logoDark.classList.remove("hidden"); }
                if (desktopMenu) { desktopMenu.classList.remove("text-white"); desktopMenu.classList.add("text-slate-800"); }

                if (mobileMenuBtn) {
                    mobileMenuBtn.classList.remove("bg-white/10", "bg-white/20", "text-white", "border-transparent");
                    mobileMenuBtn.classList.add("bg-slate-100", "text-slate-800", "border", "border-slate-300");
                }
                if (homeBtn) { homeBtn.classList.remove("bg-white/10", "text-white"); homeBtn.classList.add("bg-slate-100", "text-slate-800"); }

                if (title) title.style.setProperty("color", "#0f172a", "important");
                if (subtitle) subtitle.style.setProperty("color", "#64748b", "important");

            } else {
                header.style.cssText = "background-color: #0a192f !important; backdrop-filter: blur(12px) !important;";
                header.classList.remove("text-slate-800", "shadow-md");
                header.classList.add("text-white");

                if (logoDark && logoLight) { logoDark.classList.add("hidden"); logoLight.classList.remove("hidden"); }
                if (desktopMenu) { desktopMenu.classList.remove("text-slate-800"); desktopMenu.classList.add("text-white"); }

                if (mobileMenuBtn) {
                    mobileMenuBtn.classList.remove("bg-slate-100", "text-slate-800", "border", "border-slate-300");
                    mobileMenuBtn.classList.add("bg-white/10", "text-white", "border-transparent");
                }
                if (homeBtn) { homeBtn.classList.remove("bg-slate-100", "text-slate-800"); homeBtn.classList.add("bg-white/10", "text-white"); }

                if (title) title.style.setProperty("color", "#ffffff", "important");
                if (subtitle) subtitle.style.setProperty("color", "#d1d5db", "important");
            }
        }

        window.addEventListener("scroll", handleScroll);
        handleScroll();
    }

    function initFloatingActions() {
        const floatingActions = document.getElementById("floating-actions");
        const scrollTopBtn = document.getElementById("scroll-top");

        if (floatingActions) {
            window.addEventListener("scroll", () => {
                if (window.pageYOffset > 300) {
                    floatingActions.classList.remove("opacity-0", "pointer-events-none");
                    floatingActions.classList.add("opacity-100", "pointer-events-auto");
                } else {
                    floatingActions.classList.remove("opacity-100", "pointer-events-auto");
                    floatingActions.classList.add("opacity-0", "pointer-events-none");
                }
            });
        }

        if (scrollTopBtn) {
            scrollTopBtn.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        }
    }

    // ===== سیستم زوم و Pan تصویر Modal =====
    const modalImg = document.getElementById("modal-img");

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

        imgEl.style.transition = isDragging ? "none" : "transform 0.15s ease-out";
        imgEl.style.transformOrigin = "center center";
        imgEl.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${zoomScale})`;
        imgEl.style.cursor = canPan ? (isDragging ? "grabbing" : "grab") : "zoom-in";
    }

    if (modalImg) {
        modalImg.addEventListener("load", function () {
            clampPan();
            updateImageTransform(modalImg);
        });

        modalImg.addEventListener("wheel", function (e) {
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

        modalImg.addEventListener("mousedown", function (e) {
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

        window.addEventListener("mousemove", function (e) {
            if (!isDragging) return;
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            clampPan();
            updateImageTransform(modalImg);
        });

        window.addEventListener("mouseup", function () {
            if (isDragging) {
                isDragging = false;
                updateImageTransform(modalImg);
            }
        });

        modalImg.addEventListener("dblclick", function (e) {
            if (zoomScale === 1) {
                zoomScale = 2.5;
            } else {
                zoomScale = 1;
                panX = 0;
                panY = 0;
            }
            clampPan();
            updateImageTransform(modalImg);
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeProductModal();
    });
});





// ===== Mobile Categories Accordion Logic =====
const mobileCategoriesBtn = document.getElementById('mobile-categories-btn');
const mobileCategoriesSubmenu = document.getElementById('mobile-categories-submenu');
const mobileArrow = document.getElementById('mobile-arrow');

if (mobileCategoriesBtn && mobileCategoriesSubmenu) {
    mobileCategoriesBtn.addEventListener('click', function (e) {
        // جلوگیری از رفتار پیش‌فرض لینک بودن
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = !mobileCategoriesSubmenu.classList.contains('hidden');

        if (!isOpen) {
            // کلیک اول: باز کردن زیرمنوی آکاردئونی
            mobileCategoriesSubmenu.classList.remove('hidden');
            mobileCategoriesSubmenu.classList.add('flex');
            if (mobileArrow) mobileArrow.classList.add('rotate-180');
        } else {
            // کلیک دوم: بستن زیرمنوی آکاردئونی
            mobileCategoriesSubmenu.classList.add('hidden');
            mobileCategoriesSubmenu.classList.remove('flex');
            if (mobileArrow) mobileArrow.classList.remove('rotate-180');
        }
    });
}