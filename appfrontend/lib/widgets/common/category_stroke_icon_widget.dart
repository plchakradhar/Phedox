import 'package:flutter/material.dart';
import '../../core/utils/category_icon_resolver.dart';

class CategoryStrokeIconWidget extends StatelessWidget {
  final String? name;
  final double size;
  final Color? color;

  const CategoryStrokeIconWidget({
    super.key,
    required this.name,
    this.size = 20,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final iconData = CategoryIconResolver.resolve(name);
    return Icon(
      iconData,
      size: size,
      color: color ?? Theme.of(context).iconTheme.color,
    );
  }
}
