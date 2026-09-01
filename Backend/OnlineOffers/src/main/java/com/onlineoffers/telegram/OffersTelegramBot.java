package com.onlineoffers.telegram;

import com.onlineoffers.config.TelegramBotConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.objects.Update;

@Component
public class OffersTelegramBot extends TelegramLongPollingBot {

    private static final Logger log = LoggerFactory.getLogger(OffersTelegramBot.class);

    private final TelegramBotConfig config;
    private final TelegramUpdateHandler updateHandler;

    public OffersTelegramBot(TelegramBotConfig config, TelegramUpdateHandler updateHandler) {
        super(config.getBotToken() != null && !config.getBotToken().isBlank() ? config.getBotToken() : "default_token");
        this.config = config;
        this.updateHandler = updateHandler;
    }

    @Override
    public String getBotUsername() {
        return config.getBotUsername() != null ? config.getBotUsername() : "OnlineOffersBot";
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update != null) {
            updateHandler.handleUpdate(update);
        }
    }
}
