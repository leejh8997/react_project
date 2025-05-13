// ✅ SearchPanel.jsx 수정버전
import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, InputBase, IconButton, Divider, Avatar, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PostAddIcon from '@mui/icons-material/PostAdd';
import PeopleIcon from '@mui/icons-material/People';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';
import PostModal from './PostModal';
import { debounce } from 'lodash';

export default function Search({ open, onClose }) {
  const [searchType, setSearchType] = useState('user');
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [recent, setRecent] = useState([
    { username: 'jye_e', name: '지예', profile: '/images/profile1.jpg' }
  ]);
  const [result, setResult] = useState([]);

  const wrapperRef = useRef();
  const navigate = useNavigate();
  const [selectedPost, setSelectedPost] = useState(null); // ✅ 포스트 선택 상태
  const [modalOpen, setModalOpen] = useState(false); // ✅ 모달 열기 상태

  const fetchSearch = debounce(async (q) => {
    if (!q.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`http://localhost:3005/search?q=${encodeURIComponent(q)}&type=${searchType}`);
      const data = await res.json();
      if (data.success) {
        setResult(searchType === 'user' ? data.users : data.posts);
      } else {
        setResult([]);
      }
    } catch (err) {
      console.error('검색 실패:', err);
      setResult([]);
    } finally {
      setSearching(false);
    }
  }, 1000);

  useEffect(() => {
    if (keyword.trim()) {
      fetchSearch(keyword);
    } else {
      setResult([]);
    }
  }, [keyword, searchType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalOpen) return;
      if (open && wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        onClose(); // ✅ 외부 클릭 시 닫기
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose, modalOpen]);

  return (
    <Box
      ref={wrapperRef}
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
        {(keyword ? result : recent).map((item, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
            onClick={(e) => {
              if (searchType === 'user') {
                e.stopPropagation();
                navigate(`/profile/${item.username}`);
                onClose(); // 패널 닫기
              } else if (searchType === 'post') {
                setSelectedPost(item);
                setModalOpen(true); // 모달만 열고 패널 유지
              }
            }}
          >
            <Avatar src={item.profile_image || item.profile} sx={{ width: 40, height: 40, mr: 1.5 }} />
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                py: 1,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              onClick={() => {
                if (searchType === 'user') {
                  navigate(`/profile/${item.username}`);
                  onClose(); // 검색 패널 닫기
                } else if (searchType === 'post') {
                  
                  setSelectedPost(item);
                  setModalOpen(true);
                }
                console.log("sefdsfsgssdg",item);
              }}
            >
              <Typography fontWeight="bold" component="div">
                {searchType === 'user' ? item.username : item.caption}
              </Typography>
              <Typography fontSize={13} color="gray" component="span">
                {searchType === 'user' ? item.full_name || item.name : `작성자: ${item.username}`}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
      {searchType === 'post' && selectedPost && (
        <PostModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          post={selectedPost}
        />
      )}
    </Box>
  );
}