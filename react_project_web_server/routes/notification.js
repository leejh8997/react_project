const express = require('express');
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const router = express.Router();
const { getIO, getConnectedUsers } = require('../socket');

// GET /notifications?userId=xxx
router.get('/', async (req, res) => {
  const userId = req.query.userId;
  try {
    const [rows] = await db.query(`
      SELECT n.*, 
             u.user_id AS sender_user_id,
             u.username AS sender_username,
             u.profile_image AS sender_profile_image,
             (SELECT file_url FROM post_media pi WHERE pi.post_id = n.post_id LIMIT 1) AS file_url,
             (SELECT media_type FROM post_media pi WHERE pi.post_id = n.post_id LIMIT 1) AS media_type
      FROM notifications n
      LEFT JOIN users u ON n.from_user_id = u.user_id
      WHERE n.target_user_id = ?
      ORDER BY n.created_at DESC
    `, [userId]);
    console.error('rows 조회:', rows);
    res.json({ success: true, notifications: rows });
  } catch (err) {
    console.error('알림 조회 실패:', err);
    res.status(500).json({ success: false, message: '알림 불러오기 실패' });
  }
});

// 🔔 안 읽은 알림 개수 조회
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    console.log('🔐 요청 도착! user:', req.user);
    const [rows] = await db.query(
      `SELECT COUNT(*) AS count FROM notifications WHERE target_user_id = ? AND is_read = 0`,
      [req.user.userId]
    );
    console.log("rows=====>", rows);
    console.log("rows[0]=====>", rows[0]);
    res.json({ success: true, count: rows[0].count });
  } catch (err) {
    console.error('❌ 알림 수 조회 오류:', err);
    res.status(500).json({ success: false, message: '알림 수 조회 실패' });
  }
});

// 🔔 알림 전체 읽음 처리
router.put('/mark-all-read', authMiddleware, async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read = 1 WHERE target_user_id = ? AND is_read = 0`,
      [req.user.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('❌ 알림 읽음 처리 오류:', err);
    res.status(500).json({ success: false, message: '알림 읽음 처리 실패' });
  }
});

// [PUT] /notifications/:notificationId/accept - 팔로우 요청 수락
router.put('/:id/accept', authMiddleware, async (req, res) => {
  const notificationId = req.params.id;
  const targetUserId = req.user.userId; // 현재 로그인한 유저 (알림을 받은 사람)

  try {
    // 1. 알림에서 요청자(sender) ID 조회
    const [[noti]] = await db.query(`
      SELECT from_user_id FROM notifications WHERE notification_id = ?
    `, [notificationId]);

    if (!noti) {
      return res.status(404).json({ success: false, message: '알림 없음' });
    }

    const senderId = noti.from_user_id;

    // 2. 팔로우 관계 생성
    await db.query(`
      INSERT IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)
    `, [senderId, targetUserId]);

    // 3. 알림 타입 변경 (follow-request → follow)
    await db.query(`
      UPDATE notifications SET type = 'follow' WHERE notification_id = ?
    `, [notificationId]);

    // ✅ 4. 이전에 reject된 알림이 있다면 삭제
    await db.query(`
      DELETE FROM notifications
      WHERE type = 'follow-reject'
        AND target_user_id = ?
        AND from_user_id = ?
    `, [senderId, targetUserId]);

    res.json({ success: true });
  } catch (err) {
    console.error('팔로우 수락 오류:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// [DELETE] /notifications/:notificationId/reject - 팔로우 요청 거절
router.delete('/:id/reject', authMiddleware, async (req, res) => {
  const notificationId = req.params.id;
  const rejectorUserId = req.user.userId;

  try {
    // 1. 알림에서 요청 보낸 사람 ID 조회
    const [[noti]] = await db.query(`
      SELECT from_user_id FROM notifications
      WHERE notification_id = ? AND type = 'follow-request'
    `, [notificationId]);

    if (!noti) {
      return res.status(404).json({ success: false, message: '팔로우 요청 알림 없음' });
    }

    const requesterId = noti.from_user_id;

    // 2. 알림 삭제
    await db.query(`DELETE FROM notifications WHERE notification_id = ?`, [notificationId]);

    // 3. 소켓으로 상대방에게 follow-reject 알림 전송
    const [[rejector]] = await db.query(`
      SELECT user_id, username, profile_image FROM users WHERE user_id = ?
    `, [rejectorUserId]);

    const enrichedNotification = {
      type: 'follow-reject',
      sender: {
        user_id: rejector.user_id,
        username: rejector.username,
        profile_image: rejector.profile_image
      },
      post: null,             // follow-reject는 post 관련 없음
      extra: {},              // 통일성을 위해 항상 존재
      created_at: new Date().toISOString(),
      read: false
    };

    const io = getIO();
    const connectedUsers = getConnectedUsers();
    const targetSocketId = connectedUsers.get(requesterId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('receiveNotification', enrichedNotification);
    }

    // 4. follow-reject 알림 DB 저장 (선택사항)
    await db.query(`
      INSERT INTO notifications (target_user_id, from_user_id, type, post_id, extra, created_at)
      VALUES (?, ?, 'follow-reject', NULL, '{}', NOW())
    `, [requesterId, rejectorUserId]);

    res.json({ success: true });
  } catch (err) {
    console.error('팔로우 요청 거절 처리 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

module.exports = router;