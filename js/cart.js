import { eventBus } from './eventBus.js';

const STORAGE_KEY = 'urban-clothes-cart';

class Cart {
  #items;

  constructor() {
    this.#items = new Map();
    this.#loadFromStorage();
  }

  #loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.forEach(item => this.#items.set(item.product.id, item));
      }
    } catch {
      // Ignore corrupt data
    }
  }

  #saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.#items.values()]));
  }

  #emitUpdate() {
    this.#saveToStorage();
    eventBus.emit('cart:updated', this.getState());
  }

  addItem(product, quantity = 1) {
    const existing = this.#items.get(product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.#items.set(product.id, { product, quantity });
    }
    this.#emitUpdate();
  }

  removeItem(productId) {
    this.#items.delete(productId);
    this.#emitUpdate();
  }

  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const item = this.#items.get(productId);
    if (item) {
      item.quantity = quantity;
      this.#emitUpdate();
    }
  }

  clearCart() {
    this.#items.clear();
    this.#emitUpdate();
  }

  getState() {
    const items = [...this.#items.values()];
    return {
      items,
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0),
    };
  }
}

export const cart = new Cart();
