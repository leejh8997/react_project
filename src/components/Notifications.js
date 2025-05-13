// components/Notifications.js
import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Avatar, Button, Divider
} from '@mui/material';
import socket from '../utils/socket';
import { jwtDecode } from 'jwt-decode';
export default function Notifications({ open, onClose, notifications }) {
  const panelRef = useRef();
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && panelRef.current && !panelRef.current.contains(e.target)) {
        onClose(); // 외부 클릭 시 패널 닫기
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const { userId } = jwtDecode(token);
      socket.emit('register', userId);
    }

    socket.on('receiveNotification', (noti) => {
      console.log('🔔 새 알림 수신:', noti);
      // TODO: 상태에 추가
    });

    return () => {
      socket.off('receiveNotification');
    };
  }, []);

  return (
    <Box
      ref={panelRef}
      sx={{
        width: 360,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        transform: open ? 'translateX(60px)' : 'translateX(-360px)',
        transition: 'transform 0.4s ease',
        bgcolor: '#fff',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
        zIndex: -1,
        p: 2,
        overflowY: 'auto',
      }}
    >
      {/* 타이틀 */}
      <Typography variant="h6" fontWeight="bold" mb={2}>알림</Typography>
      <Divider sx={{ my: 1 }} />

      {/* 오늘 알림 */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'gray' }}>오늘</Typography>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar src="/images/profile1.jpg" sx={{ width: 36, height: 36, mr: 1 }} />
          <Box>
            <Typography fontSize={14}><b>username</b>님이 회원님의 게시글에 댓글을 남겼습니다: "좋아요!"</Typography>
            <Typography fontSize={12} color="gray">1시간 전</Typography>
          </Box>
          <Box component="img" src="/images/thumb.jpg" sx={{ width: 40, height: 40, ml: 'auto', borderRadius: 1 }} />
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />
       {/* 지난 알림 */}
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'gray' }}>지난 알림</Typography>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar src="/images/profile2.jpg" sx={{ width: 36, height: 36, mr: 1 }} />
          <Box>
            <Typography fontSize={14}><b>anotheruser</b>님이 회원님을 팔로우하기 시작했습니다.</Typography>
            <Typography fontSize={12} color="gray">3일 전</Typography>
          </Box>
          <Button variant="outlined" size="small" sx={{ ml: 'auto' }}>팔로우</Button>
        </Box>
      </Box>
    </Box>
  );
}

