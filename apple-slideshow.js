/**
 * Apple-Style Premium Slideshow Component
 * Features: Ken Burns, Smooth Fades, Dynamic Fetching
 */

class AppleSlideshow {
    constructor(elementId, options = {}) {
        console.log(`Slideshow: Initializing for #${elementId}`);
        this.container = document.getElementById(elementId);
        if (!this.container) {
            console.error(`Slideshow: Element #${elementId} not found.`);
            return;
        }

        this.tourId = options.tourId || this.container.getAttribute('data-tour-id') || this.detectTourId();
        this.tourName = options.tourName || this.container.getAttribute('data-tour-name') || this.tourId;
        
        this.images = [];
        this.currentIndex = 0;
        this.autoplayInterval = options.autoplayInterval || 3500; // Faster change (3.5s)
        this.intervalId = null;

        this.init();
    }

    detectTourId() {
        const path = window.location.pathname;
        const slug = path.split('/').pop().replace('.html', '').replace('-tour', '').replace('-bay', '');
        return slug || 'default';
    }

    async init() {
        this.container.classList.add('apple-slideshow-container');
        this.container.innerHTML = '<div class="apple-slideshow-inner"></div>';
        this.inner = this.container.querySelector('.apple-slideshow-inner');

        try {
            await this.loadImages();
        } catch (e) {
            console.error("Slideshow: Error loading images", e);
        }
        
        if (this.images.length === 0) {
            console.warn("Slideshow: No images found, loading placeholders.");
            this.loadPlaceholders();
        }

        this.renderSlides();
        this.renderControls();
        this.startAutoplay();
        this.setupTouch();
    }

    async loadImages() {
        // Access tourGalleries globally
        const galleries = window.tourGalleries || (typeof tourGalleries !== 'undefined' ? tourGalleries : null);
        
        if (galleries) {
            console.log(`Slideshow: Found tourGalleries config. Looking for ${this.tourId}...`);
            let data = galleries[this.tourId];
            
            if (!data) {
                const keys = Object.keys(galleries);
                const fuzzyKey = keys.find(k => this.tourId.includes(k) || k.includes(this.tourId));
                if (fuzzyKey) {
                    console.log(`Slideshow: Fuzzy matched ${this.tourId} to ${fuzzyKey}`);
                    data = galleries[fuzzyKey];
                }
            }

            if (data && data.images) {
                const folder = data.folder || `images/tours/${this.tourId}`;
                this.images = data.images.map(img => `${folder}/${img}`);
                console.log(`Slideshow: Successfully loaded ${this.images.length} images for ${this.tourId}`);
                return;
            }
        } else {
            console.warn("Slideshow: tourGalleries config not found on window or global scope.");
        }

        // Fallback: Try specific folders mentioned by user
        const commonFolders = [
            this.tourId,
            `${this.tourId} bay`,
            `${this.tourId} tour`,
            `sazan island tour`,
            `dafina bay`,
            `grama bay`,
            `Haxhi Ali cave Karaburun peninsula`,
            `sunset`
        ];
        
        const patterns = [`${this.tourId}-1.jpg`, `1.jpg`, `image1.jpg` ];

        for (const folder of commonFolders) {
            for (const pattern of patterns) {
                const url = `${folder}/${pattern}`;
                if (await this.checkImageExists(url)) {
                    this.images.push(url);
                }
            }
            if (this.images.length > 0) break;
        }
    }

    checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = encodeURI(url);
        });
    }

    loadPlaceholders() {
        const placeholders = [
            'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=1600',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1600',
            'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=1600'
        ];
        this.images = placeholders;
    }

    renderSlides() {
        if (!this.inner) return;
        this.inner.innerHTML = '';
        this.images.forEach((src, idx) => {
            const slide = document.createElement('div');
            slide.className = `apple-slide ${idx === 0 ? 'active' : ''}`;
            
            const img = document.createElement('img');
            img.src = encodeURI(src);
            img.alt = `${this.tourName} view ${idx + 1}`;
            img.onerror = () => console.error(`Slideshow: Failed to load image: ${src}`);
            
            slide.appendChild(img);
            this.inner.appendChild(slide);
        });
    }

    renderControls() {
        if (this.images.length <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.className = 'ss-nav-btn ss-prev';
        prevBtn.innerHTML = '←';
        prevBtn.onclick = (e) => { e.stopPropagation(); this.prev(); };

        const nextBtn = document.createElement('button');
        nextBtn.className = 'ss-nav-btn ss-next';
        nextBtn.innerHTML = '→';
        nextBtn.onclick = (e) => { e.stopPropagation(); this.next(); };

        this.container.appendChild(prevBtn);
        this.container.appendChild(nextBtn);

        const indicators = document.createElement('div');
        indicators.className = 'ss-indicators';
        this.images.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `ss-dot ${idx === 0 ? 'active' : ''}`;
            dot.onclick = (e) => { e.stopPropagation(); this.goTo(idx); };
            indicators.appendChild(dot);
        });
        this.container.appendChild(indicators);
    }

    goTo(index) {
        if (index === this.currentIndex) return;
        
        const slides = this.container.querySelectorAll('.apple-slide');
        const dots = this.container.querySelectorAll('.ss-dot');

        if (slides[this.currentIndex]) slides[this.currentIndex].classList.remove('active');
        if (dots[this.currentIndex]) dots[this.currentIndex].classList.remove('active');

        this.currentIndex = index;

        if (slides[this.currentIndex]) slides[this.currentIndex].classList.add('active');
        if (dots[this.currentIndex]) dots[this.currentIndex].classList.add('active');

        this.resetAutoplay();
    }

    next() {
        if (this.images.length === 0) return;
        let nextIndex = (this.currentIndex + 1) % this.images.length;
        this.goTo(nextIndex);
    }

    prev() {
        if (this.images.length === 0) return;
        let prevIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.goTo(prevIndex);
    }

    startAutoplay() {
        if (this.images.length <= 1) return;
        this.intervalId = setInterval(() => this.next(), this.autoplayInterval);
    }

    resetAutoplay() {
        clearInterval(this.intervalId);
        this.startAutoplay();
    }

    setupTouch() {
        let startX = 0;
        this.container.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        this.container.addEventListener('touchend', e => {
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) this.next();
                else this.prev();
            }
        }, { passive: true });
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAppSlideshow());
} else {
    initAppSlideshow();
}

function initAppSlideshow() {
    const el = document.getElementById('apple-slideshow');
    if (el && !el.dataset.initialized) {
        el.dataset.initialized = "true";
        new AppleSlideshow('apple-slideshow');
    }
}
