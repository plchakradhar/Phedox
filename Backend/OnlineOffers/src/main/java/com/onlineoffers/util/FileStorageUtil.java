package com.onlineoffers.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.UUID;

@Component
public class FileStorageUtil {

    private final Path uploadDirectory;

    public FileStorageUtil(
            @Value("${app.upload.directory:uploads/products}") String uploadDirectory
    ) {
        this.uploadDirectory = Paths.get(uploadDirectory)
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.uploadDirectory);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not create upload directory",
                    e
            );
        }
    }

    public String saveFile(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null || originalFilename.isBlank()) {
            throw new RuntimeException("Invalid file name");
        }

        String extension = "";

        int dotIndex = originalFilename.lastIndexOf('.');

        if (dotIndex >= 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String fileName =
                UUID.randomUUID() + extension;

        Path targetPath =
                uploadDirectory.resolve(fileName).normalize();

        if (!targetPath.startsWith(uploadDirectory)) {
            throw new RuntimeException("Invalid file path");
        }

        try (InputStream inputStream = file.getInputStream()) {

            Files.copy(
                    inputStream,
                    targetPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return "/uploads/products/" + fileName;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Could not save file",
                    e
            );
        }
    }

    public void deleteFile(String imageUrl) {

        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        String fileName =
                Paths.get(imageUrl)
                        .getFileName()
                        .toString();

        Path filePath =
                uploadDirectory.resolve(fileName).normalize();

        if (!filePath.startsWith(uploadDirectory)) {
            return;
        }

        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException(
                    "Could not delete file",
                    e
            );
        }
    }
}