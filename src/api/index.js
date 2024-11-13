const deleteRouter = require("./delete.api");
const listRouter = require("./list.api");
const recordRouter = require("./record");
const saveRouter = require("./save.api");
const transcribeRouter = require("./transcribe.api");
const apiRouter = require("express").Router();

apiRouter.use("/record", recordRouter);
apiRouter.use("/list", listRouter);
// apiRouter.use("/delete", deleteRouter)
// apiRouter.use("/transcribe", transcribeRouter)

module.exports = apiRouter;

