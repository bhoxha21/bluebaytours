const fs = require('fs');
const files = [
  'index.html',
  'grama-bay-tour.html',
  'dafina-bay-tour.html',
  'haxhi-ali-tour.html',
  'sazan-island-tour.html',
  'sunset-tour.html'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace Grama Photo in index.html
  if (file === 'index.html') {
    content = content.replace(
      /<img src="tour2 gallerry\.jpeg" alt="Grama Bay Full Trip" class="reveal-clip reveal">/g,
      '<img src="grama bay/display photo grama.jpeg" alt="Grama Bay Full Trip" class="reveal-clip reveal">'
    );
  }
  
  // Replace Grama Photo in grama-bay-tour.html
  if (file === 'grama-bay-tour.html') {
    content = content.replace(
      /<img src="tour4\.jpeg" alt="Grama Bay" class="hero-img">/g,
      '<img src="grama bay/display photo grama.jpeg" alt="Grama Bay" class="hero-img">'
    );
  }

  // Replace footer socials
  const newSocials = `<a href="https://wa.me/355692242662" target="_blank" class="social-item">
        <img src="icons8-whatsapp-96.png" alt="WhatsApp">
        <span>WhatsApp</span>
      </a>
      <a href="https://www.instagram.com/blue_bay_tour/" target="_blank" class="social-item">
        <img src="icons8-instagram-94.png" alt="Instagram">
        <span>Instagram</span>
      </a>
      <a href="https://www.tripadvisor.com/Attraction_Review-g678774-d33150399-Reviews-Blue_Bay_Tours_Vlora-Vlore_Vlore_County.html" target="_blank" class="social-item">
        <img src="icons8-tripadvisor-96.png" alt="TripAdvisor">
        <span>TripAdvisor</span>
      </a>
      <a href="https://www.tiktok.com/@blue_bay_tours" target="_blank" class="social-item">
        <img src="tik tok.png" alt="TikTok">
        <span>TikTok</span>
      </a>`;

  content = content.replace(
    /<a href="https:\/\/wa\.me\/355692242662"[\s\S]*?<span>Instagram<\/span>\s*<\/a>/g,
    newSocials
  );

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Updated all files');
