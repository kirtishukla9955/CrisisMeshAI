const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// We have to use try/catch for errorHandler because some paths might vary
let errorHandler;
try {
  errorHandler = require('./middleware/errorHandler').errorHandler;
} catch (e) {
  errorHandler = (err, req, res, next) => res.status(500).send("Error");
}

let startClusteringCron = () => {};
try {
  startClusteringCron = require('./services/clusteringService').startClusteringCron;
} catch (e) {
  console.log("Clustering cron not found.");
}

// Routes
const reportsRoutes = require('./routes/reports');
const apiRoutes = require('./routes/api'); // contains incidents & volunteers
const postDisasterRoutes = require('./routes/postDisasterRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Member 1: Report Intake
app.use('/api', reportsRoutes); 

// Member 3 & 4: Incidents, Volunteers, and Maps
app.use('/api', apiRoutes);
app.use('/api/post-disaster', postDisasterRoutes);

// Member 4: Error Handler must be last
app.use(errorHandler);

// Start AI Clustering Cron Job (Member 3)
startClusteringCron();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CrisisMesh API running on port ${PORT}`);
});
