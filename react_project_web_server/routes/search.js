const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * @route   GET /search
 * @desc    사용자 또는 게시글 검색
 * @access  Public
 */
router.get('/', async (req, res) => {
    const q = req.query.q;
    const type = req.query.type || 'user'; // 기본값 'user'

    if (!q || q.trim() === '') {
        return res.status(400).json({ success: false, message: '검색어를 입력해주세요.' });
    }

    try {
        if (type === 'user') {
            const [users] = await db.query(
                `SELECT user_id, username, full_name, profile_image, bio
                 FROM users
                 WHERE username LIKE ? OR full_name LIKE ?
                 LIMIT 20`,
                [`%${q}%`, `%${q}%`]
            );

            return res.json({
                success: true,
                type: 'user',
                users: users.map(user => ({
                    userId: user.user_id,
                    username: user.username,
                    full_name: user.full_name,
                    profile_image: user.profile_image || 'http://localhost:3005/uploads/default_profile.png',
                    bio: user.bio || ''
                }))
            });
        } else if (type === 'post') {
            const [posts] = await db.query(
                `SELECT p.post_id, p.caption, u.username, u.profile_image
                 FROM posts p
                 JOIN users u ON p.user_id = u.user_id
                 WHERE p.caption LIKE ?
                 ORDER BY p.created_at DESC
                 LIMIT 20`,
                [`%${q}%`]
            );

            return res.json({
                success: true,
                type: 'post',
                posts: posts.map(post => ({
                    post_id: post.post_id,
                    caption: post.caption,
                    username: post.username,
                    profile_image: post.profile_image || '/uploads/default_profile.png'
                }))
            });
        } else {
            return res.status(400).json({ success: false, message: '유효하지 않은 검색 타입입니다.' });
        }
    } catch (err) {
        console.error('검색 실패:', err);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /search/mention
 * @desc    댓글 작성 시 @mention을 위한 유저 검색
 * @access  Private (토큰 필요)
 */
router.get('/mention', async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword) {
    return res.status(400).json({ success: false, message: 'keyword가 필요합니다.' });
  }

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, full_name, profile_image
      FROM users
      WHERE username LIKE ? OR full_name LIKE ?
      ORDER BY username
      LIMIT 10
    `, [`${keyword}%`, `%${keyword}%`]);

    return res.json({ success: true, users: rows });
  } catch (err) {
    console.error('유저 검색 실패:', err);
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
});

module.exports = router;