const express = require('express');
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { postId } = req.body;

  try {
    const [[existing]] = await db.query(
      'SELECT bookmark_id FROM bookmarks WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );

    if (existing) {
      // 삭제
      await db.query('DELETE FROM bookmarks WHERE bookmark_id = ?', [existing.bookmark_id]);
      return res.json({ success: true, bookmarked: false });
    } else {
      // 추가
      await db.query('INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)', [userId, postId]);
      return res.json({ success: true, bookmarked: true });
    }
  } catch (err) {
    console.error('북마크 토글 실패:', err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;