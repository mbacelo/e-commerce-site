import { eventBus } from '../eventBus.js';
import { cart } from '../cart.js';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

let currentQuantity = 1;

export function initProductModal(productService) {
  const container = document.getElementById('product-modal');

  eventBus.on('product:selected', async (productId) => {
    currentQuantity = 1;
    const product = await productService.getProductById(productId);
    render(container, product);
    open(container);
  });
}

function open(container) {
  requestAnimationFrame(() => {
    container.querySelector('.modal-backdrop')?.classList.add('open');
  });
  document.body.style.overflow = 'hidden';
}

function close(container) {
  const backdrop = container.querySelector('.modal-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    setTimeout(() => { container.innerHTML = ''; }, 250);
  }
  document.body.style.overflow = '';
}

function render(container, product) {
  const price = formatter.format(parseFloat(product.price));
  const comparePrice = product.compareAtPrice
    ? formatter.format(parseFloat(product.compareAtPrice))
    : null;
  const onSale = !!product.compareAtPrice;
  const savings = onSale
    ? formatter.format(parseFloat(product.compareAtPrice) - parseFloat(product.price))
    : null;

  container.innerHTML = `
    <div class="modal-backdrop fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="modal-content bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div class="md:flex">
          <!-- Image Gallery -->
          <div class="md:w-1/2 relative">
            <div class="aspect-square">
              <img id="modal-main-image" src="${product.images[0]}" alt="${product.title}" class="w-full h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none">
            </div>
            ${product.images.length > 1 ? `
              <div class="absolute bottom-3 left-3 flex gap-2">
                ${product.images.map((img, i) => `
                  <button class="modal-thumb w-12 h-12 rounded-lg overflow-hidden border-2 ${i === 0 ? 'border-brand-primary' : 'border-white/60'} hover:border-brand-primary transition-colors" data-img="${img}">
                    <img src="${img}" alt="View ${i + 1}" class="w-full h-full object-cover">
                  </button>
                `).join('')}
              </div>
            ` : ''}
            ${onSale ? `<span class="sale-badge absolute top-3 left-3 bg-brand-accent text-white text-sm font-bold px-3 py-1.5 rounded-full">Save ${savings}</span>` : ''}
          </div>

          <!-- Product Details -->
          <div class="md:w-1/2 flex flex-col max-h-[90vh]">
            <div class="p-6 md:p-8 flex-1 overflow-y-auto">
              <button class="modal-close float-right p-1 rounded-lg hover:bg-gray-100 transition-colors mb-2" aria-label="Close">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>

              <p class="text-xs text-brand-muted font-medium uppercase tracking-wide">${product.category}</p>
              <h2 class="font-display font-bold text-2xl text-brand-dark mt-1 leading-tight">${product.title}</h2>

              <div class="flex items-baseline gap-3 mt-4">
                <span class="font-bold text-brand-primary text-2xl">${price}</span>
                ${comparePrice ? `<span class="text-base text-brand-muted line-through">${comparePrice}</span>` : ''}
              </div>

              <div class="mt-4 text-sm text-brand-dark/80 leading-relaxed product-description">
                ${product.descriptionHtml}
              </div>

              <div class="flex items-center gap-2 mt-4 flex-wrap">
                ${product.tags.map(tag => `<span class="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">${tag}</span>`).join('')}
              </div>
            </div>

            <!-- Sticky Footer -->
            <div class="p-6 border-t border-gray-100 bg-gray-50/50">
              <div class="flex items-center gap-3">
                <div class="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <button class="modal-qty-decrease w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-100 transition-colors">-</button>
                  <span class="modal-qty-display w-10 h-10 flex items-center justify-center font-bold text-brand-dark">${currentQuantity}</span>
                  <button class="modal-qty-increase w-10 h-10 flex items-center justify-center text-lg hover:bg-gray-100 transition-colors">+</button>
                </div>
                <button class="modal-add-cart flex-1 bg-brand-primary text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-all transform active:scale-95 text-sm shadow-lg shadow-brand-primary/20">
                  Add to Cart — ${formatter.format(parseFloat(product.price) * currentQuantity)}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Escape to close handler
  const escHandler = (e) => {
    if (e.key === 'Escape') close(container);
  };
  document.addEventListener('keydown', escHandler);

  // Wrap the module-level close to also remove the event listener
  function close(cont) {
    const backdrop = cont.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
      setTimeout(() => { cont.innerHTML = ''; }, 250);
    }
    document.body.style.overflow = '';
    document.removeEventListener('keydown', escHandler);
  }

  // Event listeners
  container.querySelector('.modal-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) close(container);
  });

  container.querySelector('.modal-close').addEventListener('click', () => close(container));

  // Thumbnail clicks
  container.querySelectorAll('.modal-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      document.getElementById('modal-main-image').src = thumb.dataset.img;
      container.querySelectorAll('.modal-thumb').forEach(t => t.classList.replace('border-brand-primary', 'border-white/60'));
      thumb.classList.replace('border-white/60', 'border-brand-primary');
    });
  });

  // Quantity controls
  const qtyDisplay = container.querySelector('.modal-qty-display');
  const addBtn = container.querySelector('.modal-add-cart');

  const updateQtyDisplay = () => {
    qtyDisplay.textContent = currentQuantity;
    addBtn.textContent = `Add to Cart — ${formatter.format(parseFloat(product.price) * currentQuantity)}`;
  };

  container.querySelector('.modal-qty-decrease').addEventListener('click', () => {
    if (currentQuantity > 1) {
      currentQuantity--;
      updateQtyDisplay();
    }
  });

  container.querySelector('.modal-qty-increase').addEventListener('click', () => {
    currentQuantity++;
    updateQtyDisplay();
  });

  addBtn.addEventListener('click', () => {
    cart.addItem(product, currentQuantity);
    close(container);
    eventBus.emit('cart:toggle');
  });
}
