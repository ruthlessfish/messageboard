"use strict";

const Thread = require("../models/thread");

module.exports = {};

async function createThread(req, res, next) {
  try {
    const { board } = req.params;
    const { text, delete_password } = req.body;
    const newThread = new Thread({ 
      board: board, 
      text: text, 
      delete_password: delete_password,
      created_on: new Date(),
      bumped_on: new Date(),
      replies: []
    });
    await newThread.save();
    res.redirect(`/b/${board}`);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
}

module.exports.createThread = createThread;

async function getThreads(req, res, next) {
  try {
    const { board } = req.params;
    const { thread_id } = req.query;
    if (thread_id) {
      const thread = await Thread.findById(thread_id)
        .select("-reported -delete_password")
        .populate("replies", "-delete_password -reported")
        .exec();
      res.json(thread);
    } else {
      const threads = await Thread.find({ board })
        .sort({ bumped_on: -1 })
        .limit(10)
        .select("-reported -delete_password")
        .populate("replies", "-delete_password -reported")
        .sort({'bumped_on': -1})
        .exec();
      threads.forEach(thread => {
        thread.replies = thread.replies.slice(0,3);
      });
      res.json(threads);
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
}

module.exports.getThreads = getThreads;

async function reportThread(req, res, next) {
  try {
    const { board } = req.params;
    const { thread_id } = req.body;
    await Thread.findByIdAndUpdate(thread_id, { reported: true });
    res.send("reported");
  } catch (err) {
    console.log(err);
    res.json(err);
  }
}

module.exports.reportThread = reportThread;

async function deleteThread(req, res, next) {
  try {
    const { board } = req.params;
    const { thread_id, delete_password } = req.body;
    const thread = await Thread.findById(thread_id);
    if (thread.delete_password === delete_password) {
      await Thread.findByIdAndDelete(thread_id);
      res.send("success");
    } else {
      res.send("incorrect password");
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
}

module.exports.deleteThread = deleteThread;