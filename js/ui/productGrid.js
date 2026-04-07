import { eventBus } from '../eventBus.js';
import { cart } from '../cart.js';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

let allProducts = [];

export async function initProductGrid(productService) {
  const container = document.getElementById('product-grid');

  // Show skeleton loading
  container.innerHTML = buildSkeletons(8);

  allProducts = await productService.getProducts();
  renderProducts(allProducts);

  eventBus.on('filter:changed', async (category) => {
    if (category) {
      const filtered = await productService.getProductsByCategory(category);
      renderProducts(filtered);
    } else {
      renderProducts(allProducts);
    }
  });
}

function renderProducts(products) {
  const container = document.getElementById('product-grid');

  if (products.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20">
        <p class="text-lg text-brand-muted font-medium">No products found in this category.</p>
        <p class="text-sm text-brand-muted mt-1">Try selecting a different category above.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
      ${products.map(buildProductCard).join('')}
    </div>
  `;

  // Attach event listeners
  container.querySelectorAll('.product-card').forEach(card => {
    const productId = card.dataset.productId;

    card.querySelector('.btn-add-cart').addEventListener('click', (e) => {
      e.stopPropagation();
      const product = allProducts.find(p => p.id === productId);
      if (product) {
        cart.addItem(product);
        showAddedFeedback(e.target);
        eventBus.emit('cart:toggle');
      }
    });

    card.addEventListener('click', () => {
      eventBus.emit('product:selected', productId);
    });
  });
}

function buildProductCard(product) {
  const price = formatter.format(parseFloat(product.price));
  const comparePrice = product.compareAtPrice
    ? formatter.format(parseFloat(product.compareAtPrice))
    : null;
  const onSale = !!product.compareAtPrice;

  return `
    <div class="product-card group relative flex flex-col cursor-pointer" data-product-id="${product.id}">
      <div class="relative aspect-square overflow-hidden bg-gray-100 rounded-2xl mb-4">
        <img src="${product.images[0]}" alt="${product.title}" class="img-primary absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy">
        ${product.images[1] ? `<img src="${product.images[1]}" alt="${product.title} alternate" class="img-secondary absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" loading="lazy">` : ''}
        
        ${onSale ? `<span class="absolute top-3 left-3 bg-brand-accent text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider z-10">Sale</span>` : ''}
        
        <!-- Add to Cart Overlay -->
        <div class="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <button class="btn-add-cart w-full bg-white text-brand-dark font-bold py-3 rounded-xl shadow-xl hover:bg-brand-primary hover:text-white transition-colors text-sm flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
      
      <div class="flex flex-col flex-1 px-1">
        <p class="text-[10px] text-brand-muted font-bold uppercase tracking-[0.1em] mb-1">${product.category}</p>
        <h3 class="font-display font-bold text-brand-dark text-sm leading-tight mb-2 line-clamp-2">${product.title}</h3>
        <div class="mt-auto flex items-center gap-2">
          <span class="font-bold text-brand-primary text-base">${price}</span>
          ${comparePrice ? `<span class="text-xs text-brand-muted line-through">${comparePrice}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function showAddedFeedback(button) {
  const original = button.innerHTML;
  button.innerHTML = `
    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
    Added!
  `;
  button.classList.add('bg-brand-accent', 'text-white');
  button.classList.remove('bg-white', 'text-brand-dark');
  
  setTimeout(() => {
    button.innerHTML = original;
    button.classList.remove('bg-brand-accent', 'text-white');
    button.classList.add('bg-white', 'text-brand-dark');
  }, 1000);
}

function buildSkeletons(count) {
  const skeleton = `
    <div class="flex flex-col">
      <div class="skeleton aspect-square rounded-2xl mb-4"></div>
      <div class="space-y-2 px-1">
        <div class="skeleton h-3 w-16"></div>
        <div class="skeleton h-4 w-full"></div>
        <div class="skeleton h-4 w-20"></div>
      </div>
    </div>
  `;
  return `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">${skeleton.repeat(count)}</div>`;
}
