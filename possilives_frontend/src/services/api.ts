import axios from "axios";
import keycloakInst from "./keycloak";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

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

export default api;