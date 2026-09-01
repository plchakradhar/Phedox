// Constants for Phedox Platform

export const MARKETPLACE_LOGOS = {
  AMAZON: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  FLIPKART: 'https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg',
  MYNTRA: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Myntra_Logo.png',
  AJIO: 'https://assets.ajio.com/static/img/Ajio-Logo.svg',
  NYKAA: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Nykaa_Logo.svg',
  TATACLIQ: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Tata_Cliq_Logo.svg',
  OTHER: null
};

export const MARKETPLACE_COLORS = {
  AMAZON: '#FF9900',
  FLIPKART: '#2874F0',
  MYNTRA: '#FF3F6C',
  AJIO: '#2C4152',
  NYKAA: '#FC2779',
  TATACLIQ: '#212121',
  OTHER: '#6B7280'
};

export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';

export const FALLBACK_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80';

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Deals First' },
  { value: 'discount-desc', label: 'Discount: High to Low' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export const DISCOUNT_FILTER_OPTIONS = [
  { value: '', label: 'All Discounts' },
  { value: '20', label: '20% or more' },
  { value: '30', label: '30% or more' },
  { value: '50', label: '50% or more' },
  { value: '70', label: '70% or more' },
];

export const TELEGRAM_STATUSES = [
  { value: 'ALL', label: 'All Posts' },
  { value: 'RECEIVED', label: 'Received' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PROCESSED', label: 'Processed' },
  { value: 'FAILED', label: 'Failed' },
];
