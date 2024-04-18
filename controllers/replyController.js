"use strict";

const Thread = require("../models/thread");
const Reply = require("../models/reply");

module.exports = {};

async function getReplies(req, res) {
  try {
    const { board } = req.params;
    const { thread_id } = req.query;
    const thread = await Thread.findById(thread_id)
      .select("-reported -delete_password")
      .populate("replies", "-delete_password -reported")
      .exec();
    res.json(thread);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
}

module.exports.getReplies = getReplies;
  
async function createReply(req, res) {
  try {
    const { board } = req.params;
    const { thread_id, text, delete_password } = req.body;
    const thread = await Thread.findById(thread_id);
    const reply = new Reply({ 
      thread_id: thread_id, 
      text:text, 
      delete_password: delete_password,
      created_on: new Date(),
      reported: false
    });

    await reply.save();

    if ( ! thread.replies) {
      thread.replies = [];
    }

    thread.replies.push(reply);
    thread.bumped_on = new Date();
    await thread.save();
    res.redirect(`/b/${board}/${thread_id}`);
  } catch (err) {
    console.log(err);
    res.json(err);
  }
}

module.exports.createReply = createReply;

async function reportReply(req, res) {
  try {
    const { board } = req.params;
    const { thread_id, reply_id } = req.body;
    await Reply.findByIdAndUpdate(reply_id, { reported: true });
    res.send("reported");
  } catch (err) {
    console.log(err);
    res.json(err);
  }
}

module.exports.reportReply = reportReply;

async function deleteReply(req, res) {
  try {
    const { board } = req.params;
    const { thread_id, reply_id, delete_password } = req.body;
    const reply  = await Reply.findById(reply_id);
    if (reply.delete_password === delete_password) {
      reply.text = "[deleted]";
      await reply.save();
      res.send("success");
    } else {
      res.send("incorrect password");
    }
  } catch (err) {
    console.log(err);
    res.json(err);
  }
}

module.exports.deleteReply = deleteReply; 