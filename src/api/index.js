const deleteRouter = require("./delete.api");
const listRouter = require("./list.api");
const saveRouter = require("./save.api");
const apiRouter = require("express").Router();

apiRouter.use("/save", saveRouter)
apiRouter.use("/list", listRouter)
apiRouter.use("/delete", deleteRouter)

module.exports = apiRouter;

