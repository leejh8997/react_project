const express = require('express');
const db = require('../db');
const authMiddleware = require('../authMiddleware');
const multer = require('multer');
const path = require('path');
const { getIO, getConnectedUsers } = require('../socket');

const router = express.Router();
// uploads 폴더에 저장, 파일명은 타임스탬프+원본명
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext);
        cb(null, `${Date.now()}-${base}${ext}`);
    }
});

const upload = multer({ storage });

/**
 * @route   GET /posts/feed
 * @desc    팔로우한 유저들의 게시물 피드 가져오기
 * @access  Private (JWT 필요)
 */
router.get('/feed', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.user;
        console.log('🔐 요청 도착! user:', req.user);
        const [feed] = await db.query(
            `SELECT 
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
                IF(ul.user_id IS NULL, FALSE, TRUE) AS is_liked,
                EXISTS (
                    SELECT 1 FROM bookmarks b WHERE b.user_id = ? AND b.post_id = p.post_id
                ) AS is_bookmarked
            FROM posts p
            JOIN users u ON p.user_id = u.user_id
            LEFT JOIN (
                SELECT post_id, COUNT(*) AS comment_count
                FROM comments
                GROUP BY post_id
            ) c ON p.post_id = c.post_id
            LEFT JOIN (
                SELECT post_id, COUNT(*) AS like_count
                FROM likes
                GROUP BY post_id
            ) l ON p.post_id = l.post_id
            LEFT JOIN (
                SELECT post_id, user_id
                FROM likes
                WHERE user_id = ?
            ) ul ON p.post_id = ul.post_id 
            WHERE p.user_id IN (
                SELECT followee_id FROM follows WHERE follower_id = ?
                UNION
                SELECT ? AS followee_id
            )
            ORDER BY p.created_at DESC`,
            [userId, userId, userId, userId]
        );

        res.json({
            success: true,
            feed: feed
        });
    } catch (err) {
        console.error('피드 조회 실패:', err);
        res.status(500).send('Server Error');
    }
});
/**
 * @route   GET /posts/explore
 * @desc    전체 게시물 탐색 (로그인 여부 상관 없음)
 * @access  Public
 */
// 전체 게시글 리스트 (공개용)
router.get('/explore', authMiddleware, async (req, res) => {
    const viewerId = req.user.userId;

    try {
        const [posts] = await db.query(`
      SELECT 
        p.post_id,
        (SELECT file_url FROM post_media pi WHERE pi.post_id = p.post_id LIMIT 1) AS file_url,
        (SELECT media_type FROM post_media pi WHERE pi.post_id = p.post_id LIMIT 1) AS media_type,
        (SELECT COUNT(*) FROM post_media pi WHERE pi.post_id = p.post_id) AS file_count,
        p.caption,
        p.created_at,
        u.user_id,
        u.username,
        u.profile_image,
        IFNULL(c.comment_count, 0) AS comment_count,
        IFNULL(l.like_count, 0) AS like_count,
        IF(ul.user_id IS NULL, FALSE, TRUE) AS is_liked,
        EXISTS (
            SELECT 1 FROM bookmarks b WHERE b.user_id = ? AND b.post_id = p.post_id
        ) AS is_bookmarked
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
      ORDER BY p.created_at DESC
    `, [viewerId, viewerId]);

        res.json({ success: true, posts });
    } catch (err) {
        console.error('전체 게시글 조회 실패:', err);
        res.status(500).send('Server Error');
    }
});
/**
 * @route   POST /posts
 * @desc    게시물 업로드 (여러 이미지 + 캡션)
 * @access  Private (JWT)
 */
router.post('/', authMiddleware, upload.array('files'), async (req, res) => {
    try {
        const { caption } = req.body;
        const { userId } = req.user;
        const files = req.files;

        if (!userId) {
            return res.status(400).json({ success: false, message: '유저 정보가 없습니다.' });
        }

        // 1. 게시물 저장
        const [postResult] = await db.query(
            `INSERT INTO posts (user_id, caption) VALUES (?, ?)`,
            [userId, caption]
        );
        const post_id = postResult.insertId;

        // 2. 파일들 저장
        for (const file of files) {
            const isVideo = file.mimetype.startsWith('video/');
            const baseUrl = req.protocol + '://' + req.get('host');
            const fileUrl = `${baseUrl}/uploads/${file.filename}`;
            await db.query(
                `INSERT INTO post_media (post_id, file_url, media_type) VALUES (?, ?, ?)`,
                [post_id, fileUrl, isVideo ? 'video' : 'image']
            );
        }

        // 게시물 저장 후
        const mentionedUsernames = [...caption.matchAll(/@([\w\d_.-]+)/g)].map(m => m[1]);

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
                            post: { post_id },
                            extra: { caption }
                        });
                    }

                    await db.query(`
                        INSERT INTO notifications (target_user_id, from_user_id, type, post_id, extra, created_at)
                        VALUES (?, ?, ?, ?, ?, NOW())
                    `, [
                        mentioned.user_id, userId, 'mention', post_id, JSON.stringify({ caption })
                    ]);
                }
            }
        }

        res.json({ success: true, post_id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
});
/**
 * @route   GET /posts/:id
 * @desc    게시물 상세 보기 (작성자 + 이미지 + 댓글)
 * @access  Public
 */
router.get('/:id', authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const { userId } = req.user;

    try {
        const [postRows] = await db.query(
            `SELECT 
                p.post_id,
                p.caption,
                p.created_at,
                u.user_id,
                u.username,
                u.profile_image,
                EXISTS (
                    SELECT 1 FROM bookmarks b WHERE b.user_id = ? AND b.post_id = p.post_id
                ) AS is_bookmarked
             FROM posts p
             JOIN users u ON p.user_id = u.user_id
             WHERE p.post_id = ?`,
            [userId, postId]
        );

        if (postRows.length === 0) {
            return res.status(404).json({ success: false, message: '게시물을 찾을 수 없습니다.' });
        }

        const post = postRows[0];

        const [files] = await db.query(
            `SELECT file_url, media_type FROM post_media WHERE post_id = ?`,
            [postId]
        );

        res.json({
            success: true,
            post: {
                postId: post.post_id,
                caption: post.caption,
                createdAt: post.created_at,
                user: {
                    userId: post.user_id,
                    username: post.username,
                    profile_image: post.profile_image
                },
                files: files.map(file => ({
                    file_url: file.file_url,
                    media_type: file.media_type
                }))
                // ❌ 댓글은 제거
            }
        });
    } catch (err) {
        console.error('게시물 상세 조회 실패:', err);
        res.status(500).send('Server Error');
    }
});
/**
 * @route   DELETE /posts/:id
 * @desc    게시물 삭제 (작성자 본인만 가능)
 * @access  Private (JWT)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    const postId = req.params.id;
    const { userId } = req.user;

    try {
        // 1. 게시물 작성자 확인
        const [postRows] = await db.query(
            `SELECT user_id FROM posts WHERE post_id = ?`,
            [postId]
        );

        if (postRows.length === 0) {
            return res.status(404).json({ success: false, message: '게시물이 존재하지 않습니다.' });
        }

        const postOwnerId = postRows[0].user_id;

        if (postOwnerId !== userId) {
            return res.status(403).json({ success: false, message: '본인의 게시물만 삭제할 수 있습니다.' });
        }

        // 2. 게시물 삭제
        await db.query(`DELETE FROM posts WHERE post_id = ?`, [postId]);

        res.json({
            success: true,
            message: '게시물이 삭제되었습니다.'
        });
    } catch (err) {
        console.error('게시물 삭제 실패:', err);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /posts/user/:userId
 * @desc    로그인한 유저의 게시물 피드 가져오기
 * @access  Private (JWT 필요)
 */
router.get('/user/:username', authMiddleware, async (req, res) => {
    const viewerId = req.user.userId;
    const username = req.params.username;

    try {
        // 1. 유저 정보 조회
        const [[user]] = await db.query(
            `SELECT user_id FROM users WHERE username = ?`,
            [username]
        );

        if (!user) {
            return res.status(404).json({ success: false, message: '사용자 없음' });
        }

        const targetUserId = user.user_id;

        // 2. 해당 유저 게시글 조회
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
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
            `, [viewerId, targetUserId]);

        res.json({ success: true, posts });
    } catch (err) {
        console.error('유저 게시물 목록 조회 실패:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;