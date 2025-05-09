import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/authFetch';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import {
    Box, Typography, Avatar, IconButton, InputBase, Button, Modal, Fade, Backdrop, CardMedia
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AddIcon from '@mui/icons-material/Add';
import Slider from 'react-slick';

dayjs.extend(relativeTime);
dayjs.locale('ko');

function formatTime(timestamp) {
    const hours = dayjs().diff(dayjs(timestamp), 'hour');
    if (hours < 1) return '방금';
    if (hours < 24) return `${hours}시간 전`;
    return dayjs(timestamp).fromNow();
}

function PostModal({ open, onClose, post }) {
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [input, setInput] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [openReplies, setOpenReplies] = useState({});

    useEffect(() => {
        if (post && open) loadComments(1, true);
    }, [post, open]);

    const loadComments = async (pageNum, reset = false) => {
        const res = await fetch(`http://localhost:3005/comments/${post.post_id}?page=${pageNum}&size=30`);
        const data = await res.json();
        if (data.success) {
            if (reset) setComments(data.comments);
            else setComments(prev => [...prev, ...data.comments]);
            setHasMore(data.comments.length === 30);
            setPage(pageNum);
        }
    };

    const handleLoadMore = () => loadComments(page + 1);

    const handleSubmit = async () => {
        const text = input.trim();
        if (!text) return;

        const res = await authFetch(`http://localhost:3005/comments/${post.post_id}`, {
            method: 'POST',
            body: JSON.stringify({ text, parent_comment_id: replyTo?.commentId || null })
        });

        const data = await res.json();
        if (data.success) {
            setInput('');
            setReplyTo(null);
            loadComments(1, true);
        }
    };

    if (!post) return null;

    return (
        <Modal open={open} onClose={onClose} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 300 } }}>
            <Fade in={open}>
                <Box sx={{ width: 777, height: 465, bgcolor: '#fff', display: 'flex', borderRadius: 2, overflow: 'hidden', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    {/* Left: Image */}
                    <Box sx={{ width: 372, height: 465, display: 'flex', flexDirection: 'column' }}>
                        <Slider dots arrows infinite={false} speed={500} slidesToShow={1} slidesToScroll={1} style={{ height: '100%' }}>
                            {(post?.images || [post?.image_url]).map((url, i) => (
                                <Box key={i} sx={{ width: 372, height: 465 }}>
                                    <CardMedia component="img" image={url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Box>
                            ))}
                        </Slider>
                    </Box>

                    {/* Right: Info */}
                    <Box sx={{ width: 404, height: 465, display: 'flex', flexDirection: 'column' }}>
                        {/* Top: Author */}
                        <Box sx={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar src={post.profile_image} sx={{ width: 32, height: 32, mr: 1 }} />
                                <Typography fontWeight="bold">{post.username}</Typography>
                            </Box>
                            <Typography sx={{ cursor: 'pointer' }}>···</Typography>
                        </Box>

                        {/* Middle: Comments */}
                        <Box sx={{ height: 247, overflowY: 'auto', px: 2, py: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
                            {/* Caption */}
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                <Avatar src={post.profile_image} sx={{ width: 28, height: 28, mr: 1 }} />
                                <Box>
                                    <Typography fontWeight="bold" fontSize={14}>{post.username}</Typography>
                                    <Typography fontSize={14}>{post.caption}</Typography>
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

                                    {/* Toggle replies */}
                                    {c.replies?.length > 0 && (
                                        <Typography
                                            sx={{ fontSize: 12, color: 'gray', cursor: 'pointer', mb: 1, ml: 5 }}
                                            onClick={() => setOpenReplies(prev => ({ ...prev, [c.commentId]: !prev[c.commentId] }))}
                                        >
                                            ── 답글 보기 ({c.replies.length}개)
                                        </Typography>
                                    )}

                                    {/* Replies */}
                                    {openReplies[c.commentId] && c.replies.map((r, j) => (
                                        <Box key={j} sx={{ display: 'flex', alignItems: 'flex-start', ml: 5, mb: 0.5 }}>
                                            <Avatar src={r.user.profile_image} sx={{ width: 24, height: 24, mr: 1 }} />
                                            <Box>
                                                <Typography fontWeight="bold" fontSize={14}>{r.user.username}</Typography>
                                                <Typography fontSize={14}>{r.text}</Typography>
                                                <Typography
                                                    sx={{ fontSize: 12, color: 'gray', cursor: 'pointer', ml: 1 }}
                                                    onClick={() => {
                                                        setReplyTo(c); // 최상위 댓글 기준으로
                                                        setInput(prev => prev.startsWith(`@${r.user.username}`) ? prev : `@${r.user.username} `);
                                                    }}
                                                >
                                                    답글 달기
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            ))}

                            {hasMore && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                                    <IconButton onClick={handleLoadMore} sx={{ border: '1px solid #ccc', width: 32, height: 32 }}>
                                        <AddIcon />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>

                        {/* Bottom: Actions and Input */}
                        <Box sx={{ borderTop: '1px solid #eee', px: 2, pt: 1, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <IconButton><FavoriteBorderIcon /></IconButton>
                                        <IconButton><ChatBubbleOutlineIcon /></IconButton>
                                        <IconButton><SendOutlinedIcon /></IconButton>
                                    </Box>
                                    <IconButton><BookmarkBorderIcon /></IconButton>
                                </Box>
                                <Typography fontWeight="bold">좋아요 {post.like_count?.toLocaleString()}개</Typography>
                                <Typography fontSize={12} color="gray">{formatTime(post.created_at)}</Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <InputBase
                                    fullWidth
                                    placeholder="댓글 달기..."
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    sx={{ px: 1, fontSize: 14 }}
                                />
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

export default PostModal;