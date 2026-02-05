import { Container } from '@mui/material';
import { SlotMachine } from './components/SlotMachine';

export function App() {
  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <SlotMachine />
    </Container>
  );
}
