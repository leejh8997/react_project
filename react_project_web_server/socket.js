const { Server } = require('socket.io');
const db = require('./db');

let io = null;
const connectedUsers = new Map();

function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log('🔌 사용자 접속:', socket.id);
        // ✅ DM용 이벤트
        socket.on('joinRoom', (roomId) => {
            socket.join(roomId);
            console.log(`${socket.id} joined room ${roomId}`);
        });
        // 메시지 전송
        socket.on('sendMessage', async ({ roomId, message }) => {
            console.log(`📤 메시지 전송 (room ${roomId}):`, message);

            const { senderId, content, type } = message;

            try {
                // DB에 저장
                const [result] = await db.query(
                    `INSERT INTO chat_messages (room_id, sender_id, content, type)
                    VALUES (?, ?, ?, ?)`,
                    [roomId, senderId, content, type]
                );

                const insertId = result.insertId;

                // 방금 삽입한 메시지 created_at 포함해서 다시 조회
                const [[savedMessage]] = await db.query(
                    `SELECT * FROM chat_messages WHERE message_id = ?`,
                    [insertId]
                );

                // 클라이언트에게 브로드캐스트
                io.to(roomId).emit('receiveMessage', savedMessage);
            } catch (err) {
                console.error('❌ 메시지 저장 중 오류 발생:', err);
            }
        });
        // 실시간 읽음 알림 처리
        socket.on('readMessage', ({ roomId, userId }) => {
            console.log(`👁️‍🗨️ 유저 ${userId}가 room ${roomId}의 메시지를 읽음`);

            // 같은 방의 다른 유저들에게 알림
            socket.to(roomId).emit('messageRead', { roomId, userId });
        });
        // ✅ 알림용 이벤트
        socket.on('register', (userId) => {
            connectedUsers.set(userId, socket.id);
            console.log(`🔗 유저 ${userId} 등록됨`);
            console.log(`🔗 유저 ${socket.id} 등록됨`);

        });

        socket.on('sendNotification', async ({ toUserId, notification }) => {
            console.log("toUserId====>", toUserId);

            if (toUserId === notification.senderId) {
                console.log('⚠️ 자기 자신에게 알림 전송 시도. 무시됨.');
                return;
            }

            const targetSocketId = connectedUsers.get(toUserId);

            try {
                // 1. DB 저장
                await db.query(`
                INSERT INTO notifications (target_user_id, from_user_id, type, post_id, extra, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
                `, [
                    toUserId,
                    notification.senderId, // ✅ 보내는 유저 ID 필요
                    notification.type,
                    notification.post?.post_id || null,
                    JSON.stringify(notification.extra || {})
                ]);

                // 2. sender 정보 불러오기
                const [[sender]] = await db.query(
                    `SELECT user_id, username, profile_image FROM users WHERE user_id = ?`,
                    [notification.senderId]
                );

                // 3. 클라이언트에 전송할 알림 구성
                const enrichedNotification = {
                    ...notification,
                    sender,
                    read: false
                };
                console.log("targetSocketId=======>", targetSocketId);
                // 2. 실시간 전송
                if (targetSocketId) {
                    io.to(targetSocketId).emit('receiveNotification', enrichedNotification);
                }
            } catch (err) {
                console.error('❌ 알림 저장 또는 전송 실패:', err);
            }
        });

        // 클라이언트 연결 종료
        socket.on('disconnect', () => {
            for (const [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) connectedUsers.delete(userId);
            }
            console.log('❌ 클라이언트 연결 해제됨');
        });
    });
}

function getIO() {
    return io;
}

function getConnectedUsers() {
    return connectedUsers;
}

module.exports = {
    initSocket,
    getIO,
    getConnectedUsers,
};