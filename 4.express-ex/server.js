const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let db;

const MongoClient = require("mongodb").MongoClient;
MongoClient.connect(
  "mongodb+srv://admin:qazqaz123!@cluster0.avjmzuj.mongodb.net/?retryWrites=true&w=majority",
  { useUnifiedTopology: true },
  (에러, client) => {
    if (에러) {
      return console.log(에러);
    }

    db = client.db("todo");
    // db.collection("test").insertOne(
    //   { _id: 0, 할일: "퇴근", 날짜: 2022 - 09 - 01 },
    //   (에러, 결과) => {
    //     console.log("저장완료");
    //   }
    // );

    app.listen(5000, () => {
      console.log("listening on 5000");
    });
  }
);

app.get("/", (요청, 응답) => {
  // __dirname은 현재 파일의 경로를 뜻합니다.
  응답.sendFile(__dirname + "/index.html");
});

app.get("/write", (요청, 응답) => {
  // __dirname은 현재 파일의 경로를 뜻합니다.
  응답.sendFile(__dirname + "/write.html");
});

//input에 정보는 어딨나???
//npm install body-parser
//bodyParser는 요청 데이터 해석을 쉽게 도와줌

//1. body-parser가 필요함
//2. form 데이터의 경우 input들에 name이 필요함
//3. 요청.body라 하면 요청햇던 form에 적힌 데이터 수신 가능

app.post("/add", (요청, 응답) => {
  응답.sendFile(__dirname + "/write.html");
  db.collection("counter").findOne({ name: "게시물갯수" }, (에러, 결과) => {
    console.log(결과.totalPost);
    let 총게시물갯수 = 결과.totalPost;
    db.collection("test").insertOne(
      { 할일: 요청.body.title, 날짜: 요청.body.date, _id: 총게시물갯수 + 1 },
      (에러, 결과) => {
        console.log("저장완료");
        //counter 라는 콜렉션에 있는 totalpost 라는 항목도 1 증가 시켜야함;
        db.collection("counter").updateOne(
          { name: "게시물갯수" },
          { $inc: { totalPost: 1 } },
          (에러, 결과) => {
            if (에러) {
              return console.log(에러 + 입니다);
            }
          }
        );
      }
    );
  });
});

/**
 * list 로 GET 요청으로 접속하면
 * 실제 Db에 저장된 데이터들이 들어이는 HTML을 보여줌
 */

app.get("/list", (요청, 응답) => {
  //db에 저장된 collection 안의 모든 데이터를 꺼내렴
  db.collection("test")
    .find()
    .toArray((에러, 결과) => {
      console.log(결과);
      응답.render("list.ejs", { 데이터들: 결과 });
    });
});

app.delete("/delete", (요청, 응답) => {
  console.log(요청.body);
  요청.body._id = parseInt(요청.body._id);
  db.collection("test").deleteOne(요청.body, (에러, 결과) => {
    console.log("삭제완료");
    응답.status(200).send({ message: "성공했습니다." });
  });
});

app.get("/detail/:id", (요청, 응답) => {
  요청.params.id = parseInt(요청.params.id);
  db.collection("test").findOne({ _id: 요청.params.id }, (에러, 결과) => {
    console.log(결과);
    응답.render("detail.ejs", { data: 결과 });
  });
});
