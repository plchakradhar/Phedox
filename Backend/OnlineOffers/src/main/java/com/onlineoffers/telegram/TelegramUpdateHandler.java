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
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;

import java.util.ArrayList;
import java.util.List;

@Component
public class TelegramUpdateHandler {

    private static final Logger log = LoggerFactory.getLogger(TelegramUpdateHandler.class);

    private final TelegramService telegramService;
    private final ProductProcessingService productProcessingService;
    private final TelegramLinkExtractor telegramLinkExtractor;

    public TelegramUpdateHandler(
            TelegramService telegramService,
            ProductProcessingService productProcessingService,
            TelegramLinkExtractor telegramLinkExtractor
    ) {
        this.telegramService = telegramService;
        this.productProcessingService = productProcessingService;
        this.telegramLinkExtractor = telegramLinkExtractor;
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

        // 1. Extract embedded URLs from MessageEntities (both text and caption)
        String embeddedUrl = extractUrlFromEntities(message, text);

        // 2. If not found in entities, check inline keyboard buttons
        if (embeddedUrl == null || embeddedUrl.isBlank()) {
            embeddedUrl = extractUrlFromReplyMarkup(message);
        }

        // 3. If not found in buttons, use TelegramLinkExtractor on text/caption
        if (embeddedUrl == null || embeddedUrl.isBlank()) {
            embeddedUrl = telegramLinkExtractor.extractFirstLink(text);
        }

        // If text is still blank but we have an embedded URL from buttons/entities
        if ((text == null || text.isBlank()) && embeddedUrl != null && !embeddedUrl.isBlank()) {
            text = "Deal Link: " + embeddedUrl;
        }

        if (text == null || text.isBlank()) {
            log.warn("Telegram message (ID: {}) has no text, caption, or deal link. Skipping.", message.getMessageId());
            return;
        }

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

            log.info("Ingesting Telegram deal post #{} from channel: {}, link: {}, text preview: {}",
                    request.getTelegramMessageId(),
                    request.getChannelUsername(),
                    request.getAffiliateUrl(),
                    text.length() > 60 ? text.substring(0, 60) + "..." : text);

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
        List<MessageEntity> entities = new ArrayList<>();
        if (message.hasEntities() && message.getEntities() != null) {
            entities.addAll(message.getEntities());
        }
        if (message.getCaptionEntities() != null) {
            entities.addAll(message.getCaptionEntities());
        }
        if (entities.isEmpty()) {
            return null;
        }

        for (MessageEntity entity : entities) {
            if ("text_link".equalsIgnoreCase(entity.getType()) && entity.getUrl() != null && !entity.getUrl().isBlank()) {
                return entity.getUrl().trim();
            } else if ("url".equalsIgnoreCase(entity.getType()) && fullText != null) {
                try {
                    int start = entity.getOffset();
                    int end = start + entity.getLength();
                    if (start >= 0 && end <= fullText.length()) {
                        String raw = fullText.substring(start, end).trim();
                        if (!raw.isBlank()) {
                            return raw.startsWith("http") ? raw : "https://" + raw;
                        }
                    }
                } catch (Exception ignored) {
                }
            }
        }
        return null;
    }

    private String extractUrlFromReplyMarkup(Message message) {
        if (message == null || !message.hasReplyMarkup()) {
            return null;
        }
        try {
            InlineKeyboardMarkup markup = message.getReplyMarkup();
            if (markup.getKeyboard() != null) {
                for (List<InlineKeyboardButton> row : markup.getKeyboard()) {
                    if (row != null) {
                        for (InlineKeyboardButton button : row) {
                            if (button != null && button.getUrl() != null && !button.getUrl().isBlank()) {
                                return button.getUrl().trim();
                            }
                        }
                    }
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }
}
