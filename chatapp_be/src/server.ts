import express from 'express';
import { initializeSocket } from './sockets/socketsHandler';
import { uploadFile } from './utils/fileUtils';
import { Server, Socket } from 'socket.io';

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const http = require('http');
const cors = require('cors');
const bodyParser = require("body-parser");
const dbPass = process.env.MONGODB_PASSWORD;
const dbUrl = `mongodb+srv://adelorenzis:${dbPass}@cluster0.bijyvlq.mongodb.net/?retryWrites=true&w=majority`;
const { swaggerDocs: V1SwaggerDocs } = require("./swagger");
const v1UserRouter = require("./v1/routes/userRoutes");
const v1GroupRouter = require('./v1/routes/grouptRoutes');
const v1ChatRouter = require('./v1/routes/chatRoutes');
const v1MessageRouter = require('./v1/routes/messageRoutes');
const v1PersonRouter = require('./v1/routes/personRoutes');
const errorHandler = require('./errors/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    }
});
const port = process.env.PORT || 3000;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err: any) => {
    console.error('Failed to connect to MongoDB:', err);
});

// Set static folder
/* app.use(express.static(path.join(__dirname, '../public'))); */
app.use(cors());
app.use(bodyParser.json());
app.use(uploadFile);
app.use('/api/v1/users', v1UserRouter);
app.use('/api/v1/groups', v1GroupRouter);
app.use('/api/v1/chats', v1ChatRouter);
app.use('/api/v1/messages', v1MessageRouter);
app.use('/api/v1/people', v1PersonRouter);
app.use(errorHandler);

initializeSocket(io);

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
    V1SwaggerDocs(app, port);
});
