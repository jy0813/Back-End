const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("contacts 페이지");
});

router.get("/list", (req, res) => {
  res.send("/contacts/list 페이지");
});
module.exports = router;
