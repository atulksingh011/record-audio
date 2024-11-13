const CONSTANTS = {
    AUTH_COOKIE_NAME: "auth_token",
    TOKEN_EXPIRATION: 60 * 60 * 1000, // 1 hour in milliseconds
    SECRET_KEY: "super_secret_key_for_signing_cookies",
    BUCKET_PATH: "record-names",
    USERS_DB: "data/users.db",
    RECORD_DB: "data/record.db",
};

module.exports = CONSTANTS;