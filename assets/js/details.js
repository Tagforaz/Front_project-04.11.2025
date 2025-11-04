
document.addEventListener('DOMContentLoaded', () => {

  const information = document.querySelector('.movie-information');
  if (!information) return;


  const id = new URLSearchParams(location.search).get('id');

  if (!id) {
    information.innerHTML = '<p style="opacity:.8">Id not founded <code>details.html?id=1</code></p>';
    return;
  }


  fetch(`https://api.tvmaze.com/shows/${id}`)
    .then(r => {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(movie => {
      const img = movie?.image?.original || movie?.image?.medium || '';
      const genres = Array.isArray(movie?.genres) ? movie.genres.join(' • ') : '';
      const summary = movie?.summary || '';

      information.innerHTML = `
        <div class="movie-poster-container">
          <img src="${img}" alt="${movie?.name || ''}">
        </div>
        <div class="movie-content">
          <h1 class="movie-title">${movie?.name || ''}</h1>
          <div class="movie-infos">
            <span>${movie?.language || ''}</span>
            <span class="duration">${movie?.averageRuntime ?? movie?.runtime ?? ''} min</span>
            <span>${genres}</span>
            <div class="rating"><i class="fa-solid fa-star"></i><span>${movie?.rating?.average ?? '—'}</span></div>
          </div>
          <div class="summary">${summary}</div>
        </div>
      `;
    })
    .catch(err => {
      console.error('Fetch error:', err);
      information.innerHTML = '<p style="opacity:.8">Məlumat yüklənmədi.</p>';
    });
});
(function () {
  const toggle = document.getElementById('langToggle');
  const menu = document.getElementById('langMenu');
  function setOpen(open){
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !menu.contains(e.target)) setOpen(false);
  });
  toggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!menu.classList.contains('open')); }
    if (e.key === 'Escape') setOpen(false);
  });
  menu.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', () => {
      menu.querySelectorAll('.lang-option').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      toggle.querySelector('.lang-code').textContent = btn.dataset.value; 
      setOpen(false);
    });
  });
})();

function plain(text = "", max = 120){
  const t = String(text).replace(/<\/?[^>]+(>|$)/g, "");
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

const track   = document.getElementById("movies");
const prevBtn = document.getElementById("featPrev");
const nextBtn = document.getElementById("featNext");

let nextActivated = false;          
const EPS = 2;                      


const getMax  = () => Math.max(0, track.scrollWidth - track.clientWidth);
const atStart = () => track.scrollLeft <= EPS;
const atEnd   = () => (getMax() - track.scrollLeft) <= EPS;

prevBtn.style.display = "none";
nextBtn.style.display = "inline-flex";


function makeCard(movie){
  const img =
    movie?.image?.original ||
    movie?.image?.medium ||
    "https://via.placeholder.com/400x600?text=No+Image";

  const year = (movie?.premiered || "").slice(0,4) || (movie?.officialSite ? "" : "");
  const runtime = movie?.averageRuntime ?? movie?.runtime ?? null;
  const genres = (movie?.genres || []).slice(0,2).join(", ");
  const lang = movie?.language || "";
  const rate = movie?.rating?.average ?? "—";
  const summary = plain(movie?.summary || "", 160);

  const metaBits = [];
  if (year) metaBits.push(year);
  if (genres) metaBits.push(genres);
  if (runtime) metaBits.push(`${runtime} min`);
  if (lang) metaBits.push(lang);
  metaBits.push(`⭐ ${rate}`);

  const el = document.createElement("a");
  el.className = "movie-card";
  el.href = "details.html?id=" + movie.id;
  el.setAttribute("title", movie.name || "Movie");

  el.innerHTML = `
    <img src="${img}" alt="${movie.name || "Poster"}" loading="lazy">
    <div class="movie-overlay">
      <div class="ovr-topbar">
        <button class="ovr-ctrl" aria-label="Play">&#9658;</button>
        <button class="ovr-ctrl" aria-label="More info">i</button>
      </div>
      <div class="ovr-body">
        <div class="ovr-title">${movie.name || ""}</div>
        <div class="ovr-meta">${metaBits.join('<span class="ovr-dot"></span>')}</div>
        <div class="ovr-summary">${summary}</div>
      </div>
    </div>`;
  return el;
}


function updateArrows(){
  const max = getMax();

  if (max <= 1) {                 
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
    return;
  }


  if (!nextActivated) {
    prevBtn.style.display = "none";
  } else {
    prevBtn.style.display = atStart() ? "none" : "inline-flex";
  }

  nextBtn.style.display = atEnd() ? "none" : "inline-flex";
}

function scrollByCards(dir = 1){
  const styles = getComputedStyle(track);
  const gap = parseFloat(styles.columnGap || styles.gap || 16);
  const first = track.firstElementChild;
  const cardWidth = first ? first.getBoundingClientRect().width + gap : 220;

  track.scrollBy({ left: dir * cardWidth * 4, behavior: "smooth" });
  setTimeout(updateArrows, 280);
}


prevBtn.addEventListener("click", () => {
  scrollByCards(-1);
  setTimeout(updateArrows, 280);
});
nextBtn.addEventListener("click", () => {
  nextActivated = true;
  scrollByCards(1);
  setTimeout(updateArrows, 280);
});


track.addEventListener("scroll", updateArrows, { passive: true });
track.addEventListener("wheel", (e) => {
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    track.scrollBy({ left: e.deltaY, behavior: "auto" });
    e.preventDefault();
  }
}, { passive: false });

fetch("https://api.tvmaze.com/shows")
  .then(r => r.json())
  .then(list => {
    const top = list.slice(0, 40);
    const frag = document.createDocumentFragment();
    top.forEach(m => frag.appendChild(makeCard(m)));
    track.appendChild(frag);
    updateArrows();
  })
  .catch(() => {
    track.innerHTML = "<p style='opacity:.8'>Data not uploaded.</p>";
    updateArrows();
  });
