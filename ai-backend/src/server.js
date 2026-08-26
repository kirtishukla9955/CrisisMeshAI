const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const apiRoutes = require('./routes/api');
const { runClusteringJob } = require('./services/clusteringService');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Schedule the clustering job to run every 60 seconds
cron.schedule('* * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Triggering scheduled clustering job...`);
  await runClusteringJob();
});

app.listen(PORT, () => {
  console.log(`CrisisMesh AI - AI Module Backend running on port ${PORT}`);
  console.log(`Clustering job scheduled to run every 1 minute.`);
});
