package com.tinyadmin.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.tinyadmin.infra.store.CaptchaStore;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CaptchaStore captchaStore;

    @Test
    void captchaEndpointShouldReturnKeyAndImage() throws Exception {
        mockMvc.perform(get("/api/auth/captcha"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("00000"))
                .andExpect(jsonPath("$.data.captchaKey").isNotEmpty())
                .andExpect(jsonPath("$.data.captchaImage").isNotEmpty());
    }

    @Test
    void loginShouldRejectWrongCaptcha() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username":"admin",
                                  "password":"admin123",
                                  "captchaKey":"missing-key",
                                  "captchaCode":"1234"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A0401"));
    }

    @Test
    void loginShouldReturnTokensAndProfile() throws Exception {
        MvcResult captchaResult = mockMvc.perform(get("/api/auth/captcha"))
                .andExpect(status().isOk())
                .andReturn();

        String body = captchaResult.getResponse().getContentAsString();
        String captchaKey = JsonTestHelper.read(body, "$.data.captchaKey");
        String captchaCode = captchaStore.get(captchaKey).orElseThrow();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "username":"admin",
                                  "password":"admin123",
                                  "captchaKey":"%s",
                                  "captchaCode":"%s"
                                }
                                """.formatted(captchaKey, captchaCode)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("00000"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.userInfo.username").value("admin"))
                .andReturn();

        String accessToken = JsonTestHelper.read(loginResult.getResponse().getContentAsString(), "$.data.accessToken");

        mockMvc.perform(get("/api/auth/profile")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("00000"))
                .andExpect(jsonPath("$.data.username").value("admin"))
                .andExpect(jsonPath("$.data.permissions").isArray());
    }
}
