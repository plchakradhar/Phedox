class CategoryBannerItem {
  final String title;
  final String subtitle;
  final String tag;
  final String cta;
  final String ctaLink;
  final List<int> gradientColors; // 0xFF...
  final String image;

  const CategoryBannerItem({
    required this.title,
    required this.subtitle,
    required this.tag,
    required this.cta,
    required this.ctaLink,
    required this.gradientColors,
    required this.image,
  });
}

class SubCategoryItem {
  final String id;
  final String name;
  final String icon;
  final String imageUrl;

  const SubCategoryItem({
    required this.id,
    required this.name,
    required this.icon,
    required this.imageUrl,
  });
}

class CategoryPromoItem {
  final String title;
  final String subtitle;
  final String tag;
  final int bgColor;
  final String cta;
  final String link;

  const CategoryPromoItem({
    required this.title,
    required this.subtitle,
    required this.tag,
    required this.bgColor,
    required this.cta,
    required this.link,
  });
}

class CategoryConfig {
  final String id;
  final String displayName;
  final String theme;
  final List<CategoryBannerItem> banners;
  final List<SubCategoryItem> subcats;
  final List<CategoryPromoItem> promos;

  const CategoryConfig({
    required this.id,
    required this.displayName,
    required this.theme,
    required this.banners,
    required this.subcats,
    required this.promos,
  });
}

class CategoryConfigs {
  static const List<Map<String, String>> fixedCategories = [
    {"id": "for-you", "label": "For You", "iconKey": "for-you"},
    {"id": "all-deals", "label": "All Deals", "iconKey": "deals"},
    {"id": "electronics", "label": "Electronics", "iconKey": "electronics"},
    {"id": "fashion", "label": "Fashion", "iconKey": "fashion"},
    {"id": "mobiles", "label": "Mobiles", "iconKey": "mobiles"},
    {"id": "home", "label": "Home", "iconKey": "home"},
    {"id": "beauty", "label": "Beauty", "iconKey": "beauty"},
    {"id": "appliances", "label": "Appliances", "iconKey": "appliances"},
    {"id": "toys", "label": "Toys, Baby & Kids", "iconKey": "toys"},
    {"id": "food", "label": "Food & Health", "iconKey": "food"},
    {"id": "auto", "label": "Auto Acc.", "iconKey": "auto"},
    {"id": "sports", "label": "Sports & Fitness", "iconKey": "sports"},
    {"id": "furniture", "label": "Furniture", "iconKey": "furniture"},
    {"id": "books", "label": "Books & Stationery", "iconKey": "books"},
  ];

  static const List<CategoryBannerItem> homeBanners = [
    CategoryBannerItem(
      title: "Mega Fashion Deals",
      subtitle: "Up to 80% off on top brands — verified & live",
      tag: "Limited Time",
      cta: "Shop Fashion",
      ctaLink: "/deals",
      gradientColors: [0xFF1E40AF, 0xFF3B82F6, 0xFF06B6D4],
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
    ),
    CategoryBannerItem(
      title: "Smartphone Festival",
      subtitle: "Latest 5G phones — verified 50%+ off",
      tag: "Flash Sale",
      cta: "Explore Mobiles",
      ctaLink: "/deals",
      gradientColors: [0xFF0F172A, 0xFF1E293B, 0xFF334155],
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    ),
    CategoryBannerItem(
      title: "Electronics Savings",
      subtitle: "Laptops, TVs, Audio — Guaranteed 50% OFF",
      tag: "Best Deals",
      cta: "View Electronics",
      ctaLink: "/deals",
      gradientColors: [0xFFEA580C, 0xFFF97316, 0xFFFBBF24],
      image: "https://images.unsplash.com/photo-1593640408182-31c228e05dc8?w=600&auto=format&fit=crop&q=80",
    ),
    CategoryBannerItem(
      title: "Beauty & Skincare Offers",
      subtitle: "Premium brands at prices you will love",
      tag: "New Arrivals",
      cta: "Shop Beauty",
      ctaLink: "/deals",
      gradientColors: [0xFF9D174D, 0xFFEC4899, 0xFFF9A8D4],
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80",
    ),
    CategoryBannerItem(
      title: "Home Makeover Sale",
      subtitle: "Furniture, decor & more — starting at 50% off",
      tag: "Trending Now",
      cta: "Explore Home",
      ctaLink: "/deals",
      gradientColors: [0xFF064E3B, 0xFF047857, 0xFF34D399],
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
    ),
  ];

  static CategoryConfig? getConfig(String? categoryIdOrName) {
    if (categoryIdOrName == null) return null;
    final key = categoryIdOrName.toLowerCase().trim();

    if (key.contains('fashion') || key.contains('cloth') || key.contains('apparel')) {
      return _fashionConfig;
    }
    if (key.contains('mobile') || key.contains('phone')) {
      return _mobilesConfig;
    }
    if (key.contains('electron') || key.contains('gadget') || key.contains('tech')) {
      return _electronicsConfig;
    }
    if (key.contains('beauty') || key.contains('cosmetic') || key.contains('skin')) {
      return _beautyConfig;
    }
    if (key.contains('home') || key.contains('decor') || key.contains('living')) {
      return _homeConfig;
    }
    if (key.contains('appliance') || key.contains('tv')) {
      return _appliancesConfig;
    }
    if (key.contains('toy') || key.contains('baby') || key.contains('kid')) {
      return _toysConfig;
    }
    if (key.contains('food') || key.contains('grocery') || key.contains('health')) {
      return _foodConfig;
    }
    if (key.contains('auto') || key.contains('car') || key.contains('motor')) {
      return _autoConfig;
    }
    if (key.contains('sport') || key.contains('fitness') || key.contains('gym')) {
      return _sportsConfig;
    }
    if (key.contains('furniture') || key.contains('sofa') || key.contains('bed')) {
      return _furnitureConfig;
    }
    if (key.contains('book') || key.contains('stationery')) {
      return _booksConfig;
    }

    return null;
  }

  static const _fashionConfig = CategoryConfig(
    id: "fashion",
    displayName: "Fashion",
    theme: "fashion",
    banners: [
      CategoryBannerItem(
        title: "Autumn Winter Collection",
        subtitle: "Trending styles up to 80% off — verified & live",
        tag: "Season Sale",
        cta: "Shop Fashion",
        ctaLink: "/deals",
        gradientColors: [0xFF7C3AED, 0xFFEC4899],
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80",
      ),
      CategoryBannerItem(
        title: "Ethnic Wear & Festive Specials",
        subtitle: "Kurtis, Sarees, Lehengas — min 50% off",
        tag: "Festive Sale",
        cta: "Explore Festive",
        ctaLink: "/deals",
        gradientColors: [0xFF92400E, 0xFFD97706],
        image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
      ),
    ],
    subcats: [
      SubCategoryItem(id: "f1", name: "Korean Store", icon: "korean store", imageUrl: "https://cdn.dummyjson.com/product-images/tops/blue-frock/thumbnail.webp"),
      SubCategoryItem(id: "f2", name: "Shirts", icon: "shirts", imageUrl: "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp"),
      SubCategoryItem(id: "f3", name: "Jeans", icon: "jeans", imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "f4", name: "Sneakers", icon: "sneakers", imageUrl: "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp"),
      SubCategoryItem(id: "f5", name: "Watches", icon: "watches", imageUrl: "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp"),
      SubCategoryItem(id: "f6", name: "Kids' Clothing", icon: "kids' clothing", imageUrl: "https://cdn.dummyjson.com/product-images/tops/girl-summer-dress/thumbnail.webp"),
      SubCategoryItem(id: "f7", name: "Luggage", icon: "luggage", imageUrl: "https://cdn.dummyjson.com/product-images/womens-bags/blue-women's-handbag/thumbnail.webp"),
      SubCategoryItem(id: "f8", name: "Jackets", icon: "jackets", imageUrl: "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp"),
      SubCategoryItem(id: "f9", name: "T-Shirts", icon: "tshirts", imageUrl: "https://cdn.dummyjson.com/product-images/tops/gray-dress/thumbnail.webp"),
      SubCategoryItem(id: "f10", name: "Athleisure", icon: "athleisure", imageUrl: "https://cdn.dummyjson.com/product-images/mens-shoes/nike-baseball-cleats/thumbnail.webp"),
      SubCategoryItem(id: "f11", name: "Dresses", icon: "dresses", imageUrl: "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/thumbnail.webp"),
      SubCategoryItem(id: "f12", name: "Jewellery", icon: "jewellery", imageUrl: "https://cdn.dummyjson.com/product-images/womens-jewellery/green-oval-earring/thumbnail.webp"),
      SubCategoryItem(id: "f13", name: "Sarees", icon: "sarees", imageUrl: "https://cdn.dummyjson.com/product-images/womens-dresses/black-women's-gown/thumbnail.webp"),
      SubCategoryItem(id: "f14", name: "Kurtis", icon: "kurtis", imageUrl: "https://cdn.dummyjson.com/product-images/womens-dresses/corset-leather-with-skirt/thumbnail.webp"),
    ],
    promos: [
      CategoryPromoItem(title: "The Sneaker Project", subtitle: "Top sneaker brands 50%+ off", tag: "Footwear", bgColor: 0xFFFFF1F2, cta: "Shop", link: "/deals"),
      CategoryPromoItem(title: "Festive Specials", subtitle: "Gift the best, save the most", tag: "Festive", bgColor: 0xFFFDF4FF, cta: "Explore", link: "/deals"),
      CategoryPromoItem(title: "New Launches", subtitle: "Fresh apparel drops every day", tag: "New In", bgColor: 0xFFEFF6FF, cta: "View", link: "/deals"),
    ],
  );

  static const _mobilesConfig = CategoryConfig(
    id: "mobiles",
    displayName: "Mobiles",
    theme: "mobiles",
    banners: [
      CategoryBannerItem(
        title: "Smartphone Festival",
        subtitle: "5G phones from ₹6,999 — 50%+ off guaranteed",
        tag: "Mega Sale",
        cta: "Shop Mobiles",
        ctaLink: "/deals",
        gradientColors: [0xFF0F172A, 0xFF1E3A5F, 0xFF2563EB],
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
      ),
    ],
    subcats: [
      SubCategoryItem(id: "m1", name: "Apple", icon: "apple", imageUrl: "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"),
      SubCategoryItem(id: "m2", name: "Samsung", icon: "samsung", imageUrl: "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp"),
      SubCategoryItem(id: "m3", name: "vivo", icon: "vivo", imageUrl: "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp"),
      SubCategoryItem(id: "m4", name: "OPPO", icon: "oppo", imageUrl: "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"),
      SubCategoryItem(id: "m5", name: "Redmi", icon: "redmi", imageUrl: "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp"),
      SubCategoryItem(id: "m6", name: "realme", icon: "realme", imageUrl: "https://cdn.dummyjson.com/product-images/smartphones/iphone-13-pro/thumbnail.webp"),
      SubCategoryItem(id: "m7", name: "Motorola", icon: "motorola", imageUrl: "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"),
      SubCategoryItem(id: "m8", name: "OnePlus", icon: "oneplus", imageUrl: "https://cdn.dummyjson.com/product-images/smartphones/iphone-5s/thumbnail.webp"),
      SubCategoryItem(id: "m9", name: "5G Phones", icon: "5g phones", imageUrl: "https://cdn.dummyjson.com/product-images/smartphones/iphone-6/thumbnail.webp"),
      SubCategoryItem(id: "m10", name: "Accessories", icon: "mobile accessories", imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp"),
    ],
    promos: [
      CategoryPromoItem(title: "Budget 5G Mobiles", subtitle: "Under ₹10,000", tag: "Budget", bgColor: 0xFFF0F9FF, cta: "Shop", link: "/deals"),
      CategoryPromoItem(title: "Flagship Deals", subtitle: "iPhone, Galaxy S & more", tag: "Premium", bgColor: 0xFFF8FAFC, cta: "Explore", link: "/deals"),
    ],
  );

  static const _electronicsConfig = CategoryConfig(
    id: "electronics",
    displayName: "Electronics",
    theme: "electronics",
    banners: [
      CategoryBannerItem(
        title: "Lowest Prices of the Week",
        subtitle: "Laptops, TVs & Audio — Unbeatable Discounts",
        tag: "Mega Sale",
        cta: "Shop Electronics",
        ctaLink: "/deals",
        gradientColors: [0xFFEA580C, 0xFFF97316, 0xFFFBBF24],
        image: "https://images.unsplash.com/photo-1593640408182-31c228e05dc8?w=600&auto=format&fit=crop&q=80",
      ),
    ],
    subcats: [
      SubCategoryItem(id: "e1", name: "Laptops", icon: "laptops", imageUrl: "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp"),
      SubCategoryItem(id: "e2", name: "Tablets", icon: "tablets", imageUrl: "https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/thumbnail.webp"),
      SubCategoryItem(id: "e3", name: "Headsets", icon: "headsets", imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp"),
      SubCategoryItem(id: "e4", name: "Wearables", icon: "wearables", imageUrl: "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/thumbnail.webp"),
      SubCategoryItem(id: "e5", name: "Printers", icon: "printers", imageUrl: "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/thumbnail.webp"),
      SubCategoryItem(id: "e6", name: "Gaming", icon: "gaming", imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp"),
      SubCategoryItem(id: "e7", name: "Camera", icon: "camera", imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop&q=80"),
    ],
    promos: [
      CategoryPromoItem(title: "Gaming Peripherals", subtitle: "Keyboards, Mice & Headsets 60% off", tag: "Gaming", bgColor: 0xFFFDF4FF, cta: "Shop", link: "/deals"),
    ],
  );

  static const _beautyConfig = CategoryConfig(
    id: "beauty",
    displayName: "Beauty",
    theme: "beauty",
    banners: [
      CategoryBannerItem(
        title: "Beauty & Glamour Sale",
        subtitle: "Premium brands at 70% off — verified live",
        tag: "Mega Offer",
        cta: "Shop Beauty",
        ctaLink: "/deals",
        gradientColors: [0xFF9D174D, 0xFFEC4899, 0xFFF9A8D4],
        image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80",
      ),
    ],
    subcats: [
      SubCategoryItem(id: "b1", name: "Skincare", icon: "skincare", imageUrl: "https://cdn.dummyjson.com/product-images/skin-care/attitude-super-leaves-hand-soap/thumbnail.webp"),
      SubCategoryItem(id: "b2", name: "Hair Care", icon: "hair care", imageUrl: "https://cdn.dummyjson.com/product-images/beauty/powder-canister/thumbnail.webp"),
      SubCategoryItem(id: "b3", name: "Makeup", icon: "makeup", imageUrl: "https://cdn.dummyjson.com/product-images/beauty/eyeshadow-palette-with-mirror/thumbnail.webp"),
      SubCategoryItem(id: "b4", name: "Fragrances", icon: "fragrances", imageUrl: "https://cdn.dummyjson.com/product-images/fragrances/calvin-klein-ck-one/thumbnail.webp"),
      SubCategoryItem(id: "b5", name: "Lipsticks", icon: "lipsticks", imageUrl: "https://cdn.dummyjson.com/product-images/beauty/red-lipstick/thumbnail.webp"),
    ],
    promos: [
      CategoryPromoItem(title: "Luxury Fragrances", subtitle: "Top perfumes min 50% off", tag: "Perfume", bgColor: 0xFFFDF4FF, cta: "View", link: "/deals"),
    ],
  );

  static const _homeConfig = CategoryConfig(
    id: "home",
    displayName: "Home",
    theme: "home",
    banners: [
      CategoryBannerItem(
        title: "Home Makeover Festival",
        subtitle: "Furniture, decor & kitchen up to 75% off",
        tag: "Home Sale",
        cta: "Explore Home",
        ctaLink: "/deals",
        gradientColors: [0xFF064E3B, 0xFF047857, 0xFF34D399],
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
      ),
    ],
    subcats: [
      SubCategoryItem(id: "h1", name: "Living Room", icon: "living room", imageUrl: "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp"),
      SubCategoryItem(id: "h2", name: "Bedroom", icon: "bedroom", imageUrl: "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp"),
      SubCategoryItem(id: "h3", name: "Kitchen", icon: "kitchen", imageUrl: "https://cdn.dummyjson.com/product-images/kitchen-accessories/bamboo-spatula/thumbnail.webp"),
      SubCategoryItem(id: "h4", name: "Home Decor", icon: "home decor", imageUrl: "https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/thumbnail.webp"),
      SubCategoryItem(id: "h5", name: "Lighting", icon: "lighting", imageUrl: "https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/thumbnail.webp"),
    ],
    promos: [],
  );

  static const _appliancesConfig = CategoryConfig(
    id: "appliances",
    displayName: "Appliances",
    theme: "appliances",
    banners: [],
    subcats: [
      SubCategoryItem(id: "a1", name: "Refrigerators", icon: "refrigerators", imageUrl: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "a2", name: "Washing Machines", icon: "washing machines", imageUrl: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "a3", name: "Televisions", icon: "televisions", imageUrl: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "a4", name: "Air Conditioners", icon: "air conditioners", imageUrl: "https://images.unsplash.com/photo-1614633833026-06201389811f?w=200&auto=format&fit=crop&q=80"),
    ],
    promos: [],
  );

  static const _toysConfig = CategoryConfig(
    id: "toys",
    displayName: "Toys, Baby & Kids",
    theme: "toys",
    banners: [],
    subcats: [
      SubCategoryItem(id: "t1", name: "Toys", icon: "toys", imageUrl: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "t2", name: "Educational Toys", icon: "educational toys", imageUrl: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "t3", name: "Baby Essentials", icon: "baby essentials", imageUrl: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=200&auto=format&fit=crop&q=80"),
    ],
    promos: [],
  );

  static const _foodConfig = CategoryConfig(
    id: "food",
    displayName: "Food & Health",
    theme: "food",
    banners: [],
    subcats: [
      SubCategoryItem(id: "fo1", name: "Daily Essentials", icon: "daily essentials", imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "fo2", name: "Snacks & Munchies", icon: "snacks & munchies", imageUrl: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "fo3", name: "Beverages", icon: "beverages", imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=200&auto=format&fit=crop&q=80"),
    ],
    promos: [],
  );

  static const _autoConfig = CategoryConfig(
    id: "auto",
    displayName: "Auto Accessories",
    theme: "auto",
    banners: [],
    subcats: [
      SubCategoryItem(id: "au1", name: "Car Accessories", icon: "car accessories", imageUrl: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "au2", name: "Bike Accessories", icon: "bike accessories", imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "au3", name: "Helmets", icon: "helmets", imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200&auto=format&fit=crop&q=80"),
    ],
    promos: [],
  );

  static const _sportsConfig = CategoryConfig(
    id: "sports",
    displayName: "Sports & Fitness",
    theme: "sports",
    banners: [],
    subcats: [
      SubCategoryItem(id: "sp1", name: "Cricket Gear", icon: "cricket gear", imageUrl: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "sp2", name: "Gym Equipment", icon: "gym equipment", imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "sp3", name: "Running Shoes", icon: "running shoes", imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80"),
    ],
    promos: [],
  );

  static const _furnitureConfig = CategoryConfig(
    id: "furniture",
    displayName: "Furniture",
    theme: "furniture",
    banners: [],
    subcats: [
      SubCategoryItem(id: "fu1", name: "Sofas", icon: "sofa", imageUrl: "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp"),
      SubCategoryItem(id: "fu2", name: "Beds", icon: "bed", imageUrl: "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp"),
      SubCategoryItem(id: "fu3", name: "Office Chairs", icon: "office chairs", imageUrl: "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/thumbnail.webp"),
    ],
    promos: [],
  );

  static const _booksConfig = CategoryConfig(
    id: "books",
    displayName: "Books & Stationery",
    theme: "books",
    banners: [],
    subcats: [
      SubCategoryItem(id: "bk1", name: "Fiction", icon: "fiction", imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "bk2", name: "Non-Fiction", icon: "non-fiction", imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&auto=format&fit=crop&q=80"),
      SubCategoryItem(id: "bk3", name: "Art Supplies", icon: "art supplies", imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&auto=format&fit=crop&q=80"),
    ],
    promos: [],
  );
}
