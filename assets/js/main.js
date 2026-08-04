// ===== Initialize AOS Animations =====
AOS.init({
    once: true,
});

// ===== Header Scroll Effect =====
const header = document.getElementById('header');
let lastScroll = 0;

function updateHeader() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 100) {
        if (header) header.classList.add('at-top');
    } else {
        if (header) header.classList.remove('at-top');
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

// ===== Scroll to Top Button =====
const scrollTopBtn = document.getElementById('scroll-top');

if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.remove('opacity-0', 'pointer-events-none');
            scrollTopBtn.classList.add('opacity-100');
        } else {
            scrollTopBtn.classList.add('opacity-0', 'pointer-events-none');
            scrollTopBtn.classList.remove('opacity-100');
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
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

// ===== Console Message =====
console.log('%c به‌رچاو | راهکارهای هوشمند ساختمان', 'color: #20b2aa; font-size: 20px; font-weight: bold;');
console.log('%c Website developed with ❤️', 'color: #0a192f; font-size: 14px;');