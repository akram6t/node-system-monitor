import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';
import expressLayouts from 'express-ejs-layouts'; // Add this line
import * as SystemInfo from './services/systeminfo';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

// Set up EJS and layouts
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));
// app.use(expressLayouts); // Add this line
// app.set('layout', 'layout/'); // Add this line
app.use(express.static(join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
  res.render('dashboard');
});

app.get('/network', (req, res) => {
  res.render('network');
});

app.get('/processes', (req, res) => {
  res.render('processes');
});

app.get('/temperature', (req, res) => {
  res.render('temperature');
});

// WebSocket handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  const intervals = {
    basic: setInterval(async () => {
      const stats = await SystemInfo.getBasicStats();
      socket.emit('basicStats', stats);
    }, 1000),
    
    network: setInterval(async () => {
      const stats = await SystemInfo.getNetworkStats();
      socket.emit('networkStats', stats);
    }, 2000),
    
    processes: setInterval(async () => {
      const stats = await SystemInfo.getProcessStats();
      socket.emit('processStats', stats);
    }, 3000),
    
    temperature: setInterval(async () => {
      const stats = await SystemInfo.getTemperatures();
      socket.emit('temperatureStats', stats);
    }, 2000)
  };

  socket.on('disconnect', () => {
    Object.values(intervals).forEach(interval => clearInterval(interval));
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});