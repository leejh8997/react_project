// ProfileEditModal.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Modal, Fade, TextField, Button, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { authFetch } from '../utils/authFetch';

export default function ProfileEditModal({ open, onClose, user }) {
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [checking, setChecking] = useState(false);
    const [checkMessage, setCheckMessage] = useState('');
    const [showPwModal, setShowPwModal] = useState(false);
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setBio(user.bio || '');
        }
    }, [user]);

    if (!user) return null; // ⛔️ 오류 방지

    const handleUsernameCheck = async () => {
        setChecking(true);
        const res = await fetch(`http://localhost:3005/users/check-username?username=${username}`);
        const data = await res.json();
        setChecking(false);
        setCheckMessage(data.available ? '사용 가능한 아이디입니다.' : '이미 사용 중입니다.');
    };

    const handleSave = async () => {
        const res = await authFetch('http://localhost:3005/users/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, bio })
        });
        const result = await res.json();
        if (result.success) {
            alert('저장되었습니다.');
            onClose();
        }
    };

    const handleChangePassword = async () => {
        if (newPw !== confirmPw) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        const res = await authFetch('http://localhost:3005/users/change-password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: newPw })
        });
        const result = await res.json();
        if (result.success) {
            alert('비밀번호가 변경되었습니다.');
            setShowPwModal(false);
        }
    };

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <Fade in={open}>
                    <Box sx={{ width: 400, p: 3, bgcolor: 'white', borderRadius: 2, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography fontWeight="bold">프로필 편집</Typography>
                            <IconButton onClick={onClose}><CloseIcon /></IconButton>
                        </Box>

                        <TextField label="이메일" value={user.email} fullWidth margin="normal" InputProps={{ readOnly: true }} />
                        <TextField label="이름" value={user.full_name} fullWidth margin="normal" InputProps={{ readOnly: true }} />

                        <Button fullWidth variant="outlined" onClick={() => setShowPwModal(true)} sx={{ my: 1 }}>비밀번호 변경</Button>

                        <TextField label="유저네임" value={username} onChange={e => setUsername(e.target.value)} fullWidth margin="normal" />
                        <Button size="small" onClick={handleUsernameCheck} disabled={checking} sx={{ mb: 1 }}>중복 체크</Button>
                        <Typography variant="caption" color="gray">{checkMessage}</Typography>

                        <TextField label="자기소개" value={bio} onChange={e => setBio(e.target.value)} fullWidth multiline rows={3} margin="normal" />

                        <Box display="flex" justifyContent="space-between" mt={2}>
                            <Button onClick={onClose}>취소</Button>
                            <Button variant="contained" onClick={handleSave}>저장</Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>

            {/* 비밀번호 변경 모달 */}
            <Modal open={showPwModal} onClose={() => setShowPwModal(false)}>
                <Fade in={showPwModal}>
                    <Box sx={{ width: 300, p: 3, bgcolor: 'white', borderRadius: 2, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <Typography fontWeight="bold" mb={2}>비밀번호 변경</Typography>
                        <TextField type="password" label="새 비밀번호" fullWidth value={newPw} onChange={e => setNewPw(e.target.value)} margin="normal" />
                        <TextField type="password" label="비밀번호 확인" fullWidth value={confirmPw} onChange={e => setConfirmPw(e.target.value)} margin="normal" />
                        <Box display="flex" justifyContent="space-between" mt={2}>
                            <Button onClick={() => setShowPwModal(false)}>취소</Button>
                            <Button variant="contained" onClick={handleChangePassword}>확인</Button>
                        </Box>
                    </Box>
                </Fade>
            </Modal>
        </>
    );
}
