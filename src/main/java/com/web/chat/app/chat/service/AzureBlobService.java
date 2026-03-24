package com.web.chat.app.chat.service;

import java.io.InputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;

@Service
public class AzureBlobService {
    private final BlobServiceClient blobServiceClient;
    @Value("${azure.storage.container-name}")
    private String containerName;

    public AzureBlobService(BlobServiceClient blobServiceClient) {
        this.blobServiceClient = blobServiceClient;
    }

    public String uploadFile(String filename, InputStream inp, Long size) {
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        BlobClient blobClient = containerClient.getBlobClient(filename);
        blobClient.upload(inp, size, true);
        return blobClient.getBlobUrl();
    }
}
