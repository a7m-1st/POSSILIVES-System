import Keycloak from 'keycloak-js';

const keycloakInst = new Keycloak({
    url: process.env.REACT_APP_ADMIN_URL,
    realm: process.env.REACT_APP_REALM,
    clientId: process.env.REACT_APP_CLIENT_ID,
});

export const logoutKeycloak = () => {
    console.log("Logging out..")
    return keycloakInst.logout()
}

export const keycloakAuthenticated = () => {
    console.log("Checking user authenticated or no")
    return keycloakInst.authenticated
}

export default keycloakInst;
