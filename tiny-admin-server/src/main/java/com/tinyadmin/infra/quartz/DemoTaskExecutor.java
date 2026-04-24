package com.tinyadmin.infra.quartz;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component("demoTaskExecutor")
public class DemoTaskExecutor {

    public void heartbeat(String args) {
        log.info("Tiny Admin demo scheduled task executed. args={}", args);
    }
}
