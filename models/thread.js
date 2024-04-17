"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const threadSchema = new Schema({
  board: { type: String, required: true },
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  replies: [{ type: Schema.Types.ObjectId, ref: "Reply" }],
});

module.exports = mongoose.model("Thread", threadSchema);
