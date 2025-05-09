import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Avatar, Button, IconButton, Divider, Modal, Fade,
  Tabs, Tab, ImageList, ImageListItem
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PostModal from './PostModal';
import { authFetch } from '../utils/authFetch';
import { jwtDecode } from 'jwt-decode';

function Profile() {
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : {};

  const [tab, setTab] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [posts, setPosts] = useState([]);
  const [profileImage, setProfileImage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [bgBlur, setBgBlur] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user.username) return;
    authFetch(`http://localhost:3005/users/${user.username}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserInfo(data.user);
          setProfileImage(data.user.profile_image);
        }
      });
  }, [user.username]);

  useEffect(() => {
    if (!user.user_id) return;
    authFetch(`http://localhost:3005/posts/user/${user.user_id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPosts(data.posts);
        }
      });
  }, [user.user_id]);

  const handleTabChange = (_, newValue) => setTab(newValue);
  const handleProfileClick = () => {
    setBgBlur(true);
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return setBgBlur(false);

    const formData = new FormData();
    formData.append('profile_image', file);

    const res = await authFetch('http://localhost:3005/users/me', {
      method: 'PUT',
      body: formData
    });

    const result = await res.json();
    if (result.success) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        setBgBlur(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // if (!userInfo) return <Typography sx={{ mt: 10, textAlign: 'center' }}>불러오는 중...</Typography>;

  return (
    <Box sx={{ maxWidth: 935, mx: 'auto', px: 2, py: 5 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 8, mb: 5 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar src={profileImage} sx={{ width: 150, height: 150 }} />
          <IconButton onClick={handleProfileClick} sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#fff' }}>
            <PhotoCameraIcon />
          </IconButton>
          <input hidden type="file" ref={fileInputRef} accept="image/*" onChange={handleImageChange} />
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6">{userInfo?.username}</Typography>
            <Button variant="outlined">프로필 편집</Button>
            <Button variant="outlined">보관된 스토리 보기</Button>
            <IconButton><SettingsIcon /></IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
            <Typography>게시물 <strong>{userInfo?.postCount}</strong></Typography>
            <Typography>팔로워 <strong>{userInfo?.followerCount}</strong></Typography>
            <Typography>팔로우 <strong>{userInfo?.followingCount}</strong></Typography>
          </Box>

          <Typography fontWeight="bold">{userInfo?.full_name}</Typography>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{userInfo?.bio}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton><AddCircleOutlineIcon sx={{ fontSize: 56 }} /></IconButton>
          <Typography variant="caption">신규</Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Tabs value={tab} onChange={handleTabChange} centered textColor="inherit" TabIndicatorProps={{ style: { backgroundColor: 'black' } }}>
        <Tab label="게시물" />
        <Tab label="저장됨" />
        <Tab label="태그됨" />
      </Tabs>

      <ImageList cols={3} rowHeight={250} sx={{ mt: 2 }}>
        {(tab === 0 ? posts : []).map(post => (
          <ImageListItem key={post.post_id} onClick={() => { setSelectedPost(post); setModalOpen(true); }} sx={{ cursor: 'pointer' }}>
            <img src={post.image_url} alt={post.post_id} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </ImageListItem>
        ))}
      </ImageList>

      <PostModal open={modalOpen} onClose={() => setModalOpen(false)} post={selectedPost} />

      <Modal open={bgBlur} onClose={() => setBgBlur(false)}>
        <Fade in={bgBlur}>
          <Box sx={{ width: '100vw', height: '100vh', backdropFilter: 'blur(5px)' }} />
        </Fade>
      </Modal>
    </Box>
  );
}

export default Profile;