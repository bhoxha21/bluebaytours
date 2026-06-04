// Depends on gallery-config.js being loaded first

document.addEventListener('DOMContentLoaded', () => {
  populateTourCards();
  populateTourGallery();
  populateIndexGallery();
});

function populateTourCards() {
  const cards = document.querySelectorAll('.tour-card[data-tour-id]');
  cards.forEach(card => {
    const tourId = card.getAttribute('data-tour-id');
    const data = tourGalleries[tourId];
    if (data && data.displayPhoto) {
      const img = card.querySelector('.tour-img-wrap img');
      if (img) {
        img.src = `${data.folder}/${data.displayPhoto}`;
      }
    }
  });

  // Also handle hero headers on individual tour pages
  const heroImg = document.querySelector('.hero-img-wrap[data-tour-id] img');
  if (heroImg) {
    const tourId = heroImg.closest('.hero-img-wrap').getAttribute('data-tour-id');
    const data = tourGalleries[tourId];
    if (data && data.displayPhoto) {
      heroImg.src = `${data.folder}/${data.displayPhoto}`;
    }
  }
}

function populateIndexGallery() {
  const track = document.getElementById('galTrack');
  // Only run if we are on index.html with a global gallery track
  if (!track || document.querySelector('.tour-page-marker')) return;

  track.innerHTML = '';
  let allImages = [];
  
  // Collect a few images from each tour to form a mixed gallery
  Object.values(tourGalleries).forEach(data => {
    if (data.images && data.images.length > 0) {
      // take up to 2 images per tour for the global gallery to keep it clean
      const selected = data.images.slice(0, 2);
      selected.forEach(imgName => {
        allImages.push({ folder: data.folder, src: imgName });
      });
    }
  });

  allImages.forEach((imgObj, idx) => {
    const div = document.createElement('div');
    div.className = `gallery-item`;
    div.setAttribute('onclick', 'openLightbox(this)');
    
    const img = document.createElement('img');
    img.src = `${imgObj.folder}/${imgObj.src}`;
    img.alt = 'Blue Bay Guest Moment';
    
    div.appendChild(img);
    track.appendChild(div);
  });
}

const sliderCss = `
  /* ===== DYNAMIC GALLERY SLIDER ===== */
  .gallery-container { position: relative; margin-top: 2rem; }
  .gallery-viewport { overflow: hidden; padding: 1rem 0; }
  .gallery-track { display: flex; gap: 2rem; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
  @media (max-width: 900px) { .gallery-track { gap: 1.5rem; } }
  .gallery-item { flex: 0 0 450px; height: 450px; border-radius: 4px; overflow: hidden; cursor: pointer; box-shadow: 0 20px 40px rgba(0,0,0,0.1); transition: transform 0.5s ease; }
  @media (max-width: 900px) { .gallery-item { flex: 0 0 85vw; height: 350px; } }
  .gallery-item:hover { transform: translateY(-10px); }
  .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 1s cubic-bezier(0.23, 1, 0.32, 1); }
  .gallery-item:hover img { transform: scale(1.08); }
  .gallery-nav { display: flex; justify-content: center; gap: 1.5rem; margin-top: 2rem; }
  .gal-btn { width: 50px; height: 50px; border-radius: 50%; border: 1px solid var(--gold, #C5A028); background: var(--white, #fff); color: var(--navy, #001F3F); font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
  .gal-btn:hover { background: var(--gold, #C5A028); color: var(--white, #fff); transform: scale(1.1); box-shadow: 0 10px 20px rgba(197, 160, 40, 0.2); }
`;

function injectSliderCSS() {
  if (!document.getElementById('gallery-slider-css')) {
    const style = document.createElement('style');
    style.id = 'gallery-slider-css';
    style.innerHTML = sliderCss;
    document.head.appendChild(style);
  }
}

function populateTourGallery() {
  const gallerySection = document.getElementById('tour-specific-gallery');
  if (!gallerySection) return;

  const tourId = gallerySection.getAttribute('data-tour-id');
  const data = tourGalleries[tourId];
  if (!data || !data.images || data.images.length === 0) {
    gallerySection.style.display = 'none'; // Hide if no images
    return;
  }

  injectSliderCSS();

  // Create Slider HTML structure
  gallerySection.innerHTML = `
    <div class="mask-wrap">
      <h2 class="section-title reveal reveal-mask">Tour Gallery</h2>
    </div>
    <div class="gallery-container">
      <div class="gallery-viewport" id="tourGalViewport">
        <div class="gallery-track" id="tourGalTrack"></div>
      </div>
      <div class="gallery-nav reveal reveal-up">
        <button class="gal-btn" onclick="slideTourGallery(-1)" aria-label="Previous">←</button>
        <button class="gal-btn" onclick="slideTourGallery(1)" aria-label="Next">→</button>
      </div>
    </div>
  `;

  const track = document.getElementById('tourGalTrack');

  data.images.forEach((imgName, idx) => {
    const div = document.createElement('div');
    div.className = `gallery-item`;
    div.setAttribute('onclick', 'openLightbox(this)');
    
    const img = document.createElement('img');
    img.src = `${data.folder}/${imgName}`;
    img.alt = `${tourId} gallery image`;
    
    div.appendChild(img);
    track.appendChild(div);
  });
}

let tourGalPos = 0;
window.slideTourGallery = function(dir) {
  const track = document.getElementById('tourGalTrack');
  const items = track ? track.querySelectorAll('.gallery-item') : [];
  const viewport = document.getElementById('tourGalViewport');
  if (!track || !items.length || !viewport) return;
  const itemW = items[0].offsetWidth + (window.innerWidth < 900 ? 24 : 32); // Responsive gap
  const max = (items.length * itemW) - viewport.offsetWidth;
  
  tourGalPos += dir * itemW;
  if (tourGalPos > max) tourGalPos = 0; // Loop to start
  if (tourGalPos < 0) tourGalPos = max; // Loop to end
  
  track.style.transform = `translateX(-${tourGalPos}px)`;
};


// Global Lightbox Logic (with navigation)
let currentGalleryImages = [];
let currentImageIndex = 0;

window.openLightbox = function(el) {
  const lightbox = document.getElementById('lightbox') || createLightbox();
  
  // Find all images in the same gallery
  const track = el.closest('.gallery-track');
  if (track) {
    currentGalleryImages = Array.from(track.querySelectorAll('img')).map(img => img.src);
    const clickedImg = el.querySelector('img').src;
    currentImageIndex = currentGalleryImages.indexOf(clickedImg);
  } else {
    currentGalleryImages = [el.querySelector('img').src];
    currentImageIndex = 0;
  }

  updateLightboxImage();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
};

function updateLightboxImage() {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  if (lbImg && currentGalleryImages[currentImageIndex]) {
    lbImg.src = currentGalleryImages[currentImageIndex];
    lbImg.classList.remove('zoomed');
  }
}

window.changeLightboxImage = function(dir, e) {
  if (e) e.stopPropagation();
  currentImageIndex += dir;
  if (currentImageIndex < 0) currentImageIndex = currentGalleryImages.length - 1;
  if (currentImageIndex >= currentGalleryImages.length) currentImageIndex = 0;
  updateLightboxImage();
};

window.closeLightbox = function() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }
};

window.toggleZoom = function(e) {
  e.stopPropagation();
  e.target.classList.toggle('zoomed');
};

function createLightbox() {
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.className = 'lightbox';
  lb.setAttribute('onclick', 'closeLightbox()');
  
  lb.innerHTML = `
    <button class="lightbox-close" onclick="closeLightbox()">✕</button>
    <button class="lightbox-nav prev" onclick="changeLightboxImage(-1, event)">&#10094;</button>
    <img id="lightboxImg" onclick="toggleZoom(event)" src="" alt="">
    <button class="lightbox-nav next" onclick="changeLightboxImage(1, event)">&#10095;</button>
  `;

  document.body.appendChild(lb);
  
  // Add some basic styles for the new nav buttons if they don't exist
  if (!document.getElementById('lightbox-nav-css')) {
    const style = document.createElement('style');
    style.id = 'lightbox-nav-css';
    style.innerHTML = `
      .lightbox-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(255,255,255,0.1);
        border: none;
        color: var(--navy);
        font-size: 2rem;
        padding: 1rem;
        cursor: pointer;
        z-index: 1001;
        transition: background 0.3s;
      }
      .lightbox-nav:hover { background: rgba(255,255,255,0.2); }
      .lightbox-nav.prev { left: 1rem; }
      .lightbox-nav.next { right: 1rem; }
      @media (max-width: 600px) {
        .lightbox-nav { padding: 0.5rem; font-size: 1.5rem; }
      }
    `;
    document.head.appendChild(style);
  }

  return lb;
}
