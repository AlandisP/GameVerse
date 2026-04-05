package com.GameVerse.GameVerse.security;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateMultipartUploadRequest;
import software.amazon.awssdk.services.s3.model.Delete;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectsRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.paginators.ListObjectsV2Iterable;

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
        String filteredkey = key.replaceAll("[^a-zA-Z0-9._/-]*","");
        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucketName)
                .key(filteredkey)
                .contentType(file.getContentType())
                .build(),
            RequestBody.fromBytes(file.getBytes())
        );
        return "https://" + bucketName + ".s3." + region +  ".amazonaws.com/" + key;
    }

    public String uploadFile(MultipartFile file, String user) throws IOException {
        return uploadFile(file, user, "Media");
    }

    public String staticMedia(MultipartFile file, String user, String type) throws IOException {
        String key = user + "/Profile/"+type;
        String filteredkey = key.replaceAll("[^a-zA-Z0-9._/-]*","");
        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucketName)
                .key(filteredkey)
                .contentType(file.getContentType())
                .build(),
            RequestBody.fromBytes(file.getBytes())
        );
        return "https://" + bucketName + ".s3." + region +  ".amazonaws.com/" + key;
    }

    public void deleteMedia(String pathname) throws IOException {
        String Key = "";
        Matcher key = Pattern.compile("amazonaws.com\\/(.*)").matcher(pathname);
        while(key.find()){
            Key = key.group(1);
        }
        s3Client.deleteObject(DeleteObjectRequest.builder().bucket(bucketName).key(Key).build());
    }
    public void deleteAllMedia(String user) throws IOException {
        ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
            .bucket(bucketName)
            .prefix(user)
            .build();

        ListObjectsV2Response listResponse;

        do {
            listResponse = s3Client.listObjectsV2(listRequest);

            List<ObjectIdentifier> objectsToDelete = listResponse.contents().stream()
                    .map(obj -> ObjectIdentifier.builder().key(obj.key()).build())
                    .collect(Collectors.toList());

            if (!objectsToDelete.isEmpty()) {
                DeleteObjectsRequest deleteRequest = DeleteObjectsRequest.builder()
                        .bucket(bucketName)
                        .delete(Delete.builder().objects(objectsToDelete).build())
                        .build();

                s3Client.deleteObjects(deleteRequest);
            }

            listRequest = listRequest.toBuilder()
                    .continuationToken(listResponse.nextContinuationToken())
                    .build();

        } while (listResponse.isTruncated());
    }
}