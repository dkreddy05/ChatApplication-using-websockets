package com.web.chat.app.chat.controller;

import com.web.chat.app.chat.service.AzureBlobService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import java.io.IOException;

@RestController
@RequestMapping("/files")
public class FileController {
    private final AzureBlobService azureBlobService;

    public FileController(AzureBlobService azureBlobService) {
        this.azureBlobService = azureBlobService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadProfile(@RequestParam("file") MultipartFile file) {
        try {
            String url = azureBlobService.uploadFile(file.getOriginalFilename(),
                    file.getInputStream(),
                    file.getSize());
            return ResponseEntity.ok(url);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Failed to upload file");
        }
    }
}
