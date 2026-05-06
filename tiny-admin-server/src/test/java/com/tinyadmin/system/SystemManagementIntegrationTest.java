package com.tinyadmin.system;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.tinyadmin.auth.JsonTestHelper;
import com.tinyadmin.infra.store.CaptchaStore;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SystemManagementIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CaptchaStore captchaStore;

    @Test
    void usersEndpointShouldIncludeRoleAndOrgMetadataForEditing() throws Exception {
        mockMvc.perform(get("/api/system/users").header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("00000"))
                .andExpect(jsonPath("$.data[0].username").value("admin"))
                .andExpect(jsonPath("$.data[0].roleIds[0]").value(1))
                .andExpect(jsonPath("$.data[0].deptName").value("平台总部"));
    }

    @Test
    void rolesEndpointShouldIncludeCheckedMenuIds() throws Exception {
        mockMvc.perform(get("/api/system/roles").header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("00000"))
                .andExpect(jsonPath("$.data[0].code").value("SUPER_ADMIN"))
                .andExpect(jsonPath("$.data[0].menuIds").isArray())
                .andExpect(jsonPath("$.data[0].menuIds[0]").value(1));
    }

    @Test
    void metadataEndpointShouldReturnMenuTreeAndDeptTree() throws Exception {
        mockMvc.perform(get("/api/system/meta").header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("00000"))
                .andExpect(jsonPath("$.data.roleOptions[0].label").value("超级管理员"))
                .andExpect(jsonPath("$.data.menuTree[0].name").value("系统管理"))
                .andExpect(jsonPath("$.data.menuTree[0].children[0].name").value("用户管理"))
                .andExpect(jsonPath("$.data.deptTree[0].name").value("平台总部"));
    }

    @Test
    void deletingMenuWithChildrenShouldBeRejected() throws Exception {
        mockMvc.perform(delete("/api/system/menus/1").header("Authorization", bearerToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A0400"));
    }

    @Test
    void deletingDeptWithChildrenShouldBeRejected() throws Exception {
        String token = bearerToken();

        mockMvc.perform(post("/api/system/depts")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "parentId": 1,
                                  "name": "研发中心",
                                  "orderNum": 10,
                                  "leader": "张工",
                                  "phone": "13800138000",
                                  "email": "rd@tinyadmin.local",
                                  "status": 1
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("00000"));

        mockMvc.perform(delete("/api/system/depts/1").header("Authorization", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A0400"));
    }

    @Test
    void savingMenuWithDescendantAsParentShouldBeRejected() throws Exception {
        mockMvc.perform(post("/api/system/menus")
                        .header("Authorization", bearerToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": 1,
                                  "parentId": 2,
                                  "name": "系统管理",
                                  "path": "/system",
                                  "component": "/layout/system",
                                  "icon": "SettingOutlined",
                                  "type": "CATALOG",
                                  "permissionCode": "",
                                  "orderNum": 1,
                                  "visible": 1,
                                  "status": 1
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A0400"));
    }

    @Test
    void savingDeptWithDescendantAsParentShouldBeRejected() throws Exception {
        String token = bearerToken();

        MvcResult createResult = mockMvc.perform(post("/api/system/depts")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "parentId": 1,
                                  "name": "产品中心",
                                  "orderNum": 20,
                                  "leader": "李工",
                                  "phone": "13800138111",
                                  "email": "pm@tinyadmin.local",
                                  "status": 1
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("00000"))
                .andReturn();

        Integer childDeptId = JsonPath.read(createResult.getResponse().getContentAsString(), "$.data.id");

        mockMvc.perform(post("/api/system/depts")
                        .header("Authorization", token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": 1,
                                  "parentId": %s,
                                  "name": "平台总部",
                                  "orderNum": 1,
                                  "leader": "管理员",
                                  "phone": "13800000000",
                                  "email": "admin@tinyadmin.local",
                                  "status": 1
                                }
                                """.formatted(childDeptId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("A0400"));
    }

    private String bearerToken() throws Exception {
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
                .andReturn();

        return "Bearer " + JsonTestHelper.read(loginResult.getResponse().getContentAsString(), "$.data.accessToken");
    }
}
