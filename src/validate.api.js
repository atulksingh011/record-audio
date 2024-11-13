// Serve static files (JS, CSS) from the public directory
const validateRouter = require("express").Router();
const crypto = require("crypto");
const CONSTANTS = require("./constants");

const users = process.env.USERS;

// POST route for validating password
validateRouter.post("/", (req, res) => {
  const { password } = req.body;
  const user = password.toLowerCase();

  if (users.indexOf(user) !== -1) {
    const token = generateToken();
    const expirationTime = Date.now() + CONSTANTS.TOKEN_EXPIRATION;

    // Set secure signed cookies
    res.cookie(CONSTANTS.AUTH_COOKIE_NAME, token, {
      signed: true,
      httpOnly: true,
      maxAge: CONSTANTS.TOKEN_EXPIRATION,
      secure: isProd(),
    });

    res.cookie("token_expiration", expirationTime, {
      signed: true,
      httpOnly: true,
      maxAge: CONSTANTS.TOKEN_EXPIRATION,
      secure: isProd(),
    });

    res.cookie("user", user, {
      signed: true,
      httpOnly: true,
      maxAge: CONSTANTS.TOKEN_EXPIRATION,
      secure: isProd(),
    });

    return res.status(200).send("Password validated");
  } else {
    return res.status(401).send("Invalid password");
  }
});

module.exports = validateRouter;

// Helper to generate token
function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

function isProd() {
  return process.env.ENV === "PROD";
}
