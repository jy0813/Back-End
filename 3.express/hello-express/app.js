const express = require("express");
const nunjucks = require("nunjucks");
const logger = require("morgan");

const admin = require("./routes/admin");
const contacts = require("./routes/contacts");

const app = express();
const port = 4000;
nunjucks.configure("template", {
  autoescape: true,
  express: app,
});

//미들웨어 셋팅
app.use(logger("dev"));

app.get("/", (request, response) => {
  response.send("hello express");
});

function vipMiddleWare(req, res, next) {
  console.log("최우선 미들웨어");
  next();
}

app.use("/admin", vipMiddleWare, admin);
app.use("/contacts", contacts);

app.get("/jjy", (request, response) => {
  response.send("hello jjy get");
});

app.listen(port, () => {
  console.log("Express listening on port", port);
});
