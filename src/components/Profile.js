import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Avatar, Button, IconButton, Divider, Modal, Fade,
  Tabs, Tab, ImageList, ImageListItem
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SettingsIcon from '@mui/icons-material/Settings';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PostModal from './PostModal';
import { authFetch } from '../utils/authFetch';
import { jwtDecode } from 'jwt-decode';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import socket from '../utils/socket';

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
  const { username } = useParams(); // /users/:username 경로 기반
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followListType, setFollowListType] = useState(''); // 'followers' or 'followings'
  const [followList, setFollowList] = useState([]);
  const [hoveredUserId, setHoveredUserId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUnfollowId, setPendingUnfollowId] = useState(null);
  const fileInputRef = useRef(null);
  const isMe = user.username === username;
  const navigate = useNavigate();
  const location = useLocation();


  const fetchUserInfo = async () => {
    const res = await authFetch(`http://localhost:3005/users/${username}`);
    const data = await res.json();
    console.log("userinfo====>", data);
    if (data.success) {
      setUserInfo(data.user);
      setProfileImage(data.user.profile_image);
    }
  };

  useEffect(() => {
    if (!username) return;

    if (tab === 0) {
      // 게시물
      authFetch(`http://localhost:3005/posts/user/${username}`)
        .then(res => res.json())
        .then(data => {
          console.log("내 게시물====>", data);
          if (data.success) setPosts(data.posts);
        });
    } else if (tab === 1 && isMe) {
      // 저장됨
      authFetch(`http://localhost:3005/users/${user.userId}/bookmarks`)
        .then(res => res.json())
        .then(data => {
          console.log("내 북마크====>", data);
          if (data.success) setPosts(data.posts);
        });
    }
  }, [username, tab]);

  useEffect(() => {
    // 페이지 이동이 발생하면 팔로우 모달 닫기
    setFollowModalOpen(false);
    setConfirmOpen(false); // 삭제 확인 모달도 같이 닫을 수 있음
    setPendingUnfollowId(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!username) return;
    fetchUserInfo();
  }, [username]);

  const handleFollowList = (type) => {
    if (!type) return;
    setFollowListType(type);
    setFollowModalOpen(true);

    authFetch(`http://localhost:3005/users/${username}/${type}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFollowList(data.users);
        }
      });
  };

  const handleFollow = async (targetUserId) => {
    // const res = await authFetch(`http://localhost:3005/follow`, {
    //   method: 'POST',
    //   body: JSON.stringify({ targetUserId }),
    //   headers: { 'Content-Type': 'application/json' }
    // });

    // const data = await res.json();
    // if (data.success) {
    // 🔔 알림 보내기
    socket.emit('sendNotification', {
      toUserId: userInfo.user_id,
      notification: {
        senderId: user.userId,
        type: 'follow-request'
      }
    });

    // // 팔로우 후 목록 다시 로드
    // if (followModalOpen && followListType) {
    //   handleFollowList(followListType);
    // }
    // fetchUserInfo(); // 사용자 정보 다시 불러오기 (카운트 갱신용)
    // }
  };
  // 팔로잉 => 언팔
  const handleUnfollow = async (targetUserId) => {
    const res = await authFetch(`http://localhost:3005/users/unfollow`, {
      method: 'DELETE',
      body: JSON.stringify({ targetUserId }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      if (followModalOpen && followListType) {
        handleFollowList(followListType); // 다시 목록 새로고침
      }
      fetchUserInfo(); // 사용자 정보 다시 불러오기 (카운트 갱신용)
    }
  };
  // 팔로워, 팔로잉 언팔
  const removeFollower = async (followerUserId) => {
    const res = await authFetch(`http://localhost:3005/follow/remove-follower`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerUserId }),
    });

    const data = await res.json();
    if (data.success) {
      if (followModalOpen && followListType) {
        handleFollowList(followListType); // 목록 다시 로드
      }
      fetchUserInfo(); // 카운트 반영
    }
  };

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

  const handleModalLikeToggle = (postId, liked) => {
    setPosts(prev =>
      prev.map(post =>
        post.post_id === postId
          ? { ...post, is_liked: liked, like_count: post.like_count + (liked ? 1 : -1) }
          : post
      )
    );
  };

  const handleModalCommentAdd = (postId) => {
    setPosts(prev =>
      prev.map(post =>
        post.post_id === postId
          ? { ...post, comment_count: post.comment_count + 1 }
          : post
      )
    );
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
            {isMe ? (
              <>
                <Button variant="outlined">프로필 편집</Button>
                <Button variant="outlined">보관된 스토리 보기</Button>
                <IconButton><SettingsIcon /></IconButton>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    if (userInfo?.isFollowing) {
                      await handleUnfollow(userInfo.user_id);
                    } else {
                      await handleFollow(userInfo.user_id);
                    }
                    fetchUserInfo(); // 팔로우 상태 갱신
                  }}
                  onMouseEnter={() => userInfo?.isFollowing && setHoveredUserId(userInfo.user_id)}
                  onMouseLeave={() => userInfo?.isFollowing && setHoveredUserId(null)}
                >
                  {userInfo?.isFollowing
                    ? hoveredUserId === userInfo.user_id
                      ? '언팔로우'
                      : '팔로잉'
                    : '팔로우'}
                </Button>
                {userInfo?.isFollowing && (
                  <Button variant="outlined" onClick={() => navigate(`/messages/${userInfo.user_id}`)}>
                    메시지 보내기
                  </Button>
                )}
              </>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
            <Typography>
              게시물 <strong>{userInfo?.postCount}</strong>
            </Typography>
            <Typography sx={{ cursor: 'pointer' }} onClick={() => handleFollowList('followers')}>
              팔로워 <strong>{userInfo?.followerCount}</strong>
            </Typography>
            <Typography sx={{ cursor: 'pointer' }} onClick={() => handleFollowList('followings')}>
              팔로우 <strong>{userInfo?.followingCount}</strong>
            </Typography>
          </Box>

          <Typography fontWeight="bold">{userInfo?.full_name}</Typography>
          <Typography sx={{ whiteSpace: 'pre-line' }}>{userInfo?.bio}</Typography>
        </Box>
      </Box>

      {isMe && (
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Box sx={{ textAlign: 'center' }}>
            <IconButton><AddCircleOutlineIcon sx={{ fontSize: 56 }} /></IconButton>
            <Typography variant="caption">신규</Typography>
          </Box>
        </Box>
      )}

      <Divider sx={{ mb: 2 }} />

      <Tabs value={tab} onChange={handleTabChange} centered textColor="inherit" TabIndicatorProps={{ style: { backgroundColor: 'black' } }}>
        <Tab label="게시물" />
        <Tab label="저장됨" />
        <Tab label="태그됨" />
      </Tabs>
      <ImageList cols={3} rowHeight={250} sx={{ mt: 2 }}>
       {(tab === 0 || tab === 1 ? posts : []).map(post => (
          <ImageListItem
            key={post.post_id}
            onClick={() => {
              setSelectedPost(post);
              setModalOpen(true);
            }}
            sx={{
              cursor: 'pointer',
              position: 'relative',
              '&:hover .overlay': {
                opacity: 1
              }
            }}
          >
            {post.media_type === 'image' ? (
              <img
                src={post.file_url}
                alt={post.caption}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <video
                src={post.file_url}
                muted
                playsInline
                preload="metadata"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}

            {/* Hover overlay */}
            <Box
              className="overlay"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                opacity: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                gap: 2,
                transition: 'opacity 0.2s ease'
              }}
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <FavoriteIcon fontSize="small" />
                <Typography fontWeight="bold">{post.like_count}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <ChatBubbleOutlineIcon fontSize="small" />
                <Typography fontWeight="bold">{post.comment_count}</Typography>
              </Box>
            </Box>
          </ImageListItem>
        ))}
      </ImageList>

      <PostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        post={selectedPost}
        onLikeToggle={handleModalLikeToggle}
        onCommentAdd={handleModalCommentAdd}
      />

      <Modal open={bgBlur} onClose={() => setBgBlur(false)}>
        <Fade in={bgBlur}>
          <Box sx={{ width: '100vw', height: '100vh', backdropFilter: 'blur(5px)' }} />
        </Fade>
      </Modal>
      <Modal open={followModalOpen} onClose={() => setFollowModalOpen(false)}>
        <Fade in={followModalOpen}>
          <Box sx={{
            width: 400, maxHeight: 500, overflowY: 'auto',
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', bgcolor: '#fff',
            borderRadius: 2, p: 2
          }}>
            <Typography fontWeight="bold" textAlign="center" mb={2}>
              {followListType === 'followers' ? '팔로워' : '팔로우'}
            </Typography>
            <Divider />
            {followList.map((userItem) => (
              <Box key={userItem.user_id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
                  onClick={() => {
                    setFollowModalOpen(false);
                    navigate(`/profile/${userItem.username}`);
                  }}>
                  <Avatar src={userItem.profile_image || '/default-profile.png'} />
                  <Box>
                    <Typography fontWeight="bold">{userItem.username}</Typography>
                    <Typography variant="caption" color="text.secondary">{userItem.full_name}</Typography>
                  </Box>
                </Box>
                {userItem.user_id !== user.userId && (
                  <>
                    {followListType === 'followings' ? (
                      // Followings 목록일 때 팔로우 / 팔로잉 토글
                      <Button
                        size="small"
                        variant={userItem.isFollowed ? 'outlined' : 'contained'}
                        onClick={() => {
                          if (!userItem.isFollowed) {
                            handleFollow(userItem.user_id);
                          } else {
                            handleUnfollow(userItem.user_id);
                          }
                        }}
                        onMouseEnter={() => userItem.isFollowed && setHoveredUserId(userItem.user_id)}
                        onMouseLeave={() => userItem.isFollowed && setHoveredUserId(null)}
                      >
                        {userItem.isFollowed
                          ? hoveredUserId === userItem.user_id
                            ? '언팔로우'
                            : '팔로잉'
                          : '팔로우'}
                      </Button>
                    ) : (
                      // Followers 목록일 때 '삭제' 버튼만
                      <Button
                        color="error"
                        variant="text"
                        onClick={() => {
                          setPendingUnfollowId(userItem.user_id);
                          setConfirmOpen(true);
                        }}
                      >
                        삭제
                      </Button>
                    )}
                  </>
                )}
              </Box>
            ))}
          </Box>
        </Fade>
      </Modal>
      {/* 팔로워 삭제 확인 모달 */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Fade in={confirmOpen}>
          <Box sx={{
            width: 300,
            p: 3,
            borderRadius: 2,
            bgcolor: '#fff',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <Typography variant="body1" mb={2}>
              해당 팔로워를 삭제하시겠습니까?
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Button onClick={() => setConfirmOpen(false)}>취소</Button>
              <Button
                color="error"
                variant="contained"
                onClick={() => {
                  if (pendingUnfollowId) {
                    removeFollower(pendingUnfollowId);
                    handleUnfollow(pendingUnfollowId)
                    setConfirmOpen(false);
                    setPendingUnfollowId(null);
                  }
                }}
              >
                삭제
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}

export default Profile;