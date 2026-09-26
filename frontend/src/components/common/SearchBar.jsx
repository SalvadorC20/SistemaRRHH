import React from 'react';
import { 
  TextField, 
  InputAdornment,
  Box,
  IconButton 
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const SearchBar = ({ 
  placeholder = "Buscar...", 
  value, 
  onChange, 
  onClear,
  width = "100%",
  variant = "outlined",
  size = "medium",
  ...props 
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <Box sx={{ width, position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <TextField
          fullWidth
          variant={variant}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          size={size}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon 
                  sx={{ 
                    color: 'primary.main',
                    opacity: 0.8 
                  }} 
                />
              </InputAdornment>
            ),
            endAdornment: value && (
              <InputAdornment position="end">
                <IconButton
                  onClick={handleClear}
                  size="small"
                  sx={{ 
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'primary.main',
                    }
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: 3,
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': { 
                  borderColor: 'primary.main' 
                },
                '&.Mui-focused fieldset': { 
                  borderColor: 'primary.main', 
                  borderWidth: 2 
                },
              },
              '& .MuiInputLabel-root.Mui-focused': { 
                color: 'primary.main' 
              },
              backgroundColor: variant === 'outlined' ? 'white' : 'transparent',
              boxShadow: variant === 'outlined' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
            }
          }}
          {...props}
        />
      </motion.div>
    </Box>
  );
};

export default SearchBar;