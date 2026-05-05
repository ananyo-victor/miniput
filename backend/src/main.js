require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const appRoutes = require('./app.route');
const initializeDatabase = require('./config/db-init.config');

require('./config/database.config');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*" } 
});

app.set('io', io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.on('disconnect', () => console.log('User disconnected'));
});

app.use(cors());
app.use(express.json());

app.use('/api', appRoutes);

const clientDistPath = path.join(__dirname, '../client/dist'); 
app.use(express.static(clientDistPath));

app.get(['/', '/admin', '/customer'], (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await initializeDatabase();
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to initialize database schema:', error.message);
        process.exit(1);
    }
}

startServer();
