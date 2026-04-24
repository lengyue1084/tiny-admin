package com.tinyadmin.infra.file;

import com.tinyadmin.config.FileStorageProperties;
import com.tinyadmin.common.exception.BizException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final FileStorageProperties properties;

    public FileUploadResult upload(MultipartFile file) {
        try {
            Path basePath = Path.of(properties.storagePath());
            Files.createDirectories(basePath);
            String fileId = UUID.randomUUID().toString();
            String filename = fileId + "-" + file.getOriginalFilename();
            Path target = basePath.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return new FileUploadResult(fileId, "/uploads/" + filename, file.getOriginalFilename(), file.getSize(), file.getContentType());
        } catch (IOException ex) {
            throw new BizException("B1001", "文件上传失败");
        }
    }

    public record FileUploadResult(
            String fileId,
            String url,
            String name,
            long size,
            String contentType
    ) {
    }
}
