import { eventBus } from '../eventBus.js';

const LOGO_SVG = `<svg viewBox="0 0 36 36" fill="none" class="w-9 h-9">
  <circle cx="18" cy="18" r="16" fill="#2d6a4f"/>
  <text x="18" y="23" text-anchor="middle" fill="#fefae0" font-size="12" font-weight="700" font-family="DM Sans, sans-serif">UC</text>
</svg>`;

const CART_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
</svg>`;

let activeCategory = null;

export function initHeader(productService) {
  const container = document.getElementById('app-header');

  container.innerHTML = `
    <nav class="header-nav sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
        <a href="/" class="flex items-center gap-3 no-underline group">
          ${LOGO_SVG}
          <span class="font-display text-lg font-bold text-brand-dark tracking-tight group-hover:text-brand-primary transition-colors">Urban Clothes</span>
        </a>
        <div id="category-filters" class="hidden md:flex items-center gap-1.5 bg-brand-dark/5 rounded-full px-1.5 py-1"></div>
        <button id="cart-toggle" class="relative p-2.5 rounded-full bg-brand-dark/5 hover:bg-brand-primary hover:text-white transition-all duration-200" aria-label="Open cart">
          ${CART_ICON}
          <span id="cart-badge" class="absolute -top-1 -right-1 bg-brand-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center hidden ring-2 ring-white z-10 pointer-events-none">0</span>
        </button>
      </div>
      <div id="category-filters-mobile" class="md:hidden overflow-x-auto px-6 pb-3 flex gap-1.5"></div>
    </nav>
  `;

  loadCategories(productService);

  document.getElementById('cart-toggle').addEventListener('click', () => {
    eventBus.emit('cart:toggle');
  });

  eventBus.on('cart:updated', (state) => {
    const badge = document.getElementById('cart-badge');
    if (state.totalItems > 0) {
      badge.textContent = state.totalItems > 99 ? '99+' : state.totalItems;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

async function loadCategories(productService) {
  const categories = await productService.getCategories();
  const filterHTML = buildCategoryPills(categories);

  document.getElementById('category-filters').innerHTML = filterHTML;
  document.getElementById('category-filters-mobile').innerHTML = filterHTML;

  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const category = pill.dataset.category;

      if (activeCategory === category) {
        activeCategory = null;
      } else {
        activeCategory = category;
      }

      document.querySelectorAll('.category-pill').forEach(p => {
        const isActive = p.dataset.category === activeCategory;
        p.classList.toggle('active', isActive);
      });

      eventBus.emit('filter:changed', activeCategory);
    });
  });
}

function buildCategoryPills(categories) {
  return categories.map(cat => `
    <button class="category-pill px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer" data-category="${cat}">
      ${cat}
    </button>
  `).join('');
}
