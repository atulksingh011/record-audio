const CONSTANTS = {
    PORT: 3000,
    AUTH_COOKIE_NAME: "auth_token",
    PASSWORD: "superadmin",
    TOKEN_EXPIRATION: 60 * 60 * 1000, // 1 hour in milliseconds
    SECRET_KEY: "super_secret_key_for_signing_cookies",
    DB_FILE_NAME: "records.db",
};

module.exports = CONSTANTS;