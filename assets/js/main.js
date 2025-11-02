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
    const t = String(text).replace(/<\/?[^>]+(>|$)/g, ""); // HTML tagları sil
    return t.length > max ? t.slice(0, max - 1) + "…" : t;
  }

  const track = document.getElementById("movies");
  const prevBtn = document.getElementById("featPrev");
  const nextBtn = document.getElementById("featNext");

  // kart yarat
function makeCard(movie){
  const img =
    movie?.image?.original ||
    movie?.image?.medium ||
    "https://via.placeholder.com/400x600?text=No+Image";

  // il, janrlar, dil, müddət, reytinq
  const year = (movie?.premiered || "").slice(0,4) || (movie?.officialSite ? "" : "");
  const runtime = movie?.averageRuntime ?? movie?.runtime ?? null; // dəqiqə
  const genres = (movie?.genres || []).slice(0,2).join(", ");
  const lang = movie?.language || "";
  const rate = movie?.rating?.average ?? "—";
  const summary = plain(movie?.summary || "", 160);

  // meta hissəsini hazırla (olanları göstər)
  const metaBits = [];
  if (year) metaBits.push(year);
  if (genres) metaBits.push(genres);
  if (runtime) metaBits.push(`${runtime} min`);
  if (lang) metaBits.push(lang);
  metaBits.push(`⭐ ${rate}`);

  const el = document.createElement("a");
  el.className = "movie-card";
  el.href = "#";
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
    </div>
  `;
  return el;
}


  function scrollByCards(dir = 1){
    const cardWidth = track.firstElementChild
      ? track.firstElementChild.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 16)
      : 220;
    track.scrollBy({ left: dir * cardWidth * 4, behavior: "smooth" });
  }

  prevBtn.addEventListener("click", () => scrollByCards(-1));
  nextBtn.addEventListener("click", () => scrollByCards(1));


  track.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      track.scrollBy({ left: e.deltaY, behavior: "auto" });
      e.preventDefault();
    }
  }, { passive: false });

  
  (function dragScroll(){
    let isDown=false, startX=0, startScroll=0;
    track.addEventListener("pointerdown", (e)=>{
      isDown=true; startX=e.clientX; startScroll=track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", (e)=>{
      if(!isDown) return;
      const dx = e.clientX - startX;
      track.scrollLeft = startScroll - dx;
    });
    ["pointerup","pointercancel","pointerleave"].forEach(type=>{
      track.addEventListener(type, ()=>{ isDown=false; });
    });
  })();


  fetch("https://api.tvmaze.com/shows")
    .then(r => r.json())
    .then(list => {
      const top = list.slice(0, 40);
      const frag = document.createDocumentFragment();
      top.forEach(m => frag.appendChild(makeCard(m)));
      track.appendChild(frag);
    })
    .catch(() => {
      track.innerHTML = "<p style='opacity:.8'>Data not uploaded.</p>";
    });