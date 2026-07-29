(function () {
  const slider = document.getElementById('slider');
  const slidesWrap = document.getElementById('slides');
  const slides = Array.from(slidesWrap.children);
  const dotsWrap = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const playToggle = document.getElementById('playToggle');
  const progressFill = document.getElementById('progressFill');

  const AUTOPLAY_MS = 4000;
  let current = 0;
  let isPlaying = true;
  let autoplayTimer = null;
  let progressStart = null;
  let progressRAF = null;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function render() {
    slidesWrap.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    render();
    restartAutoplay();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startProgress() {
    cancelAnimationFrame(progressRAF);
    progressStart = performance.now();
    function step(now) {
      const elapsed = now - progressStart;
      const pct = Math.min(100, (elapsed / AUTOPLAY_MS) * 100);
      progressFill.style.width = pct + '%';
      if (pct < 100 && isPlaying) {
        progressRAF = requestAnimationFrame(step);
      }
    }
    progressRAF = requestAnimationFrame(step);
  }

  function stopProgress() {
    cancelAnimationFrame(progressRAF);
  }

  function startAutoplay() {
    stopAutoplay();
    startProgress();
    autoplayTimer = setInterval(() => {
      current = (current + 1) % slides.length;
      render();
      startProgress();
    }, AUTOPLAY_MS);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    stopProgress();
    progressFill.style.width = '0%';
  }

  function restartAutoplay() {
    if (isPlaying) startAutoplay();
    else progressFill.style.width = '0%';
  }

  function togglePlay() {
    isPlaying = !isPlaying;
    playToggle.innerHTML = isPlaying ? '&#10073;&#10073;' : '&#9654;';
    playToggle.setAttribute('aria-label', isPlaying ? 'Pause autoplay' : 'Play autoplay');
    if (isPlaying) {
      startAutoplay();
    } else {
      stopAutoplay();
    }
  }

  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  playToggle.addEventListener('click', togglePlay);

  // Pause on hover, resume on leave (only if user hasn't manually paused)
  slider.addEventListener('mouseenter', () => { if (isPlaying) stopProgress(), clearInterval(autoplayTimer); });
  slider.addEventListener('mouseleave', () => { if (isPlaying) startAutoplay(); });

  // Keyboard navigation
  slider.setAttribute('tabindex', '0');
  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Basic swipe support for touch devices
  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      diff < 0 ? next() : prev();
    }
  }, { passive: true });

  render();
  startAutoplay();
})();