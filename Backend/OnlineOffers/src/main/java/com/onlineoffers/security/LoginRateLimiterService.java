package com.onlineoffers.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginRateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(LoginRateLimiterService.class);

    @Value("${security.login.max-attempts:5}")
    private int maxAttempts;

    @Value("${security.login.lockout-minutes:15}")
    private long lockoutMinutes;

    private static class AttemptTracker {
        int attempts;
        Instant lockedUntil;
        Instant lastAttempt;

        AttemptTracker(int attempts, Instant lastAttempt) {
            this.attempts = attempts;
            this.lastAttempt = lastAttempt;
        }
    }

    private final Map<String, AttemptTracker> attemptsCache = new ConcurrentHashMap<>();

    public boolean isBlocked(String key) {
        if (key == null || key.isBlank()) return false;

        AttemptTracker tracker = attemptsCache.get(key);
        if (tracker == null) return false;

        if (tracker.lockedUntil != null) {
            if (Instant.now().isBefore(tracker.lockedUntil)) {
                return true;
            } else {
                // Lockout has expired, reset
                attemptsCache.remove(key);
                return false;
            }
        }

        return false;
    }

    public void loginFailed(String key) {
        if (key == null || key.isBlank()) return;

        attemptsCache.compute(key, (k, tracker) -> {
            Instant now = Instant.now();
            if (tracker == null) {
                return new AttemptTracker(1, now);
            }

            // If last attempt was more than lockout duration ago, reset count
            if (tracker.lastAttempt.plusSeconds(lockoutMinutes * 60).isBefore(now)) {
                return new AttemptTracker(1, now);
            }

            tracker.attempts++;
            tracker.lastAttempt = now;

            if (tracker.attempts >= maxAttempts) {
                tracker.lockedUntil = now.plusSeconds(lockoutMinutes * 60);
                log.warn("Rate limit triggered: Key '{}' is temporarily locked out for {} minutes after {} failed attempts.",
                        k, lockoutMinutes, tracker.attempts);
            }

            return tracker;
        });
    }

    public void loginSucceeded(String key) {
        if (key != null) {
            attemptsCache.remove(key);
        }
    }

    public long getRemainingLockoutMinutes(String key) {
        if (key == null) return 0;
        AttemptTracker tracker = attemptsCache.get(key);
        if (tracker != null && tracker.lockedUntil != null) {
            long remainingSeconds = tracker.lockedUntil.getEpochSecond() - Instant.now().getEpochSecond();
            return remainingSeconds > 0 ? (remainingSeconds + 59) / 60 : 0;
        }
        return 0;
    }
}
