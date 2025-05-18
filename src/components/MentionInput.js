import React, { useState, useRef, useEffect } from 'react';
import { Box, InputBase, Paper, Avatar, Typography } from '@mui/material';
import { authFetch } from '../utils/authFetch';

function MentionInput({ value, onChange, handleSubmit, inputRef, placeholder, minRows, suggestionPosition = 'top' }) {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [cursor, setCursor] = useState(null);
    const localInputRef = useRef(null);
    const mergedRef = inputRef ?? localInputRef;

    const getLastMentionKeyword = (text, caretPosition) => {
        const subText = text.substring(0, caretPosition);
        const match = subText.match(/@([\w\d_.-]{1,})$/);
        return match ? match[1] : null;
    };

    const handleInputChange = (e) => {
        const text = e.target.value;
        const caretPos = e.target.selectionStart;
        setCursor(caretPos);
        onChange(text);

        const keyword = getLastMentionKeyword(text, caretPos);
        if (keyword?.length > 0) {
            authFetch(`http://localhost:3005/search/mention?keyword=${encodeURIComponent(keyword)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setSuggestions(data.users);
                        setShowSuggestions(true);
                    } else {
                        setShowSuggestions(false);
                    }
                });
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (user) => {
        if (cursor === null) return;
        const prefix = value.slice(0, cursor);
        const suffix = value.slice(cursor);
        const newPrefix = prefix.replace(/@([\w\d_.-]{1,})$/, `@${user.username} `);
        const newText = newPrefix + suffix;
        onChange(newText);
        setShowSuggestions(false);

        setTimeout(() => {
            const pos = newPrefix.length;
            if (mergedRef.current) {
                mergedRef.current.setSelectionRange(pos, pos);
                mergedRef.current.focus();
            }
        }, 0);
    };

    return (
        <Box sx={{ position: 'relative' }}>
            <InputBase
                inputRef={mergedRef}
                multiline
                fullWidth
                minRows={minRows}
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault(); // 줄바꿈 방지
                        handleSubmit?.();
                    }
                }}
                sx={{ px: 1, fontSize: 14 }}
            />

            {showSuggestions && suggestions.length > 0 && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'absolute',
                        [suggestionPosition]: '25%',
                        left: 0,
                        zIndex: 10,
                        width: '100%',
                    }}
                >
                    {suggestions.map((user) => (
                        <Box
                            key={user.user_id}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 1,
                                py: 1,
                                cursor: 'pointer',
                                '&:hover': { backgroundColor: '#f0f0f0' }
                            }}
                            onMouseDown={() => handleSuggestionClick(user)}
                        >
                            <Avatar src={user.profile_image} sx={{ width: 32, height: 32, mr: 1 }} />
                            <Box>
                                <Typography fontWeight="bold">{user.username}</Typography>
                                <Typography fontSize={12} color="gray">{user.full_name || 'N/A'}</Typography>
                            </Box>
                        </Box>
                    ))}
                </Paper>
            )}
        </Box>
    );
}

export default MentionInput;
