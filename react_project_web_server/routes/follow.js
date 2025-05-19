const express = require('express');
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

// // 팔로우
// router.post('/', authMiddleware, async (req, res) => {
//   const followerId = req.user.userId;       // 로그인한 사용자
//   const { targetUserId } = req.body;        // 팔로우 대상 사용자

//   if (!targetUserId || followerId === targetUserId) {
//     return res.status(400).json({ success: false, message: '잘못된 요청' });
//   }

//   try {
//     // 중복 방지: 이미 팔로우 중인지 확인
//     const [existing] = await db.query(
//       `SELECT * FROM follows WHERE follower_id = ? AND followee_id = ?`,
//       [followerId, targetUserId]
//     );

//     if (existing.length > 0) {
//       return res.json({ success: false, message: '이미 팔로우 중입니다.' });
//     }

//     // 팔로우 등록
//     await db.query(
//       `INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)`,
//       [followerId, targetUserId]
//     );

//     res.json({ success: true, message: '팔로우 완료' });
//   } catch (err) {
//     console.error('🔥 팔로우 에러:', err);
//     res.status(500).json({ success: false });
//   }
// });

// 강제 팔로워 삭제: 상대방이 나를 팔로우 중일 때 끊기
router.delete('/remove-follower', authMiddleware, async (req, res) => {
  const myUserId = req.user.userId;
  const { followerUserId } = req.body;

  try {
    await db.query(
      `DELETE FROM follows WHERE follower_id = ? AND followee_id = ?`,
      [followerUserId, myUserId] // ✅ 방향 반대!
    );

    res.json({ success: true });
  } catch (err) {
    console.error('🔥 팔로워 삭제 실패:', err);
    res.status(500).json({ success: false });
  }
});
module.exports = router;