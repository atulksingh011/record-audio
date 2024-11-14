const deleteRouter = require("./delete.api");
const listRouter = require("./list.api");
const fetchRouter = require("./fetch.api");
const saveRouter = require("./save.api");
const apiRouter = require("express").Router();

apiRouter.use("/fetch", fetchRouter);
apiRouter.use("/list", listRouter);
apiRouter.use("/save", saveRouter);
apiRouter.use("/delete", deleteRouter)

module.exports = apiRouter;

