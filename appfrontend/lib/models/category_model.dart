class CategoryModel {
  final dynamic id;
  final String name;
  final String? description;
  final String? imageUrl;
  final bool? active;

  CategoryModel({
    required this.id,
    required this.name,
    this.description,
    this.imageUrl,
    this.active = true,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'],
      name: json['name']?.toString() ?? 'Category',
      description: json['description']?.toString(),
      imageUrl: json['imageUrl']?.toString(),
      active: json['active'] != false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'imageUrl': imageUrl,
      'active': active,
    };
  }
}
