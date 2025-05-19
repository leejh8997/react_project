const express = require('express');
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const { getIO, getConnectedUsers } = require('../socket');
const router = express.Router();

router.post('/:id', authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const { userId } = req.user;

    try {

        // 게시글 작성자 정보 조회
        const [[{ postOwnerId }]] = await db.query(
            `SELECT user_id AS postOwnerId FROM posts WHERE post_id = ?`,
            [postId]
        );

        // 1. 이미 좋아요 눌렀는지 확인
        const [rows] = await db.query(
            `SELECT * FROM likes WHERE post_id = ? AND user_id = ?`,
            [postId, userId]
        );

        if (rows.length > 0) {
            // 2. 이미 눌렀다면 좋아요 취소
            await db.query(
                `DELETE FROM likes WHERE post_id = ? AND user_id = ?`,
                [postId, userId]
            );
            // 알림 삭제
            await db.query(
                `DELETE FROM notifications 
                WHERE type = 'like' 
                AND from_user_id = ? 
                AND target_user_id = ? 
                AND post_id = ?`,
                [userId, postOwnerId, postId]
            );

            // 🔽 소켓으로 상대방에게 알림 수 감소 신호 전송
            const io = getIO();
            const connectedUsers = getConnectedUsers();
            const targetSocketId = connectedUsers.get(postOwnerId);
            if (targetSocketId) {
                io.to(targetSocketId).emit('decreaseNotificationCount');
            }

            return res.json({ success: true, liked: false });
        } else {
            // 3. 안 눌렀다면 좋아요 추가
            await db.query(
                `INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, NOW())`,
                [postId, userId]
            );

            return res.json({
                success: true,
                liked: true,
                postOwnerId: postOwnerId,
                // thumbnailUrl: postInfo.thumbnailUrl
            });
        }
    } catch (err) {
        console.error('좋아요 토글 실패:', err);
        res.status(500).send('Server Error');
    }
});
module.exports = router;


// /**
//  * @route   DELETE /posts/:id/like
//  * @desc    게시물 좋아요 취소
//  * @access  Private
//  */
// router.delete('/posts/:id/like', authMiddleware, async (req, res) => {
//     const postId = req.params.id;
//     const { userId } = req.user;

//     try {
//         // 1. 좋아요 삭제
//         await db.query(
//             `DELETE FROM likes WHERE user_id = ? AND post_id = ?`,
//             [userId, postId]
//         );

//         // 2. 현재 좋아요 수 조회
//         const [likeResult] = await db.query(
//             `SELECT COUNT(*) AS likeCount FROM likes WHERE post_id = ?`,
//             [postId]
//         );

//         res.json({
//             success: true,
//             message: '좋아요 취소됨',
//             likeCount: likeResult[0].likeCount
//         });
//     } catch (err) {
//         console.error('좋아요 삭제 실패:', err);
//         res.status(500).send('Server Error');
//     }
// });

// /**
//  * @route   POST /posts/:id/like
//  * @desc    게시물에 좋아요 추가
//  * @access  Private
//  */
// router.post('/posts/:id/like', authMiddleware, async (req, res) => {
//     const postId = req.params.id;
//     const { userId } = req.user;

//     try {
//         // 1. 중복 좋아요 방지
//         await db.query(
//             `INSERT IGNORE INTO likes (user_id, post_id, created_at)
//              VALUES (?, ?, NOW())`,
//             [userId, postId]
//         );

//         // 2. 현재 좋아요 수 조회
//         const [likeResult] = await db.query(
//             `SELECT COUNT(*) AS likeCount FROM likes WHERE post_id = ?`,
//             [postId]
//         );

//         res.json({
//             success: true,
//             message: '좋아요 추가됨',
//             likeCount: likeResult[0].likeCount
//         });
//     } catch (err) {
//         console.error('좋아요 추가 실패:', err);
//         res.status(500).send('Server Error');
//     }
// });