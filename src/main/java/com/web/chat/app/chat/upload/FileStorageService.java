package com.web.chat.app.chat.upload;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /**
     * Stores the uploaded file and returns the public URL path
     * (e.g. /uploads/uuid-filename.jpg).
     */
    String store(MultipartFile file);
}
