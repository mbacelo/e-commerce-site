import { eventBus } from '../eventBus.js';
import { cart } from '../cart.js';

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

let isOpen = false;

export function initCartDrawer() {
  const container = document.getElementById('cart-drawer');
  
  // Initial structure setup
  container.innerHTML = `
    <div class="cart-backdrop fixed inset-0 bg-black/40 z-50">
      <div class="cart-panel fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        <div class="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 class="font-display font-bold text-lg text-brand-dark">Your Cart</h2>
          <button class="cart-close p-1 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Close cart">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div id="cart-content" class="flex-1 flex flex-col min-h-0"></div>
      </div>
    </div>
  `;

  const contentContainer = document.getElementById('cart-content');
  renderContent(contentContainer, cart.getState());

  eventBus.on('cart:updated', (state) => renderContent(contentContainer, state));
  eventBus.on('cart:toggle', () => toggle(container));

  // Attach static listeners once
  container.querySelector('.cart-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) close(container);
  });

  container.querySelector('.cart-close').addEventListener('click', () => close(container));

  // Listen for Escape once
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      close(container);
    }
  });
}

function toggle(container) {
  isOpen = !isOpen;
  const backdrop = container.querySelector('.cart-backdrop');
  const panel = container.querySelector('.cart-panel');
  if (backdrop && panel) {
    backdrop.classList.toggle('open', isOpen);
    panel.classList.toggle('open', isOpen);
  }
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function close(container) {
  isOpen = false;
  const backdrop = container.querySelector('.cart-backdrop');
  const panel = container.querySelector('.cart-panel');
  if (backdrop && panel) {
    backdrop.classList.remove('open');
    panel.classList.remove('open');
  }
  document.body.style.overflow = '';
}

function renderContent(container, state) {
  container.innerHTML = state.items.length === 0 ? renderEmptyCart() : renderCartItems(state);

  if (state.items.length > 0) {
    // Attach dynamic listeners
    container.querySelectorAll('.qty-decrease').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.productId;
        const item = state.items.find(i => i.product.id === id);
        if (item) cart.updateQuantity(id, item.quantity - 1);
      });
    });

    container.querySelectorAll('.qty-increase').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.productId;
        const item = state.items.find(i => i.product.id === id);
        if (item) cart.updateQuantity(id, item.quantity + 1);
      });
    });

    container.querySelectorAll('.item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        cart.removeItem(btn.dataset.productId);
      });
    });

    const clearBtn = container.querySelector('.cart-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => cart.clearCart());
    }
  }
}

function renderEmptyCart() {
  return `
    <div class="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <svg class="w-16 h-16 text-brand-muted mb-4" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
      <p class="font-display font-bold text-brand-dark text-lg mb-1">Your cart is empty</p>
      <p class="text-sm text-brand-muted">Browse our products and add something you love!</p>
    </div>
  `;
}

function renderCartItems(state) {
  return `
    <div class="cart-items flex-1 overflow-y-auto p-5 space-y-4">
      ${state.items.map(item => renderCartItem(item)).join('')}
    </div>
    <div class="border-t border-gray-100 p-5 space-y-4">
      <div class="flex items-center justify-between">
        <span class="font-medium text-brand-muted">Subtotal</span>
        <span class="font-display font-bold text-xl text-brand-dark">${formatter.format(state.subtotal)}</span>
      </div>
      <p class="text-xs text-brand-muted">Shipping and taxes calculated at checkout.</p>
      <button class="w-full bg-brand-accent text-white font-bold py-3.5 rounded-xl hover:bg-brand-accent/90 transition-colors text-sm">
        Proceed to Checkout
      </button>
      <button class="cart-clear w-full text-sm text-brand-muted hover:text-brand-accent transition-colors py-1">
        Clear Cart
      </button>
    </div>
  `;
}

function renderCartItem(item) {
  const { product, quantity } = item;
  const lineTotal = formatter.format(parseFloat(product.price) * quantity);

  return `
    <div class="flex gap-4">
      <img src="${product.images[0]}" alt="${product.title}" class="w-20 h-20 rounded-xl object-cover flex-shrink-0">
      <div class="flex-1 min-w-0">
        <h4 class="font-medium text-sm text-brand-dark leading-snug truncate">${product.title}</h4>
        <p class="text-xs text-brand-muted mt-0.5">${formatter.format(parseFloat(product.price))} each</p>
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center border border-gray-200 rounded-lg">
            <button class="qty-btn qty-decrease w-8 h-8 flex items-center justify-center text-sm rounded-l-lg" data-product-id="${product.id}">-</button>
            <span class="w-8 h-8 flex items-center justify-center text-sm font-medium">${quantity}</span>
            <button class="qty-btn qty-increase w-8 h-8 flex items-center justify-center text-sm rounded-r-lg" data-product-id="${product.id}">+</button>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-medium text-sm text-brand-dark">${lineTotal}</span>
            <button class="item-remove text-brand-muted hover:text-brand-accent transition-colors" data-product-id="${product.id}" aria-label="Remove item">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
