import { app } from './app.js';
import { connectMongo } from './config/mongo.js';
import { env } from './config/env.js';
import { initCron } from './scraping/core/queue.js';

(async () => {
  await connectMongo();
  initCron(); // start the scheduler
  app.listen(env.PORT, () => {
    console.log(`Server running on :${env.PORT}`);
  });
})();
