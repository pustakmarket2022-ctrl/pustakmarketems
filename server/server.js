const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO Real-time setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log(`[Socket.IO]: Client connected -> ${socket.id}`);

  socket.on('join_user_room', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });

  socket.on('join_group_room', (groupId) => {
    if (groupId) {
      socket.join(`group_${groupId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO]: Client disconnected -> ${socket.id}`);
  });
});

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const advanceRoutes = require('./routes/advanceRoutes');
const overtimeRoutes = require('./routes/overtimeRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const todoRoutes = require('./routes/todoRoutes');
const groupRoutes = require('./routes/groupRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const noteRoutes = require('./routes/noteRoutes');

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/advances', advanceRoutes);
app.use('/api/overtime', overtimeRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/notes', noteRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'Pustak Market EMS Backend Service with Real-Time Socket.IO',
    time: new Date(),
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[Pustak Market EMS Server]: Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
});
