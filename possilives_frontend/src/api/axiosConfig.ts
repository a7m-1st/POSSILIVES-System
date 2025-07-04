import axios from 'axios'
import keycloakInst from '../services/keycloak.ts';

export const api = axios.create(
    {//prev = https://9c96-103-106-239-104.ap.ngrok.io
        baseURL: 'http://localhost:8081'
      , headers: { "Content-Type": "application/json" }
    }
);

api.interceptors.request.use(
  async (config) => {
    if(keycloakInst.authenticated) {
      try {
        await keycloakInst.updateToken(30);
        config.headers.Authorization = `Bearer ${keycloakInst.token}`;
      } catch (error) {
        alert("Session Expired. Please login again." + error);
        keycloakInst.logout();
      }
    }
    return config;
  }, (error) => {
    return Promise.reject(error);
  }
)

export const initUser = async () => {
  try {
    const res = await api.post("/api/users/initUser");
    if(res.status == 401 || res.status == 400) return false;
    
    return res.data;
  } catch(error) {
    console.error("Error in initUser", error);
    return false;
  }
}