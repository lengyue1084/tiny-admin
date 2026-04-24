package com.tinyadmin.auth.service;

import com.tinyadmin.auth.dto.CaptchaResponse;
import com.tinyadmin.infra.store.CaptchaStore;
import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.Duration;
import java.util.Base64;
import java.util.UUID;
import javax.imageio.ImageIO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CaptchaService {

    private final CaptchaStore captchaStore;

    public CaptchaResponse createCaptcha() {
        String text = UUID.randomUUID().toString().replace("-", "").substring(0, 4).toUpperCase();
        String key = UUID.randomUUID().toString();
        captchaStore.save(key, text, Duration.ofMinutes(5));
        return new CaptchaResponse(key, render(text), text);
    }

    public boolean validate(String key, String value) {
        return captchaStore.get(key)
                .map(text -> text.equalsIgnoreCase(value))
                .orElse(false);
    }

    public void clear(String key) {
        captchaStore.delete(key);
    }

    private String render(String text) {
        try {
            BufferedImage image = new BufferedImage(140, 48, BufferedImage.TYPE_INT_RGB);
            Graphics2D graphics = image.createGraphics();
            graphics.setColor(new Color(242, 244, 248));
            graphics.fillRect(0, 0, 140, 48);
            graphics.setFont(new Font("SansSerif", Font.BOLD, 28));
            graphics.setColor(new Color(30, 41, 59));
            graphics.drawString(text, 18, 32);
            graphics.dispose();
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(image, "png", outputStream);
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (Exception ex) {
            throw new IllegalStateException("captcha render failed", ex);
        }
    }
}
