package com.GameVerse.GameVerse.security;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.region}")
    private String region;

    @Value("${aws.bucketName}")
    private String bucketName;

    public String uploadFile(MultipartFile file, String user, String type) throws IOException {
        String randomUID = UUID.randomUUID().toString() + "_";
        if(type.equals("Profile")){
            randomUID = "";
        }
        String key = user + "/" + type + "/" + randomUID + file.getOriginalFilename();
        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build(),
            RequestBody.fromBytes(file.getBytes())
        );
        return "https://" + bucketName + ".s3." + region +  ".amazonaws.com/" + key;
    }

    public String uploadFile(MultipartFile file, String user) throws IOException {
        return uploadFile(file, user, "Media");
    }
}