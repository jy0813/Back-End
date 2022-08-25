const http = require("http");

http
  .createServer((request, response) => {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.write("Hello Server");
    response.end();
  })
  .listen(4000);

/**
 * @http 상태코드
 * @1XX 조건부응답
 * @2XX 응답성공
 * @3XX 리다이렉션
 * @4XX 요청오류 (ex 404 Not Found)
 * @5xx 서버오류
 */
