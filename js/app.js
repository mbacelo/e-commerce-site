import { productService } from './productService.js';
import { cart } from './cart.js';
import { eventBus } from './eventBus.js';
import { initHeader } from './ui/header.js';
import { initProductGrid } from './ui/productGrid.js';
import { initProductModal } from './ui/productModal.js';
import { initCartDrawer } from './ui/cartDrawer.js';

async function init() {
  initHeader(productService);
  initCartDrawer();
  initProductModal(productService);
  await initProductGrid(productService);

  // Emit initial cart state so the badge updates on page load
  eventBus.emit('cart:updated', cart.getState());
}

init();
