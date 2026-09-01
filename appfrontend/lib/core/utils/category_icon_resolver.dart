import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class CategoryIconResolver {
  static IconData resolve(String? nameOrId) {
    if (nameOrId == null || nameOrId.trim().isEmpty) {
      return CupertinoIcons.square_grid_2x2;
    }

    final raw = nameOrId.toLowerCase().trim();
    final clean = raw.replaceAll(RegExp(r'[^a-z0-9\s-]'), '').trim();

    // 1. Direct and Substring Heuristics
    if (clean == 'for-you' || clean == 'foryou' || clean.contains('sparkle')) {
      return CupertinoIcons.sparkles;
    }
    if (clean == 'all-deals' || clean.contains('deal') || clean.contains('offer') || clean.contains('flash') || clean.contains('sale')) {
      return CupertinoIcons.bolt_fill;
    }
    if (clean.contains('fashion') || clean.contains('cloth') || clean.contains('shirt') || clean.contains('tshirt') || clean.contains('jacket') || clean.contains('apparel') || clean.contains('dress') || clean.contains('kurti') || clean.contains('saree')) {
      return CupertinoIcons.tag;
    }
    if (clean.contains('mobile') || clean.contains('phone') || clean.contains('smartphone') || clean.contains('apple') || clean.contains('samsung') || clean.contains('vivo') || clean.contains('oppo') || clean.contains('redmi') || clean.contains('oneplus') || clean.contains('5g')) {
      return CupertinoIcons.device_phone_portrait;
    }
    if (clean.contains('laptop') || clean.contains('computer') || clean.contains('pc') || clean.contains('macbook')) {
      return CupertinoIcons.device_laptop;
    }
    if (clean.contains('tablet') || clean.contains('ipad')) {
      return Icons.tablet_mac;
    }
    if (clean.contains('electron') || clean.contains('gadget') || clean.contains('tech') || clean.contains('storage') || clean.contains('cable') || clean.contains('charger') || clean.contains('router')) {
      return CupertinoIcons.desktopcomputer;
    }
    if (clean.contains('beauty') || clean.contains('cosmetic') || clean.contains('skincare') || clean.contains('makeup') || clean.contains('lipstick') || clean.contains('fragrance') || clean.contains('perfume')) {
      return CupertinoIcons.sparkles;
    }
    if (clean.contains('home') || clean.contains('living') || clean.contains('decor') || clean.contains('bedroom') || clean.contains('curtain') || clean.contains('bedsheet')) {
      return CupertinoIcons.home;
    }
    if (clean.contains('appliance') || clean.contains('tv') || clean.contains('television') || clean.contains('refrigerator') || clean.contains('fridge') || clean.contains('washing') || clean.contains('cooler') || clean.contains('ac')) {
      return CupertinoIcons.tv;
    }
    if (clean.contains('toy') || clean.contains('baby') || clean.contains('kid') || clean.contains('infant') || clean.contains('game') || clean.contains('puzzle')) {
      return CupertinoIcons.gift;
    }
    if (clean.contains('food') || clean.contains('grocery') || clean.contains('snack') || clean.contains('beverage') || clean.contains('health') || clean.contains('drink')) {
      return CupertinoIcons.cart;
    }
    if (clean.contains('car') || clean.contains('auto') || clean.contains('vehicle') || clean.contains('helmet') || clean.contains('motor')) {
      return CupertinoIcons.car;
    }
    if (clean.contains('sport') || clean.contains('fitness') || clean.contains('gym') || clean.contains('workout') || clean.contains('cricket') || clean.contains('football')) {
      return Icons.fitness_center;
    }
    if (clean.contains('furniture') || clean.contains('sofa') || clean.contains('chair') || clean.contains('table') || clean.contains('bed') || clean.contains('wardrobe')) {
      return Icons.chair_outlined;
    }
    if (clean.contains('book') || clean.contains('stationery') || clean.contains('novel') || clean.contains('pen') || clean.contains('art')) {
      return CupertinoIcons.book;
    }
    if (clean.contains('shoe') || clean.contains('sneaker') || clean.contains('sandal') || clean.contains('footwear')) {
      return Icons.snowshoeing;
    }
    if (clean.contains('watch') || clean.contains('wearable') || clean.contains('clock')) {
      return CupertinoIcons.time;
    }
    if (clean.contains('luggage') || clean.contains('bag') || clean.contains('trolley')) {
      return Icons.luggage_outlined;
    }
    if (clean.contains('jewel') || clean.contains('gem') || clean.contains('ring')) {
      return CupertinoIcons.circle_grid_hex;
    }
    if (clean.contains('camera') || clean.contains('photo') || clean.contains('lens')) {
      return CupertinoIcons.camera;
    }
    if (clean.contains('audio') || clean.contains('headphone') || clean.contains('headset') || clean.contains('earbud') || clean.contains('speaker')) {
      return CupertinoIcons.headphones;
    }
    if (clean.contains('gaming') || clean.contains('console')) {
      return CupertinoIcons.game_controller;
    }

    return CupertinoIcons.square_grid_2x2;
  }
}
