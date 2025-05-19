const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const multer = require('multer');
const path = require('path');

// 업로드 디렉토리 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const upload = multer({ storage });


/**
 * @route   POST /dm/conversations
 * @desc    DM 대화방 생성 (1:1 또는 그룹)
 * @access  Private
 */
router.post('/conversations', authMiddleware, async (req, res) => {
  const myId = req.user.userId;
  const { participants, isGroup, title } = req.body;

  // 내 ID를 포함한 전체 유저 배열
  const allParticipants = [...new Set([myId, ...participants])];

  if (!isGroup && allParticipants.length !== 2) {
    return res.status(400).json({ success: false, message: '1:1 대화는 정확히 두 명이어야 합니다.' });
  }

  try {
    let conversationId;

    if (!isGroup) {
      // 1:1 → 기존 대화방 있는지 확인
      const [existing] = await db.query(`
                SELECT c.conversation_id
                FROM dm_conversations c
                JOIN dm_participants p1 ON c.conversation_id = p1.conversation_id
                JOIN dm_participants p2 ON c.conversation_id = p2.conversation_id
                WHERE c.is_group = false
                AND p1.user_id = ? AND p2.user_id = ?`,
        [myId, participants[0]]
      );

      if (existing.length > 0) {
        return res.json({ success: true, conversationId: existing[0].conversation_id, message: '기존 대화방 반환' });
      }
    }

    // 새 대화방 생성
    const [result] = await db.query(
      `INSERT INTO dm_conversations (title, is_group) VALUES (?, ?)`,
      [title || null, isGroup]
    );
    conversationId = result.insertId;

    // 참여자 추가
    const values = allParticipants.map(uid => [conversationId, uid]);
    await db.query(
      `INSERT INTO dm_participants (conversation_id, user_id) VALUES ?`,
      [values]
    );

    res.json({ success: true, conversationId, message: '새 대화방 생성 완료' });
  } catch (err) {
    console.error('대화방 생성 실패:', err);
    res.status(500).send('Server Error');
  }
});
//대화방 목록 불러오기 API
router.get('/rooms', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId가 필요합니다.' });
  }

  try {
    const [rooms] = await db.query(`
      SELECT r.room_id, r.is_group, r.room_name, m1.content AS lastMessage, m1.type AS lastType, m1.created_at AS lastTime
      FROM chat_room_members rm
      JOIN chat_rooms r ON rm.room_id = r.room_id
      LEFT JOIN (
        SELECT room_id, content, type, created_at
        FROM chat_messages
        WHERE (room_id, created_at) IN (
          SELECT room_id, MAX(created_at)
          FROM chat_messages
          GROUP BY room_id
        )
      ) m1 ON r.room_id = m1.room_id
      WHERE rm.user_id = ?
      ORDER BY m1.created_at DESC
    `, [userId]);

    for (let room of rooms) {
      const [members] = await db.query(`
        SELECT u.user_id, u.username, u.profile_image
        FROM chat_room_members rm
        JOIN users u ON rm.user_id = u.user_id
        WHERE rm.room_id = ?
      `, [room.room_id]);

      // participants 전체 추가
      room.participants = members;

      // 1:1 채팅일 경우 상대방 정보도 따로 세팅
      const partner = members.find(m => m.user_id != userId);
      room.partnerId = partner?.user_id;
      room.username = partner?.username;
      room.profile = partner?.profile_image || '/uploads/default_profile.png';
    }

    res.json({ success: true, rooms });
  } catch (err) {
    console.error('채팅방 목록 불러오기 실패:', err);
    res.status(500).send('Server Error');
  }
});
// /**
//  * @route   GET /dm/conversations
//  * @desc    내가 참여 중인 대화방 목록 조회
//  * @access  Private
//  */
// router.get('/conversations', authMiddleware, async (req, res) => {
//     const myId = req.user.userId;

//     try {
//         // 1. 내가 참여한 대화방 ID들
//         const [rooms] = await db.query(`
//             SELECT 
//                 c.conversation_id,
//                 c.is_group,
//                 c.title
//             FROM dm_conversations c
//             JOIN dm_participants p ON c.conversation_id = p.conversation_id
//             WHERE p.user_id = ?
//             ORDER BY c.created_at DESC
//         `, [myId]);

//         const conversations = [];

//         for (const room of rooms) {
//             // 2. 마지막 메시지
//             const [lastMsg] = await db.query(`
//                 SELECT text, created_at
//                 FROM dm_messages
//                 WHERE conversation_id = ?
//                 ORDER BY created_at DESC
//                 LIMIT 1
//             `, [room.conversation_id]);

//             // 3. 참여자 정보 (본인 제외)
//             const [members] = await db.query(`
//                 SELECT u.user_id, u.username, u.profile_image
//                 FROM dm_participants p
//                 JOIN users u ON p.user_id = u.user_id
//                 WHERE p.conversation_id = ? AND u.user_id != ?
//             `, [room.conversation_id, myId]);

//             conversations.push({
//                 conversationId: room.conversation_id,
//                 isGroup: room.is_group,
//                 title: room.title,
//                 lastMessage: lastMsg[0]?.text || null,
//                 lastSentAt: lastMsg[0]?.created_at || null,
//                 participants: members.map(m => ({
//                     userId: m.user_id,
//                     username: m.username,
//                     profile_image: m.profile_image || '/uploads/default_profile.png'
//                 }))
//             });
//         }

//         res.json({ success: true, conversations });
//     } catch (err) {
//         console.error('대화방 목록 조회 실패:', err);
//         res.status(500).send('Server Error');
//     }
// });
// 채팅방 메시지 불러오기
router.get('/messages', async (req, res) => {
  const { roomId } = req.query;

  if (!roomId) {
    return res.status(400).json({ success: false, message: 'roomId가 필요합니다.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT message_id, room_id, sender_id, content, type, created_at
       FROM chat_messages
       WHERE room_id = ?
       ORDER BY created_at ASC
       LIMIT 50`,
      [roomId]
    );

    res.json({ success: true, messages: rows });
  } catch (err) {
    console.error('메시지 불러오기 실패:', err);
    res.status(500).send('Server Error');
  }
});
// /**
//  * @route   GET /dm/conversations/:id/messages
//  * @desc    대화방 메시지 목록 조회
//  * @access  Private
//  */
// router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
//     const myId = req.user.userId;
//     const conversationId = req.params.id;

//     try {
//         // 1. 대화방 참여 여부 확인
//         const [check] = await db.query(
//             `SELECT * FROM dm_participants WHERE conversation_id = ? AND user_id = ?`,
//             [conversationId, myId]
//         );

//         if (check.length === 0) {
//             return res.status(403).json({ success: false, message: '이 대화방에 참여한 적이 없습니다.' });
//         }

//         // 2. 메시지 조회
//         const [messages] = await db.query(`
//             SELECT 
//                 m.message_id,
//                 m.text,
//                 m.created_at,
//                 u.user_id,
//                 u.username,
//                 u.profile_image,
//                 COALESCE(rs.is_read, false) AS is_read
//             FROM dm_messages m
//             JOIN users u ON m.sender_id = u.user_id
//             LEFT JOIN dm_read_status rs ON rs.message_id = m.message_id AND rs.user_id = ?
//             WHERE m.conversation_id = ?
//             ORDER BY m.created_at ASC
//         `, [myId, conversationId]);

//         res.json({
//             success: true,
//             messages: messages.map(msg => ({
//                 messageId: msg.message_id,
//                 text: msg.text,
//                 createdAt: msg.created_at,
//                 isRead: !!msg.is_read,
//                 sender: {
//                     userId: msg.user_id,
//                     username: msg.username,
//                     profile_image: msg.profile_image || '/uploads/default_profile.png'
//                 }
//             }))
//         });
//     } catch (err) {
//         console.error('메시지 조회 실패:', err);
//         res.status(500).send('Server Error');
//     }
// });
// 이미지 or 동영상 업로드
router.post('/upload', upload.array('file'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded' });
  }

  const baseUrl = 'http://localhost:3005';
  const filesInfo = req.files.map(file => ({
    fileUrl: `${baseUrl}/uploads/${file.filename}`,
    type: file.mimetype.startsWith('video') ? 'video' : 'image'
  }));

  res.json({ success: true, files: filesInfo });
});

/**
 * @route   POST /dm/conversations/:id/messages
 * @desc    대화방 메시지 전송
 * @access  Private
 */
router.post('/conversations/:id/messages', authMiddleware, async (req, res) => {
  const myId = req.user.userId;
  const conversationId = req.params.id;
  const { text } = req.body;

  if (!text || text.trim() === '') {
    return res.status(400).json({ success: false, message: '메시지 내용을 입력해주세요.' });
  }

  try {
    // 1. 참여 여부 확인
    const [check] = await db.query(
      `SELECT * FROM dm_participants WHERE conversation_id = ? AND user_id = ?`,
      [conversationId, myId]
    );

    if (check.length === 0) {
      return res.status(403).json({ success: false, message: '이 대화방에 참여한 적이 없습니다.' });
    }

    // 2. 메시지 저장
    const [result] = await db.query(
      `INSERT INTO dm_messages (conversation_id, sender_id, text) VALUES (?, ?, ?)`,
      [conversationId, myId, text]
    );
    const messageId = result.insertId;

    // 3. 읽음 상태: 보낸 사람 외 모든 참여자에 대해 is_read = false
    const [otherUsers] = await db.query(
      `SELECT user_id FROM dm_participants WHERE conversation_id = ? AND user_id != ?`,
      [conversationId, myId]
    );

    if (otherUsers.length > 0) {
      const readStatusValues = otherUsers.map(user => [messageId, user.user_id, false]);
      await db.query(
        `INSERT INTO dm_read_status (message_id, user_id, is_read) VALUES ?`,
        [readStatusValues]
      );
    }

    res.json({
      success: true,
      messageId,
      message: '메시지 전송 완료'
    });
  } catch (err) {
    console.error('메시지 전송 실패:', err);
    res.status(500).send('Server Error');
  }
});
router.post('/read', async (req, res) => {
  const { roomId, userId } = req.body;

  if (!roomId || !userId) {
    return res.status(400).json({ success: false, message: 'roomId와 userId 필요' });
  }

  try {
    // 1. 안 읽은 메시지 가져오기
    const [rows] = await db.query(`
      SELECT message_id, read_by
      FROM chat_messages
      WHERE room_id = ?
    `, [roomId]);

    // 2. 읽지 않은 메시지 필터링 후 업데이트
    for (const msg of rows) {
      let readList = [];

      try {
        readList = JSON.parse(msg.read_by || '[]');
      } catch (e) { }

      if (!readList.includes(String(userId))) {
        readList.push(String(userId));

        await db.query(`
          UPDATE chat_messages SET read_by = ? WHERE message_id = ?
        `, [JSON.stringify(readList), msg.message_id]);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('읽음 처리 실패:', err);
    res.status(500).send('Server Error');
  }
});
// /**
//  * @route   PUT /dm/messages/:id/read
//  * @desc    메시지 읽음 처리
//  * @access  Private
//  */
// router.put('/messages/:id/read', authMiddleware, async (req, res) => {
//     const myId = req.user.userId;
//     const messageId = req.params.id;

//     try {
//         // 1. 해당 메시지가 존재하는지 확인
//         const [messages] = await db.query(
//             `SELECT conversation_id FROM dm_messages WHERE message_id = ?`,
//             [messageId]
//         );

//         if (messages.length === 0) {
//             return res.status(404).json({ success: false, message: '해당 메시지를 찾을 수 없습니다.' });
//         }

//         // 2. 사용자 참여 여부 확인
//         const [check] = await db.query(
//             `SELECT * FROM dm_participants WHERE conversation_id = ? AND user_id = ?`,
//             [messages[0].conversation_id, myId]
//         );

//         if (check.length === 0) {
//             return res.status(403).json({ success: false, message: '이 대화방에 참여하지 않았습니다.' });
//         }

//         // 3. 읽음 처리
//         const [updated] = await db.query(
//             `UPDATE dm_read_status SET is_read = true WHERE message_id = ? AND user_id = ?`,
//             [messageId, myId]
//         );

//         res.json({
//             success: true,
//             message: '읽음 처리 완료'
//         });
//     } catch (err) {
//         console.error('읽음 처리 실패:', err);
//         res.status(500).send('Server Error');
//     }
// });
/**
 * @route   DELETE /dm/messages/:id
 * @desc    메시지 삭제 (is_deleted = true 로 처리)
 * @access  Private
 */
router.delete('/messages/:id', authMiddleware, async (req, res) => {
  const myId = req.user.userId;
  const messageId = req.params.id;

  try {
    // 1. 해당 메시지가 본인의 것인지 확인
    const [rows] = await db.query(
      `SELECT sender_id FROM dm_messages WHERE message_id = ?`,
      [messageId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: '메시지를 찾을 수 없습니다.' });
    }

    if (rows[0].sender_id !== myId) {
      return res.status(403).json({ success: false, message: '삭제 권한이 없습니다.' });
    }

    // 2. 삭제 처리
    await db.query(
      `UPDATE dm_messages SET is_deleted = true WHERE message_id = ?`,
      [messageId]
    );

    res.json({ success: true, message: '메시지 삭제 완료' });
  } catch (err) {
    console.error('메시지 삭제 실패:', err);
    res.status(500).send('Server Error');
  }
});
/**
 * @route   DELETE /dm/conversations/:id
 * @desc    나만 대화방에서 나가기 (참여자 목록에서 제거)
 * @access  Private
 */
router.delete('/conversations/:id', authMiddleware, async (req, res) => {
  const myId = req.user.userId;
  const conversationId = req.params.id;

  try {
    // 1. 참여 여부 확인
    const [check] = await db.query(
      `SELECT * FROM dm_participants WHERE conversation_id = ? AND user_id = ?`,
      [conversationId, myId]
    );

    if (check.length === 0) {
      return res.status(403).json({ success: false, message: '이 대화방에 참여하지 않았습니다.' });
    }

    // 2. 참여자 목록에서 제거
    await db.query(
      `DELETE FROM dm_participants WHERE conversation_id = ? AND user_id = ?`,
      [conversationId, myId]
    );

    res.json({ success: true, message: '대화방에서 나갔습니다.' });
  } catch (err) {
    console.error('대화방 나가기 실패:', err);
    res.status(500).send('Server Error');
  }
});
// routes/dm.js
router.get('/search', async (req, res) => {
  const keyword = req.query.keyword;
  if (!keyword || keyword.trim() === '') {
    return res.json({ success: true, users: [] });
  }

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, full_name AS name, profile_image
      FROM users
      WHERE username LIKE ? OR full_name LIKE ?
      LIMIT 20
    `, [`%${keyword}%`, `%${keyword}%`]);

    res.json({ success: true, users: rows });
  } catch (err) {
    console.error('유저 검색 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});
// routes/dm.js
router.post('/create-room', async (req, res) => {
  const { userIds, creatorId } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0 || !creatorId) {
    return res.status(400).json({ success: false, message: '필수 정보 누락' });
  }

  const participantIds = [...new Set([...userIds, creatorId])];

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
    // 1. 채팅방 생성 (is_group = 1)
    const [roomResult] = await conn.query(`
      INSERT INTO chat_rooms (is_group, room_name, created_at)
      VALUES (?, NULL, NOW())
    `, [1]);

    const roomId = roomResult.insertId;

    // 2. 참여자들 chat_room_members에 추가
    const values = participantIds.map(uid => [roomId, uid]);
    await conn.query(`
      INSERT INTO chat_room_members (room_id, user_id)
      VALUES ?
    `, [values]);

    // 3. 참여자 정보 불러오기
    const [participants] = await conn.query(`
      SELECT user_id, username, profile_image
      FROM users
      WHERE user_id IN (?)
    `, [participantIds]);

    await conn.commit();

    res.json({
      success: true,
      room: {
        room_id: roomId,
        is_group: 1,
        room_name: null,
        participants
      }
    });
  } catch (err) {
    await conn.rollback();
    console.error('채팅방 생성 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  } finally {
    conn.release();
  }
});

module.exports = router;