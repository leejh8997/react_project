// App.js - 라우팅 구성 (인스타그램 스타일에 맞게 수정)
import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';

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

function App() {
  const location = useLocation();

  // 로그인/회원가입 화면에서는 Menu 숨김
  const isAuthPage = location.pathname === '/' || location.pathname === '/join';
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);

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
    } else if (notifOpen) {
      setNotifOpen(false);
      setTimeout(() => setNotifVisible(false), 400); // 애니메이션 시간에 맞춰 unmount
    }
  };

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
        <Box sx={{ width: '100%',
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