import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Link, useMatch } from 'react-router-dom';
import { gameStore } from '../stores/game.store';
import { CreditDisplay } from './CreditDisplay';

export const Header: React.FC = observer(() => {
  const isPlayRoute = useMatch('/game');

  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar sx={{ position: 'relative' }}>
        <Typography
          component={Link}
          to="/"
          variant="h5"
          sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'inherit' }}
        >
          Slot Machine Game
        </Typography>
        {isPlayRoute && (
          <>
            <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              <CreditDisplay credits={gameStore.credits} />
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {gameStore.playerId}
              </Typography>
              <IconButton>
                <AccountCircleIcon sx={{ fontSize: 32 }}/>
              </IconButton>
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
});
