class TelegramPostModel {
  final dynamic id;
  final String? messageId;
  final String? channelName;
  final String? messageText;
  final String? extractedUrl;
  final String? resolvedUrl;
  final String? marketplace;
  final String? status;
  final String? errorMessage;
  final dynamic productId;
  final String? receivedAt;
  final String? processedAt;

  TelegramPostModel({
    required this.id,
    this.messageId,
    this.channelName,
    this.messageText,
    this.extractedUrl,
    this.resolvedUrl,
    this.marketplace,
    this.status,
    this.errorMessage,
    this.productId,
    this.receivedAt,
    this.processedAt,
  });

  factory TelegramPostModel.fromJson(Map<String, dynamic> json) {
    return TelegramPostModel(
      id: json['id'],
      messageId: json['messageId']?.toString(),
      channelName: json['channelName']?.toString(),
      messageText: json['messageText']?.toString(),
      extractedUrl: json['extractedUrl']?.toString(),
      resolvedUrl: json['resolvedUrl']?.toString(),
      marketplace: json['marketplace']?.toString(),
      status: json['status']?.toString(),
      errorMessage: json['errorMessage']?.toString(),
      productId: json['productId'],
      receivedAt: json['receivedAt']?.toString(),
      processedAt: json['processedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'messageId': messageId,
      'channelName': channelName,
      'messageText': messageText,
      'extractedUrl': extractedUrl,
      'resolvedUrl': resolvedUrl,
      'marketplace': marketplace,
      'status': status,
      'errorMessage': errorMessage,
      'productId': productId,
      'receivedAt': receivedAt,
      'processedAt': processedAt,
    };
  }
}
