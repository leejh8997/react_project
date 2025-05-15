// App.js - 라우팅 구성 (인스타그램 스타일에 맞게 수정)
import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import socket from './utils/socket';
// 인스타그램 메뉴 구성에 맞춘 컴포넌트
import Login from './components/Login';
import Join from './components/Join';
import Home from './components/Home';
import Search from './components/Search';
import Explore from './components/Explore';
import Reels from './components/Reels';
import Messages from './components/Messages';
import Notifications from './components/Notifications';
import PostUpload from './components/PostUpload';
import Profile from './components/Profile';
import Menu from './components/Menu';
import { authFetch } from './utils/authFetch';
import { jwtDecode } from 'jwt-decode';

function App() {
  const location = useLocation();

  // 로그인/회원가입 화면에서는 Menu 숨김
  const isAuthPage = location.pathname === '/' || location.pathname === '/join';
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  // const [notification, setNotifications] = useState([]);
  // ✅ 1. App.jsx - unreadCount 상태 추가
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem('token');
  const currentUser = token ? jwtDecode(token) : {};

  const handleSearchToggle = () => {
    if (!searchOpen && !searchVisible) {
      setSearchVisible(true);
      setTimeout(() => setSearchOpen(true), 10);
    } else if (searchOpen) {
      setSearchOpen(false);
      setTimeout(() => setSearchVisible(false), 400); // 애니메이션 시간에 맞춰 unmount
    }
  };

  const handleNotifToggle = () => {
    if (!notifOpen && !notifVisible) {
      setNotifVisible(true);
      setTimeout(() => setNotifOpen(true), 10);
      // 패널 열릴 때 전체 읽음 처리
      authFetch('http://localhost:3005/notifications/mark-all-read', { method: 'PUT' })
        .then(() => setUnreadCount(0))
        .catch(err => console.error('알림 읽음 처리 실패:', err));
    } else if (notifOpen) {
      setNotifOpen(false);
      setTimeout(() => setNotifVisible(false), 400); // 애니메이션 시간에 맞춰 unmount
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const { userId } = currentUser;
    socket.emit('register', userId);

    const handleReceive = (notification) => {
      console.log('📉 알림 리시브 이벤트 수신!');
      setUnreadCount((count) => count + 1);
    };
    const handleDecrease = () => {
      console.log('📉 알림 감소 이벤트 수신!');
      setUnreadCount((count) => Math.max(count - 1, 0));
    };

    socket.on('receiveNotification', handleReceive);
    socket.on('decreaseNotificationCount', handleDecrease);

    return () => {
      socket.off('receiveNotification');
      socket.off('decreaseNotificationCount');
    };
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const { userId } = currentUser;

    authFetch(`http://localhost:3005/notifications/unread-count?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setUnreadCount(data.count);
      })
      .catch(err => console.error('초기 알림 개수 로딩 실패:', err));
  }, []);

  return (
    <Box sx={{ display: 'flex', position: 'relative' }}>
      <CssBaseline />

      {!isAuthPage && (
        <>
          <Box sx={{ position: 'relative', zIndex: 500 }}>
            {searchVisible && (
              <Search open={searchOpen} onClose={handleSearchToggle} />
            )}
            {notifVisible && (
              <Notifications open={notifOpen} onClose={handleNotifToggle} />
            )}
            <Menu
              onSearchClick={handleSearchToggle}
              onNotifClick={handleNotifToggle}
              unreadCount={unreadCount}
            />
          </Box>
        </>
      )}
      <Box component="main" sx={{
        flexGrow: 1,
        display: 'flex',
        justifyContent: location.pathname === '/messages' ? 'flex-start' : 'center',
        px: 0,
        ml: !isAuthPage ? '60px' : 0
      }}>
        <Box sx={{
          width: '100%',
          ...(location.pathname !== '/messages' && { maxWidth: 600, px: 2 }) // 메시지 페이지가 아닐 경우만 px, maxWidth 적용
        }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/join" element={<Join />} />
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/reels" element={<Reels />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/upload" element={<PostUpload />} />
            <Route path="/profile/:username" element={<Profile />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default App;