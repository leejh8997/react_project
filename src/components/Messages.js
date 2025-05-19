import socket from '../utils/socket';
import { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Avatar, Divider, IconButton, Button, InputBase
} from '@mui/material';
import { Add, Close, InsertEmoticon, Image, Send, Videocam } from '@mui/icons-material';
import { authFetch } from '../utils/authFetch';
import ForumIcon from '@mui/icons-material/Forum';
import { jwtDecode } from 'jwt-decode';


function Messages() {
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : {};
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState([]);
  const [messages, setMessages] = useState([]);
  const [readByList, setReadByList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (!user.userId) return;
    console.log(user);
    fetch(`http://localhost:3005/dm/rooms?userId=${user.userId}`)
      .then(res => res.json())
      .then(data => {
        console.log("룸 리스트:: ", data);
        if (data.success) {
          setRoomList(data.rooms);
        }
      });
  }, [user.userId]);

  useEffect(() => {
    if (!searchKeyword.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    searchTimeout.current = setTimeout(() => {
      authFetch(`http://localhost:3005/dm/search?keyword=${searchKeyword}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setSearchResults(data.users);
        });
    }, 1000);
  }, [searchKeyword]);

  useEffect(() => {
    if (!selectedRoom) return;

    // 기존 메시지 초기화
    setMessages([]);

    // 1. 방 입장 (소켓)
    socket.emit('joinRoom', selectedRoom.room_id);

    // 실시간 읽음 이벤트 전송
    socket.emit('readMessage', {
      roomId: selectedRoom.room_id,
      userId: user.userId
    });

    // 서버에서 오는 읽음 알림 수신
    socket.on('messageRead', ({ userId }) => {
      console.log(`✅ 유저 ${userId}가 이 방의 메시지를 읽음`);
      // → 메시지에 read 상태 표시 업데이트 가능
      // 예: setLastReadBy(prev => [...new Set([...prev, userId])]);
      setReadByList(prev => [...new Set([...prev, userId])]);
    });

    // 채팅방 입장 시
    fetch('http://localhost:3005/dm/read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        roomId: selectedRoom.room_id,
        userId: user.userId // 현재 로그인 유저 ID
      })
    });

    // 2. 이전 메시지 로딩
    fetch(`http://localhost:3005/dm/messages?roomId=${selectedRoom.room_id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("셀렉티드룸", selectedRoom);
          setMessages(data.messages);
        }
      });

    // 3. 실시간 수신
    socket.on('receiveMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('messageRead');
    };
  }, [selectedRoom]);

  const handleSelectUser = (user) => {
    if (!selectedUsers.find(u => u.user_id === user.user_id)) {
      setSelectedUsers(prev => [...prev, user]);
    }
  };

  const handleCreateRoom = async () => {
    if (selectedUsers.length === 0) return;

    const res = await fetch('http://localhost:3005/dm/create-room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds: selectedUsers.map(u => u.user_id),
        creatorId: user.userId
      })
    });

    const data = await res.json();
    if (data.success) {
      setRoomList(prev => [data.room, ...prev]);
      setShowNewChatModal(false);
      setSelectedUsers([]);
      setSearchKeyword('');
      setSearchResults([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;

    // 텍스트 메시지 먼저 전송
    if (input.trim()) {
      const msg = {
        senderId: user.userId,
        content: input,
        type: 'text',
      };

      socket.emit('sendMessage', {
        roomId: selectedRoom.room_id,
        message: msg,
      });
    }

    // 파일이 있을 경우 업로드 후 각 파일별로 메시지 전송
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach(file => formData.append('file', file)); // input name은 'file'

      const res = await fetch('http://localhost:3005/dm/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        for (let f of data.files) {
          const msg = {
            senderId: user.userId,
            content: f.fileUrl,
            type: f.type,
          };

          socket.emit('sendMessage', {
            roomId: selectedRoom.room_id,
            message: msg
          });
        }
      }
    }

    setInput('');
    setFiles([]);
  };

  const handleFileChange = (e) => {
    setFiles([...files, ...Array.from(e.target.files)]);
  };

  function format_chat_time(isoTimeStr) {
    const dt = new Date(isoTimeStr);
    const hours = dt.getHours();
    const minutes = dt.getMinutes().toString().padStart(2, '0');
    const period = hours < 12 ? '오전' : '오후';
    const hour12 = hours % 12 || 12;
    return `${dt.getMonth() + 1}.${dt.getDate()} ${period} ${hour12}:${minutes}`;
  }

  return (
    <Box display="flex" height="100vh">
      {/* 좌측: 채팅 목록 */}
      <Box width={320} borderRight="1px solid #ddd" display="flex" flexDirection="column">
        {/* 헤더 */}
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
          <Typography fontWeight="bold">{user.username}</Typography>
          <IconButton onClick={() => setShowNewChatModal(true)}>
            <Add />
          </IconButton>
        </Box>

        {/* 내 프로필 */}
        <Box display="flex" flexDirection="column" alignItems="center" py={1}>
          <Avatar src={user.profileImage} sx={{ width: 56, height: 56 }} />
          <Typography variant="body2">내 메모</Typography>
        </Box>
        <Divider />

        {/* 메시지 + 요청 */}
        <Box display="flex" justifyContent="space-between" px={2} py={1}>
          <Typography fontWeight="bold">메시지</Typography>
          <Typography color="skyblue">요청</Typography>
        </Box>
        <Box flex={1} overflow="auto" px={2} py={1}>
          {[...new Map(roomList.map(room => [room.room_id, room])).values()]
            .sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime))
            .map((room) => {
              const participants = room.participants || [];
              const avatars = participants.slice(0, 4); // 최대 4명까지

              return (
                <Box key={room.room_id} display="flex" alignItems="center" sx={{ cursor: 'pointer', mb: 2 }} onClick={() => setSelectedRoom(room)}>
                  <Box position="relative" width={40} height={40} mr={1.5}>
                    {avatars.map((user, i) => (
                      <Avatar
                        key={i}
                        src={user.profile_image || '/default-profile.png'}
                        sx={{
                          width: 20,
                          height: 20,
                          position: 'absolute',
                          top: Math.floor(i / 2) * 20,
                          left: (i % 2) * 20,
                          border: '2px solid white',
                          boxSizing: 'content-box',
                          zIndex: avatars.length - i
                        }}
                      />
                    ))}
                  </Box>

                  <Box>
                    <Typography fontWeight="bold">
                      {room.room_name || '(알 수 없음)'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {room.lastType === 'image'
                        ? '사진을 보냈습니다.'
                        : room.lastType === 'video'
                          ? '동영상을 보냈습니다.'
                          : room.lastMessage || '대화를 시작하세요'}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
        </Box>
      </Box>

      {/* 우측: 채팅 영역 */}
      <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        {!selectedRoom ? (
          <>
            <ForumIcon sx={{ fontSize: 56 }} />
            <Typography fontWeight="bold" mt={2}>내 메시지</Typography>
            <Typography variant="body2" color="text.secondary">친구나 그룹에 비공개 사진과 메시지를 보내보세요</Typography>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => setShowNewChatModal(true)}>메시지 보내기</Button>
          </>
        ) : (
          <Box width="100%" height="100%" display="flex" flexDirection="column">
            {/* 상단 프로필 */}
            <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid #ddd">
              <Box display="flex" alignItems="center">
                <Avatar src={user.profileImage} sx={{ width: 40, height: 40, mr: 1 }} />
                <Typography fontWeight="bold">{user.username}</Typography>
              </Box>
              <Typography fontWeight="bold">설정</Typography>
            </Box>

            {/* 가운데 프로필 + 채팅 영역 */}
            {/* ✅ 리팩토링: 그룹 프로필 스타일 + 채팅방 제목 + 전체 참여자 이름 출력 */}
            <Box flex={1} overflow="auto" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
              <Box
                position="relative"
                width={64}
                height={64}
                display="flex"
                flexWrap="wrap"
                justifyContent="center"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                {(selectedRoom.participants || []).slice(0, 4).map((user, i) => (
                  <Avatar
                    key={i}
                    src={user.profile_image || '/default-profile.png'}
                    sx={{
                      width: 30,
                      height: 30,
                      position: 'absolute',
                      top: i < 2 ? 0 : 34,
                      left: i % 2 === 0 ? 0 : 34,
                      border: '2px solid white',
                      zIndex: 10 - i
                    }}
                  />
                ))}
              </Box>

              <Typography fontWeight="bold" mt={1}>
                {selectedRoom.room_name || '(알 수 없음)'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, textAlign: 'center', whiteSpace: 'normal' }}>
                {(selectedRoom.participants || [])
                  .map(p => p.username)
                  .join(', ')}
              </Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }}>프로필 보기</Button>
            </Box>
            {selectedRoom && (
              <Box flex={1} overflow="auto" px={2} py={1}>
                {messages.map((msg, index) => {
                  const isMyMessage = msg.sender_id === user.userId;
                  const partnerId = selectedRoom.partnerId;
                  const currentTime = new Date(msg.created_at).toISOString();
                  const showTime =
                    index === 0 ||
                    new Date(messages[index - 1].created_at).toISOString().slice(0, 16) !==
                    currentTime.slice(0, 16); // 시간 기준 중복 제거

                  const formattedTime = format_chat_time(currentTime);

                  const senderName = isMyMessage
                    ? user.userName
                    : selectedRoom.participants?.find(p => p.user_id === msg.sender_id)?.username || '알 수 없음';

                  return (
                    <Box key={`${msg.created_at}-${msg.sender_id}`} mb={1}>
                      {showTime && (
                        <Typography align="center" color="text.secondary" fontSize={12} mb={1}>
                          {formattedTime}
                        </Typography>
                      )}

                      <Box
                        display="flex"
                        justifyContent={isMyMessage ? 'flex-end' : 'flex-start'}
                        flexDirection="row"
                      >
                        <Box
                          bgcolor={isMyMessage ? '#DCF8C6' : '#F0F0F0'}
                          borderRadius={2}
                          px={2}
                          py={1}
                          maxWidth="70%"
                        >
                          <Typography fontSize={14}>
                            {msg.type === 'image' ? (
                              <img src={msg.content} style={{ maxWidth: '100%', borderRadius: 4 }} />
                            ) : msg.type === 'video' ? (
                              <video src={msg.content} controls style={{ maxWidth: '100%', borderRadius: 4 }} />
                            ) : (
                              isMyMessage ? msg.content : `${senderName}: ${msg.content}`
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      {/* ✅ 읽음 표시 */}
                      {isMyMessage && index === messages.length - 1 && readByList.includes(String(partnerId)) && (
                        <Typography
                          variant="caption"
                          color="gray"
                          align="right"
                          sx={{ mt: 0.5, mr: 1 }}
                        >
                          읽음
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}

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
                <IconButton color="primary"><Send onClick={() => handleSend()} /></IconButton>
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
            <InputBase
              fullWidth
              placeholder="받는 사람: 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              sx={{ border: '1px solid #ccc', borderRadius: 1, px: 1, py: 0.5, mb: 2 }}
            />

            {/* 선택된 유저 목록 */}
            <Box display="flex" flexWrap="wrap" mb={1}>
              {selectedUsers.map(user => (
                <Box key={user.user_id} mr={1} mb={1} display="flex" alignItems="center">
                  <Avatar src={user.profile_image} sx={{ width: 24, height: 24, mr: 0.5 }} />
                  <Typography variant="body2">{user.username}</Typography>
                  <IconButton size="small" onClick={() =>
                    setSelectedUsers(selectedUsers.filter(u => u.user_id !== user.user_id))
                  }>
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>

            {/* 검색 결과 */}
            {searchResults.map(user => (
              <Box key={user.user_id} display="flex" alignItems="center" sx={{ cursor: 'pointer', mb: 1 }}
                onClick={() => handleSelectUser(user)}>
                <Avatar src={user.profile_image} sx={{ width: 40, height: 40, mr: 1 }} />
                <Box>
                  <Typography fontWeight="bold">{user.username}</Typography>
                  <Typography variant="caption" color="text.secondary">{user.name}</Typography>
                </Box>
              </Box>
            ))}

            <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleCreateRoom}>
              채팅
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Messages;
