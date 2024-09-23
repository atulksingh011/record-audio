const express = require("express");
const publicRouter = express.Router();
const path = require("path");
const CONSTANTS = require("./constants");
const { isValidToken } = require("./utils");
const publicDir = path.join(__dirname, "../", "public");

publicRouter.use(promptForPassword);
publicRouter.use(express.static(publicDir));

publicRouter.get("/", (req, res) => {
  return res.sendFile(path.join(publicDir, "index.html"));
});

publicRouter.get("/record", (req, res) => {
  return res.sendFile(path.join(publicDir, "record.html"));
});

module.exports = publicRouter;

// Middleware for page rendering (password protection)
function promptForPassword(req, res, next) {
  const authToken = req.signedCookies[CONSTANTS.AUTH_COOKIE_NAME];
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
