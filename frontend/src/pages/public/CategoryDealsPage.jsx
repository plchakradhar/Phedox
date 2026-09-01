import React, { useState, useEffect, useMemo } from "react";
import "./CategoryDealsPage.css";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowRight, X, Filter } from "lucide-react";
import { categoryApi } from "../../api/categories";
import { productApi } from "../../api/products";
import ProductGrid from "../../components/common/ProductGrid";
import BannerCarousel from "../../components/common/BannerCarousel";
import SubCategoryGrid from "../../components/common/SubCategoryGrid";
import ErrorState from "../../components/common/ErrorState";
import { SORT_OPTIONS } from "../../utils/constants";

/* ─── ALL 14 Category Configurations with Full In-Depth Subcategories ───── */
const ALL_CAT_CONFIGS = {
  "fashion": {
    "displayName": "Fashion",
    "theme": "fashion",
    "banners": [
      {
        "title": "Autumn Winter Collection",
        "subtitle": "Trending styles up to 80% off — verified & live",
        "tag": "Season Sale",
        "cta": "Shop Fashion",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#7c3aed 0%,#ec4899 100%)",
        "image": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Ethnic Wear & Festive Specials",
        "subtitle": "Kurtis, Sarees, Lehengas — min 50% off",
        "tag": "Festive Sale",
        "cta": "Explore Festive",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#92400e 0%,#d97706 100%)",
        "image": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "The Sneaker Project",
        "subtitle": "Your ultimate footwear destination with top brands",
        "tag": "Sneaker Drop",
        "cta": "Shop Footwear",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#1e1b4b 0%,#4338ca 100%)",
        "image": "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "f1",
        "name": "Korean Store",
        "icon": "korean store",
        "imageUrl": "https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp"
      },
      {
        "id": "f2",
        "name": "Shirts",
        "icon": "shirts",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp"
      },
      {
        "id": "f3",
        "name": "Jeans",
        "icon": "jeans",
        "imageUrl": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "f4",
        "name": "Sneakers",
        "icon": "sneakers",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp"
      },
      {
        "id": "f5",
        "name": "Watches",
        "icon": "watches",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp"
      },
      {
        "id": "f6",
        "name": "Kids' clothing",
        "icon": "kids' clothing",
        "imageUrl": "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/thumbnail.webp"
      },
      {
        "id": "f7",
        "name": "Luggage",
        "icon": "luggage",
        "imageUrl": "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/thumbnail.webp"
      },
      {
        "id": "f8",
        "name": "Jackets",
        "icon": "jackets",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp"
      },
      {
        "id": "f9",
        "name": "Tshirts",
        "icon": "tshirts",
        "imageUrl": "https://cdn.dummyjson.com/product-images/tops/gray-dress/thumbnail.webp"
      },
      {
        "id": "f10",
        "name": "Athleisure",
        "icon": "athleisure",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/thumbnail.webp"
      },
      {
        "id": "f11",
        "name": "Rakhi specials",
        "icon": "rakhi specials",
        "imageUrl": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-crystal-earring/thumbnail.webp"
      },
      {
        "id": "f12",
        "name": "Kurta sets",
        "icon": "kurta sets",
        "imageUrl": "https://cdn.dummyjson.com/product-images/womens-dresses/black-women's-gown/thumbnail.webp"
      },
      {
        "id": "f13",
        "name": "Dresses",
        "icon": "dresses",
        "imageUrl": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/thumbnail.webp"
      },
      {
        "id": "f14",
        "name": "Casual shoes",
        "icon": "casual shoes",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/thumbnail.webp"
      },
      {
        "id": "f15",
        "name": "Trolley Bag",
        "icon": "trolley bag",
        "imageUrl": "https://cdn.dummyjson.com/product-images/womens-bags/heshe-women's-leather-bag/thumbnail.webp"
      },
      {
        "id": "f16",
        "name": "Jewellery",
        "icon": "jewellery",
        "imageUrl": "https://cdn.dummyjson.com/product-images/womens-jewellery/green-oval-earring/thumbnail.webp"
      },
      {
        "id": "f17",
        "name": "Sarees",
        "icon": "sarees",
        "imageUrl": "https://cdn.dummyjson.com/product-images/womens-dresses/black-women's-gown/thumbnail.webp"
      },
      {
        "id": "f18",
        "name": "Women's jeans",
        "icon": "women's jeans",
        "imageUrl": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "f19",
        "name": "Kurtis",
        "icon": "kurtis",
        "imageUrl": "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/thumbnail.webp"
      },
      {
        "id": "f20",
        "name": "Women's sandals",
        "icon": "women's sandals",
        "imageUrl": "https://cdn.dummyjson.com/product-images/womens-shoes/black-&-brown-slipper/thumbnail.webp"
      },
      {
        "id": "f21",
        "name": "Nightwear",
        "icon": "nightwear",
        "imageUrl": "https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp"
      }
    ],
    "promos": [
      {
        "title": "The Sneaker Project",
        "subtitle": "Top sneaker brands 50%+ off",
        "tag": "Footwear",
        "bg": "#fff1f2",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Rakhi Specials",
        "subtitle": "Gift the best, save the most",
        "tag": "Festive",
        "bg": "#fdf4ff",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "New Launches",
        "subtitle": "Fresh apparel drops every day",
        "tag": "New In",
        "bg": "#eff6ff",
        "cta": "View",
        "link": "/deals"
      }
    ]
  },
  "mobiles": {
    "displayName": "Mobiles",
    "theme": "mobiles",
    "banners": [
      {
        "title": "Smartphone Festival",
        "subtitle": "5G phones from ₹6,999 — 50%+ off guaranteed",
        "tag": "Mega Sale",
        "cta": "Shop Mobiles",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#2563eb 100%)",
        "image": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Latest 5G Flagships",
        "subtitle": "Pro camera phones & 6000mAh battery champions",
        "tag": "New Arrivals",
        "cta": "Explore Now",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#164e63 0%,#0891b2 100%)",
        "image": "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "m1",
        "name": "Apple",
        "icon": "apple",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"
      },
      {
        "id": "m2",
        "name": "Samsung",
        "icon": "samsung",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp"
      },
      {
        "id": "m3",
        "name": "vivo",
        "icon": "vivo",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp"
      },
      {
        "id": "m4",
        "name": "OPPO",
        "icon": "oppo",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"
      },
      {
        "id": "m5",
        "name": "Redmi",
        "icon": "redmi",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp"
      },
      {
        "id": "m6",
        "name": "realme",
        "icon": "realme",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp"
      },
      {
        "id": "m7",
        "name": "Motorola",
        "icon": "motorola",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"
      },
      {
        "id": "m8",
        "name": "Nothing",
        "icon": "nothing",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp"
      },
      {
        "id": "m9",
        "name": "Google",
        "icon": "google",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp"
      },
      {
        "id": "m10",
        "name": "OnePlus",
        "icon": "oneplus",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"
      },
      {
        "id": "m11",
        "name": "POCO",
        "icon": "poco",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp"
      },
      {
        "id": "m12",
        "name": "iQOO",
        "icon": "iqoo",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp"
      },
      {
        "id": "m13",
        "name": "HMD",
        "icon": "hmd",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"
      },
      {
        "id": "m14",
        "name": "Lava",
        "icon": "lava",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp"
      },
      {
        "id": "m15",
        "name": "Infinix",
        "icon": "infinix",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp"
      },
      {
        "id": "m16",
        "name": "Tecno",
        "icon": "tecno",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"
      },
      {
        "id": "m17",
        "name": "5G Phones",
        "icon": "5g phones",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp"
      },
      {
        "id": "m18",
        "name": "Budget Phones",
        "icon": "budget phones",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp"
      },
      {
        "id": "m19",
        "name": "Premium Phones",
        "icon": "premium phones",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"
      },
      {
        "id": "m20",
        "name": "Mobile Accessories",
        "icon": "mobile accessories",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp"
      }
    ],
    "promos": [
      {
        "title": "Budget Phones Under ₹10K",
        "subtitle": "Great performance, great price",
        "tag": "Budget",
        "bg": "#f0f9ff",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Premium Flagship Deals",
        "subtitle": "iPhone, Galaxy S & more",
        "tag": "Premium",
        "bg": "#f8fafc",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "Mobile Accessories",
        "subtitle": "Cases, chargers & more at 70% off",
        "tag": "Accessories",
        "bg": "#fff7ed",
        "cta": "View",
        "link": "/deals"
      }
    ]
  },
  "electronics": {
    "displayName": "Electronics",
    "theme": "electronics",
    "banners": [
      {
        "title": "Lowest Prices of the Week",
        "subtitle": "Laptops, TVs & Audio — Unbeatable Discounts",
        "tag": "Mega Sale",
        "cta": "Shop Electronics",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#ea580c 0%,#f97316 60%,#fbbf24 100%)",
        "image": "https://images.unsplash.com/photo-1593640408182-31c228e05dc8?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Lenovo & HP Chromebooks",
        "subtitle": "Starting ₹1,249/Month — 0% Interest Offers",
        "tag": "Top Deals",
        "cta": "Explore Laptops",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#1e293b 0%,#334155 60%,#475569 100%)",
        "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "e1",
        "name": "Get in Mins",
        "icon": "get in mins",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp"
      },
      {
        "id": "e2",
        "name": "Laptops",
        "icon": "laptops",
        "imageUrl": "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp"
      },
      {
        "id": "e3",
        "name": "Tablets",
        "icon": "tablets",
        "imageUrl": "https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/thumbnail.webp"
      },
      {
        "id": "e4",
        "name": "Grooming",
        "icon": "grooming",
        "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp"
      },
      {
        "id": "e5",
        "name": "Mobile Covers",
        "icon": "mobile covers",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/thumbnail.webp"
      },
      {
        "id": "e6",
        "name": "Storage",
        "icon": "storage",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp"
      },
      {
        "id": "e7",
        "name": "Chargers & Cables",
        "icon": "chargers & cables",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/thumbnail.webp"
      },
      {
        "id": "e8",
        "name": "Power Bank",
        "icon": "power bank",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp"
      },
      {
        "id": "e9",
        "name": "Health Care",
        "icon": "health care",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/thumbnail.webp"
      },
      {
        "id": "e10",
        "name": "Printers",
        "icon": "printers",
        "imageUrl": "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/thumbnail.webp"
      },
      {
        "id": "e11",
        "name": "New Launches",
        "icon": "new launches",
        "imageUrl": "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"
      },
      {
        "id": "e12",
        "name": "Headsets",
        "icon": "headsets",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp"
      },
      {
        "id": "e13",
        "name": "Wearables",
        "icon": "wearables",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp"
      },
      {
        "id": "e14",
        "name": "Accessories",
        "icon": "accessories",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp"
      },
      {
        "id": "e15",
        "name": "IT Peripherals",
        "icon": "it peripherals",
        "imageUrl": "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/thumbnail.webp"
      },
      {
        "id": "e16",
        "name": "Camera",
        "icon": "camera",
        "imageUrl": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "e17",
        "name": "Gaming",
        "icon": "gaming",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp"
      },
      {
        "id": "e18",
        "name": "Smart Devices",
        "icon": "smart devices",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/thumbnail.webp"
      },
      {
        "id": "e19",
        "name": "Gaming Hub",
        "icon": "gaming hub",
        "imageUrl": "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp"
      },
      {
        "id": "e20",
        "name": "Routers",
        "icon": "routers",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp"
      }
    ],
    "promos": [
      {
        "title": "Get in Minutes",
        "subtitle": "Instant delivery on select items",
        "tag": "Fast Delivery",
        "bg": "#fef3c7",
        "cta": "Order Now",
        "link": "/deals"
      },
      {
        "title": "New Launches Weekly",
        "subtitle": "Be first to grab latest tech",
        "tag": "New",
        "bg": "#eff6ff",
        "cta": "View",
        "link": "/deals"
      },
      {
        "title": "Gaming Hub Deals",
        "subtitle": "Consoles, games & gear 50% off",
        "tag": "Gaming",
        "bg": "#fdf4ff",
        "cta": "Explore",
        "link": "/deals"
      }
    ]
  },
  "beauty": {
    "displayName": "Beauty",
    "theme": "beauty",
    "banners": [
      {
        "title": "Beauty & Glamour Sale",
        "subtitle": "Premium brands at 70% off — verified live",
        "tag": "Mega Offer",
        "cta": "Shop Beauty",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#9d174d 0%,#ec4899 60%,#f9a8d4 100%)",
        "image": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "K-Beauty Arrivals",
        "subtitle": "Korean skincare favourites now in India",
        "tag": "New In",
        "cta": "Explore",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#6d28d9 0%,#a78bfa 60%,#ddd6fe 100%)",
        "image": "https://images.unsplash.com/photo-1573575154488-cdabfc90de21?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "b1",
        "name": "Skincare",
        "icon": "skincare",
        "imageUrl": "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/thumbnail.webp"
      },
      {
        "id": "b2",
        "name": "Hair Care",
        "icon": "hair care",
        "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp"
      },
      {
        "id": "b3",
        "name": "Makeup",
        "icon": "makeup",
        "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp"
      },
      {
        "id": "b4",
        "name": "Fragrances",
        "icon": "fragrances",
        "imageUrl": "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/thumbnail.webp"
      },
      {
        "id": "b5",
        "name": "Bath & Spa",
        "icon": "bath & spa",
        "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp"
      },
      {
        "id": "b6",
        "name": "Hygiene",
        "icon": "hygiene",
        "imageUrl": "https://cdn.dummyjson.com/product-images/fragrances/chanel-coco-noir-eau-de/thumbnail.webp"
      },
      {
        "id": "b7",
        "name": "Oral Care",
        "icon": "oral care",
        "imageUrl": "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/thumbnail.webp"
      },
      {
        "id": "b8",
        "name": "K-Beauty",
        "icon": "k-beauty",
        "imageUrl": "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/thumbnail.webp"
      },
      {
        "id": "b9",
        "name": "Grooming",
        "icon": "grooming",
        "imageUrl": "https://cdn.dummyjson.com/product-images/fragrances/dior-j'adore/thumbnail.webp"
      },
      {
        "id": "b10",
        "name": "Premium Beauty",
        "icon": "premium beauty",
        "imageUrl": "https://cdn.dummyjson.com/product-images/fragrances/dolce-shine-eau-de/thumbnail.webp"
      },
      {
        "id": "b11",
        "name": "Derma Care",
        "icon": "derma care",
        "imageUrl": "https://cdn.dummyjson.com/product-images/skin-care/vaseline-men-body-and-face-lotion/thumbnail.webp"
      },
      {
        "id": "b12",
        "name": "Combos & Kits",
        "icon": "combos & kits",
        "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp"
      },
      {
        "id": "b13",
        "name": "Exclusive Deals",
        "icon": "exclusive deals",
        "imageUrl": "https://cdn.dummyjson.com/product-images/fragrances/gucci-bloom-eau-de/thumbnail.webp"
      },
      {
        "id": "b14",
        "name": "Wellness",
        "icon": "wellness",
        "imageUrl": "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/thumbnail.webp"
      },
      {
        "id": "b15",
        "name": "Lipsticks",
        "icon": "lipsticks",
        "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp"
      },
      {
        "id": "b16",
        "name": "Sunscreen",
        "icon": "sunscreen",
        "imageUrl": "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/thumbnail.webp"
      }
    ],
    "promos": [
      {
        "title": "Luxury Skincare",
        "subtitle": "Premium brands at 60%+ off",
        "tag": "Premium",
        "bg": "#fdf4ff",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Hair Care Bundles",
        "subtitle": "Complete routines, big savings",
        "tag": "Bundle",
        "bg": "#fff1f2",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "Natural & Organic",
        "subtitle": "Clean beauty picks",
        "tag": "Organic",
        "bg": "#f0fdf4",
        "cta": "View",
        "link": "/deals"
      }
    ]
  },
  "home": {
    "displayName": "Home",
    "theme": "home",
    "banners": [
      {
        "title": "Home Makeover Festival",
        "subtitle": "Furniture, decor & kitchen up to 75% off",
        "tag": "Home Sale",
        "cta": "Explore Home",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#064e3b 0%,#047857 60%,#34d399 100%)",
        "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Designer Living Essentials",
        "subtitle": "Beds, sofas, lighting & rugs at factory pricing",
        "tag": "Living Fest",
        "cta": "Shop Now",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#78350f 0%,#b45309 100%)",
        "image": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "h1",
        "name": "Living Room",
        "icon": "living room",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp"
      },
      {
        "id": "h2",
        "name": "Bedroom",
        "icon": "bedroom",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp"
      },
      {
        "id": "h3",
        "name": "Kitchen",
        "icon": "kitchen",
        "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/bamboo-spatula/thumbnail.webp"
      },
      {
        "id": "h4",
        "name": "Home Decor",
        "icon": "home decor",
        "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/thumbnail.webp"
      },
      {
        "id": "h5",
        "name": "Lighting",
        "icon": "lighting",
        "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/thumbnail.webp"
      },
      {
        "id": "h6",
        "name": "Storage",
        "icon": "storage",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp"
      },
      {
        "id": "h7",
        "name": "Bedding",
        "icon": "bedding",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp"
      },
      {
        "id": "h8",
        "name": "Furniture",
        "icon": "furniture",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/thumbnail.webp"
      },
      {
        "id": "h9",
        "name": "Home Improvement",
        "icon": "home improvement",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/thumbnail.webp"
      },
      {
        "id": "h10",
        "name": "Bedsheets",
        "icon": "bedsheets",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp"
      },
      {
        "id": "h11",
        "name": "Cushions",
        "icon": "cushions",
        "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/thumbnail.webp"
      },
      {
        "id": "h12",
        "name": "Kitchen Storage",
        "icon": "kitchen storage",
        "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/thumbnail.webp"
      },
      {
        "id": "h13",
        "name": "Cookware",
        "icon": "cookware",
        "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-whisk/thumbnail.webp"
      },
      {
        "id": "h14",
        "name": "Wall Decor",
        "icon": "wall decor",
        "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/thumbnail.webp"
      },
      {
        "id": "h15",
        "name": "Rugs",
        "icon": "rugs",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp"
      },
      {
        "id": "h16",
        "name": "Clocks",
        "icon": "clocks",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp"
      },
      {
        "id": "h17",
        "name": "Mirrors",
        "icon": "mirrors",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/thumbnail.webp"
      },
      {
        "id": "h18",
        "name": "Organization",
        "icon": "organization",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp"
      }
    ],
    "promos": [
      {
        "title": "Kitchen Must-Haves",
        "subtitle": "Cookware sets from ₹499",
        "tag": "Cookware",
        "bg": "#fef3c7",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Bedding Fest",
        "subtitle": "Pure cotton sheets & comforters",
        "tag": "Bedding",
        "bg": "#eff6ff",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "Wall Art & Lighting",
        "subtitle": "Lamps, clocks & frames",
        "tag": "Decor",
        "bg": "#fdf2f8",
        "cta": "View",
        "link": "/deals"
      }
    ]
  },
  "appliances": {
    "displayName": "Appliances",
    "theme": "appliances",
    "banners": [
      {
        "title": "Mega Home Appliances Fest",
        "subtitle": "Refrigerators, ACs & TVs at 55%+ off with warranty",
        "tag": "Mega Appliance Sale",
        "cta": "Shop Appliances",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#0369a1 0%,#0284c7 60%,#38bdf8 100%)",
        "image": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Smart Kitchen Appliances",
        "subtitle": "Air fryers, microwaves, juicers & cooktops",
        "tag": "Kitchen Fest",
        "cta": "Explore Kitchen",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#c2410c 0%,#ea580c 100%)",
        "image": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "ap1",
        "name": "Refrigerators",
        "icon": "refrigerators",
        "imageUrl": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "ap2",
        "name": "Washing Machines",
        "icon": "washing machines",
        "imageUrl": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "ap3",
        "name": "Air Conditioners",
        "icon": "air conditioners",
        "imageUrl": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "ap4",
        "name": "Air Coolers",
        "icon": "air coolers",
        "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/thumbnail.webp"
      },
      {
        "id": "ap5",
        "name": "Televisions",
        "icon": "televisions",
        "imageUrl": "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp"
      },
      {
        "id": "ap6",
        "name": "Microwave Ovens",
        "icon": "microwave ovens",
        "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/bamboo-spatula/thumbnail.webp"
      },
      {
        "id": "ap7",
        "name": "Water Purifiers",
        "icon": "water purifiers",
        "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/thumbnail.webp"
      },
      {
        "id": "ap8",
        "name": "Vacuum Cleaners",
        "icon": "vacuum cleaners",
        "imageUrl": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "ap9",
        "name": "Air Purifiers",
        "icon": "air purifiers",
        "imageUrl": "https://images.unsplash.com/photo-1580974852861-c381510bc98a?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "ap10",
        "name": "Fans",
        "icon": "fans",
        "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/thumbnail.webp"
      },
      {
        "id": "ap11",
        "name": "Geysers",
        "icon": "geysers",
        "imageUrl": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "ap12",
        "name": "Kitchen Appliances",
        "icon": "kitchen appliances",
        "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/black-whisk/thumbnail.webp"
      },
      {
        "id": "ap13",
        "name": "Induction Cooktops",
        "icon": "induction cooktops",
        "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/bamboo-spatula/thumbnail.webp"
      },
      {
        "id": "ap14",
        "name": "Dishwashers",
        "icon": "dishwashers",
        "imageUrl": "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200&auto=format&fit=crop&q=80"
      }
    ],
    "promos": [
      {
        "title": "0% Interest EMIs",
        "subtitle": "On refrigerators & washing machines",
        "tag": "Finance Offer",
        "bg": "#f0f9ff",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Summer Coolers & ACs",
        "subtitle": "Beat the heat with huge savings",
        "tag": "Cooling",
        "bg": "#e0f2fe",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "Smart TV Clearance",
        "subtitle": "4K UHD displays from ₹9,999",
        "tag": "Entertainment",
        "bg": "#fff7ed",
        "cta": "View",
        "link": "/deals"
      }
    ]
  },
  "toys": {
    "displayName": "Toys, Baby & Kids",
    "theme": "toys",
    "banners": [
      {
        "title": "Kids & Baby Mega Carnival",
        "subtitle": "Toys, clothing & diapering at 60%+ off",
        "tag": "Kids Fest",
        "cta": "Shop Kids",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#eab308 0%,#f59e0b 60%,#f43f5e 100%)",
        "image": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Educational & STEM Toys",
        "subtitle": "Puzzles, robotics & learning kits for all ages",
        "tag": "Learning",
        "cta": "Explore STEM",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#0284c7 0%,#38bdf8 100%)",
        "image": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "t1",
        "name": "Shop By Age",
        "icon": "shop by age",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/thumbnail.webp"
      },
      {
        "id": "t2",
        "name": "Toys",
        "icon": "toys",
        "imageUrl": "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "t3",
        "name": "Educational Toys",
        "icon": "educational toys",
        "imageUrl": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "t4",
        "name": "Baby Essentials",
        "icon": "baby essentials",
        "imageUrl": "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/thumbnail.webp"
      },
      {
        "id": "t5",
        "name": "Baby Care",
        "icon": "baby care",
        "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp"
      },
      {
        "id": "t6",
        "name": "Kids' Clothing",
        "icon": "kids' clothing",
        "imageUrl": "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/thumbnail.webp"
      },
      {
        "id": "t7",
        "name": "Kids' Footwear",
        "icon": "kids' footwear",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/thumbnail.webp"
      },
      {
        "id": "t8",
        "name": "School Supplies",
        "icon": "school supplies",
        "imageUrl": "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/thumbnail.webp"
      },
      {
        "id": "t9",
        "name": "Board Games",
        "icon": "board games",
        "imageUrl": "https://images.unsplash.com/photo-1611996575749-79a3a250f948?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "t10",
        "name": "Outdoor Toys",
        "icon": "outdoor toys",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-ball/thumbnail.webp"
      },
      {
        "id": "t11",
        "name": "Story Books",
        "icon": "story books",
        "imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "t12",
        "name": "Remote Control",
        "icon": "remote control",
        "imageUrl": "https://cdn.dummyjson.com/product-images/vehicle/300-touring/thumbnail.webp"
      },
      {
        "id": "t13",
        "name": "Soft Toys",
        "icon": "soft toys",
        "imageUrl": "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "t14",
        "name": "Action Figures",
        "icon": "action figures",
        "imageUrl": "https://images.unsplash.com/photo-1608734265656-f035d3e7bcbf?w=200&auto=format&fit=crop&q=80"
      }
    ],
    "promos": [
      {
        "title": "Baby Care Value Packs",
        "subtitle": "Diapers & baby skin care combos",
        "tag": "Baby Care",
        "bg": "#fef9c3",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Board Games & Puzzles",
        "subtitle": "Family fun favorites from ₹299",
        "tag": "Games",
        "bg": "#fdf2f8",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "Kids Footwear & Apparel",
        "subtitle": "Starting at ₹199 only",
        "tag": "Fashion",
        "bg": "#eff6ff",
        "cta": "View",
        "link": "/deals"
      }
    ]
  },
  "food": {
    "displayName": "Food & Health",
    "theme": "food",
    "banners": [
      {
        "title": "Fresh Grocery & Health Carnival",
        "subtitle": "Daily staples, snacks & nutrition up to 60% off",
        "tag": "Grocery Sale",
        "cta": "Order Essentials",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#15803d 0%,#22c55e 60%,#84cc16 100%)",
        "image": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Dry Fruits & Healthy Snacks",
        "subtitle": "Premium almonds, walnuts, cashews & seeds",
        "tag": "Nutrition",
        "cta": "Explore Snacks",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#a16207 0%,#ca8a04 100%)",
        "image": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "fd1",
        "name": "Daily Essentials",
        "icon": "daily essentials",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp"
      },
      {
        "id": "fd2",
        "name": "Snacks & Munchies",
        "icon": "snacks & munchies",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/beef-steak/thumbnail.webp"
      },
      {
        "id": "fd3",
        "name": "Beverages",
        "icon": "beverages",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/cat-food/thumbnail.webp"
      },
      {
        "id": "fd4",
        "name": "Dry Fruits & Nuts",
        "icon": "dry fruits & nuts",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/chicken-meat/thumbnail.webp"
      },
      {
        "id": "fd5",
        "name": "Breakfast Cereals",
        "icon": "breakfast cereals",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/cooking-oil/thumbnail.webp"
      },
      {
        "id": "fd6",
        "name": "Packaged Foods",
        "icon": "packaged foods",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/cucumber/thumbnail.webp"
      },
      {
        "id": "fd7",
        "name": "Household Cleaning",
        "icon": "household cleaning",
        "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp"
      },
      {
        "id": "fd8",
        "name": "Personal Care",
        "icon": "personal care",
        "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/red-nail-polish/thumbnail.webp"
      },
      {
        "id": "fd9",
        "name": "Wellness & Supplements",
        "icon": "wellness & supplements",
        "imageUrl": "https://cdn.dummyjson.com/product-images/skin-care/olay-ultra-moisture-shea-butter-body-wash/thumbnail.webp"
      },
      {
        "id": "fd10",
        "name": "Organic Foods",
        "icon": "organic foods",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/dog-food/thumbnail.webp"
      },
      {
        "id": "fd11",
        "name": "Spices & Oils",
        "icon": "spices & oils",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/eggs/thumbnail.webp"
      },
      {
        "id": "fd12",
        "name": "Protein & Nutrition",
        "icon": "protein & nutrition",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/fish-steak/thumbnail.webp"
      },
      {
        "id": "fd13",
        "name": "Health Drinks",
        "icon": "health drinks",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/cat-food/thumbnail.webp"
      }
    ],
    "promos": [
      {
        "title": "Super Saver Grocery",
        "subtitle": "Staples, tea, coffee & snacks",
        "tag": "Super Saver",
        "bg": "#f0fdf4",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Immunity & Vitamins",
        "subtitle": "Daily wellness essentials",
        "tag": "Wellness",
        "bg": "#ecfdf5",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "Organic & Cold-Pressed",
        "subtitle": "Pure honey & cold-pressed oils",
        "tag": "Organic",
        "bg": "#fefce8",
        "cta": "View",
        "link": "/deals"
      }
    ]
  },
  "auto": {
    "displayName": "Auto Accessories",
    "theme": "auto",
    "banners": [
      {
        "title": "Auto Accessories & Rider Hub",
        "subtitle": "Helmets, dashcams, seat covers & car care 50%+ off",
        "tag": "Auto Fest",
        "cta": "Shop Auto",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#1e293b 0%,#334155 60%,#f97316 100%)",
        "image": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Car Detailing & Upgrades",
        "subtitle": "High pressure washers, polishers & floor mats",
        "tag": "Car Care",
        "cta": "Explore Care",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%)",
        "image": "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "au1",
        "name": "Car Accessories",
        "icon": "car accessories",
        "imageUrl": "https://cdn.dummyjson.com/product-images/vehicle/300-touring/thumbnail.webp"
      },
      {
        "id": "au2",
        "name": "Bike Accessories",
        "icon": "bike accessories",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      },
      {
        "id": "au3",
        "name": "Car Care",
        "icon": "car care",
        "imageUrl": "https://cdn.dummyjson.com/product-images/vehicle/300-touring/thumbnail.webp"
      },
      {
        "id": "au4",
        "name": "Bike Care",
        "icon": "bike care",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      },
      {
        "id": "au5",
        "name": "Helmets",
        "icon": "helmets",
        "imageUrl": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "au6",
        "name": "Seat Covers",
        "icon": "seat covers",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp"
      },
      {
        "id": "au7",
        "name": "Floor Mats",
        "icon": "floor mats",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp"
      },
      {
        "id": "au8",
        "name": "Phone Holders",
        "icon": "phone holders",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp"
      },
      {
        "id": "au9",
        "name": "Chargers & Inverters",
        "icon": "chargers & inverters",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/thumbnail.webp"
      },
      {
        "id": "au10",
        "name": "Cleaning Products",
        "icon": "cleaning products",
        "imageUrl": "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp"
      },
      {
        "id": "au11",
        "name": "Car Lighting",
        "icon": "car lighting",
        "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/thumbnail.webp"
      },
      {
        "id": "au12",
        "name": "Tool Kits",
        "icon": "tool kits",
        "imageUrl": "https://cdn.dummyjson.com/product-images/kitchen-accessories/bamboo-spatula/thumbnail.webp"
      },
      {
        "id": "au13",
        "name": "Safety Gear",
        "icon": "safety gear",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/thumbnail.webp"
      },
      {
        "id": "au14",
        "name": "Riding Jackets",
        "icon": "riding jackets",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp"
      },
      {
        "id": "au15",
        "name": "Tire Inflators",
        "icon": "tire inflators",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      }
    ],
    "promos": [
      {
        "title": "Helmet Safety Fest",
        "subtitle": "ISI certified helmets at 50% off",
        "tag": "Safety",
        "bg": "#fff7ed",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Car Detailing & Wash",
        "subtitle": "Shampoos, polishes & vacuums",
        "tag": "Detailing",
        "bg": "#f1f5f9",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "Mobile Holders & Chargers",
        "subtitle": "Fast charging travel companions",
        "tag": "Electronics",
        "bg": "#eff6ff",
        "cta": "View",
        "link": "/deals"
      }
    ]
  },
  "sports": {
    "displayName": "Sports & Fitness",
    "theme": "sports",
    "banners": [
      {
        "title": "Sports & Fitness Mega Sale",
        "subtitle": "Gym gear, shoes & sportswear up to 70% off",
        "tag": "Fitness Fest",
        "cta": "Get Fit",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#1d4ed8 0%,#2563eb 60%,#f97316 100%)",
        "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Outdoor & Team Sports",
        "subtitle": "Cricket, football, badminton & cycling essentials",
        "tag": "Sports Hub",
        "cta": "Explore Gear",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#065f46 0%,#059669 100%)",
        "image": "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "sp1",
        "name": "Cricket Gear",
        "icon": "cricket gear",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/thumbnail.webp"
      },
      {
        "id": "sp2",
        "name": "Football",
        "icon": "football",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-ball/thumbnail.webp"
      },
      {
        "id": "sp3",
        "name": "Badminton",
        "icon": "badminton",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/thumbnail.webp"
      },
      {
        "id": "sp4",
        "name": "Basketball",
        "icon": "basketball",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-ball/thumbnail.webp"
      },
      {
        "id": "sp5",
        "name": "Running Shoes",
        "icon": "running shoes",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/thumbnail.webp"
      },
      {
        "id": "sp6",
        "name": "Gym Equipment",
        "icon": "gym equipment",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/thumbnail.webp"
      },
      {
        "id": "sp7",
        "name": "Yoga Mats",
        "icon": "yoga mats",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/thumbnail.webp"
      },
      {
        "id": "sp8",
        "name": "Cycling",
        "icon": "cycling",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      },
      {
        "id": "sp9",
        "name": "Sports Shoes",
        "icon": "sports shoes",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp"
      },
      {
        "id": "sp10",
        "name": "Active Sportswear",
        "icon": "active sportswear",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp"
      },
      {
        "id": "sp11",
        "name": "Fitness Accessories",
        "icon": "fitness accessories",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/thumbnail.webp"
      },
      {
        "id": "sp12",
        "name": "Outdoor Camping",
        "icon": "outdoor camping",
        "imageUrl": "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/thumbnail.webp"
      },
      {
        "id": "sp13",
        "name": "Swimming Gear",
        "icon": "swimming gear",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/thumbnail.webp"
      },
      {
        "id": "sp14",
        "name": "Whey Protein",
        "icon": "whey protein",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/cucumber/thumbnail.webp"
      },
      {
        "id": "sp15",
        "name": "Smart Trackers",
        "icon": "smart trackers",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/american-football/thumbnail.webp"
      }
    ],
    "promos": [
      {
        "title": "Home Gym Under ₹1,499",
        "subtitle": "Dumbbells, bands & mats",
        "tag": "Home Gym",
        "bg": "#eff6ff",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Running & Sports Shoes",
        "subtitle": "Top athletic brands 50%+ off",
        "tag": "Footwear",
        "bg": "#fff1f2",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "Cycling & Adventure",
        "subtitle": "Mountain & road cycles",
        "tag": "Bikes",
        "bg": "#f0fdf4",
        "cta": "View",
        "link": "/deals"
      }
    ]
  },
  "furniture": {
    "displayName": "Furniture",
    "theme": "furniture",
    "banners": [
      {
        "title": "Grand Furniture Carnival",
        "subtitle": "Beds, sofas & wardrobes at factory-direct pricing",
        "tag": "Furniture Fest",
        "cta": "Shop Furniture",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#78350f 0%,#92400e 60%,#b45309 100%)",
        "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Ergonomic Work From Home",
        "subtitle": "Chairs & height-adjustable desks with warranty",
        "tag": "WFH Essentials",
        "cta": "Explore Office",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#1c1917 0%,#44403c 100%)",
        "image": "https://images.unsplash.com/photo-1580481077195-c54d31cb0272?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "fn1",
        "name": "Living Room",
        "icon": "living room",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp"
      },
      {
        "id": "fn2",
        "name": "Bedroom",
        "icon": "bedroom",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp"
      },
      {
        "id": "fn3",
        "name": "Dining Sets",
        "icon": "dining sets",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/thumbnail.webp"
      },
      {
        "id": "fn4",
        "name": "Office Chairs",
        "icon": "office chairs",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/thumbnail.webp"
      },
      {
        "id": "fn5",
        "name": "Sofas & Sectionals",
        "icon": "sofas & sectionals",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp"
      },
      {
        "id": "fn6",
        "name": "Solid Wood Beds",
        "icon": "solid wood beds",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp"
      },
      {
        "id": "fn7",
        "name": "Coffee Tables",
        "icon": "coffee tables",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp"
      },
      {
        "id": "fn8",
        "name": "Accent Chairs",
        "icon": "accent chairs",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/thumbnail.webp"
      },
      {
        "id": "fn9",
        "name": "Wardrobes",
        "icon": "wardrobes",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp"
      },
      {
        "id": "fn10",
        "name": "Cabinets",
        "icon": "cabinets",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp"
      },
      {
        "id": "fn11",
        "name": "Bookshelves",
        "icon": "bookshelves",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp"
      },
      {
        "id": "fn12",
        "name": "TV Units",
        "icon": "tv units",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/wooden-bathroom-sink-with-mirror/thumbnail.webp"
      },
      {
        "id": "fn13",
        "name": "Mattresses",
        "icon": "mattresses",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp"
      },
      {
        "id": "fn14",
        "name": "Recliners",
        "icon": "recliners",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp"
      },
      {
        "id": "fn15",
        "name": "Shoe Racks",
        "icon": "shoe racks",
        "imageUrl": "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp"
      }
    ],
    "promos": [
      {
        "title": "Solid Sheesham Wood",
        "subtitle": "Lifetime durability guarantee",
        "tag": "Solid Wood",
        "bg": "#fef3c7",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Mattress Comfort Fest",
        "subtitle": "Orthopedic memory foam",
        "tag": "Mattresses",
        "bg": "#fdf4ff",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "Modular Wardrobes",
        "subtitle": "Space-saving bedroom storage",
        "tag": "Storage",
        "bg": "#f0fdf4",
        "cta": "View",
        "link": "/deals"
      }
    ]
  },
  "books": {
    "displayName": "Books & Stationery",
    "theme": "books",
    "banners": [
      {
        "title": "Books & Stationery Festival",
        "subtitle": "Bestsellers, academic & art supplies 50%+ off",
        "tag": "Book Fest",
        "cta": "Shop Books",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#0f172a 0%,#1e3a8a 60%,#0284c7 100%)",
        "image": "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Student & Exam Prep Hub",
        "subtitle": "UPSC, JEE, NEET & Engineering books at lowest prices",
        "tag": "Exam Specials",
        "cta": "Explore Exams",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#701a75 0%,#a21caf 100%)",
        "image": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "bk1",
        "name": "Fiction",
        "icon": "fiction",
        "imageUrl": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk2",
        "name": "Non-Fiction",
        "icon": "non-fiction",
        "imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk3",
        "name": "Academic Books",
        "icon": "academic books",
        "imageUrl": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk4",
        "name": "Competitive Exams",
        "icon": "competitive exams",
        "imageUrl": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk5",
        "name": "Engineering",
        "icon": "engineering",
        "imageUrl": "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk6",
        "name": "Programming & Tech",
        "icon": "programming & tech",
        "imageUrl": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk7",
        "name": "Children's Books",
        "icon": "children's books",
        "imageUrl": "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk8",
        "name": "Manga & Comics",
        "icon": "manga & comics",
        "imageUrl": "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk9",
        "name": "Notebooks",
        "icon": "notebooks",
        "imageUrl": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk10",
        "name": "Luxury Pens",
        "icon": "luxury pens",
        "imageUrl": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk11",
        "name": "Art Supplies",
        "icon": "art supplies",
        "imageUrl": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk12",
        "name": "Office Supplies",
        "icon": "office supplies",
        "imageUrl": "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk13",
        "name": "Self-Help",
        "icon": "self-help",
        "imageUrl": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "bk14",
        "name": "Novels",
        "icon": "novels",
        "imageUrl": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&auto=format&fit=crop&q=80"
      }
    ],
    "promos": [
      {
        "title": "Top 100 Bestsellers",
        "subtitle": "Fiction, memoirs & business",
        "tag": "Bestsellers",
        "bg": "#fef3c7",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Art & Calligraphy",
        "subtitle": "Brushes, canvas & acrylics",
        "tag": "Art",
        "bg": "#fdf2f8",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "Executive Diaries & Pens",
        "subtitle": "Premium desk stationery",
        "tag": "Stationery",
        "bg": "#eff6ff",
        "cta": "View",
        "link": "/deals"
      }
    ]
  },
  "2wheelers": {
    "displayName": "Two Wheelers",
    "theme": "twowheelers",
    "banners": [
      {
        "title": "Two Wheeler Super Hub",
        "subtitle": "Electric & petrol rides, riding gear & spare parts",
        "tag": "Ride Fest",
        "cta": "Explore Rides",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#0f172a 0%,#dc2626 60%,#b91c1c 100%)",
        "image": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80"
      },
      {
        "title": "Riding Season Protection Gear",
        "subtitle": "Certified helmets, gloves, armor & jackets 50%+ off",
        "tag": "Rider Gear",
        "cta": "Shop Gear",
        "ctaLink": "#",
        "bg": "linear-gradient(135deg,#18181b 0%,#27272a 100%)",
        "image": "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80"
      }
    ],
    "subcats": [
      {
        "id": "tw1",
        "name": "Popular Motorcycles",
        "icon": "popular motorcycles",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      },
      {
        "id": "tw2",
        "name": "Popular Scooters",
        "icon": "popular scooters",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      },
      {
        "id": "tw3",
        "name": "Electric Vehicles",
        "icon": "electric vehicles",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      },
      {
        "id": "tw4",
        "name": "Latest Launches",
        "icon": "new launches",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      },
      {
        "id": "tw5",
        "name": "Helmets",
        "icon": "helmets",
        "imageUrl": "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "tw6",
        "name": "Riding Gloves",
        "icon": "riding gloves",
        "imageUrl": "https://cdn.dummyjson.com/product-images/sports-accessories/baseball-glove/thumbnail.webp"
      },
      {
        "id": "tw7",
        "name": "Bike Covers",
        "icon": "bike covers",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      },
      {
        "id": "tw8",
        "name": "Bike Care & Wash",
        "icon": "bike care & wash",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      },
      {
        "id": "tw9",
        "name": "Spare Parts",
        "icon": "spare parts",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      },
      {
        "id": "tw10",
        "name": "Performance Tyres",
        "icon": "performance tyres",
        "imageUrl": "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=200&auto=format&fit=crop&q=80"
      },
      {
        "id": "tw11",
        "name": "Engine Oils",
        "icon": "engine oils",
        "imageUrl": "https://cdn.dummyjson.com/product-images/groceries/apple/thumbnail.webp"
      },
      {
        "id": "tw12",
        "name": "LED Fog Lights",
        "icon": "led fog lights",
        "imageUrl": "https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/thumbnail.webp"
      },
      {
        "id": "tw13",
        "name": "Security Locks",
        "icon": "security locks",
        "imageUrl": "https://cdn.dummyjson.com/product-images/motorcycle/generic-motorcycle/thumbnail.webp"
      },
      {
        "id": "tw14",
        "name": "Riding Jackets",
        "icon": "riding jackets",
        "imageUrl": "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp"
      }
    ],
    "promos": [
      {
        "title": "EV Scooter Offers",
        "subtitle": "Zero emissions, huge savings",
        "tag": "Electric",
        "bg": "#f0fdf4",
        "cta": "Shop",
        "link": "/deals"
      },
      {
        "title": "Rider Protection Gear",
        "subtitle": "Helmets, armor & knee guards",
        "tag": "Safety",
        "bg": "#fef2f2",
        "cta": "Explore",
        "link": "/deals"
      },
      {
        "title": "Bike Spares & Oils",
        "subtitle": "Motul, Castrol, Bosch spares",
        "tag": "Maintenance",
        "bg": "#f8fafc",
        "cta": "View",
        "link": "/deals"
      }
    ]
  }
};

/* ─── Helpers to Resolve Config & Filter by Category / Subcategory ───── */
const getCatConfig = (idOrSlug, fallbackName) => {
  if (!idOrSlug) return ALL_CAT_CONFIGS.fashion;
  const key = String(idOrSlug).toLowerCase().trim();
  if (ALL_CAT_CONFIGS[key]) return ALL_CAT_CONFIGS[key];

  const nameToMatch = (fallbackName || idOrSlug || "").toLowerCase();
  for (const [k, v] of Object.entries(ALL_CAT_CONFIGS)) {
    if (v.displayName.toLowerCase() === nameToMatch || k === nameToMatch) {
      return v;
    }
  }

  // Keyword matching
  if (nameToMatch.includes("fashion") || nameToMatch.includes("cloth") || nameToMatch.includes("wear")) return ALL_CAT_CONFIGS.fashion;
  if (nameToMatch.includes("mobil") || nameToMatch.includes("phone")) return ALL_CAT_CONFIGS.mobiles;
  if (nameToMatch.includes("electr") || nameToMatch.includes("gadget") || nameToMatch.includes("tv")) return ALL_CAT_CONFIGS.electronics;
  if (nameToMatch.includes("beaut") || nameToMatch.includes("care") || nameToMatch.includes("makeup")) return ALL_CAT_CONFIGS.beauty;
  if (nameToMatch.includes("home") || nameToMatch.includes("kitchen") || nameToMatch.includes("decor")) return ALL_CAT_CONFIGS.home;
  if (nameToMatch.includes("appliance")) return ALL_CAT_CONFIGS.appliances;
  if (nameToMatch.includes("toy") || nameToMatch.includes("kid") || nameToMatch.includes("baby")) return ALL_CAT_CONFIGS.toys;
  if (nameToMatch.includes("food") || nameToMatch.includes("grocer") || nameToMatch.includes("health")) return ALL_CAT_CONFIGS.food;
  if (nameToMatch.includes("auto") || nameToMatch.includes("car")) return ALL_CAT_CONFIGS.auto;
  if (nameToMatch.includes("sport") || nameToMatch.includes("fit")) return ALL_CAT_CONFIGS.sports;
  if (nameToMatch.includes("furnitur")) return ALL_CAT_CONFIGS.furniture;
  if (nameToMatch.includes("book") || nameToMatch.includes("station")) return ALL_CAT_CONFIGS.books;
  if (nameToMatch.includes("wheel") || nameToMatch.includes("bike") || nameToMatch.includes("scoot")) return ALL_CAT_CONFIGS["2wheelers"];

  return ALL_CAT_CONFIGS.fashion;
};

const isProductInCategory = (product, categoryId, categoryName) => {
  if (!product) return false;
  if (product.categoryId && String(product.categoryId) === String(categoryId)) return true;
  if (product.category && typeof product.category === "object") {
    if (String(product.category.id) === String(categoryId)) return true;
    if (categoryName && product.category.name && product.category.name.toLowerCase() === categoryName.toLowerCase()) return true;
  }
  if (typeof product.category === "string" && categoryName) {
    if (product.category.toLowerCase().includes(categoryName.toLowerCase())) return true;
  }
  if (categoryName) {
    const title = (product.title || product.name || "").toLowerCase();
    const desc = (product.description || "").toLowerCase();
    const target = categoryName.toLowerCase();
    if (title.includes(target) || desc.includes(target)) return true;
  }
  return false;
};

const isProductInSubcategory = (product, subcategoryName) => {
  if (!product || !subcategoryName) return true;
  const target = subcategoryName.toLowerCase();
  const title = (product.title || product.name || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const subcat = (product.subCategory || product.subcategory || product.subCategoryName || "").toLowerCase();
  return title.includes(target) || desc.includes(target) || subcat.includes(target);
};

export const CategoryDealsPage = () => {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSub = searchParams.get("sub") || null;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const isNumericId = /^\d+$/.test(categoryId);
      const [catDataRes, prodDataRes, allProdsRes] = await Promise.allSettled([
        isNumericId ? categoryApi.getCategoryById(categoryId) : Promise.resolve(null),
        isNumericId ? productApi.getProducts({ categoryId }) : productApi.getProducts({ search: categoryId }),
        productApi.getProducts(),
      ]);

      const catData = catDataRes.status === "fulfilled" ? catDataRes.value : null;
      let rawProds = prodDataRes.status === "fulfilled" && Array.isArray(prodDataRes.value) ? prodDataRes.value : [];
      const allProds = allProdsRes.status === "fulfilled" && Array.isArray(allProdsRes.value) ? allProdsRes.value : [];

      const cfg = getCatConfig(categoryId, catData?.name);
      const catDisplayName = catData?.name || cfg.displayName;

      // Filter products strictly for THIS category
      let categoryStrictProds = rawProds.filter(p => isProductInCategory(p, categoryId, catDisplayName));
      
      // If direct category had few results, harvest from all products matching this category
      if (categoryStrictProds.length < 3 && allProds.length > 0) {
        const harvested = allProds.filter(p => isProductInCategory(p, categoryId, catDisplayName));
        if (harvested.length > categoryStrictProds.length) {
          categoryStrictProds = harvested;
        }
      }

      setCategory(catData || { id: categoryId, name: catDisplayName });
      setProducts(categoryStrictProds);
    } catch (err) {
      setError(err.message || "Failed to load category deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) loadData();
  }, [categoryId]);

  // Handle Subcategory Click: Toggles subcategory filter
  const handleSubcategorySelect = (subCat) => {
    const subName = subCat.name || subCat;
    if (activeSub && activeSub.toLowerCase() === subName.toLowerCase()) {
      setSearchParams({}); // Clear filter if already selected
    } else {
      setSearchParams({ sub: subName });
    }
  };

  // Filter products by selected subcategory (if activeSub is set)
  const filteredProducts = useMemo(() => {
    if (!activeSub) return products;
    return products.filter(p => isProductInSubcategory(p, activeSub));
  }, [products, activeSub]);

  // Sort filtered products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === "discount-desc") return (Number(b.discountPercentage) || 0) - (Number(a.discountPercentage) || 0);
      if (sortBy === "price-asc") return (Number(a.currentPrice) || 0) - (Number(b.currentPrice) || 0);
      if (sortBy === "price-desc") return (Number(b.currentPrice) || 0) - (Number(a.currentPrice) || 0);
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [filteredProducts, sortBy]);

  const cfg = getCatConfig(categoryId, category?.name);
  const currentCategoryName = category?.name || cfg.displayName;

  return (
    <div className={`mp-page theme-${cfg.theme}`}>
      {/* 1 ── Hero Promotional Banners */}
      <section className="mp-section">
        <BannerCarousel banners={cfg.banners} />
      </section>

      <div className="container">
        {/* 2 ── In-depth Sub-category shortcut tiles (Temporarily Commented Out) */}
        {/*
        {cfg.subcats && cfg.subcats.length > 0 && (
          <section className="mp-section">
            <SubCategoryGrid
              categories={cfg.subcats}
              activeSub={activeSub}
              onSelect={handleSubcategorySelect}
              title={`Shop ${currentCategoryName}`}
              theme="warm"
            />
          </section>
        )}
        */}

        {/* 3 ── Active Subcategory Filter Bar (Temporarily Commented Out) */}
        {/*
        {activeSub && (
          <div className="subcat-active-banner">
            <span className="subcat-active-text">
              Showing deals for <strong>"{activeSub}"</strong> in {currentCategoryName} ({sortedProducts.length} items found)
            </span>
            <button
              type="button"
              className="subcat-clear-btn"
              onClick={() => setSearchParams({})}
              title="Show all category products"
            >
              <X size={14} />
              <span>Clear Filter (Show All {currentCategoryName})</span>
            </button>
          </div>
        )}
        */}

        {/* Error state */}
        {error && <ErrorState title="Error Loading Deals" message={error} onRetry={loadData} />}

        {/* 4 ── Category Product Grid with Sort Bar */}
        <section className="mp-section">
          <div className="deals-header-bar">
            <span className="deals-count">
              Found <strong>{sortedProducts.length}</strong> active deals
              {activeSub && <span> for "<em>{activeSub}</em>"</span>}
            </span>
            <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort deals">
              {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <ProductGrid
            products={sortedProducts}
            loading={loading}
            skeletonCount={8}
            emptyTitle={activeSub ? `No Deals in "${activeSub}" right now` : `No Deals in ${currentCategoryName}`}
            emptyDescription={
              activeSub
                ? `No active offers found for "${activeSub}". Try clearing the filter or checking back soon!`
                : "No active deals found in this category right now. Check back soon!"
            }
            actionLink={activeSub ? undefined : "/deals"}
          />
          {activeSub && sortedProducts.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSearchParams({})}
              >
                View All {currentCategoryName} Deals
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CategoryDealsPage;
