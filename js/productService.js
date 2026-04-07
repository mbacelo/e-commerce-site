import { products } from './data.js';

class ProductService {
  #products;

  constructor(dataSource) {
    this.#products = dataSource;
  }

  async getProducts() {
    return [...this.#products];
  }

  async getProductById(id) {
    const product = this.#products.find(p => p.id === id);
    if (!product) throw new Error(`Product not found: ${id}`);
    return { ...product };
  }

  async getProductByHandle(handle) {
    const product = this.#products.find(p => p.handle === handle);
    if (!product) throw new Error(`Product not found: ${handle}`);
    return { ...product };
  }

  async getProductsByCategory(category) {
    return this.#products.filter(p => p.category === category).map(p => ({ ...p }));
  }

  async getCategories() {
    return [...new Set(this.#products.map(p => p.category))];
  }

  async searchProducts(query) {
    const q = query.toLowerCase();
    return this.#products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.includes(q))
    ).map(p => ({ ...p }));
  }
}

export const productService = new ProductService(products);
