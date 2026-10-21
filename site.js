/* =========================================================
   Paint a Life Initiative preview - website script
   ---------------------------------------------------------
   Every page loads this file. It does three jobs:
     1. Mobile menu: the menu button opens and closes the menu
     2. Forms: sends the contact / registration forms by email
     3. Photo viewer: click a photo to see it big (lightbox)
   ========================================================= */


/* ---------- 1. Mobile menu toggle ---------- */

// On small screens the menu links are hidden. Clicking the menu button adds or removes
// the "open" class on the list of links (see "nav ul.open" in style.css).
document.querySelector('.menu').onclick = function () {
  var menuList = document.querySelector('nav ul');
  var isOpen = menuList.classList.toggle('open');
  this.setAttribute('aria-expanded', isOpen);
};


/* ---------- 2. Demo form (preview only: sends nothing) ---------- */
var f=document.getElementById('demo');
if(f)f.addEventListener('submit',function(e){e.preventDefault();var m=f.querySelector('.fmsg')||f.appendChild(document.createElement('p'));m.className='fmsg ok';m.textContent='Thank you! (Demo only \u2013 nothing was sent.)';f.reset();});
var y=document.getElementById('yr');if(y)y.textContent=new Date().getFullYear();

/* ---------- 3. Clickable photo viewer (lightbox) ---------- */

(function () {
  // All photos in the page content (not the logo in the menu or footer).
  var photos = [].slice.call(document.querySelectorAll('main img,section img,header img')).filter(function (img) {
    return !img.closest('nav,footer,.brand');
  });
  if (!photos.length) return;  // no photos on this page: nothing to do

  // Build the viewer: a dark box with close / previous / next buttons
  // and one big image. It stays hidden until a photo is clicked.
  var viewer = document.createElement('div');
  viewer.className = 'lb';
  viewer.innerHTML = '<button class="lbx" aria-label="Close"><svg class="ico lg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12"/></svg></button><button class="lbp" aria-label="Previous"><svg class="ico lg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m15 18-6-6 6-6"/></svg></button><img alt=""><button class="lbn" aria-label="Next"><svg class="ico lg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 18 6-6-6-6"/></svg></button>';
  document.body.appendChild(viewer);

  var bigImage = viewer.querySelector('img');
  var current = 0;  // number of the photo being shown

  // Show photo number n (wraps around at the start and end).
  function show(n) {
    current = (n + photos.length) % photos.length;
    bigImage.src = photos[current].currentSrc || photos[current].src;
    bigImage.alt = photos[current].alt;
    viewer.classList.add('on');
    document.body.style.overflow = 'hidden';  // stop the page scrolling behind
  }

  // Close the viewer.
  function hide() {
    viewer.classList.remove('on');
    document.body.style.overflow = '';
  }

  // Make every photo clickable (and usable with the keyboard: Tab + Enter).
  photos.forEach(function (img, i) {
    img.classList.add('zoom');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      show(i);
    });
    img.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        show(i);
      }
    });
  });

  // Buttons: × closes, ‹ previous photo, › next photo.
  viewer.querySelector('.lbx').onclick = hide;
  viewer.querySelector('.lbp').onclick = function (event) {
    event.stopPropagation();
    show(current - 1);
  };
  viewer.querySelector('.lbn').onclick = function (event) {
    event.stopPropagation();
    show(current + 1);
  };

  // Clicking the dark area around the photo closes the viewer.
  viewer.addEventListener('click', function (event) {
    if (event.target === viewer) hide();
  });

  // Keyboard: Escape closes, left / right arrows change photo.
  document.addEventListener('keydown', function (event) {
    if (!viewer.classList.contains('on')) return;
    if (event.key === 'Escape') hide();
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });

  // Phones: swipe left for the next photo, swipe right for the previous one.
  var touchStartX = null;
  viewer.addEventListener('touchstart', function (event) {
    touchStartX = event.touches[0].clientX;
  });
  viewer.addEventListener('touchend', function (event) {
    if (touchStartX === null) return;
    var distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 50) show(current + (distance < 0 ? 1 : -1));
    touchStartX = null;
  });
})();

/* ---------- Get Involved: pre-select from ?i=volunteer|partner|academy|member|invite|kind ---------- */
(function () {
  var i = new URLSearchParams(location.search).get('i'), s = document.getElementById('i');
  var map = { volunteer: 'Volunteer', member: 'Become a member', partner: 'Partner with Paint a Life', academy: 'Partner with Paint a Life Academy', invite: 'Invite you for a talk / workshop', kind: 'Donate in kind' };
  if (s && map[i]) s.value = map[i];
})();
