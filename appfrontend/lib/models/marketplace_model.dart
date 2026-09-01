class MarketplaceModel {
  final dynamic id;
  final String name;
  final String? code;
  final String? affiliateTag;
  final String? baseUrl;
  final String? logoUrl;
  final bool? active;

  MarketplaceModel({
    required this.id,
    required this.name,
    this.code,
    this.affiliateTag,
    this.baseUrl,
    this.logoUrl,
    this.active = true,
  });

  factory MarketplaceModel.fromJson(Map<String, dynamic> json) {
    return MarketplaceModel(
      id: json['id'],
      name: json['name']?.toString() ?? 'Marketplace',
      code: json['code']?.toString(),
      affiliateTag: json['affiliateTag']?.toString(),
      baseUrl: json['baseUrl']?.toString(),
      logoUrl: json['logoUrl']?.toString(),
      active: json['active'] != false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'code': code,
      'affiliateTag': affiliateTag,
      'baseUrl': baseUrl,
      'logoUrl': logoUrl,
      'active': active,
    };
  }
}
