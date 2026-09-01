package com.onlineoffers.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.util.Locale;
import java.util.Set;

@Component
public class IpSecurityValidator {

    private static final Logger log = LoggerFactory.getLogger(IpSecurityValidator.class);

    private static final Set<String> BLOCKED_HOSTS = Set.of(
            "localhost",
            "127.0.0.1",
            "0.0.0.0",
            "169.254.169.254",
            "metadata.google.internal",
            "instance-data"
    );

    /**
     * Checks whether the given URL string is safe against SSRF attacks.
     *
     * @param urlString the URL to inspect
     * @return true if the URL points to a public, routable IP address with http/https scheme; false otherwise
     */
    public boolean isSafeUrl(String urlString) {
        if (urlString == null || urlString.isBlank()) {
            return false;
        }

        try {
            String trimmed = urlString.trim();
            if (!trimmed.matches("(?i)^https?://.*")) {
                trimmed = "https://" + trimmed;
            }

            URI uri = URI.create(trimmed);
            String scheme = uri.getScheme();
            if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
                log.warn("SSRF blocked: Invalid URL scheme '{}' in {}", scheme, urlString);
                return false;
            }

            String host = uri.getHost();
            if (host == null || host.isBlank()) {
                log.warn("SSRF blocked: No host present in {}", urlString);
                return false;
            }

            String lowerHost = host.toLowerCase(Locale.ROOT);
            if (BLOCKED_HOSTS.contains(lowerHost)) {
                log.warn("SSRF blocked: Prohibited host '{}' in {}", lowerHost, urlString);
                return false;
            }

            InetAddress[] addresses = InetAddress.getAllByName(host);
            for (InetAddress address : addresses) {
                if (isPrivateOrLocalAddress(address)) {
                    log.warn("SSRF blocked: Host '{}' resolved to non-public IP: {}", host, address.getHostAddress());
                    return false;
                }
            }

            return true;
        } catch (UnknownHostException e) {
            log.warn("SSRF validation failed: Unable to resolve host for {}: {}", urlString, e.getMessage());
            return false;
        } catch (Exception e) {
            log.warn("SSRF validation error for {}: {}", urlString, e.getMessage());
            return false;
        }
    }

    /**
     * Inspects if an InetAddress is loopback, link-local, site-local, multicast, or cloud metadata.
     */
    public boolean isPrivateOrLocalAddress(InetAddress address) {
        if (address == null) return true;

        if (address.isLoopbackAddress() ||
                address.isSiteLocalAddress() ||
                address.isLinkLocalAddress() ||
                address.isAnyLocalAddress() ||
                address.isMulticastAddress()) {
            return true;
        }

        byte[] rawIp = address.getAddress();

        // Check IPv4 specific ranges
        if (rawIp.length == 4) {
            int b0 = rawIp[0] & 0xFF;
            int b1 = rawIp[1] & 0xFF;

            // 0.0.0.0/8 (Broadcast/Current network)
            if (b0 == 0) return true;

            // 10.0.0.0/8 (Private)
            if (b0 == 10) return true;

            // 127.0.0.0/8 (Loopback)
            if (b0 == 127) return true;

            // 169.254.0.0/16 (Link-Local & Cloud Metadata e.g. 169.254.169.254)
            if (b0 == 169 && b1 == 254) return true;

            // 172.16.0.0/12 (Private)
            if (b0 == 172 && b1 >= 16 && b1 <= 31) return true;

            // 192.168.0.0/16 (Private)
            if (b0 == 192 && b1 == 168) return true;

            // 100.64.0.0/10 (Carrier-Grade NAT)
            if (b0 == 100 && (b1 >= 64 && b1 <= 127)) return true;

            // 192.0.0.0/24, 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 (Documentation / Reserved)
            if (b0 == 192 && b1 == 0) return true;
        }

        // Check IPv6 specific ranges
        if (rawIp.length == 16) {
            // ::1 / Loopback
            if (address.isLoopbackAddress()) return true;

            // Unique Local Address (fc00::/7, fd00::/8)
            int b0 = rawIp[0] & 0xFF;
            if ((b0 & 0xFE) == 0xFC) return true;

            // Link-local unicast (fe80::/10)
            int b1 = rawIp[1] & 0xFF;
            if (b0 == 0xFE && (b1 & 0xC0) == 0x80) return true;
        }

        return false;
    }
}
