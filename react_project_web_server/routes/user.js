const express = require('express');
const db = require('../db');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../authMiddleware');
const { getIO, getConnectedUsers } = require('../socket');
const bcrypt = require('bcrypt');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });
const router = express.Router();

/**
 * @route   GET /users/:username
 * @desc    특정 유저의 프로필 조회 (닉네임 기준)
 * @access  Public
 */
router.get('/:username', authMiddleware, async (req, res) => {
  const { username } = req.params;
  const myId = req.user?.userId; // 로그인 유저

  try {
    const [[user]] = await db.query(`
        SELECT 
          user_id,
          username,
          email,
          full_name,
          bio,
          profile_image,
          (SELECT COUNT(*) FROM posts WHERE user_id = u.user_id) AS postCount,
          (SELECT COUNT(*) FROM follows WHERE followee_id = u.user_id) AS followerCount,
          (SELECT COUNT(*) FROM follows WHERE follower_id = u.user_id) AS followingCount
        FROM users u
        WHERE username = ?
      `, [username]);

    if (!user) return res.status(404).json({ success: false, message: '유저 없음' });

    // 나 자신이 아닌 경우에만 isFollowing 여부 확인
    let isFollowing = false;
    console.log("--------------------", myId && user.user_id !== myId);
    if (myId && user.user_id !== myId) {
      const [followRows] = await db.query(
        `SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ? LIMIT 1`,
        [myId, user.user_id]
      );
      isFollowing = followRows.length > 0;
    }

    res.json({
      success: true,
      user: {
        ...user,
        isFollowing
      }
    });
  } catch (err) {
    console.error('유저 정보 조회 실패:', err);
    res.status(500).send('Server Error');
  }
});
// /**
//  * @route   GET /users/:username/posts
//  * @desc    특정 유저의 게시물 목록 조회
//  * @access  Public (현재는 공개 계정만)
//  */
// router.get('/:username/posts', async (req, res) => {
//     const username = req.params.username;

//     try {
//         // 1. 유저 존재 확인
//         const [userRows] = await db.query(
//             `SELECT user_id FROM users WHERE username = ?`,
//             [username]
//         );

//         if (userRows.length === 0) {
//             return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
//         }

//         const userId = userRows[0].user_id;

//         // 2. 게시물 + 대표 이미지(여러 이미지 중 첫 번째만) 조회
//         const [postRows] = await db.query(
//             `SELECT 
//                 p.post_id,
//                 p.created_at,
//                 pi.image_url AS thumbnail
//             FROM posts p
//             LEFT JOIN post_images pi ON pi.image_id = (
//                 SELECT image_id
//                 FROM post_images
//                 WHERE post_id = p.post_id
//                 ORDER BY image_id ASC
//                 LIMIT 1
//             )
//             WHERE p.user_id = ?
//             ORDER BY p.created_at DESC`,
//             [userId]
//         );

//         res.json({
//             success: true,
//             posts: postRows.map(post => ({
//                 postId: post.post_id,
//                 createdAt: post.created_at,
//                 img_url: post.thumbnail
//             }))
//         });
//     } catch (err) {
//         console.error('유저 게시물 목록 조회 실패:', err);
//         res.status(500).send('Server Error');
//     }
// });
/**
 * @route   PUT /users/me
 * @desc    내 정보 수정 (bio, username, profile_image)
 * @access  Private (JWT 필요)
 */
router.put('/me', authMiddleware, async (req, res) => {
  const { username, bio } = req.body;
  const { userId } = req.user;

  try {
    await db.query(
      `UPDATE users SET username = ?, bio = ? WHERE user_id = ?`,
      [username, bio, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('프로필 업데이트 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});
router.put('/profile', authMiddleware, upload.single('profile_image'), async (req, res) => {
  const { userId } = req.user;
  const { username, bio } = req.body;
  const file = req.file;

  try {
    // 1. 프로필 이미지 URL 구성
    let profileImage = null;
    if (file) {
      const baseUrl = req.protocol + '://' + req.get('host');
      profileImage = baseUrl + '/uploads/' + file.filename;
    }

    // 2. username 중복 검사
    if (username) {
      const [[exists]] = await db.query(
        `SELECT COUNT(*) AS cnt FROM users WHERE username = ? AND user_id != ?`,
        [username, userId]
      );
      if (exists.cnt > 0) {
        return res.status(400).json({ success: false, message: '이미 사용 중인 사용자 이름입니다.' });
      }
    }

    // 3. 동적 UPDATE SQL 구성
    const updateFields = [];
    const params = [];

    if (username) {
      updateFields.push('username = ?');
      params.push(username);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      params.push(bio);
    }
    if (profileImage) {
      updateFields.push('profile_image = ?');
      params.push(profileImage);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: '수정할 항목이 없습니다.' });
    }
    params.push(userId);
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
      params
    );
    // 4. 수정된 내용 응답
    res.json({
      success: true,
      message: '프로필이 수정되었습니다.',
      updated: {
        username,
        bio,
        profile_image: profileImage
      }
    });
  } catch (err) {
    console.error('프로필 수정 실패:', err);
    res.status(500).send('Server Error');
  }
});
router.get('/check-username', async (req, res) => {
  const { username } = req.query;
  try {
    const [rows] = await db.query(
      `SELECT COUNT(*) AS count FROM users WHERE username = ?`,
      [username]
    );
    res.json({ success: true, isDuplicate: rows[0].count > 0 });
  } catch (err) {
    console.error('유저네임 중복 확인 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

router.put('/change-password', authMiddleware, async (req, res) => {
  const { password } = req.body;
  const { userId } = req.user;

  try {
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      `UPDATE users SET password = ? WHERE user_id = ?`,
      [hashed, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('비밀번호 변경 실패:', err);
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});
// 팔로워 목록
router.get('/:username/followers', authMiddleware, async (req, res) => {
  const { username } = req.params;
  const loginUserId = req.user.userId;

  try {
    const [[targetUser]] = await db.query(
      `SELECT user_id FROM users WHERE username = ?`,
      [username]
    );
    if (!targetUser) return res.json({ success: false, message: '유저 없음' });

    const [rows] = await db.query(
      `SELECT u.user_id, u.username, u.full_name, u.profile_image,
              EXISTS (
                SELECT 1 FROM follows f2
                WHERE f2.follower_id = ? AND f2.followee_id = u.user_id
              ) AS isFollowed
            FROM follows f
            JOIN users u ON f.follower_id = u.user_id
            WHERE f.followee_id = ?`,
      [loginUserId, targetUser.user_id]
    );

    res.json({ success: true, users: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});
// 팔로잉 목록
router.get('/:username/followings', authMiddleware, async (req, res) => {
  const { username } = req.params;
  const loginUserId = req.user.userId;

  const [[targetUser]] = await db.query(
    `SELECT user_id FROM users WHERE username = ?`,
    [username]
  );
  if (!targetUser) return res.json({ success: false, message: '유저 없음' });

  const [rows] = await db.query(
    `SELECT u.user_id, u.username, u.full_name, u.profile_image,
            EXISTS (
              SELECT 1 FROM follows f2
              WHERE f2.follower_id = ? AND f2.followee_id = u.user_id
            ) AS isFollowed
     FROM follows f
     JOIN users u ON f.followee_id = u.user_id
     WHERE f.follower_id = ?`,
    [loginUserId, targetUser.user_id]
  );

  res.json({ success: true, users: rows });
});
// 언팔로우
router.delete('/unfollow', authMiddleware, async (req, res) => {
  const followerId = req.user.userId;
  const { targetUserId } = req.body;
  console.log("팔로워아이디", followerId);
  try {
    // 1. 팔로우 관계 삭제
    const [result] = await db.query(
      `DELETE FROM follows WHERE follower_id = ? AND followee_id = ?`,
      [followerId, targetUserId]
    );

    // 2. 팔로우 알림 삭제
    await db.query(`
            DELETE FROM notifications 
            WHERE type IN ('follow', 'follow-request')
            AND target_user_id = ?
            AND from_user_id = ?
        `, [targetUserId, followerId]);

    // 🔽 소켓으로 상대방에게 알림 수 감소 신호 전송
    const io = getIO();
    const connectedUsers = getConnectedUsers();
    const targetSocketId = connectedUsers.get(targetUserId);
    if (targetSocketId) {
      io.to(targetSocketId).emit('decreaseNotificationCount');
    }

    if (result.affectedRows > 0) {
      res.json({ success: true, message: '언팔로우 성공' });
    } else {
      res.json({ success: false, message: '언팔로우 대상 없음' });
    }


  } catch (err) {
    console.error('🔥 언팔로우 에러:', err);
    res.status(500).json({ success: false });
  }
});
// 프로필에서 저장된 게시물 불러올 때 사용
router.get('/:userId/bookmarks', async (req, res) => {
  const { userId } = req.params;

  try {
    const [posts] = await db.query(`
            SELECT 
                p.post_id,
                (SELECT file_url FROM post_media pi WHERE pi.post_id = p.post_id LIMIT 1) AS file_url,
                (SELECT media_type FROM post_media pi WHERE pi.post_id = p.post_id LIMIT 1) AS media_type,
                p.caption,
                p.created_at,
                u.user_id,
                u.username,
                u.profile_image,
                IFNULL(c.comment_count, 0) AS comment_count,
                IFNULL(l.like_count, 0) AS like_count,
                IF(ul.user_id IS NULL, FALSE, TRUE) AS is_liked
            FROM posts p
            JOIN users u ON p.user_id = u.user_id
            LEFT JOIN (
                SELECT post_id, COUNT(*) AS comment_count FROM comments GROUP BY post_id
            ) c ON p.post_id = c.post_id
            LEFT JOIN (
                SELECT post_id, COUNT(*) AS like_count FROM likes GROUP BY post_id
            ) l ON p.post_id = l.post_id
            LEFT JOIN (
                SELECT post_id, user_id FROM likes WHERE user_id = ?
            ) ul ON p.post_id = ul.post_id
	        JOIN bookmarks b ON b.post_id = p.post_id
            WHERE b.user_id = ?
            ORDER BY p.created_at DESC
            `, [userId, userId, userId]);

    res.json({ success: true, posts: posts });
  } catch (err) {
    console.error('북마크 불러오기 실패:', err);
    res.status(500).json({ success: false });
  }
});


module.exports = router;