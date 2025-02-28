export enum RequestError {
    NONE = 0,
    UNAUTHORIZED = 401,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    OTHER = 1000
}