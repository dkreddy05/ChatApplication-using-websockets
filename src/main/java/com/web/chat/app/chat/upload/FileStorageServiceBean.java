package com.web.chat.app.chat.upload;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FileStorageServiceBean implements FileStorageService {

    private static final long MAX_BYTES = 50L * 1024 * 1024; // 50 MB

    private static final Set<String> ALLOWED_MIME_PREFIXES = Set.of(
            "image/", "video/", "audio/");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/zip",
            "text/plain");

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Value("${app.upload.url-prefix:/uploads}")
    private String urlPrefix;

    private Path uploadPath;

    @PostConstruct
    public void init() {
        uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
            log.info("Upload directory ready: {}", uploadPath);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadPath, e);
        }
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty file.");
        }

        // Size check
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("File exceeds the 50 MB limit.");
        }

        // MIME type check
        String contentType = file.getContentType();
        if (!isAllowedMimeType(contentType)) {
            throw new IllegalArgumentException("File type not allowed: " + contentType);
        }

        // Build safe filename
        String originalName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "upload");
        String extension = "";
        int dotIdx = originalName.lastIndexOf('.');
        if (dotIdx >= 0) {
            extension = originalName.substring(dotIdx); // e.g. ".jpg"
        }
        String storedName = UUID.randomUUID() + extension;

        Path targetPath = uploadPath.resolve(storedName);
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("Stored file '{}' as '{}'", originalName, storedName);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + originalName, e);
        }

        return urlPrefix + "/" + storedName;
    }

    private boolean isAllowedMimeType(String mimeType) {
        if (mimeType == null)
            return false;
        for (String prefix : ALLOWED_MIME_PREFIXES) {
            if (mimeType.startsWith(prefix))
                return true;
        }
        return ALLOWED_MIME_TYPES.contains(mimeType);
    }
}
