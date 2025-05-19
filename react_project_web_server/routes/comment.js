const express = require('express');
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const { getIO, getConnectedUsers } = require('../socket');

const router = express.Router();

/**
 * @route   POST /comments/:id
 * @desc    댓글 작성
 * @access  Private
 */
router.post('/:id', authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const { text, parent_comment_id = null } = req.body;
    const { userId } = req.user;

    if (!text || text.trim() === '') {
        return res.status(400).json({ success: false, message: '댓글을 입력해주세요.' });
    }

    try {
        await db.query(`
            INSERT INTO comments (user_id, post_id, text, parent_comment_id, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `, [userId, postId, text, parent_comment_id || null]);

        // 게시글 작성자 및 썸네일 가져오기
        const [[postInfo]] = await db.query(
            `SELECT p.user_id AS postOwnerId, pi.file_url AS thumbnailUrl
            FROM posts p
            LEFT JOIN post_media pi ON p.post_id = pi.post_id
            WHERE p.post_id = ?
            LIMIT 1`,
            [postId]
        );

        // 타입 판별
        const type = parent_comment_id ? 'mention' : 'comment';

        // 댓글 등록 후
        const mentionedUsernames = [...text.matchAll(/@([\w\d_.-]+)/g)].map(m => m[1]);

        if (mentionedUsernames.length > 0) {
            const [mentionedUsers] = await db.query(
                `SELECT user_id FROM users WHERE username IN (?)`,
                [mentionedUsernames]
            );

            for (const mentioned of mentionedUsers) {
                if (mentioned.user_id !== userId) {
                    const io = getIO();
                    const connectedUsers = getConnectedUsers();
                    const targetSocketId = connectedUsers.get(mentioned.user_id);
                    if (targetSocketId) {
                        io.to(targetSocketId).emit('receiveNotification', {
                            senderId: userId,
                            type: 'mention',
                            post: { post_id: postId },
                            extra: { text }
                        });
                    }

                    await db.query(`
                INSERT INTO notifications (target_user_id, from_user_id, type, post_id, extra, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            `, [
                        mentioned.user_id, userId, 'mention', postId, JSON.stringify({ text })
                    ]);
                }
            }
        }

        res.json({
            success: true,
            message: '등록 완료',
            postOwnerId: postInfo.postOwnerId,
            thumbnailUrl: postInfo.thumbnailUrl,
            type,
            text
        });
    } catch (err) {
        console.error('댓글 등록 실패:', err);
        res.status(500).send('Server Error');
    }
});
/**
 * @route   DELETE /comments/:id
 * @desc    댓글 삭제 (본인만 가능)
 * @access  Private
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    const commentId = req.params.id;
    const { userId } = req.user;

    try {
        // 1. 댓글 소유자 확인
        const [commentRows] = await db.query(
            `SELECT user_id FROM comments WHERE comment_id = ?`,
            [commentId]
        );

        if (commentRows.length === 0) {
            return res.status(404).json({ success: false, message: '댓글이 존재하지 않습니다.' });
        }

        if (commentRows[0].user_id !== userId) {
            return res.status(403).json({ success: false, message: '본인의 댓글만 삭제할 수 있습니다.' });
        }

        // 2. 삭제 실행
        await db.query(`DELETE FROM comments WHERE comment_id = ?`, [commentId]);

        res.json({ success: true, message: '댓글 삭제 완료' });
    } catch (err) {
        console.error('댓글 삭제 실패:', err);
        res.status(500).send('Server Error');
    }
});
/**
 * @route   GET /comments/:id
 * @desc    게시물의 댓글 목록 조회
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    const postId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 30;
    const offset = (page - 1) * size;

    try {
        // 1. 최상위 댓글만 페이징하여 조회 (parent_comment_id IS NULL)
        const [topComments] = await db.query(
            `SELECT 
                c.comment_id,
                c.text,
                c.created_at,
                c.user_id,
                u.username,
                u.profile_image
             FROM comments c
             JOIN users u ON c.user_id = u.user_id
             WHERE c.post_id = ? AND c.parent_comment_id IS NULL
             ORDER BY c.created_at ASC
             LIMIT ? OFFSET ?`,
            [postId, size, offset]
        );

        const topCommentIds = topComments.map(c => c.comment_id);

        // 2. 해당 댓글들의 대댓글 모두 조회
        let repliesMap = {};
        if (topCommentIds.length > 0) {
            const [replies] = await db.query(
                `SELECT 
                    c.comment_id,
                    c.text,
                    c.created_at,
                    c.parent_comment_id,
                    c.user_id,
                    u.username,
                    u.profile_image
                 FROM comments c
                 JOIN users u ON c.user_id = u.user_id
                 WHERE c.parent_comment_id IN (?)`,
                [topCommentIds]
            );

            // 대댓글을 parent_comment_id 기준으로 그룹화
            repliesMap = replies.reduce((acc, cur) => {
                if (!acc[cur.parent_comment_id]) acc[cur.parent_comment_id] = [];
                acc[cur.parent_comment_id].push({
                    commentId: cur.comment_id,
                    text: cur.text,
                    createdAt: cur.created_at,
                    user: {
                        userId: cur.user_id,
                        username: cur.username,
                        profile_image: cur.profile_image
                    }
                });
                return acc;
            }, {});
        }

        // 3. 최상위 댓글에 대댓글 포함시켜 리턴
        const fullComments = topComments.map(c => ({
            commentId: c.comment_id,
            text: c.text,
            createdAt: c.created_at,
            user: {
                userId: c.user_id,
                username: c.username,
                profile_image: c.profile_image
            },
            replies: repliesMap[c.comment_id] || []
        }));

        res.json({ success: true, comments: fullComments });
    } catch (err) {
        console.error('댓글 및 대댓글 조회 실패:', err);
        res.status(500).send('Server Error');
    }
});
module.exports = router;