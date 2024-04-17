"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const replySchema = new Schema({
  thread_id: { type: String, required: true },
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
});

module.exports = mongoose.model("Reply", replySchema);
