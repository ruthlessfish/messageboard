"use strict";

const {
  getThreads,
  createThread,
  reportThread,
  deleteThread
} = require("../controllers/threadController");

const {
  getReplies,
  createReply,
  reportReply,
  deleteReply
} = require("../controllers/replyController");

module.exports = async function (app) {
  app
    .route("/api/threads/:board")
      .get(getThreads)
      .post(createThread)
      .put(reportThread)
      .delete(deleteThread);

  app
    .route("/api/replies/:board")
    .get(getReplies)
    .post(createReply)
    .put(reportReply)
    .delete(deleteReply);
};
