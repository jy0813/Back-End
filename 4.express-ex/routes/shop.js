const router = require("express").Router();

function loginCheck(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("로그인 안됨");
  }
}

//모든 url에 적용할 미들웨어
router.use(loginCheck);

router.get("/shirts", function (req, res) {
  res.send("셔츠 파는 페이지입니다.");
});

router.get("/pants", function (req, res) {
  응답.send("바지 파는 페이지입니다.");
});

module.exports = router;
