import dotenv from 'dotenv';

dotenv.config();

import app from './app';
import './types/server';

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
