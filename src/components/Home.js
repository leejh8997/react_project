// PostModal 컴포넌트를 분리해 import하여 재사용
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { authFetch } from '../utils/authFetch';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  Box, Typography, Avatar, useTheme, useMediaQuery, Card, CardHeader, CardContent, CardMedia,
  IconButton, InputBase, Button
} from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import PostModal from './PostModal';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import socket from '../utils/socket';
import { jwtDecode } from 'jwt-decode';

dayjs.extend(relativeTime);
dayjs.locale('ko');

const sampleStories = [
  { username: 'netflix', profile: '/images/profile1.jpg' },
  { username: 'sun_sunday', profile: '/images/profile2.jpg' },
  { username: 'kangseonki', profile: '/images/profile3.jpg' },
  { username: 'du.zin', profile: '/images/profile4.jpg' },
  { username: 'hyeontae', profile: '/images/profile5.jpg' },
  { username: 'minhyuk', profile: '/images/profile6.jpg' },
  { username: 'jane', profile: '/images/profile7.jpg' },
];

function Arrow({ className, style, onClick, isVisible, direction }) {
  if (!isVisible) return null;
  return (
    <div
      className={className}
      style={{ ...style, zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.5)', borderRadius: '50%', width: 32, height: 32, top: '35%', [direction === 'left' ? 'left' : 'right']: -12 }}
      onClick={onClick}
    >
      {direction === 'left' ? (
        <ArrowBackIosNewIcon sx={{ color: 'white', fontSize: 16 }} />
      ) : (
        <ArrowForwardIosIcon sx={{ color: 'white', fontSize: 16 }} />
      )}
    </div>
  );
}

function Home() {
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : {};
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const sliderRef = useRef(null);
  const [slideState, setSlideState] = useState({ current: 0, total: 0 });
  const [feeds, setFeeds] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [mutedMap, setMutedMap] = useState({});
  const videoRefs = useRef({});

  const handleAfterChange = (index) => {
    setSlideState(prev => ({ ...prev, current: index }));
  };

  const fetchPosts = useCallback(() => {
    authFetch('http://localhost:3005/posts/feed')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFeeds(data.feed);
          // initialize mute state
          const initialMuted = {};
          data.feed.forEach(post => {
            if (post.media_type === 'video') {
              initialMuted[post.post_id] = true;
            }
          });
          setMutedMap(initialMuted);
        }
      });
  }, []);

  useEffect(() => {
    if (sliderRef.current) {
      const total = React.Children.count(sliderRef.current.innerSlider.props.children);
      setSlideState(prev => ({ ...prev, total }));
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const handleFeedUpdate = () => {
      fetchPosts(); // ✅ 새 피드 불러오기
    };
    window.addEventListener('feedUpdated', handleFeedUpdate);
    return () => {
      window.removeEventListener('feedUpdated', handleFeedUpdate);
    };
  }, [fetchPosts]);

  const handleSubmitComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const res = await authFetch(`http://localhost:3005/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });

    const result = await res.json();
    if (result.success) {
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      // 댓글 알림 전송
      socket.emit('sendNotification', {
        toUserId: result.postOwnerId, // ← 서버에서 댓글 등록 후 응답에 포함되도록 하세요
        notification: {
          senderId: user.userId,
          type: result.type,
          extra: { text: result.text, file_url: result.thumbnailUrl },
          post: { post_id: postId }
        }
      });
    }
  };

  const handleCommentChange = (postId, text) => {
    setCommentInputs(prev => ({ ...prev, [postId]: text }));
  };

  const handleOpenModal = async (post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const handleToggleLike = async (postId) => {
    const res = await authFetch(`http://localhost:3005/likes/${postId}`, {
      method: 'POST'
    });
    const data = await res.json();
    if (data.success) {
      setFeeds(prev => prev.map(p =>
        p.post_id === postId ? {
          ...p,
          is_liked: data.liked,
          like_count: p.like_count + (data.liked ? 1 : -1)
        } : p
      ));
      if (data.liked) {
        socket.emit('sendNotification', {
          toUserId: data.postOwnerId, // ← 서버에서 좋아요 응답에 포함되도록 하세요
          notification: {
            senderId: user.userId,
            type: 'like',
            post: { post_id: postId },
            extra: {}
          }
        });
      }
    }
  };
  // 모달에서 좋아요, 댓글 달면 실시간으로 홈 페이지에 반영하는 콜백함수
  const handleModalLikeToggle = (postId, liked) => {
    setFeeds(prev =>
      prev.map(post =>
        post.post_id === postId
          ? { ...post, is_liked: liked, like_count: post.like_count + (liked ? 1 : -1) }
          : post
      )
    );
  };
  const handleModalCommentAdd = (postId) => {
    setFeeds(prev =>
      prev.map(post =>
        post.post_id === postId
          ? { ...post, comment_count: post.comment_count + 1 }
          : post
      )
    );
  };

  const handleMuteToggle = (postId) => {
    const video = videoRefs.current[postId];
    if (video) {
      const newMuted = !video.muted;
      video.muted = newMuted;
      setMutedMap(prev => ({ ...prev, [postId]: newMuted }));
    }
  };

  const handleVideoPlayToggle = (postId) => {
    const video = videoRefs.current[postId];
    if (video) {
      if (video.paused) video.play();
      else video.pause();
    }
  };

  const handleToggleBookmark = async (postId) => {
    const res = await authFetch('http://localhost:3005/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ postId }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      setFeeds(prev => prev.map(p => p.post_id === postId ? { ...p, is_bookmarked: data.bookmarked } : p));
    }
  };
  const handleModalBookmarkToggle = (postId, bookmarked) => {
    setFeeds(prev =>
      prev.map(post =>
        post.post_id === postId
          ? { ...post, is_bookmarked: bookmarked }
          : post
      )
    );
  };
  

  const slidesVisible = isMobile ? 4 : 6;
  const sliderSettings = {
    dots: false,
    infinite: false,
    speed: 800,
    slidesToShow: slidesVisible,
    slidesToScroll: 3,
    arrows: true,
    swipe: true,
    draggable: true,
    touchThreshold: 15,
    edgeFriction: 0.2,
    afterChange: handleAfterChange,
    nextArrow: <Arrow direction="right" isVisible={slideState.current + slidesVisible < slideState.total} />,
    prevArrow: <Arrow direction="left" isVisible={slideState.current > 0} />,
  };

  return (
    <Box
      sx={{
        px: isMobile ? 1 : 4,
        py: 2,
        backgroundColor: isDark ? '#000' : '#fff',
        minHeight: '100vh',
        color: isDark ? 'white' : 'black',
        zIndex: 0, // 👈 추가!
        position: 'relative', // 👈 z-index 적용 위해 필요
        '& ::-webkit-scrollbar': { display: 'none' },
        '& .slick-arrow.slick-prev:before, & .slick-arrow.slick-next:before': { display: 'none' }
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Slider ref={sliderRef} {...sliderSettings}>
          {sampleStories.map((user, idx) => (
            <Box key={idx} sx={{ textAlign: 'center', px: 1 }}>
              <Avatar src={user.profile} sx={{ width: 56, height: 56, mx: 'auto', border: '2px solid orange' }} />
              <Typography variant="caption" noWrap>{user.username}</Typography>
            </Box>
          ))}
        </Slider>
      </Box>

      <Box>
        {feeds.map((post, idx) => (
          <Card key={idx} sx={{ mb: 4, borderRadius: 2, backgroundColor: isDark ? '#121212' : '#fff' }}>
            <CardHeader avatar={<Avatar src={post.profile_image} />} title={<Typography fontWeight="bold">{post.username}</Typography>} subheader={new Date(post.created_at).toLocaleString()} action={<Typography sx={{ pr: 2 }}>···</Typography>} />
            <CardMedia sx={{ position: 'relative', zIndex: 1, '&:hover': { '& .MuiIconButton-root': { opacity: 1 } } }}>
              {post.media_type === 'video' && post.file_url ? (
                <>
                  <video
                    src={post.file_url}
                    ref={el => {
                      if (el) videoRefs.current[post.post_id] = el;
                    }}
                    onError={(e) => console.warn('비디오 로딩 실패:', e.target.src)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onClick={() => handleVideoPlayToggle(post.post_id)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMuteToggle(post.post_id);
                    }}
                    className="mute-button"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      width: 20,
                      height: 20,
                      zIndex: 10,
                    }}
                  >
                    {mutedMap[post.post_id] ? <VolumeOffIcon /> : <VolumeUpIcon />}
                  </button>
                </>
              ) : (
                <img
                  src={post.file_url}
                  alt="post"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </CardMedia>
            <CardContent sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                  <IconButton onClick={() => handleToggleLike(post.post_id)}>{post.is_liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}</IconButton>
                  {/* 말풍선 아이콘 클릭 시: */}
                  <IconButton onClick={() => handleOpenModal(post)}>
                    <ChatBubbleOutlineIcon />
                  </IconButton>
                  <IconButton><SendOutlinedIcon /></IconButton>
                </Box>
                <IconButton onClick={() => handleToggleBookmark(post.post_id)}>
                  {post.is_bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
              </Box>
              <Typography sx={{ fontWeight: 'bold', fontSize: 14, mb: 0.5 }}>좋아요 {post.like_count.toLocaleString()}개</Typography>
              <Typography fontWeight="bold" sx={{ display: 'inline' }}>{post.username}</Typography>
              <Typography sx={{ display: 'inline', ml: 1 }}>{post.caption}</Typography>
              <Box mt={1}>
                {post.caption?.match(/#[^\s#]+/g)?.map((tag, i) => (
                  <Typography key={i} component="span" sx={{ color: 'skyblue', mr: 1, fontSize: 14 }}>{tag}</Typography>
                ))}
              </Box>
              <Typography sx={{ mt: 1, fontSize: 14, color: 'gray', cursor: 'pointer' }} onClick={() => handleOpenModal(post)}>댓글 {post.comment_count}개 모두 보기</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <InputBase fullWidth placeholder="댓글 달기..." value={commentInputs[post.post_id] || ''} onChange={e => handleCommentChange(post.post_id, e.target.value)} sx={{ px: 1, fontSize: 14 }} />
                {commentInputs[post.post_id]?.trim() && (
                  <Button onClick={() => handleSubmitComment(post.post_id)} sx={{ color: 'skyblue', fontWeight: 'bold' }}>게시</Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <PostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        post={selectedPost}
        onLikeToggle={handleModalLikeToggle}
        onCommentAdd={handleModalCommentAdd}
        onBookmarkToggle={handleModalBookmarkToggle}
      />
    </Box>
  );
}

export default Home;
