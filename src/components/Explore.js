import React, { useEffect, useState } from 'react';
import { Box, Typography, ImageList, ImageListItem } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MovieIcon from '@mui/icons-material/Movie';
import CollectionsIcon from '@mui/icons-material/Collections';
import PostModal from './PostModal';
import { authFetch } from '../utils/authFetch';

function Explore() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    authFetch('http://localhost:3005/posts/explore')
      .then(res => res.json())
      .then(data => {
        if (data.success) setPosts(data.posts);
        console.log(posts);
      });
  }, []);

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

  return (
    <Box>
      <ImageList cols={3} gap={4} rowHeight={280}>
        {posts.map(post => (
          <ImageListItem
            key={post.post_id}
            onClick={() => {
              setSelectedPost(post);
              setModalOpen(true);
            }}
            sx={{
              cursor: 'pointer',
              position: 'relative',
              '&:hover .overlay': { opacity: 1 }
            }}
          >
            {post.media_type === 'image' ? (
              <img
                src={post.file_url}
                alt={post.caption}
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
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                opacity: 0,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                transition: 'opacity 0.2s ease'
              }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <FavoriteIcon />
                <Typography component="span">{post.like_count}</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <ChatBubbleOutlineIcon />
                <Typography component="span">{post.comment_count}</Typography>
              </Box>
            </Box>
            {/* Top-right indicator */}
            <Box sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', display: 'flex', gap: 1 }}>
              {post.media_type === 'video' && <MovieIcon fontSize="small" />}
              {post.media_type !== 'video' && post.file_count > 1 && <CollectionsIcon fontSize="small" />}
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
    </Box>
  );
}

export default Explore;