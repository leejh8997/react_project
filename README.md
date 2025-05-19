# 📷 React 기반 SNS 웹 프로젝트

인스타그램을 참고하여 만든 SNS 웹 애플리케이션입니다.  
사용자는 게시글 업로드, 댓글/답글, 좋아요, 북마크, 팔로우, 실시간 알림, DM 기능 등을 사용할 수 있습니다.

---

## 📆 개발 기간

- 2025년 05월 07일 ~ 2025년 05월 18일 
- 프로젝트 기획 구상, DB설계, 서비스 개발, 테스트 및 수정

---

## 👨‍👩‍👦‍👦 팀원 구성

| 이름   | GitHub 프로필 |
|--------|----------------|
| 이재형 | https://github.com/leejh8997 |

---

## 💻 사용 언어 및 기술 스택

### 🚀 Frontend
<p>
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=React&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript (ES6%2B)-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/React Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white"/>
  <img src="https://img.shields.io/badge/MUI-007FFF?style=for-the-badge&logo=mui&logoColor=white"/>
  <img src="https://img.shields.io/badge/react--slick-000000?style=for-the-badge&logo=react&logoColor=white"/>
</p>

### 🛠 Backend
<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white"/>
</p>

### 🧰 기타
<p>
  <img src="https://img.shields.io/badge/Multer-333333?style=for-the-badge&logo=npm&logoColor=white"/>
  <img src="https://img.shields.io/badge/bcrypt-004C7F?style=for-the-badge&logo=keybase&logoColor=white"/>
  <img src="https://img.shields.io/badge/dayjs-EF4035?style=for-the-badge&logo=javascript&logoColor=white"/>
</p>

---

## 📄 페이지별 기능
![image](https://github.com/user-attachments/assets/bce0098a-1b5b-4216-9c83-8128e4627a6e)
![image](https://github.com/user-attachments/assets/bcc23bbe-e470-4c38-bb3f-eeb485171013)

### 🔐 로그인 페이지 (login)
- 기본 정보를 통한 회원 가입
- JWT 기반 인증 시스템을 사용하여 로그인 구현
- 로그인 시, 유효성 검사를 수행하여 accessToken 발급
- 발급된 토큰은 로컬 스토리지에 저장되며, 인증이 필요한 페이지에서 사용자 정보를 식별하는 데 사용됨
- 로그인 실패 시 에러 메시지 출력
- 로그인 성공 후 메인 페이지(Home)로 자동 이동되며, 사용자 피드가 로드됨

---

![image](https://github.com/user-attachments/assets/51fbbf68-3526-43e4-99eb-00c45cf19d5b)
![image](https://github.com/user-attachments/assets/71f79b2c-d901-4afb-935e-52f7e2ee9415)

### 🏠 메인 페이지 (Home)
- 팔로우한 유저의 피드 출력
- 이미지/동영상 슬라이더
- 댓글/좋아요/북마크 기능
- 댓글 모달창에서 답글, 맨션, 시간 표기 등 UX 개선

---

![image](https://github.com/user-attachments/assets/744b1b3d-2370-4867-be9a-85477909882e)

### 🔍 탐색 페이지 (Explore)
- 전체 공개 게시글 썸네일 출력
- 마우스 오버 시 좋아요/댓글 수 표시
- 클릭 시 상세 모달(PostModal) 열기

---

![image](https://github.com/user-attachments/assets/e2cff1ab-c7a4-4b0c-bbe7-aca528e8c98b)
![image](https://github.com/user-attachments/assets/c7d1ec4a-0cf8-4f4a-bf8d-f76638ba4081)

### 👤 프로필 페이지
- 게시글/저장됨/태그됨 탭 전환
- 프로필 이미지 업로드
- 팔로워/팔로잉 모달 (언팔/삭제 기능 포함)
- 본인/타인에 따라 버튼 분기
- 팔로우 요청 → 알림 → 수락 시 관계 생성

---

![image](https://github.com/user-attachments/assets/ba7fc167-1823-486f-8ec5-07b9abcb51aa)

### ➕ 게시글 업로드
- 이미지/동영상 혼합 업로드 지원
- 썸네일 정렬 및 슬라이더 구성
- 맨션 기능 포함
- 업로드 완료 시 피드백 메시지

---

![image](https://github.com/user-attachments/assets/a60a4194-26ef-4bb6-a20e-3d81b8c087a7)

### ❤️ 알림 기능
- 댓글, 답글, 좋아요, 팔로우 요청 알림
- 실시간 수신 (Socket.IO)
- 알림 읽음/읽지 않음 구분
- 알림 클릭 시 해당 게시글로 이동

---

![image](https://github.com/user-attachments/assets/18a5148c-dd31-4a11-988e-1b34868cc9ce)

### 💬 메시지 (DM)
- 1:1 및 그룹(1:N) 채팅 지원
- 나/상대 메시지 위치 및 스타일 구분
- 채팅 시간 중앙 정렬 표기
- 메시지 실시간 수신 및 스크롤 자동 이동

---

## ✍ 프로젝트 후기

- 실시간 알림과 소켓 통신을 직접 설계하며 **Socket.IO 구조에 대한 이해도**가 높아졌습니다.
- 인스타그램 UI를 모방하며 **MUI와 react-slick 커스터마이징** 경험을 쌓을 수 있었습니다.
- 북마크, 멘션, DM 등 고급 기능을 구현하며 **풀스택 구현 역량**을 향상시켰습니다.
