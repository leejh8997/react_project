const express = require('express');
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../authMiddleware');

const router = express.Router();
const ACCESS_SECRET = 'show-me-the-money';
const REFRESH_SECRET = 'show-me-the-refresh';

// 쿠키 파서 등록 필요 (Express app에서 app.use(cookieParser())도 설정해야 함)


// 회원가입
router.post('/signup', async (req, res) => {
    const { email, password, username, fullName } = req.body;

    try {
        const [existing] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.json({ success: false, message: '이미 등록된 이메일입니다.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(
            `INSERT INTO users (email, password, username, full_name, bio, profile_image, created_at)
       VALUES (?, ?, ?, ?, NULL, NULL, NOW())`,
            [email, hashedPassword, username, fullName]
        );

        res.json({ success: true, message: '회원가입 성공!' });
    } catch (err) {
        console.error('회원가입 에러:', err);
        res.status(500).send('Server Error');
    }
});

// 로그인 + Access / Refresh 토큰 발급
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [user] = await db.query(
            `SELECT user_id, email, username, password, profile_image, bio FROM users WHERE email = ?`,
            [email]
        );

        if (user.length === 0) return res.json({ success: false, message: '등록되지 않은 이메일입니다.' });

        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) return res.json({ success: false, message: '비밀번호가 틀렸습니다.' });

        const payload = {
            userId: user[0].user_id,
            email: user[0].email,
            username: user[0].username,
            profileImage: user[0].profile_image
        };

        const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
        console.log('리프레쉬토큰', refreshToken);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,        // 개발 환경에서는 false (HTTPS 시 true)
            sameSite: 'Lax',      // 또는 'None' (이 경우 secure: true 필수)
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: '로그인 성공!',
            token: accessToken,
            user: {
                userId: user[0].user_id,
                email: user[0].email,
                username: user[0].username,
                profile_image: user[0].profile_image,
                bio: user[0].bio
            }
        });
    } catch (err) {
        console.error('로그인 에러:', err);
        res.status(500).send('Server Error');
    }
});

// JWT 인증 사용자 정보
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        const [user] = await db.query(
            `SELECT user_id, email, username, profile_image, bio FROM users WHERE user_id = ?`,
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        res.json({
            success: true,
            user: {
                userId: user[0].user_id,
                email: user[0].email,
                username: user[0].username,
                profile_image: user[0].profile_image,
                bio: user[0].bio
            }
        });
    } catch (err) {
        console.error('내 정보 조회 실패:', err);
        res.status(500).send('Server Error');
    }
});

// 토큰 재발급
router.post('/refresh', (req, res) => {
    const token = req.cookies.refreshToken;
    console.log(token);
    if (!token) return res.status(401).json({ success: false, message: '리프레시 토큰 없음' });

    try {
        const decoded = jwt.verify(token, REFRESH_SECRET);
        const newAccessToken = jwt.sign({
            userId: decoded.userId,
            email: decoded.email,
            username: decoded.username
        }, ACCESS_SECRET, { expiresIn: '10m' });

        res.json({ success: true, token: newAccessToken });
    } catch (err) {
        console.error('토큰 리프레시 실패:', err);
        res.status(403).json({ success: false, message: '유효하지 않은 리프레시 토큰' });
    }
});

module.exports = router;
