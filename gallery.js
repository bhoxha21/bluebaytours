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
    div.className = `gallery-item reveal reveal-scale reveal-delay-${(idx % 5) + 1}`;
    div.setAttribute('onclick', 'openLightbox(this)');
    
    const img = document.createElement('img');
    img.src = `${imgObj.folder}/${imgObj.src}`;
    img.alt = 'Blue Bay Guest Moment';
    
    div.appendChild(img);
    track.appendChild(div);
  });
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

  const grid = gallerySection.querySelector('.tour-gallery-grid');
  grid.innerHTML = '';

  data.images.forEach((imgName, idx) => {
    const div = document.createElement('div');
    div.className = `gallery-item reveal reveal-up reveal-delay-${(idx % 3) + 1}`;
    div.style.height = '300px';
    div.style.borderRadius = '4px';
    div.style.overflow = 'hidden';
    div.style.cursor = 'zoom-in';
    div.setAttribute('onclick', 'openLightbox(this)');
    
    const img = document.createElement('img');
    img.src = `${data.folder}/${imgName}`;
    img.alt = `${tourId} gallery image`;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.transition = 'transform 0.5s ease';
    
    div.addEventListener('mouseover', () => img.style.transform = 'scale(1.05)');
    div.addEventListener('mouseout', () => img.style.transform = 'scale(1)');

    div.appendChild(img);
    grid.appendChild(div);
  });
}

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
