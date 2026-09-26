// src/components/layout/Layout.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isDemo } = useAuth();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const topOffset = isDemo ? '106px' : '64px';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar onToggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: topOffset,
          ml: sidebarOpen ? '240px' : '0px',
          width: sidebarOpen ? 'calc(100% - 240px)' : '100%',
          transition: 'all 0.3s ease',
          backgroundColor: 'background.default',
          minHeight: `calc(100vh - ${topOffset})`,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
