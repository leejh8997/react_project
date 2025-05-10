// PostModal 컴포넌트를 분리해 import하여 재사용
import React, { useRef, useEffect, useState } from 'react';
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
import PostModal from './PostModal';

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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const sliderRef = useRef(null);
  const [slideState, setSlideState] = useState({ current: 0, total: 0 });
  const [feeds, setFeeds] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleAfterChange = (index) => {
    setSlideState(prev => ({ ...prev, current: index }));
  };

  useEffect(() => {
    if (sliderRef.current) {
      const total = React.Children.count(sliderRef.current.innerSlider.props.children);
      setSlideState(prev => ({ ...prev, total }));
    }
  }, []);

  useEffect(() => {
    authFetch('http://localhost:3005/posts/feed')
    .then(res => res.json())
    .then(data => {
      console.log(data.feed);
      if (data.success) setFeeds(data.feed);
    });
  }, []);

  const handleSubmitComment = async (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const res = await authFetch(`http://localhost:3005/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });

    const result = await res.json();
    if (result.success) {
      alert('댓글 등록 완료');
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
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
    }
  };
  const handleModalLikeToggle = (postId, liked) => {
    setFeeds(prev =>
      prev.map(post =>
        post.post_id === postId
          ? { ...post, is_liked: liked, like_count: post.like_count + (liked ? 1 : -1) }
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
      sx={{ px: isMobile ? 1 : 4, py: 2, backgroundColor: isDark ? '#000' : '#fff', minHeight: '100vh', color: isDark ? 'white' : 'black', '& ::-webkit-scrollbar': { display: 'none' }, '& .slick-arrow.slick-prev:before, & .slick-arrow.slick-next:before': { display: 'none' } }}
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
            <CardMedia component="img" image={post.file_url} alt="post" sx={{ borderRadius: 0 }} />
            <CardContent sx={{ py: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Box>
                  <IconButton onClick={() => handleToggleLike(post.post_id)}>{post.is_liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}</IconButton>
                  <IconButton><ChatBubbleOutlineIcon /></IconButton>
                  <IconButton><SendOutlinedIcon /></IconButton>
                </Box>
                <IconButton><BookmarkBorderIcon /></IconButton>
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
      />
    </Box>
  );
}

export default Home;
