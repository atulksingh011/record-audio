const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const path = require("path");
const app = express();
const PORT = 3000;

// Constants for authentication
const AUTH_COOKIE_NAME = "auth_token";
const PASSWORD = "superadmin"; // Default password
const TOKEN_EXPIRATION = 60 * 60 * 1000; // 1 hour in milliseconds
const SECRET_KEY = "super_secret_key_for_signing_cookies";

const publicDir = path.join(__dirname, "../", "public")

// Middleware
app.use(cookieParser(SECRET_KEY));
app.use(bodyParser.json());

// Helper to generate token
function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

// Validate the token expiration (server-side)
function isValidToken(token, expiration) {
  const currentTime = Date.now();
  return token && expiration > currentTime;
}

// Middleware for page rendering (password protection)
function promptForPassword(req, res, next) {
  const authToken = req.signedCookies[AUTH_COOKIE_NAME];
  const tokenExpiration = req.signedCookies["token_expiration"];

  if (!authToken || !isValidToken(authToken, tokenExpiration)) {
    // If not authenticated, return HTML snippet with prompt logic
    res.send(`
      <html>
        <body>
          <script>
            const password = prompt("Enter the password");
            if (password) {
              fetch('/api/validate-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
              })
              .then(response => {
                if (response.ok) {
                  window.location.reload();
                } else {
                  alert('Incorrect password. Please try again.');
                  window.location.reload();
                }
              });
            }
          </script>
        </body>
      </html>
    `);
  } else {
    next(); // Proceed to page rendering if authenticated
  }
}

// Middleware for API authentication
function apiAuthentication(req, res, next) {
  const authToken = req.signedCookies[AUTH_COOKIE_NAME];
  const tokenExpiration = req.signedCookies["token_expiration"];

  if (!authToken || !isValidToken(authToken, tokenExpiration)) {
    res.status(401).send("Authentication expired. Please re-enter password.");
  } else {
    next();
  }
}

function isProd() {
  return process.env.ENV === "PROD";
}

// Serve static files (JS, CSS) from the public directory
const apiRouter = express.Router();

// POST route for validating password
apiRouter.post("/api/validate-password", (req, res) => {
  const { password } = req.body;

  if (password === PASSWORD) {
    const token = generateToken();
    const expirationTime = Date.now() + TOKEN_EXPIRATION;

    // Set secure signed cookies
    res.cookie(AUTH_COOKIE_NAME, token, {
      signed: true,
      httpOnly: true,
      maxAge: TOKEN_EXPIRATION,
      secure: isProd(), // Uncomment this when using HTTPS
    });

    res.cookie("token_expiration", expirationTime, {
      signed: true,
      httpOnly: true,
      maxAge: TOKEN_EXPIRATION,
      secure: isProd(), // Uncomment this when using HTTPS
    });

    return res.status(200).send("Password validated");
  } else {
    return res.status(401).send("Invalid password");
  }
});

// Sample API Route (Protected)
apiRouter.get("/api/data", apiAuthentication, (req, res) => {
  return res.json({ data: "This is protected data from the API." });
});

// Use the router in the app
app.use('/', apiRouter);

// Serve static files (JS, CSS) from the public directory
const publicRouter = express.Router();

publicRouter.use(promptForPassword);
publicRouter.use(express.static(publicDir));

publicRouter.get('/', (req, res) => {
  return res.sendFile(path.join(publicDir, 'index.html'));
});

publicRouter.get('/record', (req, res) => {
  return res.sendFile(path.join(publicDir, 'record.html'));
});

// Use the router in the app
app.use('/', publicRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
