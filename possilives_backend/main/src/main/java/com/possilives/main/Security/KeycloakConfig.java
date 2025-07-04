package com.possilives.main.Security;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfig {

    @Value("${spring.security.oauth2.client.registration.keycloak.client-id}")
    private String userClientId;
    @Value("${spring.security.oauth2.client.registration.keycloak.client-secret}")
    private String userClientSecret;
    @Value("${keycloak.realm-name}")
    private String realm;
    @Value("${keycloak.server-url}")
    private String serverUrl;
    @Value("${spring.security.oauth2.client.registration.keycloak.authorization-grant-type}")
    private String grantType;

    @Value("${keycloak.admin.client-id}")
    private String adminClientId;
    @Value("${spring.security.oauth2.client.registration.keycloak.client-secret}")
    private String adminClientSecret;


    @Bean
    @Qualifier("userKeycloak")
    public Keycloak userKeycloak() {
        return KeycloakBuilder.builder()
                .clientSecret(userClientSecret)
                .clientId(userClientId)
                .grantType(grantType)
                .realm(realm)
                .serverUrl(serverUrl)
                .build();
    }

    @Bean
    @Qualifier("adminKeycloak")
    public Keycloak adminKeycloak() {
        return KeycloakBuilder.builder()
                .clientSecret(adminClientSecret)
                .clientId(adminClientId)
                .grantType(grantType)
                .realm(realm)
                .serverUrl(serverUrl)
                .build();
    }
}