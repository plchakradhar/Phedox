import React from "react";
import {
  Sparkles,
  ShoppingBag,
  ShoppingCart,
  Shirt,
  Smartphone,
  Laptop,
  Tablet,
  Home,
  Tv,
  Baby,
  Utensils,
  CookingPot,
  UtensilsCrossed,
  Car,
  Bike,
  Dumbbell,
  Armchair,
  Sofa,
  Bed,
  BedDouble,
  BookOpen,
  BookMarked,
  Footprints,
  Watch,
  Luggage,
  Briefcase,
  Gem,
  Zap,
  Flame,
  Scissors,
  Shield,
  ShieldCheck,
  Camera,
  Gamepad2,
  Gamepad,
  HardDrive,
  Printer,
  Headphones,
  Radio,
  PlugZap,
  BatteryCharging,
  Stethoscope,
  HeartPulse,
  Smile,
  Moon,
  Sun,
  Wind,
  Droplets,
  Droplet,
  Flower2,
  Bath,
  Eye,
  Palette,
  Brush,
  Paintbrush,
  Leaf,
  FlaskConical,
  Package,
  Boxes,
  Tag,
  Award,
  Trophy,
  Gift,
  Coffee,
  CupSoda,
  GlassWater,
  Salad,
  Cookie,
  Apple,
  Wrench,
  Hammer,
  Fuel,
  Gauge,
  Lock,
  Backpack,
  GraduationCap,
  Puzzle,
  ToyBrick,
  Dices,
  Heart,
  Code,
  Compass,
  Library,
  Disc,
  Layers,
  Lightbulb,
  Lamp,
  Pencil,
  PenTool,
  Paperclip,
  RotateCw,
  Fan,
  Microwave,
  Refrigerator,
  Wifi,
  Router,
  Monitor,
  Mouse,
  Keyboard,
  Trees,
  Cloud,
  Waves,
  Rocket,
  Activity,
  Crown,
  Target,
  Tent,
  DoorClosed,
  FolderKanban,
  Archive,
  Clock,
  CircleDot,
  Snowflake,
  Sliders,
  DollarSign,
  BadgePercent,
  Coins,
} from "lucide-react";

/**
 * Direct explicit key-to-icon mapping for high precision matching
 */
const ICON_MAP = {
  // Top level categories
  "for-you": Sparkles,
  "foryou": Sparkles,
  "fashion": Shirt,
  "mobiles": Smartphone,
  "mobile": Smartphone,
  "electronics": Laptop,
  "beauty": Sparkles,
  "home": Home,
  "appliances": Tv,
  "appliance": Tv,
  "toys": Baby,
  "toy": Baby,
  "food": Utensils,
  "auto": Car,
  "sports": Dumbbell,
  "furniture": Armchair,
  "books": BookOpen,
  "book": BookOpen,
  "2wheelers": Bike,
  "twowheelers": Bike,
  "deals": Zap,
  "all": ShoppingBag,

  // Fashion subcategories
  "korean store": Sparkles,
  "shirts": Shirt,
  "shirt": Shirt,
  "jeans": Layers,
  "sneakers": Footprints,
  "watches": Watch,
  "watch": Watch,
  "kids' clothing": Baby,
  "kids clothing": Baby,
  "luggage": Luggage,
  "jackets": Shirt,
  "jacket": Shirt,
  "tshirts": Shirt,
  "tshirt": Shirt,
  "t-shirt": Shirt,
  "athleisure": Activity,
  "rakhi specials": Gift,
  "kurta sets": Sparkles,
  "kurta": Sparkles,
  "dresses": Gem,
  "dress": Gem,
  "casual shoes": Footprints,
  "trolley bag": Luggage,
  "jewellery": Gem,
  "jewelry": Gem,
  "sarees": Sparkles,
  "saree": Sparkles,
  "women's jeans": Layers,
  "kurtis": Sparkles,
  "kurti": Sparkles,
  "women's sandals": Footprints,
  "nightwear": Moon,

  // Mobiles subcategories
  "apple": Apple,
  "samsung": Smartphone,
  "vivo": Smartphone,
  "oppo": Smartphone,
  "redmi": Smartphone,
  "realme": Zap,
  "motorola": Smartphone,
  "nothing": Smartphone,
  "google": Smartphone,
  "oneplus": CircleDot,
  "poco": Flame,
  "iqoo": Rocket,
  "hmd": Smartphone,
  "lava": Flame,
  "infinix": Smartphone,
  "tecno": Radio,
  "5g phones": Wifi,
  "budget phones": BadgePercent,
  "premium phones": Crown,
  "mobile accessories": Headphones,

  // Electronics subcategories
  "get in mins": Zap,
  "laptops": Laptop,
  "laptop": Laptop,
  "tablets": Tablet,
  "tablet": Tablet,
  "grooming": Scissors,
  "mobile covers": Shield,
  "storage": HardDrive,
  "chargers & cables": PlugZap,
  "chargers": PlugZap,
  "cables": PlugZap,
  "power bank": BatteryCharging,
  "health care": Stethoscope,
  "printers": Printer,
  "printer": Printer,
  "new launches": Rocket,
  "headsets": Headphones,
  "headset": Headphones,
  "wearables": Watch,
  "accessories": Mouse,
  "it peripherals": Monitor,
  "camera": Camera,
  "cameras": Camera,
  "gaming": Gamepad2,
  "smart devices": Lightbulb,
  "gaming hub": Gamepad,
  "routers": Router,
  "router": Router,

  // Beauty subcategories
  "skincare": Droplets,
  "skin care": Droplets,
  "hair care": Scissors,
  "makeup": Sparkles,
  "fragrances": Flower2,
  "fragrance": Flower2,
  "bath & spa": Bath,
  "bath": Bath,
  "hygiene": ShieldCheck,
  "oral care": Smile,
  "k-beauty": Sparkles,
  "premium beauty": Crown,
  "derma care": FlaskConical,
  "combos & kits": Gift,
  "exclusive deals": Tag,
  "wellness": Leaf,
  "lipsticks": Sparkles,
  "lipstick": Sparkles,
  "sunscreen": Sun,

  // Home subcategories
  "living room": Sofa,
  "bedroom": Bed,
  "kitchen": CookingPot,
  "home decor": Palette,
  "lighting": Lightbulb,
  "bedding": BedDouble,
  "home improvement": Hammer,
  "bedsheets": Layers,
  "cushions": Armchair,
  "kitchen storage": Package,
  "cookware": CookingPot,
  "wall decor": Paintbrush,
  "rugs": Layers,
  "clocks": Clock,
  "mirrors": Eye,
  "organization": FolderKanban,

  // Appliances subcategories
  "refrigerators": Refrigerator,
  "refrigerator": Refrigerator,
  "washing machines": RotateCw,
  "washing machine": RotateCw,
  "air conditioners": Snowflake,
  "air conditioner": Snowflake,
  "air coolers": Wind,
  "air cooler": Wind,
  "televisions": Tv,
  "television": Tv,
  "microwave ovens": Microwave,
  "microwave": Microwave,
  "water purifiers": Droplet,
  "water purifier": Droplet,
  "vacuum cleaners": Wind,
  "vacuum cleaner": Wind,
  "air purifiers": Leaf,
  "air purifier": Leaf,
  "fans": Fan,
  "fan": Fan,
  "geysers": Flame,
  "geyser": Flame,
  "kitchen appliances": UtensilsCrossed,
  "induction cooktops": Zap,
  "dishwashers": Waves,

  // Toys subcategories
  "shop by age": Baby,
  "toys": ToyBrick,
  "toy": ToyBrick,
  "educational toys": Puzzle,
  "baby essentials": Baby,
  "baby care": Heart,
  "kids' footwear": Footprints,
  "school supplies": Backpack,
  "board games": Dices,
  "outdoor toys": Bike,
  "story books": BookOpen,
  "remote control": Gamepad2,
  "soft toys": Heart,
  "action figures": ShieldCheck,

  // Food & Health subcategories
  "daily essentials": ShoppingCart,
  "snacks & munchies": Cookie,
  "snacks": Cookie,
  "beverages": Coffee,
  "dry fruits & nuts": Apple,
  "dry fruits": Apple,
  "breakfast cereals": Salad,
  "packaged foods": Package,
  "household cleaning": Droplets,
  "personal care": HeartPulse,
  "wellness & supplements": Leaf,
  "supplements": Leaf,
  "organic foods": Salad,
  "organic": Salad,
  "spices & oils": Droplet,
  "protein & nutrition": Dumbbell,
  "protein": Dumbbell,
  "health drinks": CupSoda,

  // Auto accessories subcategories
  "car accessories": Car,
  "bike accessories": Bike,
  "car care": Sparkles,
  "bike care": Wrench,
  "helmets": ShieldCheck,
  "helmet": ShieldCheck,
  "seat covers": Armchair,
  "floor mats": Layers,
  "phone holders": Smartphone,
  "chargers & inverters": PlugZap,
  "cleaning products": Droplets,
  "car lighting": Lightbulb,
  "tool kits": Wrench,
  "safety gear": ShieldCheck,
  "riding jackets": Shield,
  "tire inflators": Gauge,

  // Sports & Fitness subcategories
  "cricket gear": Trophy,
  "cricket": Trophy,
  "football": Target,
  "badminton": Activity,
  "basketball": Target,
  "running shoes": Footprints,
  "gym equipment": Dumbbell,
  "gym": Dumbbell,
  "yoga mats": Flower2,
  "yoga": Flower2,
  "cycling": Bike,
  "sports shoes": Footprints,
  "active sportswear": Shirt,
  "fitness accessories": Watch,
  "outdoor camping": Tent,
  "camping": Tent,
  "swimming gear": Waves,
  "whey protein": Flame,
  "smart trackers": Watch,

  // Furniture subcategories
  "dining sets": UtensilsCrossed,
  "office chairs": Armchair,
  "sofas & sectionals": Sofa,
  "sofa": Sofa,
  "solid wood beds": BedDouble,
  "coffee tables": Coffee,
  "accent chairs": Armchair,
  "wardrobes": DoorClosed,
  "wardrobe": DoorClosed,
  "cabinets": Archive,
  "bookshelves": Library,
  "tv units": Monitor,
  "mattresses": Bed,
  "recliners": Armchair,
  "shoe racks": Footprints,

  // Books & Stationery subcategories
  "fiction": BookOpen,
  "non-fiction": BookMarked,
  "academic books": GraduationCap,
  "competitive exams": Award,
  "engineering": Wrench,
  "programming & tech": Code,
  "children's books": BookOpen,
  "manga & comics": Paintbrush,
  "notebooks": BookMarked,
  "luxury pens": PenTool,
  "art supplies": Palette,
  "office supplies": Paperclip,
  "self-help": Lightbulb,
  "novels": Library,

  // Two Wheelers subcategories
  "popular motorcycles": Bike,
  "motorcycles": Bike,
  "popular scooters": Bike,
  "scooters": Bike,
  "electric vehicles": Zap,
  "riding gloves": Shield,
  "bike covers": Shield,
  "bike care & wash": Droplets,
  "spare parts": Wrench,
  "performance tyres": Disc,
  "engine oils": Fuel,
  "led fog lights": Sun,
  "security locks": Lock,
};

/**
 * Intelligent semantic resolver that matches any category, subcategory name or keyword
 * to the most appropriate Lucide line-stroke icon component.
 */
export const resolveCategoryIcon = (nameOrId) => {
  if (!nameOrId) return Layers;
  
  const raw = String(nameOrId).trim().toLowerCase();
  
  // 1. Direct exact map lookup
  if (ICON_MAP[raw]) return ICON_MAP[raw];

  // 2. Normalized sanitized match
  const clean = raw.replace(/[^a-z0-9\s-]/g, "").trim();
  if (ICON_MAP[clean]) return ICON_MAP[clean];

  // 3. Keyword / semantic substring heuristics
  if (clean.includes("fashion") || clean.includes("cloth") || clean.includes("shirt") || clean.includes("wear") || clean.includes("apparel") || clean.includes("dress") || clean.includes("kurti") || clean.includes("saree") || clean.includes("jacket")) return Shirt;
  if (clean.includes("mobile") || clean.includes("phone") || clean.includes("smartphone") || clean.includes("android") || clean.includes("iphone") || clean.includes("5g")) return Smartphone;
  if (clean.includes("laptop") || clean.includes("computer") || clean.includes("pc") || clean.includes("macbook")) return Laptop;
  if (clean.includes("tablet") || clean.includes("ipad")) return Tablet;
  if (clean.includes("electron") || clean.includes("gadget") || clean.includes("tech")) return Laptop;
  if (clean.includes("beauty") || clean.includes("cosmetic") || clean.includes("skin") || clean.includes("makeup") || clean.includes("glow")) return Sparkles;
  if (clean.includes("home") || clean.includes("living") || clean.includes("room") || clean.includes("house") || clean.includes("kitchen")) return Home;
  if (clean.includes("appliance") || clean.includes("tv") || clean.includes("fridge") || clean.includes("refrigerator") || clean.includes("cooler") || clean.includes("ac")) return Tv;
  if (clean.includes("toy") || clean.includes("baby") || clean.includes("kid") || clean.includes("infant") || clean.includes("child")) return Baby;
  if (clean.includes("food") || clean.includes("grocery") || clean.includes("snack") || clean.includes("eat") || clean.includes("meal") || clean.includes("health")) return Utensils;
  if (clean.includes("car") || clean.includes("auto") || clean.includes("vehicle") || clean.includes("motor")) return Car;
  if (clean.includes("sport") || clean.includes("fitness") || clean.includes("gym") || clean.includes("workout") || clean.includes("train")) return Dumbbell;
  if (clean.includes("furniture") || clean.includes("sofa") || clean.includes("chair") || clean.includes("table") || clean.includes("bed") || clean.includes("wardrobe")) return Armchair;
  if (clean.includes("book") || clean.includes("stationery") || clean.includes("study") || clean.includes("exam") || clean.includes("read")) return BookOpen;
  if (clean.includes("wheeler") || clean.includes("bike") || clean.includes("cycle") || clean.includes("scooter") || clean.includes("ride")) return Bike;
  if (clean.includes("deal") || clean.includes("offer") || clean.includes("flash") || clean.includes("sale")) return Zap;
  if (clean.includes("shoe") || clean.includes("sneaker") || clean.includes("sandal") || clean.includes("footwear") || clean.includes("heel")) return Footprints;
  if (clean.includes("watch") || clean.includes("clock") || clean.includes("time")) return Watch;
  if (clean.includes("bag") || clean.includes("luggage") || clean.includes("travel") || clean.includes("trolley")) return Luggage;
  if (clean.includes("jewel") || clean.includes("gem") || clean.includes("ring") || clean.includes("gold") || clean.includes("silver")) return Gem;
  if (clean.includes("game") || clean.includes("gaming") || clean.includes("play")) return Gamepad2;
  if (clean.includes("camera") || clean.includes("photo") || clean.includes("lens")) return Camera;
  if (clean.includes("audio") || clean.includes("sound") || clean.includes("headphone") || clean.includes("earbud") || clean.includes("speaker")) return Headphones;
  if (clean.includes("fragrance") || clean.includes("perfume") || clean.includes("scent") || clean.includes("flower")) return Flower2;
  if (clean.includes("light") || clean.includes("lamp") || clean.includes("bulb")) return Lightbulb;
  if (clean.includes("clean") || clean.includes("wash") || clean.includes("water") || clean.includes("soap") || clean.includes("drop")) return Droplets;

  return Layers;
};

/**
 * Modern Line-Stroke Category & Subcategory Icon Component
 */
export const CategoryStrokeIcon = ({
  name,
  size = 20,
  strokeWidth = 1.8,
  color,
  className = "",
  style = {},
  ariaHidden = true,
}) => {
  const IconComponent = resolveCategoryIcon(name);

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      color={color}
      className={`category-stroke-icon ${className}`}
      style={{
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        ...style,
      }}
      aria-hidden={ariaHidden}
    />
  );
};

export default CategoryStrokeIcon;
