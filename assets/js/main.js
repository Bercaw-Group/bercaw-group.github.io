// ===== Initialize AOS Animations =====
AOS.init({
    once: true,
});

// ===== Header Scroll Effect & Logo Switcher =====
const header = document.getElementById('header');
const logoLight = document.getElementById('header-logo-light');
const logoDark = document.getElementById('header-logo-dark');
let lastScroll = 0;

function updateHeader() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 100) {
        if (header) header.classList.add('at-top');
        // نمایش لوگوی روشن در بالای صفحه (پس‌زمینه تیره)
        if (logoLight) logoLight.classList.remove('hidden');
        if (logoDark) logoDark.classList.add('hidden');
    } else {
        if (header) header.classList.remove('at-top');
        // نمایش لوگوی تیره در زمان اسکرول (پس‌زمینه سفید)
        if (logoLight) logoLight.classList.add('hidden');
        if (logoDark) logoDark.classList.remove('hidden');
    }
    
    lastScroll = currentScroll;
}

window.addEventListener('scroll', updateHeader);
window.addEventListener('load', updateHeader);
updateHeader();

// ===== Mobile Menu Toggle =====
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
        const icon = mobileMenuBtn.querySelector('i');
        
        if (mobileMenu.classList.contains('hidden')) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    });

    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// ===== Mobile Forms Submenu Toggle =====
const mobileFormsToggle = document.getElementById('mobile-forms-toggle');
const mobileFormsSubmenu = document.getElementById('mobile-forms-submenu');
const mobileFormsIcon = document.getElementById('mobile-forms-icon');

if (mobileFormsToggle && mobileFormsSubmenu) {
    mobileFormsToggle.addEventListener('click', () => {
        mobileFormsSubmenu.classList.toggle('hidden');
        if (mobileFormsIcon) mobileFormsIcon.classList.toggle('rotate-180');
    });
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        if (href === '#' || href.startsWith('http')) return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
            const headerHeight = header ? header.offsetHeight : 80;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

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

// ===== Consultation Modal =====
function openConsultationModal() {
    const modal = document.getElementById('consultation-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
}

function closeConsultationModal() {
    const modal = document.getElementById('consultation-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
        
        const form = document.getElementById('consultation-form');
        if (form) form.reset();
        
        const successMsg = document.getElementById('form-success');
        const errorMsg = document.getElementById('form-error');
        if (successMsg) successMsg.classList.add('hidden');
        if (errorMsg) errorMsg.classList.add('hidden');
    }
}

const consultationModal = document.getElementById('consultation-modal');
if (consultationModal) {
    consultationModal.addEventListener('click', (e) => {
        if (e.target.id === 'consultation-modal') {
            closeConsultationModal();
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeConsultationModal();
        closeLightbox();
    }
});

// ===== Image Lightbox =====
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
        if (e.target.id === 'lightbox') {
            closeLightbox();
        }
    });
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

// ===== Utilities =====
function formatPrice(price) {
    if (!price) return '0';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('hidden');
        element.style.display = 'block';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('hidden');
        element.style.display = 'none';
    }
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
                <p class="text-xl text-gray-600">${message}</p>
            </div>
        `;
    }
}

function showEmptyState(containerId, message) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-box-open text-5xl text-gray-300 mb-4"></i>
                <p class="text-xl text-gray-600">${message}</p>
            </div>
        `;
    }
}

// ===== Active Navigation Link =====
const sections = document.querySelectorAll('section[id]');

if (sections.length > 0) {
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('text-teal');
            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                link.classList.add('text-teal');
            }
        });
    });
}

// ===== Lazy Load Images =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===== Portfolio Modal & Slider Logic =====
window.currentModalProject = null;
window.currentModalImgIndex = 0;

// باز کردن پاپ‌آپ پروژه‌ها
window.openProjectModal = function(index) {
    // نکته: متغیر داده‌ها بسته به کدهای فایل sheets.js شما ممکن است allProjects باشد
    let project = null;
    if (typeof filteredProjects !== 'undefined' && filteredProjects[index]) {
        project = filteredProjects[index];
    } else if (typeof allProjects !== 'undefined' && allProjects[index]) {
        project = allProjects[index];
    }
    
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
    if (!window.currentModalProject || !window.currentModalProject.images || !window.currentModalProject.images.length) return;

    window.currentModalImgIndex += direction;
    
    if (window.currentModalImgIndex < 0) {
        window.currentModalImgIndex = window.currentModalProject.images.length - 1;
    } else if (window.currentModalImgIndex >= window.currentModalProject.images.length) {
        window.currentModalImgIndex = 0;
    }

    updateModalUI();
};

// بروزرسانی اطلاعات المان‌های داخل پاپ‌آپ
function updateModalUI() {
    if (!window.currentModalProject) return;

    const imgEl = document.getElementById('modal-img');
    const counterEl = document.getElementById('modal-counter');
    const titleEl = document.getElementById('modal-title');
    const categoryEl = document.getElementById('modal-category');
    const cityEl = document.getElementById('modal-city');
    const descEl = document.getElementById('modal-description');
    const prevBtn = document.getElementById('modal-prev-btn');
    const nextBtn = document.getElementById('modal-next-btn');

    if (imgEl) imgEl.src = window.currentModalProject.images[window.currentModalImgIndex];
    if (counterEl) counterEl.textContent = `${window.currentModalImgIndex + 1} / ${window.currentModalProject.images.length}`;
    if (titleEl) titleEl.textContent = window.currentModalProject.title;
    if (categoryEl) categoryEl.textContent = window.currentModalProject.category;
    
    if (cityEl) {
        cityEl.innerHTML = window.currentModalProject.city ? `<i class="fas fa-map-marker-alt text-teal ml-1"></i>${window.currentModalProject.city}` : '';
    }
    
    if (descEl) descEl.textContent = window.currentModalProject.description || 'توضیحات تکمیلی برای این پروژه ثبت نشده است.';

    const hasMultiple = window.currentModalProject.images.length > 1;
    if (prevBtn) prevBtn.style.display = hasMultiple ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = hasMultiple ? 'flex' : 'none';
    if (counterEl) counterEl.style.display = hasMultiple ? 'block' : 'none';
}

// ===== Activity Categories (Home Page) =====
// برای افزودن یک حوزه فعالیت جدید، فقط یک آبجکت به این آرایه اضافه کنید.
// وقتی صفحه اختصاصی آن حوزه آماده شد، available را true و link را آدرس صفحه اصلی همان پوشه کنید
// (مثال: مانند آجر → '/brick/brick-index.html').
const activityCategories = [
    {
        title: 'آجر نما نسوز',
        description: 'تامین و اجرای انواع آجر نسوز، آجر نما و دیوارپوش ساختمانی',
        icon: 'fa-th-large',
        link: '/brick/brick-index.html',
        image: "/assets/images/cat-brick.png",
        available: true
    },
    {
        title: 'آسانسور',
        description: 'مشاوره، تامین و نصب آسانسورهای ساختمانی',
        icon: 'fa-arrows-alt-v',
        link: '/elevator/elevator-index.html',
        image: "/assets/images/cat-elevator.png",
        available: true
    },
    {
        title: 'درب و پنجره',
        description: 'تامین و اجرای انواع درب و پنجره UPVC، آلومینیوم و فلزی',
        icon: 'fa-door-open',
        link: '/window/window-index.html',
        image: "/assets/images/cat-window.png",
        available: true
    },
    {
        title: 'طراحی معماری، دکوراسیون و نما',
        description: 'طراحی تخصصی با متد های روز دنیا',
        icon: 'fa-building',
        link: '/architect/architect-index.html',
        image: "/assets/images/cat-arch.png",
        available: true
    },
    {
        title: 'میلگرد بستر و والمش',
        description: 'تامین و اجرای میلگرد بستر و شبکه‌های والمش',
        icon: 'fa-grip-lines',
        link: '/wallmesh/wallmesh-index.html',
        image: "/assets/images/cat-wallmesh.jfif",
        available: true
    },
    {
        title: 'سایر مصالح ساختمانی',
        description: 'تامین سایر مصالح مورد نیاز پروژه‌های ساختمانی',
        icon: 'fa-boxes-stacked',
        link: '#',
        image: "/assets/images/cat-other.jfif",
        available: false
    }
];

function renderActivityCategories() {
    const grid = document.getElementById('categories-grid');
    if (!grid) return;

    // تغییر کلاس کانتینر اصلی به 6 ستون در دسکتاپ
    grid.className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4";

    grid.innerHTML = activityCategories.map(cat => {
        // فرض بر این است که یک کلید به نام image به داده‌های cat اضافه کرده‌اید
        const bgImage = cat.image || 'default.jpg'; 

        if (cat.available) {
            return `
                <a href="${cat.link}" class="group relative h-[400px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-teal block">
                    <!-- Background Image & Overlay -->
                    <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" style="background-image: url('${bgImage}')"></div>
                    <div class="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity"></div>
                    
                    <!-- Content -->
                    <div class="absolute inset-0 p-5 flex flex-col justify-end text-white z-10">
                        <div class="w-12 h-12 bg-teal/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-3 group-hover:bg-teal transition-colors">
                            <i class="fas ${cat.icon} text-xl text-teal group-hover:text-white transition-colors"></i>
                        </div>
                        <h3 class="text-lg font-bold mb-1 text-white">${cat.title}</h3>
                        <p class="text-xs text-gray-300 line-clamp-2 mb-3 leading-relaxed">${cat.description}</p>
                        <span class="inline-flex items-center text-teal text-xs font-semibold">
                            مشاهده
                            <i class="fas fa-arrow-left mr-1.5 transition-transform group-hover:-translate-x-1"></i>
                        </span>
                    </div>
                </a>
            `;
        }

        return `
            <div class="relative h-[400px] rounded-2xl overflow-hidden shadow-lg opacity-75 border-2 border-transparent block">
                <!-- Background Image & Overlay -->
                <div class="absolute inset-0 bg-cover bg-center grayscale" style="background-image: url('${bgImage}')"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-transparent"></div>

                <span class="absolute top-3 left-3 bg-gray-800/80 backdrop-blur-sm text-gray-200 text-[10px] font-semibold px-2.5 py-0.5 rounded-full z-20">به‌زودی</span>
                
                <!-- Content -->
                <div class="absolute inset-0 p-5 flex flex-col justify-end text-white z-10">
                    <div class="w-12 h-12 bg-gray-800/40 backdrop-blur-md rounded-xl flex items-center justify-center mb-3">
                        <i class="fas ${cat.icon} text-xl text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-bold mb-1 text-white">${cat.title}</h3>
                    <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed">${cat.description}</p>
                </div>
            </div>
        `;
    }).join('');
}

renderActivityCategories();

// ===== Console Message =====
console.log('%c به‌رچاو | راهکارهای هوشمند ساختمان', 'color: #20b2aa; font-size: 20px; font-weight: bold;');
console.log('%c Website developed with ❤️', 'color: #0a192f; font-size: 14px;');

// ===== Interactive Canvas Background (Hero) =====
const heroCanvas = document.getElementById('hero-canvas');

if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    let particles = [];
    const mouse = { x: null, y: null, radius: 170 };

    function resizeCanvas() {
        heroCanvas.width = heroCanvas.offsetWidth;
        heroCanvas.height = heroCanvas.offsetHeight;
        initParticles();
    }

    // ثبت موقعیت موس نسبت به بخش هیرو
    window.addEventListener('mousemove', (e) => {
        const rect = heroCanvas.getBoundingClientRect();
        if (
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom &&
            e.clientX >= rect.left &&
            e.clientX <= rect.right
        ) {
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        } else {
            mouse.x = null;
            mouse.y = null;
        }
    });

    class Particle {
        constructor() {
            this.x = Math.random() * heroCanvas.width;
            this.y = Math.random() * heroCanvas.height;
            this.vx = (Math.random() - 0.5) * 1.2;
            this.vy = (Math.random() - 0.5) * 1.2;
            this.radius = Math.random() * 2 + 1;
            this.baseColor = '#64ffda'; // teal-light
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.baseColor;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#64ffda';
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        update() {
            // برخورد با دیواره‌ها
            if (this.x < 0 || this.x > heroCanvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > heroCanvas.height) this.vy *= -1;

            // واکنش به حرکت موس (دفع و تغییر مسیر)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x -= Math.cos(angle) * force * 4;
                    this.y -= Math.sin(angle) * force * 4;
                }
            }

            this.x += this.vx;
            this.y += this.vy;
            this.draw();
        }
    }

    function initParticles() {
        particles = [];
        const count = Math.floor((heroCanvas.width * heroCanvas.height) / 8500);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        for (let a = 0; a < particles.length; a++) {
            // اتصال ذرات به یکدیگر
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = 1 - (distance / 120);
                    ctx.strokeStyle = `rgba(32, 178, 170, ${opacity * 0.35})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }

            // اتصال ذرات به نشانگر موس
            if (mouse.x !== null && mouse.y !== null) {
                const dx = particles[a].x - mouse.x;
                const dy = particles[a].y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const opacity = 1 - (distance / mouse.radius);
                    ctx.strokeStyle = `rgba(100, 255, 218, ${opacity * 0.75})`;
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        // ایجاد پس‌زمینه گرادینت سرمه‌ای متناسب با تم سایت
        const gradient = ctx.createLinearGradient(0, 0, heroCanvas.width, heroCanvas.height);
        gradient.addColorStop(0, '#0a192f');
        gradient.addColorStop(0.5, '#112240');
        gradient.addColorStop(1, '#0a2336');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, heroCanvas.width, heroCanvas.height);

        particles.forEach(p => p.update());
        connectParticles();

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
}


// ===== Interactive Mouse Effects for About & Services Section =====
const aboutSection = document.getElementById('about');
const aboutSpotlight = document.getElementById('about-spotlight');

if (aboutSection) {
    // 1. حرکت نور پس‌زمینه متناسب با مختصات موس
    aboutSection.addEventListener('mousemove', (e) => {
        const rect = aboutSection.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (aboutSpotlight) {
            aboutSpotlight.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(32, 178, 170, 0.25), transparent 80%)`;
        }
    });

    // 2. چرخش 3D کارت‌ها با حرکت موس روی آن‌ها
    const tiltCards = aboutSection.querySelectorAll('.tilt-card');
    
    tiltCards.forEach(card => {
        card.style.transition = 'transform 0.1s ease-out, border-color 0.3s ease';
        card.style.transformStyle = 'preserve-3d';

        card.addEventListener('mousemove', (e) => {
            const cardRect = card.getBoundingClientRect();
            const cardWidth = cardRect.width;
            const cardHeight = cardRect.height;

            const centerX = cardRect.left + cardWidth / 2;
            const centerY = cardRect.top + cardHeight / 2;

            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            const rotateX = (+1 * (mouseY / (cardHeight / 2)) * 12).toFixed(2);
            const rotateY = (-1 * (mouseX / (cardWidth / 2)) * 12).toFixed(2);

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });

        // بازگشت به حالت اولیه هنگام خروج موس
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease, border-color 0.3s ease';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
}


// ===== Mobile Categories Accordion Logic =====
const mobileCategoriesBtn = document.getElementById('mobile-categories-btn');
const mobileCategoriesSubmenu = document.getElementById('mobile-categories-submenu');
const mobileArrow = document.getElementById('mobile-arrow');

if (mobileCategoriesBtn && mobileCategoriesSubmenu) {
    mobileCategoriesBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isOpen = !mobileCategoriesSubmenu.classList.contains('hidden');

        if (!isOpen) {
            // کلیک اول: باز کردن زیرمنوی آکاردئونی
            mobileCategoriesSubmenu.classList.remove('hidden');
            mobileCategoriesSubmenu.classList.add('flex');
            if (mobileArrow) mobileArrow.classList.add('rotate-180');
        } else {
            // کلیک دوم: بستن منوی موبایل و اسکرول دقیق به بخش #categories
            const mobileMenuEl = document.getElementById('mobile-menu');
            const mobileMenuBtnEl = document.getElementById('mobile-menu-btn');
            
            // ۱. ابتدا منوی موبایل را می‌بندیم تا ارتفاع واقعی صفحه مشخص شود
            if (mobileMenuEl) mobileMenuEl.classList.add('hidden');
            if (mobileMenuBtnEl) {
                const icon = mobileMenuBtnEl.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }

            // ۲. محاسبه دقیق موقعیت بخش categories و کسر ارتفاع هدر
            setTimeout(() => {
                const targetSection = document.getElementById('categories');
                if (targetSection) {
                    const headerEl = document.getElementById('header');
                    const headerHeight = headerEl ? headerEl.offsetHeight : 80;
                    const elementPosition = targetSection.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }, 50); // یک وقفه بسیار کوتاه برای ثبت بسته شدن منو
        }
    });
}