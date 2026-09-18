require('dotenv').config();
const app = require('./src/app');
const connectDB = async () => {
  const dbConfig = require('./src/config/db');
  await dbConfig();
};

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});