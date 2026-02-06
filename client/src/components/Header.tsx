import React from 'react';
import { Link, useMatch } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { CreditDisplay } from './CreditDisplay';
import { slotMachineStore } from '../stores/SlotMachineStore';

export const Header: React.FC = observer(() => {
  const isPlayRoute = useMatch('/play');

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
              <CreditDisplay credits={slotMachineStore.credits} />
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton component={Link} to="/">
              <AccountCircleIcon sx={{ fontSize: 32 }}/>
            </IconButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
});
