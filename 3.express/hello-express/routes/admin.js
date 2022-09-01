const express = require("express");
const router = express.Router();
const login = false;

function testMiddleWare(req, res, next) {
  console.log("첫번째 미들웨어");
  next();
}

function testMiddleWare2(req, res, next) {
  console.log("두번째 미들웨어");
  next();
}

function loginRequired(req, res, next) {
  if (!login) {
    res.redirect("/");
  } else {
    next();
  }
}

router.get("/", testMiddleWare, testMiddleWare2, (req, res) => {
  res.send("admin 이후 url");
});

router.get("/products", (req, res) => {
  // res.send("admin products");
  res.render("admin/products.html", {
    message: "hello!!!!!!!!!!!!",
    online: "online!!",
    desc: "<h2>태그가 출력됩니다.</h2>",
  });
});

router.get("/products/write", (req, res) => {
  res.render("admin/write.html");
});

router.post("/products/write", (req, res) => {
  res.send(req.body);
});

module.exports = router;
