import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Avatar, Grid, Paper, Dialog, DialogTitle, DialogContent, Button, DialogActions } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

function MyPage() {
  let [list, setList] = useState([]);
  let [open, setOpen] = useState(false);
  let [imgUrl, setImgUrl] = useState();
  const [files, setFile] = useState();
  const token = localStorage.getItem("token");

  const fuUserInfo = () => {
    if (!token) {
      // 다시 로그인 페이지로 이동
      // navigate("/");
    }
    const sessionUser = jwtDecode(token);
    fetch("http://localhost:3005/member?email=" + sessionUser.email)
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.message === 'success') {
          setList(data.list);
          console.log("===>", list);
        }
      })
  }

  const fnSaveImg = () => {
    console.log("fnSave호출");
    const formData = new FormData();
    formData.append("file", files);
    formData.append("email", list.email);
    fetch("http://localhost:3005/member/upload", {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if(data.message==='success'){
          alert("프로필이 변경되었습니다.");
          setImgUrl(null);
          setFile(null);
          setOpen(false);
          fuUserInfo();
        } else{
          alert("프로필 변경에 실패하였습니다.");
        }
      })
      .catch(err => {
        console.error(err);
      });
  }

  // // member에 profileImg 컬럼에 파일경로 저장
  // const fuProfileEdit = (profileImg) => {
  //   fetch("http://localhost:3005/member", {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ profileImg, email: list.email }),

  //   })
  //     .then(res => res.json())
  //     .then(data => {
  //       console.log(data);
  //       if (data.result > 0) {
  //         alert("DB 저장 성공");
  //         setImgUrl(null);
  //         setFile(null);
  //         setOpen(false);
  //         fuUserInfo();
  //       } else {
  //         alert("DB 저장 실패");
  //       }
  //     })
  // }
  // //서버에 파일 정보 저장
  // const fnProfileUpload = () => {
  //   console.log(files);
  //   const formData = new FormData();
  //   formData.append('email', list.email);
  //   formData.append('photos', files);
  //   fetch('http://localhost:3005/member/upload', {
  //     method: "POST",
  //     body: formData, // FormData는 직접 Content-Type 지정하지 않음!
  //   })
  //     .then(res => res.json())
  //     .then(data => {
  //       console.log("이미지 업로드 응답:", data);
  //       if (data.message == "success") {
  //         fuProfileEdit(data.profileImg);
  //       } else {
  //         alert("이미지 저장에 실패했습니다.");
  //       }
  //     })
  //     .catch(err => {
  //       console.error(err);
  //     });
  // }


  const selectImg = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      setImgUrl(imgUrl);
      setFile(file);
    }
  }

  useEffect(() => {
    fuUserInfo();
  }, []);

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="flex-start"
        minHeight="100vh"
        sx={{ padding: '20px' }}
      >
        <Paper elevation={3} sx={{ padding: '20px', borderRadius: '15px', width: '100%' }}>
          {/* 프로필 정보 상단 배치 */}
          <Box display="flex" flexDirection="column" alignItems="center" sx={{ marginBottom: 3 }}>
            <Avatar
              alt="프로필 이미지"
              src={list.profileImg ? list.profileImg : "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e"} // 프로필 이미지 경로
              sx={{ width: 100, height: 100, marginBottom: 2 }}
              onClick={() => { setOpen(!open) }}
            />
            <Typography variant="h5">{list.userName}</Typography>
            <Typography variant="body2" color="text.secondary">
              {list.email}
            </Typography>
          </Box>
          <Grid container spacing={2} sx={{ marginTop: 2 }}>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">팔로워</Typography>
              <Typography variant="body1">150</Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">팔로잉</Typography>
              <Typography variant="body1">100</Typography>
            </Grid>
            <Grid item xs={4} textAlign="center">
              <Typography variant="h6">게시물</Typography>
              <Typography variant="body1">50</Typography>
            </Grid>
          </Grid>
          <Box sx={{ marginTop: 3 }}>
            <Typography variant="h6">내 소개</Typography>
            <Typography variant="body1">
              {list.intro}
            </Typography>
          </Box>
        </Paper>
        <Dialog open={open}>
          <DialogTitle>이미지 수정</DialogTitle>
          <DialogContent>
            <label>
              {/* <input onChange={selectImg} name='photos' type="file" accept='image/*' style={{ display: "none" }}></input> */}
              <input onChange={selectImg} type="file" accept="image/*" style={{display : "none"}}></input>
              <Button variant='contained' component="span">이미지 선택</Button>
              {!imgUrl ? " 선택된 파일 없음" : "이미지 선택 됨"}
            </label>
          </DialogContent>
          {imgUrl && (
            <Box
              mt={2}
              display="flex"
              flexDirection="column"
              alignItems="center" // ✅ 중앙 정렬
            >
              <Typography variant='subtitle1'>미리보기</Typography>
              <Avatar
                alt="미리보기"
                src={imgUrl}
                sx={{ width: 100, height: 100, margin: 2 }}
                onClick={() => { setOpen(!open) }}
              />
            </Box>
          )}
          <DialogActions>
            {/* <Button variant='contained' onClick={() => fnProfileUpload}>저장</Button> */}
            <Button variant='contained' onClick={() => {fnSaveImg()}}>저장</Button>
            <Button variant='outlined' onClick={() => {
              setOpen(false);
              setImgUrl(null);
              setFile(null);
            }}>취소</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default MyPage;