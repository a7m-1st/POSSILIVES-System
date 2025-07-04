FROM maven:3.9-eclipse-temurin-17-alpine AS dev

# Set working directory
WORKDIR /app

# Copy pom.xml for dependency resolution
COPY main/pom.xml .

# Download dependencies
RUN mvn dependency:go-offline

# Copy source code (will be overridden by volume mount in dev mode)
COPY main/src ./src

# Expose port for application
EXPOSE 8080

# Expose debug port
EXPOSE 5005

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=dev

# Command to run the application in dev mode with debugging enabled
CMD ["mvn", "spring-boot:run", "-Dspring-boot.run.jvmArguments='-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005'"]


# Build stage
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml first for dependency resolution (better layer caching)
COPY main/pom.xml .
# Download dependencies
RUN mvn dependency:go-offline

# Copy source code
COPY main/src ./src

# Package the application
RUN mvn package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=prod

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]