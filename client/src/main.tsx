import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { App } from './App';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#e94560' },
    secondary: { main: '#ffd700' },
    success: { main: '#4ecca3' },
    background: { default: '#1a1a2e', paper: '#16213e' },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>
);
