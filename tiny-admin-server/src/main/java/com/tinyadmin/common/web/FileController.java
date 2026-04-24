package com.tinyadmin.common.web;

import com.tinyadmin.common.api.ApiResponse;
import com.tinyadmin.infra.file.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ApiResponse<?> upload(@RequestPart("file") MultipartFile file) {
        return ApiResponse.success(fileStorageService.upload(file), RequestTraceContext.get());
    }
}
