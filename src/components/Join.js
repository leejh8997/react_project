import React, { useState } from 'react';
import {
  Box, TextField, Button, Typography, Link, Divider, Alert, CssBaseline
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import backgroundImage from '../assets/login-background.jpg';
import { useNavigate } from 'react-router-dom';

function Join() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const validate = () => {
    if (!email || !password || !username || !fullName) {
      setError('모든 항목을 입력해주세요.');
      return false;
    }
    if (!email.includes('@')) {
      setError('유효한 이메일 주소를 입력해주세요.');
      return false;
    }
    if (password.length < 4) {
      setError('비밀번호는 최소 4자 이상이어야 합니다.');
      return false;
    }
    return true;
  };

  const handleJoin = async () => {
    setError(null);
    setSuccess(null);
    if (!validate()) return;

    try {
      const res = await fetch("http://localhost:3005/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, fullName })
      });
      const data = await res.json();
      if (!data.success) return setError(data.message);
      setSuccess('회원가입 성공!');
      navigate('/');
    } catch (err) {
      setError('서버 오류 발생');
    }
  };

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            p: 5,
            borderRadius: 5,
            boxShadow: 5,
            width: 350,
            textAlign: 'center'
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={1}>
            ReactGram
          </Typography>

          <Typography variant="body2" color="textSecondary" mb={2}>
            친구들의 사진과 동영상을 보려면 가입하세요.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<FacebookIcon />}
            sx={{ mb: 2 }}
          >
            Facebook으로 로그인
          </Button>

          <Divider sx={{ my: 2 }}>또는</Divider>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <TextField
            fullWidth
            label="이메일 주소"
            variant="outlined"
            margin="dense"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <TextField
            fullWidth
            label="비밀번호"
            type="password"
            variant="outlined"
            margin="dense"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <TextField
            fullWidth
            label="성명"
            variant="outlined"
            margin="dense"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
          />
          <TextField
            fullWidth
            label="사용자 이름"
            variant="outlined"
            margin="dense"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />

          <Typography variant="caption" color="textSecondary" mt={2}>
            저희 서비스를 이용하는 사람이 회원님의 연락처 정보를 Instagram에 업로드했을 수도 있습니다.{' '}
            <Link href="#" underline="hover">더 알아보기</Link>
          </Typography>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
            onClick={handleJoin}
          >
            가입
          </Button>

          <Box mt={3} py={2} borderTop="1px solid #ccc">
            <Typography variant="body2">
              계정이 있으신가요?{' '}
              <Link href="/" sx={{ fontWeight: 600 }}>
                로그인
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Join;
