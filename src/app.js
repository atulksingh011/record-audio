require("dotenv").config();
require("dotenv").config({ path: ".env.prod" });

require("./s3");

const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const publicRouter = require("./pages.api");
const validateRouter = require("./validate.api");
const apiRouter = require("./api");
const { apiAuthentication } = require("./utils");
const CONSTANTS = require("./constants");
const { initializeDatabase, startPeriodicUpload } = require("./db");
const app = express();

// Middleware
app.use(cookieParser(CONSTANTS.SECRET_KEY));
app.use(bodyParser.json());

app.use("/api/validate-password", validateRouter);
// app.use("/api", apiAuthentication, apiRouter);
app.use("/api", apiRouter);
app.use("/", publicRouter);

initializeDatabase()
  .then(() => {
    startPeriodicUpload();

    // Start the server
    app.listen(CONSTANTS.PORT, () => {
      console.log(`Server running on http://localhost:${CONSTANTS.PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error initializing the database:", error);
  });
