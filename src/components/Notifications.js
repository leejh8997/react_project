// components/Notifications.js
import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Typography, Avatar, Button, Divider
} from '@mui/material';
import socket from '../utils/socket';
import { jwtDecode } from 'jwt-decode';
import PostModal from './PostModal';
import { formatDistanceToNowStrict, isToday } from 'date-fns';
import ko from 'date-fns/locale/ko';
import { authFetch } from '../utils/authFetch';

export default function Notifications({ open, onClose }) {
  const panelRef = useRef();
  const [notifications, setNotifications] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem('token');
  const currentUser = token ? jwtDecode(token) : {};

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
    if (currentUser) {
      const { userId } = currentUser;
      socket.emit('register', userId);
    }

    socket.on('receiveNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    return () => {
      socket.off('receiveNotification');
    };
  }, []);

  const renderMessage = (n) => {
    switch (n.type) {
      case 'comment':
        const shortText1 = n.extra.text.length > 20 ? n.extra.text.slice(0, 20) + '...' : n.extra.text;
        return (
          <>
            <b>{n.sender.username}</b>님이 게시글에 댓글을 남겼습니다. <span style={{ color: '#666' }}>: {shortText1}</span>
          </>
        );
      case 'reply':
         const shortText2 = n.extra.text.length > 20 ? n.extra.text.slice(0, 20) + '...' : n.extra.text;
        return (
          <>
            <b>{n.sender.username}</b>님이 댓글에 답글을 남겼습니다. <span style={{ color: '#666' }}>: {shortText2}</span>
          </>
        );
      case 'like':
        return <><b>{n.sender.username}</b>님이 회원님의 게시글을 좋아합니다.</>;
      case 'follow':
        return <><b>{n.sender.username}</b>님이 회원님을 팔로우 하기 시작했습니다.</>;
      case 'follow-request':
        return <><b>{n.sender.username}</b>님이 팔로우를 요청했습니다.</>;
      case 'follow-reject':
        return <><b>{n.sender.username}</b>님이 팔로우를 거절하셨습니다.</>;
      default:
        return null;
    }
  };

  const todayNoti = notifications.filter(n => isToday(new Date(n.created_at)));
  const pastNoti = notifications.filter(n => !isToday(new Date(n.created_at)));

  const handleAcceptFollow = async (notificationId, senderId) => {
    try {
      const res = await authFetch(`http://localhost:3005/notifications/${notificationId}/accept`, { method: 'PUT' });
      const result = await res.json();
      if (result.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.notification_id === notificationId
              ? { ...n, type: 'follow' }
              : n
          )
        );
      }
    } catch (err) {
      console.error('수락 오류:', err);
    }
  };

  const handleRejectFollow = async (notificationId, senderId) => {
    try {
      const res = await authFetch(`http://localhost:3005/notifications/${notificationId}/reject`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        setNotifications(prev => prev.filter(n => n.notification_id !== notificationId));
        // 상대방에게 거절 알림 전송
        socket.emit('sendNotification', {
          toUserId: senderId,
          notification: {
            type: 'follow-reject',
            sender: {
              user_id: currentUser.userId,
              username: currentUser.username,
              profile_image: currentUser.profile_image || null
            },
            created_at: new Date().toISOString(),
            read: false
          }
        });
      }
    } catch (err) {
      console.error('거절 오류:', err);
    }
  };

  return open ? (
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
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        overflowY: 'auto',
      }}
    >
      {/* 타이틀 */}
      <Typography variant="h6" fontWeight="bold" mb={2}>알림</Typography>
      <Divider sx={{ my: 1 }} />

      {/* 오늘 알림 */}
      {/* {todayNoti.length > 0 &&  */}
      <Typography fontSize={14} fontWeight="bold" mt={1} mb={1}>오늘</Typography>
      {/*  } */}
      {todayNoti.map((n, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, cursor: 'pointer' }} onClick={() => {
          if (n.post) {
            setSelectedPost(n.post);
            setModalOpen(true);
          }
        }}>
          <Avatar src={n.sender.profile_image} sx={{ width: 36, height: 36 }} />
          <Box sx={{ flex: 1 }}>
            <Typography fontSize={14}>{renderMessage(n)}</Typography>
            <Typography fontSize={12} color="gray">
              {formatDistanceToNowStrict(new Date(n.created_at), { addSuffix: true, locale: ko })}
            </Typography>
          </Box>
          {n.post && <Box component="img" src={n.post.file_url} sx={{ width: 44, height: 44, objectFit: 'cover' }} />}
          {n.type === 'follow-request' ? (
            <Box>
              <Button size="small" variant="contained" onClick={() => handleAcceptFollow(n.notification_id, n.sender.user_id)}>확인</Button>
              <Button size="small" color="error" onClick={() => handleRejectFollow(n.notification_id, n.sender.user_id)}>삭제</Button>
            </Box>
          ) : n.post && (
            <Box component="img" src={n.post.file_url} sx={{ width: 44, height: 44, objectFit: 'cover' }} />
          )}
        </Box>
      ))}


      {/* 지난 알림 */}
      {/* {pastNoti.length > 0 &&  */}
      <><Divider sx={{ my: 1 }} /><Typography fontSize={14} fontWeight="bold" mb={1}>지난 알림</Typography></>
      {/* } */}
      {pastNoti.map((n, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, cursor: 'pointer' }} onClick={() => {
          if (n.post) {
            setSelectedPost(n.post);
            setModalOpen(true);
          }
        }}>
          <Avatar src={n.sender.profile_image} sx={{ width: 36, height: 36 }} />
          <Box sx={{ flex: 1 }}>
            <Typography fontSize={14}>{renderMessage(n)}</Typography>
            <Typography fontSize={12} color="gray">
              {formatDistanceToNowStrict(new Date(n.created_at), { addSuffix: true, locale: ko })}
            </Typography>
          </Box>
          {n.post && <Box component="img" src={n.post.file_url} sx={{ width: 44, height: 44, objectFit: 'cover' }} />}
        </Box>
      ))}

      <PostModal open={modalOpen} onClose={() => setModalOpen(false)} post={selectedPost} />
    </Box>
  ) : null;
}

