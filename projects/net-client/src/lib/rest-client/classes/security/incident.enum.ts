export enum AuthIncident{
    PRE_FAILED_CALL = "Making arequest to secured endpoint with no token supplied",
    SERVER_INVALIDATED = "Existent token was invalidated by the server",
    RETRY_LIMIT_REACHED = "Max token acquisition retries reached",
    MANUAL_LOGOUT = "User manually logged out",
}