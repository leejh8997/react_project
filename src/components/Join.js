import React, { useState } from 'react';
import {
  TextField, Button, Container, Typography, Box, Alert
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

function Join() {
  const [form, setForm] = useState({
    email: '',
    pwd: '',
    userName: '',
    addr: '',
    phone: '',
    birth: '',
    intro: '',
  });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleJoin = async () => {
    try {
      const res = await fetch('http://localhost:3005/member/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.result > 0) {
        setMessage({ type: 'success', text: '회원가입 성공! 로그인 페이지로 이동합니다.' });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage({ type: 'error', text: '회원가입 실패' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: '서버 오류' });
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <Typography variant="h4" gutterBottom>
          회원가입
        </Typography>

        {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

        <TextField
          label="Username"
          name="userName"
          variant="outlined"
          margin="normal"
          fullWidth
          value={form.userName}
          onChange={handleChange}
        />
        <TextField
          label="Email"
          name="email"
          variant="outlined"
          margin="normal"
          fullWidth
          value={form.email}
          onChange={handleChange}
        />
        <TextField
          label="Password"
          name="pwd"
          variant="outlined"
          margin="normal"
          type="password"
          fullWidth
          value={form.pwd}
          onChange={handleChange}
        />
        <TextField
          label="Address"
          name="addr"
          variant="outlined"
          margin="normal"
          fullWidth
          value={form.addr}
          onChange={handleChange}
        />
        <TextField
          label="Phone"
          name="phone"
          variant="outlined"
          margin="normal"
          fullWidth
          value={form.phone}
          onChange={handleChange}
        />
        <TextField
          label="Birthdate"
          name="birth"
          variant="outlined"
          margin="normal"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={form.birth}
          onChange={handleChange}
        />
        <TextField
          label="자기소개"
          name="intro"
          variant="outlined"
          margin="normal"
          fullWidth
          value={form.intro}
          onChange={handleChange}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: '20px' }}
          onClick={handleJoin}
        >
          회원가입
        </Button>

        <Typography variant="body2" style={{ marginTop: '10px' }}>
          이미 회원이라면? <Link to="/login">로그인</Link>
        </Typography>
      </Box>
    </Container>
  );
}

export default Join;