package com.onlineoffers.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.directory:uploads/products}")
    private String uploadDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths
                .get(uploadDirectory)
                .toAbsolutePath()
                .normalize();

        String locationUri = uploadPath.toUri().toString();
        if (!locationUri.endsWith("/")) {
            locationUri += "/";
        }

        registry.addResourceHandler("/uploads/products/**")
                .addResourceLocations(locationUri);
    }
}