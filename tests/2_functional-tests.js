const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const { test, suite } = require("mocha");
const Thread = require("../models/thread");
const Reply = require("../models/reply");
const { deleteReply } = require("../controllers/replyController");

const chaiServer = chai.use(chaiHttp);

var delThreadID;
var delReplyID;
suite("Functional Tests", function () {
  before(async () => {
    await Thread.deleteMany();
    await Reply.deleteMany();

    const newThread = new Thread({
      board: "test",
      text: "foo bar baz",
      delete_password: "testpassword",
      created_on: new Date(),
      bumped_on: new Date(),
      replies: [],
    });
    newThread.save();

    delThreadID = newThread._id;

    const newReply = new Reply({
      thread_id: delThreadID,
      text: "foo bar baz",
      delete_password: "test delete",
      created_on: new Date(),
    });
    newReply.save();
    delReplyID = newReply._id;
  });
  suite("API ROUTING FOR /api/threads/:board", function () {
    suite("POST", function () {
      test("Post test", function (done) {
        chaiServer
          .request(server)
          .post("/api/threads/test2")
          .send({
            text: "test text",
            delete_password: "test",
          })
          .end(function (err, res) {
            // console.log(res);
            assert.equal(res.status, 200);

            done();
          });
      });
    });

    suite("GET", function () {
      test("GET Test", function (done) {
        chaiServer
          .request(server)
          .get("/api/threads/test2")
          .query({})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], "board");
            assert.property(res.body[0], "text");
            assert.property(res.body[0], "_id");
            delThreadID = res.body[0]._id;
            assert.property(res.body[0], "created_on");
            assert.property(res.body[0], "bumped_on");
            assert.property(res.body[0], "replies");
            done();
          });
      });
    });

    suite("DELETE", function () {
      test("DELETE Test with wrong password", function (done) {
        chaiServer
          .request(server)
          .delete("/api/threads/test2")
          .set("Content-Type", "application/json")
          .send({
            thread_id: delThreadID,
            delete_password: "testwrongpassword",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            // console.log(res.text);
            assert.equal(res.text, "incorrect password");
            done();
          });
      });

      test("DELETE Test with right password", function (done) {
        chaiServer
          .request(server)
          .delete("/api/threads/test2")
          .set("Content-Type", "application/json")
          .send({
            thread_id: delThreadID,
            delete_password: "test",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            // console.log(res.text);
            assert.equal(res.text, "success");
            done();
          });
      });
    });

    suite("PUT", function () {
      //Need to create a new thread to test
      test("PUT Test", function (done) {
        chaiServer
          .request(server)
          .post("/api/threads/test3")
          .send({
            text: "test text",
            delete_password: "test",
          })
          .end(function () {});

        //Get the thread id
        chaiServer
          .request(server)
          .get("/api/threads/test3")
          .query({})
          .end(function (err, res) {
            delThreadID = res.body[0]._id;
          });

        //do the put request
        chaiServer
          .request(server)
          .put("/api/threads/test3")
          .send({
            thread_id: delThreadID,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", function () {
    suite("POST", function () {
      test("POST a reply", function (done) {
        chaiServer
          .request(server)
          .post("/api/replies/test3")
          .send({
            text: "test reply",
            delete_password: "test delete",
            thread_id: delThreadID,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            done();
          });
      });
    });

    suite("GET", function () {
      test("GET the replies", function (done) {
        chaiServer
          .request(server)
          .get("/api/replies/test3?thread_id=" + delThreadID)
          .end(function (err, res) {
            assert.equal(res.status, 200);
            // assert.isObject(res.body);
            done();
          });
      });
    });

    suite("PUT", function () {
      test("PUT a reply", function (done) {
        chaiServer
          .request(server)
          .put("/api/replies/test3")
          .send({
            thread_id: delThreadID,
            reply_id: delReplyID,
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
          });
      });
    });

    suite("DELETE", function () {
      test("DELETE a reply incorrect password", function (done) {
        chaiServer
          .request(server)
          .delete("/api/replies/test3")
          .set("Content-Type", "application/json")
          .send({
            thread_id: delThreadID,
            reply_id: delReplyID,
            delete_password: "wrong password",
          })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
          });
      });
      test("DELETE a reply correct password", function (done) {
        chaiServer
          .request(server)
          .delete("/api/replies/test3")
          .set("Content-Type", "application/json")
          .send({
            thread_id: delThreadID,
            reply_id: delReplyID,
            delete_password: "test delete",
          })
          .end(function (err1, res1) {
            assert.equal(res1.status, 200);
            console.log(
              "DELETE a reply correct password",
              delThreadID,
              delReplyID
            );
            assert.equal(
              res1.text,
              "success",
              `thread: ${delThreadID}, replyid: ${delReplyID}`
            );

            done();
          });
      });
    });
  });
});
