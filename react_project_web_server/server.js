const express = require('express');
const cors = require('cors');
const http = require('http');
const session = require('express-session');
const path = require('path');
const db = require('./db');
const cookieParser = require('cookie-parser');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const postRouter = require('./routes/post');
const commentRouter = require('./routes/comment');
const likeRouter = require('./routes/like');
const followRouter = require('./routes/follow');
const notificationRouter = require('./routes/notification');
const searchRouter = require('./routes/search');
const dmRouter = require('./routes/dm');
const bookmarkRouter = require('./routes/bookmarks');

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', "http://52.78.171.225"],
  credentials: true,
}));

const server = http.createServer(app);
const { initSocket } = require('./socket');
initSocket(server);



app.use(session({
  secret: 'test1234',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60,
  }
}));

// 📌 정적 파일
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 📌 라우터 연결
app.use('/auth', authRouter);                   // 회원가입/로그인
app.use('/users', userRouter);                  // 프로필, 내 정보
app.use('/posts', postRouter);                  // 게시물
app.use('/comments', commentRouter);               // 게시물 > 댓글
app.use('/likes', likeRouter);                  // 게시물 > 좋아요
app.use('/follow', followRouter);                // 사용자 > 팔로우
app.use('/notifications', notificationRouter);  // 알림
app.use('/search', searchRouter);               // 검색
app.use('/dm', dmRouter);
app.use('/bookmarks', bookmarkRouter); 

server.listen(3005, () => {
  console.log('서버 실행 중! (with socket.io)');
});