package com.onlineoffers.config;

import com.onlineoffers.telegram.OffersTelegramBot;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.generics.BotSession;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

@Configuration
public class TelegramBotConfig {

    private static final Logger log = LoggerFactory.getLogger(TelegramBotConfig.class);

    @Value("${telegram.bot.username:OnlineOffersBot}")
    private String botUsername;

    @Value("${telegram.bot.token:}")
    private String botToken;

    private BotSession botSession;

    public String getBotUsername() {
        if (botUsername != null && botUsername.startsWith("@")) {
            return botUsername.substring(1);
        }
        return botUsername != null ? botUsername : "OnlineOffersBot";
    }

    public String getBotToken() {
        return botToken;
    }

    @Bean
    public TelegramBotsApi telegramBotsApi(OffersTelegramBot offersTelegramBot) {
        try {
            TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
            if (botToken != null && !botToken.isBlank() && !botToken.equals("default_token")) {
                this.botSession = botsApi.registerBot(offersTelegramBot);
                log.info("Telegram Bot registered successfully with Telegram API: @{}", getBotUsername());
            } else {
                log.warn("Telegram bot token is empty or default. Bot registration skipped.");
            }
            return botsApi;
        } catch (Exception e) {
            log.error("Failed to register Telegram Bot: {}", e.getMessage(), e);
            return null;
        }
    }

    @PreDestroy
    public void cleanup() {
        if (botSession != null && botSession.isRunning()) {
            try {
                log.info("Stopping Telegram Bot session...");
                botSession.stop();
            } catch (Exception ignored) {
            }
        }
    }
}