package com.possilives.main.RestTemplate;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ApiService {
  private final RestTemplate restTemplate;

  public String getDataFromApi(String apiUrl) {
    ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);
    return response.getBody();
  }

  public void postDataToApi(String apiUrl, Object requestBody) {
    restTemplate.postForEntity(apiUrl, requestBody, String.class);
  }

}
