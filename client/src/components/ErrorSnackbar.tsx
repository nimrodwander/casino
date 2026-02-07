import React from 'react';
import { observer } from 'mobx-react-lite';
import { Alert, Snackbar } from '@mui/material';
import { errorStore } from '../stores/ErrorStore';

export const ErrorSnackbar: React.FC = observer(() => {
  return (
    <Snackbar
      open={errorStore.error !== null}
      autoHideDuration={5000}
      onClose={() => errorStore.clearError()}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="error" variant="filled" onClose={() => errorStore.clearError()}>
        {errorStore.error}
      </Alert>
    </Snackbar>
  );
});
