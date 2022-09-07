const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const { ObjectId } = require("mongodb");
require("dotenv").config();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
let db;

const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(
  process.env.DB_URL,
  { useUnifiedTopology: true },
  (err, client) => {
    if (err) {
      return console.log(err);
    }

    db = client.db("todo");

    app.listen(process.env.PORT, () => {
      console.log("listening on 5000");
    });
  }
);

app.get("/", (req, res) => {
  // __dirname은 현재 파일의 경로를 뜻합니다.
  res.render("index.ejs");
});

app.get("/write", (req, res) => {
  // __dirname은 현재 파일의 경로를 뜻합니다.
  res.render("write.ejs");
});

//input에 정보는 어딨나???
//npm install body-parser
//bodyParser는 요청 데이터 해석을 쉽게 도와줌

//1. body-parser가 필요함
//2. form 데이터의 경우 input들에 name이 필요함
//3. req.body라 하면 요청햇던 form에 적힌 데이터 수신 가능

/**
 * list 로 GET 요청으로 접속하면
 * 실제 Db에 저장된 데이터들이 들어이는 HTML을 보여줌
 */

app.get("/list", (req, res) => {
  //db에 저장된 collection 안의 모든 데이터를 꺼내렴
  db.collection("test")
    .find()
    .toArray((err, result) => {
      console.log(result);
      res.render("list.ejs", { datas: result });
    });
});

app.get("/detail/:id", (req, res) => {
  req.params.id = parseInt(req.params.id);
  db.collection("test").findOne({ _id: req.params.id }, (err, result) => {
    console.log(result);
    res.render("detail.ejs", { data: result });
  });
});

app.get("/edit/:id", (req, res) => {
  req.params.id = parseInt(req.params.id);
  db.collection("test").findOne({ _id: req.params.id }, (err, result) => {
    console.log(result);
    res.render("edit.ejs", { edit: result });
  });
});

app.put("/edit", (req, res) => {
  db.collection("test").updateOne(
    { _id: parseInt(req.body.id) },
    { $set: { 할일: req.body.title, 날짜: req.body.date } },
    (err, result) => {
      console.log("수정완료");
      res.redirect("/list");
    }
  );
});

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");

app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/fail", (req, res) => {
  res.render("fail.ejs");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/fail",
  }),
  (req, res) => {
    res.json(req.user);
    console.log(req.user);
  }
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "id",
      passwordField: "pw",
      session: true,
      passReqToCallback: false,
    },
    function (id, pw, done) {
      //console.log(입력한아이디, 입력한비번);
      db.collection("login").findOne({ id: id }, function (err, result) {
        if (err) return done(err);

        if (!result)
          return done(null, false, { message: "존재하지않는 아이디요" });
        if (pw == result.pw) {
          return done(null, result);
        } else {
          return done(null, false, { message: "비번틀렸어요" });
        }
      });
    }
  )
);

// 로그인 성공시 발동
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 로그인 시 개인정보를 db에서 찾는 역할
passport.deserializeUser((id, done) => {
  db.collection("login").findOne({ id: id }, (err, result) => {
    done(null, result);
  });
});

function loginCheck(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.send("로그인 안됨");
  }
}

app.post("/chatroom", loginCheck, (req, res) => {
  let saveData = {
    title: "chatroom",
    member: [ObjectId(req.body.targetId), req.user._id],
    date: new Date(),
  };
  db.collection("chatroom")
    .insertOne(saveData)
    .then((result) => {
      res.send("성공");
    })
    .catch((error) => {});
});

app.get("/chat", loginCheck, (req, res) => {
  db.collection("chatroom")
    .find({ member: req.user._id })
    .toArray()
    .then((result) => {
      res.render("chat.ejs", { data: result });
    });
});

app.post("/register", (req, res) => {
  db.collection("login").insertOne(
    { id: req.body.id, pw: req.body.pw },
    (err, result) => {
      res.redirect("/");
    }
  );
});

app.post("/message", loginCheck, (req, res) => {
  let saveData = {
    parent: req.body.parent,
    content: req.body.content,
    userid: req.user._id,
    date: new Date(),
  };
  db.collection("message")
    .insertOne(saveData)
    .then(() => {
      console.log("db저장성공");
      res.send("db저장성공");
    })
    .catch(() => {
      console.log("실패");
    });
});

app.get("/message/:parentid", loginCheck, function (req, res) {
  res.writeHead(200, {
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });
  db.collection("message")
    .find({ parent: req.params.parentid })
    .toArray()
    .then((result) => {
      res.write("event: test\n");
      res.write(`data: ${JSON.stringify(result)}\n\n`);
    });

  const pipeline = [{ $match: { "fullDocument.parent": req.params.parentid } }];

  const collection = db.collection("message");
  const changeStream = collection.watch(pipeline);
  changeStream.on("change", (result) => {
    res.write("event: test\n");
    res.write(`data: ${JSON.stringify([result.fullDocument])}\n\n`);
  });
});

app.post("/add", (req, res) => {
  req.user._id;
  res.render("write.ejs");
  db.collection("counter").findOne({ name: "게시물갯수" }, (err, result) => {
    console.log(result.totalPost);
    let totalPost = result.totalPost;
    let saveData = {
      할일: req.body.title,
      날짜: req.body.date,
      _id: totalPost + 1,
      작성자: req.user._id,
    };
    db.collection("test").insertOne(saveData, (err, result) => {
      console.log("저장완료");
      //counter 라는 콜렉션에 있는 totalpost 라는 항목도 1 증가 시켜야함;
      db.collection("counter").updateOne(
        { name: "게시물갯수" },
        { $inc: { totalPost: 1 } },
        (err, result) => {
          if (err) {
            return console.log(err + 입니다);
          }
        }
      );
    });
  });
});

app.delete("/delete", (req, res) => {
  console.log("삭제요청 들어옴");
  console.log(req.body);
  req.body._id = parseInt(req.body._id);
  let deleteData = { _id: req.body._id, 작성자: req.user._id };
  db.collection("counter").findOne({ name: "게시물갯수" }, (err, result) => {
    db.collection("test").deleteOne(deleteData, (err, result) => {
      console.log("삭제완료");
      res.status(200).send({ message: "성공했습니다" });
      db.collection("counter").updateOne(
        { name: "게시물갯수" },
        { $inc: { totalPost: -1 } },
        (err, result) => {
          if (err) {
            return console.log(err + 입니다);
          }
        }
      );
    });
  });
});

app.get("/mypage", loginCheck, (req, res) => {
  console.log(req.user);
  res.render("mypage.ejs", { 사용자: req.user });
});

app.get("/search", (req, res) => {
  console.log(req.query.value);
  db.collection("test")
    .aggregate([
      {
        $search: {
          index: "titleSearch",
          text: {
            query: req.query.value,
            path: "할일",
          },
        },
      },
    ])
    .toArray((err, result) => {
      console.log(result);
      res.render("search.ejs", { datas: result });
    });
});

app.use("/shop", require("./routes/shop.js"));

app.use("/board/sub", require("./routes/bode.js"));

let multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/image");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  // fileFilter: (req, file, callback) => {
  //   var ext = path.extname(file.originalname);
  //   if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") {
  //     return callback(new Error("PNG, JPG만 업로드하세요"));
  //   }
  //   callback(null, true);
  // },
  // limits: {
  //   fileSize: 1024 * 1024,
  // },
});

const upload = multer({ storage });

app.get("/upload", (req, res) => {
  res.render("upload.ejs");
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.send("업로드 완료");
});

app.get("/image/:img", (req, res) => {
  res.sendFile(__dirname + "/public/image/" + req.params.img);
});
