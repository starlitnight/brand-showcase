document.addEventListener('DOMContentLoaded', function() {
  loadBrandsAndInit();
});

async function loadBrandsAndInit() {
  try {
    const response = await fetch('brands.json');
    const data = await response.json();
    const brands = data.brands;
    
    const shuffledBrands = shuffleArray([...brands]);
    
    renderDesktopGrid(shuffledBrands);
    renderMobileSlider(shuffledBrands);
    
    initColumnAnimation();
    initMobileSlider();
  } catch (error) {
    console.error('Error loading brands:', error);
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomHeight() {
  const heights = ['small', 'medium', 'large'];
  return heights[Math.floor(Math.random() * heights.length)];
}

function createBrandCard(brand, index) {
  const heightClass = getRandomHeight();
  const card = document.createElement('div');
  card.className = `brand-card brand-card--${heightClass}`;
  card.setAttribute('data-index', index);
  
  card.innerHTML = `
    <img src="${brand.background}" alt="${brand.name} background" class="brand-card__bg">
    <div class="brand-card__overlay"></div>
    ${brand.cashback ? `<span class="brand-card__badge">${brand.cashback}</span>` : ''}
    <img src="${brand.logo}" alt="${brand.name} logo" class="brand-card__logo">
  `;
  
  return card;
}

function renderDesktopGrid(brands) {
  const grid = document.getElementById('brandGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const columns = [[], [], [], []];
  
  brands.forEach((brand, index) => {
    const columnIndex = index % 4;
    columns[columnIndex].push(brand);
  });
  
  columns.forEach((columnBrands, colIndex) => {
    const column = document.createElement('div');
    column.className = 'brand-showcase__column';
    column.setAttribute('data-column', colIndex);
    
    columnBrands.forEach((brand, index) => {
      const card = createBrandCard(brand, index);
      column.appendChild(card);
    });
    
    grid.appendChild(column);
  });
}

function renderMobileSlider(brands) {
  const track = document.getElementById('mobileSliderTrack');
  if (!track) return;
  
  track.innerHTML = '';
  
  brands.slice(0, 8).forEach((brand, index) => {
    const slide = document.createElement('div');
    slide.className = 'mobile-slider__slide';
    
    const card = document.createElement('div');
    card.className = 'brand-card brand-card--mobile';
    card.innerHTML = `
      <img src="${brand.background}" alt="${brand.name} background" class="brand-card__bg">
      <div class="brand-card__overlay"></div>
      ${brand.cashback ? `<span class="brand-card__badge">${brand.cashback}</span>` : ''}
      <img src="${brand.logo}" alt="${brand.name} logo" class="brand-card__logo">
    `;
    
    slide.appendChild(card);
    track.appendChild(slide);
  });
}

function initColumnAnimation() {
  const brandShowcase = document.getElementById('brandShowcase');
  const columns = document.querySelectorAll('.brand-showcase__column');
  
  if (!brandShowcase || columns.length === 0) return;
  
  let hasAnimated = false;
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        startColumnAnimation(columns);
      }
    });
  }, observerOptions);
  
  observer.observe(brandShowcase);
}

function startColumnAnimation(columns) {
  const staggerDelay = 250;
  const slideDuration = 1200;
  
  columns.forEach((column, index) => {
    setTimeout(() => {
      column.classList.add('animate-up');
    }, index * staggerDelay);
  });
  
  const totalUpTime = (columns.length - 1) * staggerDelay + slideDuration;
  
  setTimeout(() => {
    columns.forEach((column, index) => {
      column.classList.remove('animate-up');
      
      setTimeout(() => {
        column.classList.add('animate-down');
      }, index * staggerDelay);
    });
  }, totalUpTime + 100);
}

function initMobileSlider() {
  const track = document.getElementById('mobileSliderTrack');
  const dotsContainer = document.getElementById('sliderDots');
  
  if (!track || !dotsContainer) return;
  
  dotsContainer.innerHTML = '';
  
  const slides = track.querySelectorAll('.mobile-slider__slide');
  const slideCount = slides.length;
  let currentSlide = 0;
  
  for (let i = 0; i < slideCount; i++) {
    const dot = document.createElement('button');
    dot.classList.add('dot');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    
    dot.addEventListener('click', () => {
      goToSlide(i);
    });
    
    dotsContainer.appendChild(dot);
  }
  
  const dots = dotsContainer.querySelectorAll('.dot');
  
  track.addEventListener('scroll', () => {
    const scrollLeft = track.scrollLeft;
    const slideWidth = slides[0].offsetWidth + 16;
    const newSlide = Math.round(scrollLeft / slideWidth);
    
    if (newSlide !== currentSlide && newSlide >= 0 && newSlide < slideCount) {
      currentSlide = newSlide;
      updateDots();
    }
  });
  
  function goToSlide(index) {
    const slideWidth = slides[0].offsetWidth + 16;
    track.scrollTo({
      left: index * slideWidth,
      behavior: 'smooth'
    });
    currentSlide = index;
    updateDots();
  }
  
  function updateDots() {
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentSlide);
    });
  }
}
