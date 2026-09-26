import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';

const ConfirmDialog = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'primary',
  loading = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <DialogTitle 
          id="confirm-dialog-title"
          sx={{ 
            backgroundColor: 'primary.main',
            color: 'white',
            fontWeight: 'bold',
            py: 2
          }}
        >
          {title}
        </DialogTitle>
        
        <DialogContent sx={{ py: 3 }}>
          <DialogContentText 
            id="confirm-dialog-description"
            sx={{ 
              fontSize: '1rem',
              color: 'text.primary',
              lineHeight: 1.6
            }}
          >
            {message}
          </DialogContentText>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button 
            onClick={onCancel}
            variant="outlined"
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm} 
            color={confirmColor} 
            variant="contained"
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              background: confirmColor === 'error' ? 
                'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)' :
                'linear-gradient(135deg, #0A3D62 0%, #3C6382 100%)',
              '&:hover': {
                background: confirmColor === 'error' ? 
                  'linear-gradient(135deg, #b71c1c 0%, #d32f2f 100%)' :
                  'linear-gradient(135deg, #072B4A 0%, #2F4E68 100%)',
              }
            }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
                Procesando...
              </Box>
            ) : (
              confirmText
            )}
          </Button>
        </DialogActions>
      </motion.div>
    </Dialog>
  );
};

export default ConfirmDialog;