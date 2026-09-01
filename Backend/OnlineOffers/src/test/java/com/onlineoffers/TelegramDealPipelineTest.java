package com.onlineoffers;

import com.onlineoffers.dto.ProductResponse;
import com.onlineoffers.dto.ScrapedProductData;
import com.onlineoffers.entity.TelegramPost;
import com.onlineoffers.repository.ProductRepository;
import com.onlineoffers.repository.TelegramPostRepository;
import com.onlineoffers.service.ProductProcessingService;
import com.onlineoffers.service.ProductService;
import com.onlineoffers.service.TelegramProductParser;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootTest
public class TelegramDealPipelineTest {

    @Autowired
    private TelegramProductParser parser;

    @Autowired
    private ProductProcessingService processingService;

    @Autowired
    private ProductService productService;

    @Autowired
    private TelegramPostRepository telegramPostRepository;

    @Autowired
    private ProductRepository productRepository;

    @Test
    public void testParserWithTypicalTelegramFormat() {
        String msg = "🔥 LOOT DEAL: DIGISMART Storm BLDC Motor with Remote 1200 mm Ceiling Fan\n" +
                "MRP: ₹4,290\n" +
                "Deal Price: ₹1,499 (65% off)\n" +
                "Buy here: https://amzn.to/3example";

        ScrapedProductData data = parser.parse(msg);
        Assertions.assertNotNull(data);
        Assertions.assertTrue(data.getName().contains("DIGISMART"));
        Assertions.assertEquals(new BigDecimal("1499"), data.getCurrentPrice());
        Assertions.assertEquals(new BigDecimal("4290"), data.getOriginalPrice());
        Assertions.assertEquals("https://amzn.to/3example", data.getProductUrl());
        Assertions.assertEquals("Electronics", data.getCategory());
    }

    @Test
    public void testParserWithOnlyOnePriceAndDiscountPercent() {
        String msg = "Sony WH-1000XM5 Wireless Headphones\n" +
                "Flat 60% OFF @ Rs. 11999\n" +
                "Link: https://amazon.in/dp/B0example";

        ScrapedProductData data = parser.parse(msg);
        Assertions.assertNotNull(data);
        Assertions.assertEquals(new BigDecimal("11999"), data.getCurrentPrice());
        Assertions.assertTrue(data.getOriginalPrice().compareTo(new BigDecimal("29000")) >= 0);
    }

    @Test
    @Transactional
    public void testEndToEndTelegramIngestionAndDealsFetch() {
        TelegramPost post = new TelegramPost();
        post.setTelegramMessageId(99991L);
        post.setChannelId("-1004373141294");
        post.setChannelUsername("toolsofferss");
        post.setMessageText("DIGISMART Storm BLDC Motor with Remote 1200 mm Ceiling Fan\n" +
                "MRP: ₹4290\n" +
                "Deal Price: ₹1499\n" +
                "Buy: https://amzn.to/testdeal99");
        post.setAffiliateUrl("https://amzn.to/testdeal99");
        post.setMarketplace("AMAZON");
        post.setReceivedAt(LocalDateTime.now());
        post.setPostedAt(LocalDateTime.now());
        post.setStatus("RECEIVED");
        post = telegramPostRepository.save(post);

        // Process post
        processingService.processTelegramPost(post.getId());

        // Verify post status
        TelegramPost updatedPost = telegramPostRepository.findById(post.getId()).orElse(null);
        Assertions.assertNotNull(updatedPost);
        Assertions.assertEquals("PROCESSED", updatedPost.getStatus());
        Assertions.assertTrue(updatedPost.isSuccessful());
        Assertions.assertNotNull(updatedPost.getProduct());

        // Verify Deals page query gets this active product
        List<ProductResponse> deals = productService.getFilteredProducts(null, null, new BigDecimal("50"), null);
        Assertions.assertFalse(deals.isEmpty());
        boolean found = deals.stream().anyMatch(d -> d.getName().contains("DIGISMART"));
        Assertions.assertTrue(found, "Product should be present in 50%+ deals list");
    }
}
