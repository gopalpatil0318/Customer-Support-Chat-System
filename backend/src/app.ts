import express from 'express';
import cors from 'cors';
import routes from './routes/auth';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true, 
}));

app.use('/api', routes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
