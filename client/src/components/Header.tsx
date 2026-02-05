import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { CreditDisplay } from './CreditDisplay';
import { slotMachineStore } from '../stores/SlotMachineStore';

export const Header: React.FC = observer(() => (
  <AppBar position="static" color="transparent" elevation={0}>
    <Toolbar>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        Slot Machine Game
      </Typography>
      <Box sx={{ flexGrow: 1, textAlign: 'center' }}>
        {slotMachineStore.sessionId != null && (
          <CreditDisplay credits={slotMachineStore.credits} />
        )}
      </Box>
      <IconButton>
        <AccountCircleIcon />
      </IconButton>
    </Toolbar>
  </AppBar>
));
