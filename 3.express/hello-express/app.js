const express = require("express");
const nunjucks = require("nunjucks");
const logger = require("morgan");
const bodyParser = require("body-parser");

const admin = require("./routes/admin");
const contacts = require("./routes/contacts");
const { a } = require("../../1.module/myvar");

const app = express();
const port = 4000;
nunjucks.configure("template", {
  autoescape: true,
  express: app,
});

//미들웨어 셋팅
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/uploads", express.static("uploads"));

app.use((req, res, next) => {
  app.locals.isLogin = true;
  next();
});

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

app.use((req, res, next) => {
  res.status(400).render("common/404.html");
});

app.use((req, res, next) => {
  res.status(500).render("common/500.html");
});

app.listen(port, () => {
  console.log("Express listening on port", port);
});
