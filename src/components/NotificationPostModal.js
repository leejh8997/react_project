// components/NotificationPostModal.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
  Box, Typography, Avatar, IconButton, InputBase, Button, Modal, Fade, Backdrop, CardMedia
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Slider from 'react-slick';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { authFetch } from '../utils/authFetch';
import MentionInput from './MentionInput';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import socket from '../utils/socket';

dayjs.extend(relativeTime);
dayjs.locale('ko');

function formatTime(timestamp) {
  const hours = dayjs().diff(dayjs(timestamp), 'hour');
  if (hours < 1) return '방금';
  if (hours < 24) return `${hours}시간 전`;
  return dayjs(timestamp).fromNow();
}

function Arrow({ className, style, onClick, direction, isVisible }) {
  if (!isVisible) return null;
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        ...style,
        zIndex: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        borderRadius: '50%',
        width: 32,
        height: 32,
        top: '50%',
        transform: 'translateY(-50%)',
        [direction === 'left' ? 'left' : 'right']: 12
      }}
    >
      {direction === 'left' ? (
        <ArrowBackIosNewIcon sx={{ color: 'white', fontSize: 16 }} />
      ) : (
        <ArrowForwardIosIcon sx={{ color: 'white', fontSize: 16 }} />
      )}
    </div>
  );
}

export default function NotificationPostModal({ open, onClose, post }) {
  const [postData, setPostData] = useState(null);
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [input, setInput] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [openReplies, setOpenReplies] = useState({});
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [files, setFiles] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const commentInputRef = useRef(null);
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : {};

  useEffect(() => {
    if (open && post?.post_id) {
      authFetch(`http://localhost:3005/posts/${post.post_id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const p = data.post;
            setPostData(p);
            setFiles(p.files || []);
            setLikeCount(p.like_count || 0);
            setLiked(p.is_liked || false);
            setBookmarked(p.is_bookmarked || false);
            loadComments(1, true, p.postId);
          }
        });
    }
  }, [post, open]);

  const loadComments = async (pageNum, reset = false, postId) => {
    const res = await authFetch(`http://localhost:3005/comments/${postId}?page=${pageNum}&size=30`);
    const data = await res.json();
    if (data.success) {
      if (reset) setComments(data.comments);
      else setComments(prev => [...prev, ...data.comments]);
      setHasMore(data.comments.length === 30);
      setPage(pageNum);
    }
  };

  const handleToggleLike = async () => {
    const res = await authFetch(`http://localhost:3005/likes/${postData.postId}`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      setLiked(data.liked);
      setLikeCount(prev => prev + (data.liked ? 1 : -1));
    }
  };

  const handleToggleBookmark = async () => {
    const res = await authFetch('http://localhost:3005/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ postId: postData.postId }),
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) setBookmarked(data.bookmarked);
  };

  const handleSubmit = async () => {
    const text = input.trim();
    if (!text) return;

    const res = await authFetch(`http://localhost:3005/comments/${postData.postId}`, {
      method: 'POST',
      body: JSON.stringify({ text, parent_comment_id: replyTo?.commentId || null })
    });

    const data = await res.json();
    if (data.success) {
      setInput('');
      setReplyTo(null);
      loadComments(1, true, postData.postId);
    }
  };

  if (!postData) return null;

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 300 } }}>
      <Fade in={open}>
        <Box sx={{ width: 777, height: 465, bgcolor: '#fff', display: 'flex', borderRadius: 2, overflow: 'hidden', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          {/* Left: Media */}
          <Box sx={{ width: 372, height: 465, display: 'flex', flexDirection: 'column', '& .slick-prev:before, & .slick-next:before': { display: 'none' } }}>
            <Slider
              ref={sliderRef}
              dots
              arrows
              infinite={false}
              speed={500}
              slidesToShow={1}
              slidesToScroll={1}
              afterChange={(i) => setCurrentSlide(i)}
              nextArrow={<Arrow direction="right" isVisible={currentSlide < files.length - 1} />}
              prevArrow={<Arrow direction="left" isVisible={currentSlide > 0} />}
            >
              {(files || []).map((file, i) => (
                <Box key={i} sx={{ width: 372, height: 465, position: 'relative' }}>
                  {file.media_type === 'video' ? (
                    <>
                      <CardMedia
                        ref={videoRef}
                        component="video"
                        src={file.file_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        onClick={() => {
                          if (videoRef.current.paused) {
                            videoRef.current.play();
                            setIsPlaying(true);
                          } else {
                            videoRef.current.pause();
                            setIsPlaying(false);
                          }
                        }}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button onClick={() => {
                        const muted = !videoRef.current.muted;
                        videoRef.current.muted = muted;
                        setIsMuted(muted);
                      }} className="mute-button">
                        {isMuted ? <VolumeOffIcon sx={{ width: 20, height: 20 }} /> : <VolumeUpIcon sx={{ width: 20, height: 20 }} />}
                      </button>
                    </>
                  ) : (
                    <CardMedia
                      component="img"
                      image={file.file_url}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                </Box>
              ))}
            </Slider>
          </Box>

          {/* Right: Info */}
          <Box sx={{ width: 404, height: 465, display: 'flex', flexDirection: 'column' }}>
            {/* Top: Author */}
            <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar src={postData.user.profile_image} sx={{ width: 32, height: 32, mr: 1 }} />
                <Typography fontWeight="bold">{postData.user.username}</Typography>
              </Box>
              <Typography sx={{ cursor: 'pointer' }}>···</Typography>
            </Box>

            {/* Middle: Caption & Comments */}
            <Box sx={{ height: 247, overflowY: 'auto', px: 2, py: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {/* Caption */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Avatar src={postData.user.profile_image} sx={{ width: 28, height: 28, mr: 1 }} />
                <Box>
                  <Typography fontWeight="bold" fontSize={14}>{postData.user.username}</Typography>
                  <Typography fontSize={14}>{postData.caption}</Typography>
                </Box>
              </Box>

              {/* Comments */}
              {comments.map((c, i) => (
                <Box key={i}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 0.5 }}>
                    <Avatar src={c.user.profile_image} sx={{ width: 28, height: 28, mr: 1 }} />
                    <Box>
                      <Typography fontWeight="bold" fontSize={14}>{c.user.username}</Typography>
                      <Typography fontSize={14}>{c.text}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'gray', cursor: 'pointer', ml: 1 }}
                        onClick={() => {
                          setReplyTo(c);
                          setInput(prev => prev.startsWith(`@${c.user.username}`) ? prev : `@${c.user.username} `);
                        }}>
                        답글 달기
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}

              {hasMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                  <IconButton onClick={() => loadComments(page + 1, false, postData.postId)} sx={{ border: '1px solid #ccc', width: 32, height: 32 }}>
                    <AddIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* Bottom: Actions & Input */}
            <Box sx={{ borderTop: '1px solid #eee', px: 2, pt: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box>
                    <IconButton onClick={handleToggleLike}>
                      {liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <IconButton onClick={() => commentInputRef.current?.focus()}>
                      <ChatBubbleOutlineIcon />
                    </IconButton>
                    <IconButton><SendOutlinedIcon /></IconButton>
                  </Box>
                  <IconButton onClick={handleToggleBookmark}>
                    {bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Box>
                <Typography fontWeight="bold">좋아요 {likeCount.toLocaleString()}개</Typography>
                <Typography fontSize={12} color="gray">{formatTime(postData.createdAt)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <MentionInput
                    inputRef={commentInputRef}
                    value={input}
                    onChange={setInput}
                    handleSubmit={handleSubmit}
                    placeholder="댓글 달기..."
                    suggestionPosition="bottom"
                  />
                </Box>
                {input.trim() && (
                  <Button onClick={handleSubmit} sx={{ color: 'skyblue', fontWeight: 'bold' }}>게시</Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
