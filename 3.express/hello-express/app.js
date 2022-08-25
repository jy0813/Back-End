const express = require("express");

const app = express();
const port = 4000;

app.get("/", (request, response) => {
  response.send("hello express");
});

app.get("/jjy", (request, response) => {
  response.send("hello jjy get");
});

app.listen(port, () => {
  console.log("Express listening on port", port);
});
