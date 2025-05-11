// ✅ SearchPanel.jsx 수정버전
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, InputBase, IconButton, Divider, Avatar, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PeopleIcon from '@mui/icons-material/People';
import ClearIcon from '@mui/icons-material/Clear';
import { debounce } from 'lodash';

export default function Search({ open, onClose }) {
  const [searchType, setSearchType] = useState('user');
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [recent, setRecent] = useState([
    { username: 'jye_e', name: '지예', profile: '/images/profile1.jpg' }
  ]);
  const [result, setResult] = useState([]);

  const fetchSearch = debounce(async (q) => {
    if (!q.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setResult([
        { username: 'jye_e', name: '지예', profile: '/images/profile1.jpg' },
        { username: 'mj_park', name: '박민지', profile: '/images/profile2.jpg' }
      ]);
      setSearching(false);
    }, 1000);
  }, 1000);

  useEffect(() => {
    if (keyword.trim()) {
      fetchSearch(keyword);
    } else {
      setResult([]);
    }
  }, [keyword]);

  return (
    <Box
      sx={{
        width: 360,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        transform: open ? 'translateX(60px)' : 'translateX(-360px)',
        transition: 'transform 0.4s ease',
        bgcolor: '#fff',
        boxShadow: 3,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        p: 2,
      }}
    >
      <Typography variant="h6" fontWeight="bold" mb={2}>검색</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, border: '1px solid #ccc', borderRadius: 2, px: 1 }}>
        <SearchIcon sx={{ color: 'gray' }} />
        <InputBase
          fullWidth
          placeholder="검색"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={{ ml: 1 }}
        />
        {searching ? (
          <CircularProgress size={20} />
        ) : keyword ? (
          <IconButton onClick={() => setKeyword('')} size="small">
            <ClearIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Box>

      <Box sx={{ display: 'flex', mb: 1 }}>
        <Box
          onClick={() => setSearchType('post')}
          sx={{
            flex: 1,
            textAlign: 'center',
            py: 1,
            borderBottom: searchType === 'post' ? '2px solid black' : '1px solid #ddd',
            cursor: 'pointer'
          }}
        >
          <PostAddIcon fontSize="small" /> 게시글
        </Box>
        <Box
          onClick={() => setSearchType('user')}
          sx={{
            flex: 1,
            textAlign: 'center',
            py: 1,
            borderBottom: searchType === 'user' ? '2px solid black' : '1px solid #ddd',
            cursor: 'pointer'
          }}
        >
          <PeopleIcon fontSize="small" /> 사람
        </Box>
      </Box>

      {!keyword && recent.length > 0 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1, py: 1 }}>
            <Typography fontSize={13} color="gray">최근 검색 항목</Typography>
            <Typography
              fontSize={13}
              color="skyblue"
              sx={{ cursor: 'pointer' }}
              onClick={() => setRecent([])}
            >
              모두 지우기
            </Typography>
          </Box>
          <Divider />
        </>
      )}

      <Box sx={{ flex: 1, overflowY: 'auto', mt: 1 }}>
        {(keyword ? result : recent).map((user, i) => (
          <Box
            key={i}
            sx={{ display: 'flex', alignItems: 'center', px: 1.5, py: 1, cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <Avatar src={user.profile} sx={{ width: 40, height: 40, mr: 1.5 }} />
            <Box>
              <Typography fontWeight="bold">{user.username}</Typography>
              <Typography fontSize={13} color="gray">{user.name}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}