import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Modal,
  Fade,
  Backdrop,
  Avatar,
  IconButton
} from '@mui/material';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEmotionsOutlinedIcon from '@mui/icons-material/EmojiEmotionsOutlined';
import '../PostUploadModal.css';
import EmojiPicker from 'emoji-picker-react';
import { authFetch } from '../utils/authFetch';
import { jwtDecode } from 'jwt-decode';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';

export default function PostUploadModal({ open, onClose }) {
  const token = localStorage.getItem('token');
  const user = token ? jwtDecode(token) : {};
  const [files, setFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const inputRef = useRef();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // state & ref
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const emojiBtnRef = useRef();
  const emojiPickerRef = useRef();
  const previewURLs = useMemo(() => {
    return files.map(file => URL.createObjectURL(file));
  }, [files]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        !emojiBtnRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    return () => {
      previewURLs.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewURLs]);

  const isVideoFile = (file) => file.type.startsWith('video/');

  const toggleMute = () => {
    if (videoRef.current) {
      const muted = !videoRef.current.muted;
      videoRef.current.muted = muted;
      setIsMuted(muted);
    }
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
  };

  const handleAddFileClick = () => {
    inputRef.current.click();
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('index', index);
  };

  const handleDrop = (e, targetIndex) => {
    const draggedIndex = e.dataTransfer.getData('index');
    const newFiles = [...files];
    const draggedItem = newFiles.splice(draggedIndex, 1)[0];
    newFiles.splice(targetIndex, 0, draggedItem);
    setFiles(newFiles);
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file));
      formData.append('caption', caption);

      const res = await authFetch('http://localhost:3005/posts', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (data.success) {

        setTimeout(() => {
          setIsUploading(false);
          setIsUploaded(true);
          setFiles([]);
          setCaption('');
          window.dispatchEvent(new Event('feedUpdated'));
        }, 2000);
      } else {
        alert('업로드 실패: ' + data.message);
        setIsUploading(false);
      }
    } catch (err) {
      console.error('업로드 중 오류:', err);
      alert('서버 오류가 발생했습니다.');
      setIsUploading(false);
    }
  };
  // 이모티콘 추가 함수
  const handleEmojiClick = (emojiData) => {
    setCaption(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 300 } }}
    >
      <Fade in={open}>
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <button className="left-btn icon-btn" onClick={onClose}>
                <CloseIcon />
              </button>
              <h3>새 게시물 만들기</h3>
              {files.length > 0 && !isUploading && (
                <button className="right-btn upload-btn" onClick={handleUpload}>공유하기</button>
              )}
            </div>

            {isUploaded ? (
              <div className="upload-success">
                <h2>게시물이 공유되었습니다.</h2>
                <div className="checkmark" />
              </div>
            ) : isUploading ? (
              <div className="spinner" />
            ) : files.length === 0 ? (
              <div className="drop-zone" onClick={handleAddFileClick}>
                <div className="upload-icon">
                  <InsertPhotoOutlinedIcon sx={{ fontSize: 64, color: '#737373' }} />
                </div>
                <p>사진과 동영상을 여기에 끌어다 놓으세요</p>
                <button className="upload-btn">컴퓨터에서 선택</button>
                <input
                  type="file"
                  ref={inputRef}
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="upload-body">
                <div className="upload-left">
                  <div className="media-preview" style={{ position: 'relative' }}>
                    {isVideoFile(files[currentIndex]) ? (
                      <>
                        <video
                          ref={videoRef}
                          src={previewURLs[currentIndex]}
                          className="preview-video"
                          muted
                          autoPlay
                          loop
                          onClick={toggleVideoPlay}
                        />
                        <button onClick={toggleMute} className="mute-button">
                          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
                        </button>
                      </>
                    ) : (
                      <img
                        src={URL.createObjectURL(files[currentIndex])}
                        alt="preview"
                        className="preview-img"
                      />
                    )}
                  </div>

                  {currentIndex > 0 && (
                    <button className="nav-left" onClick={() => setCurrentIndex(currentIndex - 1)}>&lt;</button>
                  )}
                  {currentIndex < files.length - 1 && (
                    <button className="nav-right" onClick={() => setCurrentIndex(currentIndex + 1)}>&gt;</button>
                  )}
                  <div className="indicator">
                    {files.map((_, i) => (
                      <span key={i} className={i === currentIndex ? 'dot active' : 'dot'} />
                    ))}
                  </div>
                  <div className="thumbnail-section">
                    {files.map((file, i) => {
                      const isVideo = file.type.startsWith('video/');
                      const src = previewURLs[i];
                      return (
                        <div
                          key={i}
                          className={`thumbnail-wrapper ${i === currentIndex ? 'selected' : ''}`}
                          onClick={() => setCurrentIndex(i)}
                          draggable
                          onDragStart={(e) => handleDragStart(e, i)}
                          onDrop={(e) => handleDrop(e, i)}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          {isVideo ? (
                            <video
                              src={src}
                              className="thumbnail-media"
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={src}
                              alt="thumb"
                              className="thumbnail-media"
                            />
                          )}
                        </div>
                      );
                    })}
                    <button className="add-btn" onClick={handleAddFileClick}>+</button>
                  </div>
                </div>

                <div className="upload-right">
                  <div className="profile-section">
                    <Avatar src="/images/profile1.jpg" className="profile-avatar" />
                    <span className="profile-username">jae.hyeong94</span>
                  </div>

                  <textarea
                    className="caption-box"
                    placeholder="문구 입력..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />

                  <div className="emoji-limit" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    {/* 수정된 이모티콘 버튼 + 모달 */}
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <IconButton ref={emojiBtnRef} size="small" onClick={toggleEmojiPicker}>
                        <EmojiEmotionsOutlinedIcon fontSize="small" />
                      </IconButton>
                      {showEmojiPicker && (
                        <div
                          ref={emojiPickerRef}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            zIndex: 9999
                          }}
                        >
                          <EmojiPicker onEmojiClick={handleEmojiClick} height={350} />
                        </div>
                      )}
                    </div>

                    {/* 글자 수 */}
                    <span style={{ fontSize: 12, color: '#888' }}>{caption.length}/2200</span>
                  </div>

                  <hr className="divider" />

                  <div className="meta-info">
                    <p>@jae.hyeong94</p>
                    <div className="options">
                      <p>위치 추가</p>
                      <p>공동 작업자 추가</p>
                      <p>접근성</p>
                      <p>고급 설정</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Fade>
    </Modal>
  );
}