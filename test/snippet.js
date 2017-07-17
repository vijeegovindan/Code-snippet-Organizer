const request          = require("supertest");
const assert           = require("assert");
const app              = require("../server");
const models           = require("../models");
var expect             = require('chai').expect;
var should             = require('should');

// runs before all tests in this block

before("Database Setup", function(done) {
   let newSnippet1 = {
     userid:1,
     title:"snippet-1",
     body:"body section a text field, body section a text field, body section a text field",
     notes:"additional notes text, additional notes text, additional notes text",
     language: "javascript",
     tags: ["development, deployment"]
   }
   models.snippets.create(newSnippet1).then( function(snippet) {
   Snippet1 = snippet;
   });

   let newSnippet2 = {
     userid:2,
     title:"snippet-2",
     body:"body section a text field, body section a text field, body section a text field",
     notes:"additional notes text, additional notes text, additional notes text",
     language: "ruby",
     tags: ["gem, rails"]
   }
   models.snippets.create(newSnippet2).then( function(snippet) {
   Snippet2 = snippet;
   });
   done();
});
describe("POST /api/signup'", function () {
 it("should be able to sign up", function (done) {
    request(app)
      .get('/api/signup')
      .send({
        username:'vijee',
        password:'password123'
      })
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(function(res){
        assert.equal(res.body.status, "success");
      })
      done();
   })
   it("check for credentials", function (done) {
      request(app)
        .get('/api/signup')
        .send({
          username:'vijee'
        })
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(function(res){
          assert.equal(res.body.status, "failure");
        })
        done();
     })
});
describe("GET '/api/login'", function () {
 it("should be able to login", function (done) {
    request(app)
      .get('/api/login')
      .send({
        username:'vijee',
        password:'password123'
      })
      .expect(200)
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(function(res){
        assert.equal(res.body.status, "success");
      })
      done();
   })
   it("check for credentials", function (done) {
      request(app)
        .get('/api/signup')
        .send({
          password:'password123'
        })
        .expect(200)
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(function(res){
          assert.equal(res.body.status, "failure");
        })
        done();
     })
});
 describe("POST /api/snippets", function () {
  it("should return all the snippets site-wide", function (done) {
     request(app)
       .get('/api/snippets')
       .expect(200)
       .expect("Content-Type", "application/json; charset=utf-8")
       .expect(function(res){
         assert.equal(res.body.status, "success");
         assert(res.body.data.length == 2);
       })
       done();
    })
 });
 describe("POST /api/snippets", function () {
   it("should throw a error when a title is not provided", function (done){
      request(app)
      .post('/api/snippets')
      .send({
        userid:2,
        body:"Lorem Ipsum Lorem IpsumLorem IpsumLorem Ipsum",
        notes:"notes notesnotesnotesnotesnotesnotes",
        language:"Java",
        tags:["springs boot"]
      })
      .expect(function(res){
        assert.equal(res.body.status, "failure");
        assert(res.body.data.length == 0);
      });
      done();
   })

   it("should throw a error when the description is empty", function (done){
      request(app)
      .post('/api/snippets')
      .send({
        userid:2,
        title:"snippet-4",
        notes:"notes notesnotesnotesnotesnotesnotes",
        language:"Java",
        tags:["springs boot"]
      })
      .expect(function(res){
        assert.equal(res.body.status, "failure");
        assert(res.body.data.length == 0);
      });
      done();
   })

   it("should throw a error when username is not in session", function (done){
      request(app)
      .post('/api/snippets')
      .send({
        title:"snippet-4",
        body:"Lorem Ipsum Lorem IpsumLorem IpsumLorem Ipsum",
        notes:"notes notesnotesnotesnotesnotesnotes",
        language:"Java",
        tags:["springs boot"]
      })
      .expect(function(res){
        assert.equal(res.body.status, "failure");
        assert(res.body.data.length == 0);
      });
      done();
   })

   it("User should be able to post a snippet", function (done) {
     request(app)
       .post('/api/snippets')
       .set('Content-Type', 'application/x-www-form-urlencoded')
       .send({
         userid:1,
         title:"title3",
         body:"Lorem Ipsum Lorem IpsumLorem IpsumLorem Ipsum",
         notes:"notes notesnotesnotesnotesnotesnotes",
         language:"Java",
         tags:["springs boot"]
       })
       .expect(200)
       .expect("Content-Type", "application/json; charset=utf-8")
       .expect(function(res){
         res.body.data[0].should.include.keys('title', 'body', 'notes', 'language', 'tags');
         res.body.data[0].tags.should.be.a('array');
         assert.equal(res.body.status, "success");
         assert(res.body.data.length == 1);
       })
       done();
  })
 });

describe("GET /api/snippets/langs/:lang", function () {
  it("Get all the snippets based on language", function (done) {
     request(app)
       .get("/api/snippets/langs/ruby")
       .expect(200)
       .expect("Content-Type", "application/json; charset=utf-8")
       .expect(function (res) {
          assert.equal(res.body.status, "success");
          assert(res.body.data.length > 0);
       })
      done();
  })

  it("Get a page not found", function (done) {
     request(app)
       .get("/api/snippets/langs")
       .expect(404)
       done();
  })
});
describe("GET /api/snippets/tags/:tag", function () {
  it("Get all the snippets based on tags", function (done) {
     request(app)
       .get("/api/snippets/tags/development")
       .expect(200)
       .expect("Content-Type", "application/json; charset=utf-8")
       .expect(function (res) {
          assert.equal(res.body.status, "success");
          assert(res.body.data.length > 0);
       })
      done();
  })
  it("Get a page not found if tag not provided", function (done) {
     request(app)
       .get("/api/snippets/tags")
       .expect(404)
       done();
  })
});

describe("GET /api/snippets/user", function () {
 it("should return all the snippets of session User", function (done) {
    request(app)
      .get('/api/snippets')
      .expect(200)
      .send({userid:1})
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(function(res){
        assert.equal(res.body.status, "success");
        assert(res.body.data.length > 1);
      })
      done();
   })
   it("if session expires", function (done) {
      request(app)
        .get("/api/snippets")
        .send({userid:""})
        .expect(404)
        done();
   })
});
describe("GET /api/snippets/user/langs/:lang", function () {
  it("Get user specific snippets based on language", function (done) {
     request(app)
       .get("/api/snippets/user/langs/ruby")
       .send({userid:1})
       .expect(200)
       .expect("Content-Type", "application/json; charset=utf-8")
       .expect(function (res) {
          assert.equal(res.body.status, "success");
          assert(res.body.data.length > 0);
       })
      done();
  })
  it("if session expires", function (done) {
     request(app)
       .get("/api/snippets/user/langs/ruby")
       .send({userid:""})
       .expect(404)
       done();
  })
  it("Get a page not found if lang not provided", function (done) {
     request(app)
       .get("/api/snippets/user/langs/")
       .expect(404)
       done();
  })
});
describe("GET /api/snippets/user/tags/:tag", function () {
  it("Get user specific snippets based on tags", function (done) {
     request(app)
       .get("/api/snippets/user/tags/development")
       .send({userid:1})
       .expect(200)
       .expect("Content-Type", "application/json; charset=utf-8")
       .expect(function (res) {
          assert.equal(res.body.status, "success");
          assert(res.body.data.length > 0);
       })
      done();
  })
  it("if session expires", function (done) {
     request(app)
       .get("/api/snippets/user/tags/development")
       .send({userid:""})
       .expect(404)
       done();
  })
  it("Get a page not found if tag not provided", function (done) {
     request(app)
       .get("/api/snippets/user/tags")
       .expect(404)
       done();
  })
});
