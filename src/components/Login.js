import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Checkbox, FormControlLabel,
  Link, Typography, Avatar, IconButton, InputAdornment,
  Alert, CircularProgress, Stack, CssBaseline
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import GitHubIcon from '@mui/icons-material/GitHub';

import backgroundImage from '../assets/login-background.jpg'; // 배경 이미지 경로
import Logo from '../assets/white.png'; // 로고 이미지 (사용 안 해도 OK)

function Login() {
  const [email, setEmail] = useState(localStorage.getItem('savedEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem('savedEmail') ? true : false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.style.backgroundImage = `url(${backgroundImage})`;
      mainContent.style.backgroundSize = 'cover';
      mainContent.style.backgroundPosition = 'center';
      mainContent.style.minHeight = '100vh';
    }

    return () => {
      if (mainContent) {
        mainContent.style.backgroundImage = '';
        mainContent.style.backgroundSize = '';
        mainContent.style.backgroundPosition = '';
        mainContent.style.minHeight = '';
      }
    };
  }, []);

  const handleLogin = () => {
    setLoading(true);
    setMessage(null);

    setTimeout(() => {
      fetch("http://localhost:3005/auth/login", {
        method: "POST",
        headers: {
          "Content-type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMessage({ type: 'success', text: '로그인 성공!' });
            if (rememberMe) {
              localStorage.setItem('savedEmail', email);
            } else {
              localStorage.removeItem('savedEmail');
            }
            localStorage.setItem("token", data.token);
            navigate("/home");
          } else {
            setMessage({ type: 'error', text: data.message });
          }
          setLoading(false);
        })
        .catch(err => {
          setMessage({ type: 'error', text: '서버 오류 발생' });
          setLoading(false);
        });
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
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
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            padding: 5,
            borderRadius: 5,
            boxShadow: 5,
            width: 350,
            textAlign: 'center'
          }}
        >
          <Avatar sx={{
            backgroundColor: 'primary.main',
            width: 56, height: 56, margin: '0 auto 20px'
          }}>
            <LockOutlinedIcon />
          </Avatar>

          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            }
            label="Remember me"
            sx={{ mt: 1, mb: 2 }}
          />

          <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
            <IconButton><GoogleIcon color="error" /></IconButton>
            <IconButton><FacebookIcon color="primary" /></IconButton>
            <IconButton><GitHubIcon /></IconButton>
          </Stack>

          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "LOGIN"}
          </Button>

          <Link href="#" variant="body2">
            Forgot Password?
          </Link>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
            Copyright © 2025 Lee JaeSueng, Inc
          </Typography>

          <Typography variant="body2"
            sx={{
              mt: 3,
              py: 2,
              borderTop: '1px solid #ccc',
              textAlign: 'center',
              backgroundColor: '#f9f9f9',
              borderRadius: 2
            }}
          >
            계정이 없으신가요?{' '}
            <Link href="/join" sx={{ fontWeight: 600 }}>
              가입하기
            </Link>
          </Typography>

        </Box>

      </Box>
    </>
  );
}

export default Login;