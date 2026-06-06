import { createApp } from './app/app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Server running on port ${String(env.port)}`);
});
