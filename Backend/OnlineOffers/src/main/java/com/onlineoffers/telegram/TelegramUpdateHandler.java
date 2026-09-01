package com.onlineoffers.telegram;

import com.onlineoffers.dto.TelegramMessageRequest;
import com.onlineoffers.entity.TelegramPost;
import com.onlineoffers.service.ProductProcessingService;
import com.onlineoffers.service.TelegramService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.meta.api.objects.Message;
import org.telegram.telegrambots.meta.api.objects.MessageEntity;
import org.telegram.telegrambots.meta.api.objects.Update;

import java.util.List;

@Component
public class TelegramUpdateHandler {

    private static final Logger log = LoggerFactory.getLogger(TelegramUpdateHandler.class);

    private final TelegramService telegramService;
    private final ProductProcessingService productProcessingService;

    public TelegramUpdateHandler(TelegramService telegramService, ProductProcessingService productProcessingService) {
        this.telegramService = telegramService;
        this.productProcessingService = productProcessingService;
    }

    public void handleUpdate(Update update) {
        if (update == null) {
            return;
        }

        Message message = null;
        if (update.hasChannelPost()) {
            message = update.getChannelPost();
            log.info("Received channel post (ID: {}) from chat: {}", message.getMessageId(), message.getChatId());
        } else if (update.hasMessage()) {
            message = update.getMessage();
            log.info("Received message (ID: {}) from chat: {}", message.getMessageId(), message.getChatId());
        } else if (update.hasEditedChannelPost()) {
            message = update.getEditedChannelPost();
            log.info("Received edited channel post (ID: {}) from chat: {}", message.getMessageId(), message.getChatId());
        } else if (update.hasEditedMessage()) {
            message = update.getEditedMessage();
            log.info("Received edited message (ID: {}) from chat: {}", message.getMessageId(), message.getChatId());
        }

        if (message == null) {
            log.debug("Update does not contain a supported message type");
            return;
        }

        String text = message.getText();
        if (text == null || text.isBlank()) {
            text = message.getCaption();
        }

        if (text == null || text.isBlank()) {
            log.warn("Telegram message (ID: {}) has no text or caption. Skipping.", message.getMessageId());
            return;
        }

        // Extract any embedded URLs from MessageEntities (e.g. hyperlinks formatted as [Click Here](url))
        String embeddedUrl = extractUrlFromEntities(message, text);

        try {
            TelegramMessageRequest request = new TelegramMessageRequest();
            request.setChannelId(String.valueOf(message.getChatId()));
            request.setTelegramMessageId(Long.valueOf(message.getMessageId()));
            request.setMessageText(text);

            if (message.getChat() != null) {
                String username = message.getChat().getUserName();
                if (username == null || username.isBlank()) {
                    username = message.getChat().getTitle();
                }
                request.setChannelUsername(username);
            }

            if (embeddedUrl != null && !embeddedUrl.isBlank()) {
                request.setAffiliateUrl(embeddedUrl);
            }

            log.info("Ingesting Telegram deal post from channel: {}, text preview: {}", request.getChannelUsername(), text.length() > 50 ? text.substring(0, 50) + "..." : text);

            TelegramPost post = telegramService.receivePost(request);
            if (post != null && post.getId() != null) {
                log.info("Saved Telegram post #{} in DB. Starting product processing and scraping...", post.getId());
                productProcessingService.processTelegramPost(post.getId());
                log.info("Completed processing for Telegram post #{}", post.getId());
            }
        } catch (Exception e) {
            log.error("Error handling incoming Telegram message: {}", e.getMessage(), e);
        }
    }

    private String extractUrlFromEntities(Message message, String fullText) {
        List<MessageEntity> entities = message.hasEntities() ? message.getEntities() : message.getCaptionEntities();
        if (entities == null || entities.isEmpty()) {
            return null;
        }

        for (MessageEntity entity : entities) {
            if ("text_link".equalsIgnoreCase(entity.getType()) && entity.getUrl() != null && !entity.getUrl().isBlank()) {
                return entity.getUrl();
            } else if ("url".equalsIgnoreCase(entity.getType()) && fullText != null) {
                try {
                    int start = entity.getOffset();
                    int end = start + entity.getLength();
                    if (start >= 0 && end <= fullText.length()) {
                        return fullText.substring(start, end);
                    }
                } catch (Exception ignored) {
                }
            }
        }
        return null;
    }
}
