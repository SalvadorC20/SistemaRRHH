import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ 
  message = 'Cargando...', 
  size = 40,
  fullScreen = false,
  overlay = false 
}) => {
  const spinnerContent = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight={fullScreen ? "100vh" : "200px"}
        sx={{
          ...(overlay && {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 9999,
          })
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            background: 'linear-gradient(145deg, #ffffff 0%, #f7f9fb 100%)',
          }}
        >
          <CircularProgress 
            size={size} 
            sx={{ 
              color: 'primary.main',
              mb: 2 
            }} 
          />
          <Typography 
            variant="body1" 
            color="text.primary" 
            sx={{ 
              fontWeight: 500,
              background: 'linear-gradient(90deg, #0A3D62, #3C6382)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {message}
          </Typography>
        </Paper>
      </Box>
    </motion.div>
  );

  if (overlay) {
    return (
      <Box sx={{ position: 'relative' }}>
        {spinnerContent}
      </Box>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;