import React from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Avatar,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useNavigate } from "react-router-dom"; // useNavigate import(페이지 이동을 위해 필요)
import { jwtDecode } from 'jwt-decode';
import { useState, useEffect, } from "react";

function Register() {
  const [files, setFiles] = useState(null);
  const [email, setEmail] = useState(null);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [sessionUser, setSessionUser] = useState(null);
  const [category, setCategory] = useState("");
  const [previewUrls, setPreviewUrls] = useState([]);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const fileList = event.target.files;
    setFiles(fileList);

    const previews = Array.from(fileList).map(file => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  const handleChange = (event) => {
    setCategory(event.target.value); // 선택한 값 저장
  };

  const handleSubmit = () => {
    if (!title || !content) return alert("모든 항목을 입력해주세요.");
    fetch('http://localhost:3005/feed', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: sessionUser.email, content, category, title }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.result.affectedRows > 0) {
          if (files) {
            fnUploadFile(data.result.insertId);
          } else {
            navigate("/feed");
          }
        }
      })
  };
  const fnUploadFile = (feedId) => {
    const formData = new FormData();
    formData.append('feedId', feedId);
    const fileArray = Array.from(files); // FileList → 배열
    fileArray.forEach((file, index) => {
      formData.append('file', file);
      if (index === 0) {
        formData.append('thumbnail', 'Y');
      } else {
        formData.append('thumbnail', 'N');
      }
    });
    fetch('http://localhost:3005/feed/upload', {
      method: "POST",
      body: formData, // FormData는 직접 Content-Type 지정하지 않음!
    })
      .then(res => res.json())
      .then(data => {
        console.log("이미지 업로드 응답:", data);
        if (data.message == "success") {
          alert("피드 등록 완료");
          navigate("/feed");
        } else {
          alert("피드 등록에 실패했습니다.");
        }
      })
      .catch(err => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const token = localStorage.getItem("token");
      const user = jwtDecode(token);
      setSessionUser(user);
      setEmail(user.email);
    } else {
      alert("로그인 해라");
      navigate("/");;
      return;
    }
  }, [])

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start" // 상단 정렬
        minHeight="100vh"
        sx={{ padding: '20px' }} // 배경색 없음
      >
        <Typography variant="h4" gutterBottom>
          등록
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>카테고리</InputLabel>
          <Select value={category} defaultValue="" label="카테고리" onChange={handleChange}>
            <MenuItem value={1}>일상</MenuItem>
            <MenuItem value={2}>여행</MenuItem>
            <MenuItem value={3}>음식</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="제목"
          variant="outlined"
          margin="normal"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          label="내용"
          variant="outlined"
          margin="normal"
          fullWidth
          multiline
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <Box display="flex" alignItems="center" margin="normal" >
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <IconButton color="primary" component="span">
              <PhotoCamera />
            </IconButton>
          </label>
          {files && (
            <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
              {Array.from(files).map((file, index) => (
                <Avatar
                  key={index}
                  alt={`preview-${index}`}
                  src={URL.createObjectURL(file)}
                  sx={{ width: 56, height: 56 }}
                />
              ))}
            </Box>
          )}
          <Typography variant="body1" sx={{ marginLeft: 2 }}>
            {files ? files.name : '첨부할 파일 선택'}
          </Typography>
        </Box>

        <Button onClick={() => { handleSubmit() }} variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
          등록하기
        </Button>
      </Box>
    </Container>
  );
}

export default Register;