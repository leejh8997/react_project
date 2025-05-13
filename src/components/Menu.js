// Menu.js - 인스타그램 스타일 좌측 사이드바 메뉴
import React, { useState } from 'react';
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  Tooltip,
  useTheme,
  Typography
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import ExploreIcon from '@mui/icons-material/Explore';
import MovieIcon from '@mui/icons-material/Movie';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from '../assets/white.png';
import PostUpload from './PostUpload';
import { jwtDecode } from 'jwt-decode';

const menuItems = [
  { label: '홈', icon: <HomeIcon />, path: '/home' },
  { label: '검색', icon: <SearchIcon />, action: 'search', path: '/search' },
  { label: '탐색 탭', icon: <ExploreIcon />, path: '/explore' },
  { label: '릴스', icon: <MovieIcon />, path: '/reels' },
  { label: '메시지', icon: <ChatBubbleOutlineIcon />, path: '/messages' },
  { label: '알림', icon: <FavoriteBorderIcon />, path: '/notifications' },
  { label: '만들기', icon: <AddBoxOutlinedIcon />, path: '/upload' },
  { label: '프로필', icon: <AccountCircleIcon />, path: '/profile' },
];

function Menu({ onSearchClick, onNotifClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [uploadModal, setUploadModal] = useState(false);
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : {};

   const handleClick = (item) => {
    if (item.label === '만들기') {
      setUploadModal(true);
    } else if (item.label === '검색') {
      onSearchClick?.();
    } else if (item.label === '알림') {
      onNotifClick?.();
    } else if (item.label === '프로필') {
      if (user.username) {
        navigate(`/profile/${user.username}`);
      } else {
        alert('로그인이 필요합니다.');
      }
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <Box
      sx={{
        width: '60px',
        height: '100vh',
        borderRight: `1px solid ${theme.palette.divider}`,
        position: 'fixed',
        backgroundColor: '#fff',       // 흰색 (100% 불투명)
        opacity: 1,                    // 불투명도 100%
        zIndex: 9999,                  // Search보다 앞에 가지 않게 설정
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        pt: 2
      }}
    >
      {uploadModal && (
        <PostUpload open={uploadModal} onClose={() => setUploadModal(false)} />
      )}

      

      <Box sx={{ width: '59px', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#fff' }}>
        {/* 상단 로고 */}
        <Box
          component="img"
          src={Logo}
          alt="Logo"
          sx={{ width: 32, height: 32, mb: 3, cursor: 'pointer' }}
          onClick={() => navigate('/home')}
        />

        {/* 가운데 정렬된 메뉴 */}
        <Box sx={{ width: '59px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: '#fff', }}>
          <List>
            {menuItems.map((item) => (
              <Tooltip key={item.path} title={item.label} placement="right" arrow>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleClick(item)}
                  sx={{ justifyContent: 'center' }}
                >
                  <ListItemIcon sx={{ minWidth: 0 }}>{item.icon}</ListItemIcon>
                </ListItemButton>
              </Tooltip>
            ))}
          </List>
        </Box>
      </Box>

      {/* 하단 더보기 */}
      <Box sx={{ width: '59px', mb: 1, backgroundColor: '#fff', }}>
        <Tooltip title="더 보기" placement="right" arrow>
          <ListItemButton onClick={() => alert('설정/로그아웃/전환 메뉴 (임시 동작)')} sx={{ justifyContent: 'center' }}>
            <ListItemIcon sx={{ minWidth: 0 }}><MenuIcon /></ListItemIcon>
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default Menu;