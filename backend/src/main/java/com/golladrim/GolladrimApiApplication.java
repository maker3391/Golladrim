package com.golladrim;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GolladrimApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(GolladrimApiApplication.class, args);
	}

}
