const express = require("express");
const nunjucks = require("nunjucks");

const admin = require("./routes/admin");
const contacts = require("./routes/contacts");

const app = express();
const port = 4000;
nunjucks.configure("template", {
  autoescape: true,
  express: app,
});

app.get("/", (request, response) => {
  response.send("hello express");
});

app.use("/admin", admin);
app.use("/contacts", contacts);

app.get("/jjy", (request, response) => {
  response.send("hello jjy get");
});

app.listen(port, () => {
  console.log("Express listening on port", port);
});
