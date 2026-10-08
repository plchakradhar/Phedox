package com.onlineoffers.scheduler;

import com.onlineoffers.repository.ProductClickRepository;
import com.onlineoffers.repository.ScrapingLogRepository;
import com.onlineoffers.repository.TelegramPostRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class DatabaseStorageCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(DatabaseStorageCleanupScheduler.class);

    private final ScrapingLogRepository scrapingLogRepository;
    private final TelegramPostRepository telegramPostRepository;
    private final ProductClickRepository productClickRepository;

    public DatabaseStorageCleanupScheduler(
            ScrapingLogRepository scrapingLogRepository,
            TelegramPostRepository telegramPostRepository,
            ProductClickRepository productClickRepository
    ) {
        this.scrapingLogRepository = scrapingLogRepository;
        this.telegramPostRepository = telegramPostRepository;
        this.productClickRepository = productClickRepository;
    }

    /**
     * Run storage cleanup upon startup once the application is ready.
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        try {
            cleanupOldLogsAndStorage();
        } catch (Exception e) {
            log.warn("Startup database storage cleanup encountered an error: {}", e.getMessage());
        }
    }

    /**
     * Scheduled cleanup runs every 6 hours to keep database storage footprint minimal (< 20MB).
     */
    @Scheduled(cron = "0 0 */6 * * ?")
    @Transactional
    public void cleanupOldLogsAndStorage() {
        LocalDateTime now = LocalDateTime.now();
        log.info("Starting automated database storage cleanup at {}", now);

        try {
            // 1. Delete scraping logs older than 48 hours (massive space saver)
            LocalDateTime logCutoff = now.minusHours(48);
            int deletedLogs = scrapingLogRepository.deleteByCreatedAtBefore(logCutoff);
            log.info("Cleaned up {} scraping log(s) older than 48 hours.", deletedLogs);

            // 2. Delete processed/failed telegram posts older than 3 days
            LocalDateTime telegramCutoff = now.minusDays(3);
            int deletedPosts = telegramPostRepository.deleteProcessedOrFailedPostsBefore(telegramCutoff);
            log.info("Cleaned up {} processed/failed Telegram post(s) older than 3 days.", deletedPosts);

            // 3. Delete click tracking logs older than 30 days
            LocalDateTime clickCutoff = now.minusDays(30);
            int deletedClicks = productClickRepository.deleteByClickedAtBefore(clickCutoff);
            log.info("Cleaned up {} analytics click(s) older than 30 days.", deletedClicks);

            log.info("Automated database storage cleanup completed successfully.");
        } catch (Exception e) {
            log.error("Error during automated database storage cleanup: {}", e.getMessage(), e);
        }
    }
}
