const mysql = require('mysql2');

const pool = mysql.createPool({
    // host: 'database-1.cbi0oiea6bzs.ap-northeast-2.rds.amazonaws.com',
    host: 'localhost',
    user: 'root',
    password: 'test1234',
    database: 'project' // db 이름
});

// promise 기반으로 사용할 수 있게 변환
const promisePool = pool.promise();
module.exports = promisePool;