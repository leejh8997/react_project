import React from 'react';
import { Drawer, List, ListItem, ListItemText, Typography, Toolbar, ListItemIcon } from '@mui/material';
import { Home, Add, AccountCircle } from '@mui/icons-material';
import LinkAdapter from './LinkAdapter';

function Menu() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240, // 너비 설정
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240, // Drawer 내부의 너비 설정
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Typography variant="h6" component="div" sx={{ p: 2 }}>
        SNS 메뉴
      </Typography>
      <List>
        <ListItem button component={LinkAdapter} to="/feed">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="피드" />
        </ListItem>
        <ListItem button component={LinkAdapter} to="/register">
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="등록" />
        </ListItem>
        <ListItem button component={LinkAdapter} to="/mypage">
          <ListItemIcon>
            <AccountCircle />
          </ListItemIcon>
          <ListItemText primary="마이페이지" />
        </ListItem>
        <ListItem button component={LinkAdapter} to="/recoil">
          <ListItemIcon>
            <Add />
          </ListItemIcon>
          <ListItemText primary="리코일" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Menu;