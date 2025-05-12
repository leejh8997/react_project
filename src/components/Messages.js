import React, { useState } from 'react';
import {
  Box, Typography, Avatar, Divider, IconButton, Button, InputBase
} from '@mui/material';
import { Add, Close, InsertEmoticon, Image, Send, Videocam } from '@mui/icons-material';

function Messages() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);

  const mockRooms = [
    {
      id: 1,
      username: '재원',
      profile: '/images/dog.jpg',
      lastMessage: '사진을 보냈습니다.',
      lastTime: '9분'
    }
  ];

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  return (
    <Box display="flex" height="100vh">
      {/* 좌측: 채팅 목록 */}
      <Box width={320} borderRight="1px solid #ddd" display="flex" flexDirection="column">
        {/* 헤더 */}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <Typography fontWeight="bold">jae.hyeong94</Typography>
          <IconButton onClick={() => setShowNewChatModal(true)}>
            <Add />
          </IconButton>
        </Box>

        {/* 내 프로필 */}
        <Box display="flex" flexDirection="column" alignItems="center" py={1}>
          <Avatar src="/images/profile1.jpg" sx={{ width: 56, height: 56 }} />
          <Typography variant="body2">내 메모</Typography>
        </Box>
        <Divider />

        {/* 메시지 + 요청 */}
        <Box display="flex" justifyContent="space-between" px={2} py={1}>
          <Typography fontWeight="bold">메시지</Typography>
          <Typography color="skyblue">요청</Typography>
        </Box>

        {/* 채팅방 리스트 */}
        {mockRooms.map(room => (
          <Box key={room.id} px={2} py={1} display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => setSelectedRoom(room)}>
            <Avatar src={room.profile} sx={{ width: 40, height: 40, mr: 1.5 }} />
            <Box>
              <Typography>{room.username}</Typography>
              <Typography variant="caption" color="text.secondary">{room.lastMessage} · {room.lastTime}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* 우측: 채팅 영역 */}
      <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        {!selectedRoom ? (
          <>
            <img src="/messenger-icon.png" width={56} alt="icon" />
            <Typography fontWeight="bold" mt={2}>내 메시지</Typography>
            <Typography variant="body2" color="text.secondary">친구나 그룹에 비공개 사진과 메시지를 보내보세요</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => setShowNewChatModal(true)}>메시지 보내기</Button>
          </>
        ) : (
          <Box width="100%" height="100%" display="flex" flexDirection="column">
            {/* 상단 프로필 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid #ddd">
              <Typography fontWeight="bold">설정</Typography>
              <Box display="flex" alignItems="center">
                <Avatar src={selectedRoom.profile} sx={{ width: 40, height: 40, mr: 1 }} />
                <Typography fontWeight="bold">{selectedRoom.username}</Typography>
              </Box>
            </Box>

            {/* 가운데 프로필 + 채팅 영역 */}
            <Box flex={1} overflow="auto" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <Avatar src={selectedRoom.profile} sx={{ width: 88, height: 88 }} />
              <Typography fontWeight="bold" mt={1}>{selectedRoom.username}</Typography>
              <Typography variant="body2">wodnjs_p · Instagram</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }}>프로필 보기</Button>
            </Box>

            {/* 채팅 입력창 */}
            {files.length > 0 && (
              <Box display="flex" alignItems="center" px={2} py={1} borderTop="1px solid #eee">
                <IconButton component="label">
                  <Add />
                  <input type="file" hidden multiple onChange={handleFileChange} />
                </IconButton>
                {files.map((file, idx) => (
                  <Box key={idx} position="relative" mx={1}>
                    {file.type.startsWith('video') ? (
                      <Box position="relative">
                        <video src={URL.createObjectURL(file)} width={60} height={60} style={{ objectFit: 'cover' }} />
                        <Videocam sx={{ position: 'absolute', top: 0, right: 0, fontSize: 18, color: 'white' }} />
                      </Box>
                    ) : (
                      <img src={URL.createObjectURL(file)} alt="preview" width={60} height={60} style={{ objectFit: 'cover' }} />
                    )}
                    <IconButton size="small" sx={{ position: 'absolute', top: 0, right: 0 }} onClick={() => setFiles(files.filter((_, i) => i !== idx))}>
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            <Box display="flex" alignItems="center" px={2} py={1} borderTop="1px solid #ddd">
              <IconButton><InsertEmoticon /></IconButton>
              <InputBase
                placeholder="메시지 입력..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                sx={{ ml: 1, flex: 1, bgcolor: '#f5f5f5', borderRadius: 2, px: 2, py: 1 }}
                multiline
              />
              {input || files.length > 0 ? (
                <IconButton color="primary"><Send /></IconButton>
              ) : (
                <IconButton component="label">
                  <Image />
                  <input type="file" hidden multiple onChange={handleFileChange} />
                </IconButton>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* 새 채팅 모달 */}
      {showNewChatModal && (
        <Box position="fixed" top={0} left={0} width="100%" height="100%" bgcolor="rgba(0,0,0,0.5)" display="flex" justifyContent="center" alignItems="center">
          <Box width={400} bgcolor="#fff" borderRadius={2} p={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography fontWeight="bold">새로운 메시지</Typography>
              <IconButton onClick={() => setShowNewChatModal(false)}><Close /></IconButton>
            </Box>
            <InputBase fullWidth placeholder="받는 사람: 검색..." sx={{ border: '1px solid #ccc', borderRadius: 1, px: 1, py: 0.5, mb: 2 }} />
            <Typography variant="body2" color="text.secondary" mb={1}>추천</Typography>
            <Box display="flex" alignItems="center">
              <Avatar src="/images/dog.jpg" sx={{ width: 40, height: 40, mr: 1 }} />
              <Typography>재원</Typography>
            </Box>
            <Button fullWidth variant="contained" sx={{ mt: 2 }}>채팅</Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Messages;
