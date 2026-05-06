package com.tinyadmin.infra.file;

import com.tinyadmin.common.exception.BizException;
import com.tinyadmin.config.FileStorageProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
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
            if (file == null || file.isEmpty()) {
                throw new BizException("B1001", "文件不能为空");
            }

            Path basePath = Path.of(properties.storagePath());
            Files.createDirectories(basePath);

            String originalFilename = sanitizeOriginalFilename(file.getOriginalFilename());
            String fileId = UUID.randomUUID().toString();
            String filename = fileId + "-" + originalFilename;
            Path target = basePath.resolve(filename);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return new FileUploadResult(fileId, "/uploads/" + filename, originalFilename, file.getSize(), file.getContentType());
        } catch (IOException ex) {
            throw new BizException("B1001", "文件上传失败");
        }
    }

    private String sanitizeOriginalFilename(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new BizException("B1001", "文件名不能为空");
        }

        String sanitized = Path.of(originalFilename).getFileName().toString()
                .replaceAll("[\\r\\n]", "")
                .replaceAll("[\\\\/:*?\"<>|]", "-")
                .trim();
        if (sanitized.isEmpty() || ".".equals(sanitized) || "..".equals(sanitized)) {
            throw new BizException("B1001", "文件名不合法");
        }

        return sanitized.toLowerCase(Locale.ROOT).endsWith(".")
                ? sanitized.substring(0, sanitized.length() - 1)
                : sanitized;
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
