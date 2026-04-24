package com.tinyadmin;

import com.baomidou.mybatisplus.autoconfigure.DdlAutoConfiguration;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(exclude = DdlAutoConfiguration.class)
public class TinyAdminServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(TinyAdminServerApplication.class, args);
	}

}
