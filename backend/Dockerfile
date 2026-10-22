# Multi-Stage Dockerfile for ARIA Spring Boot Backend
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy Maven wrapper & POM
COPY pom.xml .
COPY src ./src

# Build production jar skipping tests for fast compilation
RUN apt-get update && apt-get install -y maven && mvn clean package -DskipTests

# Minimal JRE Runtime Stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Non-root user for security
RUN groupadd -r aria && useradd -r -g aria aria
USER aria

COPY --from=build /app/target/aria-backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
