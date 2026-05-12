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

// Dedicated slider logic for the tour pages
let tourGalPos = 0;
window.slideTourGallery = function(dir) {
  const track = document.getElementById('tourGalTrack');
  const items = track.querySelectorAll('.gallery-item');
  const viewport = document.getElementById('tourGalViewport');
  if(items.length === 0) return;

  const itemW = items[0].offsetWidth + (window.innerWidth < 900 ? 24 : 32); // Responsive gap
  const max = (items.length * itemW) - viewport.offsetWidth;
  
  tourGalPos += dir * itemW;
  if (tourGalPos > max) tourGalPos = 0; // Loop to start
  if (tourGalPos < 0) tourGalPos = max; // Loop to end
  
  track.style.transform = `translateX(-${tourGalPos}px)`;
};

// Global Lightbox Logic (since it needs to work dynamically now)
window.openLightbox = function(el) {
  const lightbox = document.getElementById('lightbox') || createLightbox();
  const imgSrc = el.querySelector('img').src;
  const lbImg = lightbox.querySelector('img');
  lbImg.src = imgSrc;
  lbImg.classList.remove('zoomed');
  lightbox.classList.add('open');
};

window.closeLightbox = function() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.classList.remove('open');
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
  
  const btn = document.createElement('button');
  btn.className = 'lightbox-close';
  btn.innerText = '✕';
  btn.setAttribute('onclick', 'closeLightbox()');

  const img = document.createElement('img');
  img.setAttribute('onclick', 'toggleZoom(event)');

  lb.appendChild(btn);
  lb.appendChild(img);
  document.body.appendChild(lb);
  return lb;
}
