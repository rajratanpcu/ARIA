package com.aria.devops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AriaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(AriaBackendApplication.class, args);
    }
}
