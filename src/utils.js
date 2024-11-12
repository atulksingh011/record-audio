const path = require("path");
const CONSTANTS = require("./constants");
const exp = require("constants");

// Validate the token expiration (server-side)
exports.isValidToken = isValidToken;

// Middleware for API authentication
exports.apiAuthentication = (req, res, next) => {
  const authToken = req.signedCookies[CONSTANTS.AUTH_COOKIE_NAME];
  const tokenExpiration = req.signedCookies["token_expiration"];

  if (!authToken || !isValidToken(authToken, tokenExpiration)) {
    res.status(401).send("Authentication expired. Please re-enter password.");
  } else {
    next();
  }
};

exports.generateAudioFileName = (originalName) => {
  const timestamp = Date.now(); // Current timestamp
  const extension = path.extname(originalName); // Get file extension
  const baseName = path.basename(originalName, extension); // Get base name without extension

  // Combine base name, timestamp, and extension to create a unique file name
  return `${baseName}_${timestamp}${extension}`;
};

exports.getDbFilePath = () => path.join(__dirname, "../", CONSTANTS.DB_FILE_NAME);

exports.runSequentially = (tasks) => {
  return tasks.reduce((promiseChain, currentTask) => {
    return promiseChain.then((results) =>
      currentTask().then((result) => [...results, result])
    );
  }, Promise.resolve([]));
};

function isValidToken(token, expiration) {
  const currentTime = Date.now();
  return token && expiration > currentTime;
}