import { Socket } from 'socket.io';

const users: any = {};
const roomUsers: any = {};
const socketToRoom: any = {};
const peers: any = {};

// Run when client connects
export const initializeSocket = (io: any) => {
    io.on('connection', (socket: Socket) => {
        if (!users[socket.id]) {
            users[socket.id] = socket.id;
        }
        socket.emit("myID", socket.id);
        /* console.log("All users: ", users); */
        /* io.sockets.emit("allUsers", users); */

        console.log(`⚡:  ${socket.id} user just connected.`);

        socket.on('send_message', (data: any) => {
            console.log("Message: " + data.message + "To room: " + data.room);
            socket.to(data.room).emit("receive_message", data.message);
        });

        socket.on('join_room', (data: any) => {
            socket.join(data);
            console.log(`Room ${data} joined`)
        });

        socket.on("callUser", (data: any) => {
            console.log("call user")
            io.to(data.userToCall).emit('hey', { signal: data.signalData, from: data.from });
        });

        socket.on("acceptCall", (data: any) => {
            console.log("Call accepted")
            io.to(data.to).emit('callAccepted', data.signal);
        });

        socket.on('joinVideoRoom', (roomID: any) => {
            if (roomUsers[roomID]) {
                const length: number = roomUsers[roomID].length;
                if (length >= 4) {
                    socket.emit("roomFull");
                    return;
                }
                roomUsers[roomID].push(socket.id);
            } else {
                roomUsers[roomID] = [socket.id];
            }
            socketToRoom[socket.id] = roomID;
            const usersInThisRoom: any = roomUsers[roomID].filter((id: any) => id !== socket.id);
            socket.emit("allUsers", usersInThisRoom);
            console.log(`${socket.id} user joined the room.`)
            console.log(roomUsers[roomID])
        });

        socket.on("sendingSignal", (payload: any) => {
            console.log(`${payload.callerID} has sent an offer to ${payload.userToSignal}`);
            io.to(payload.userToSignal).emit('userJoined', { signal: payload.signal, callerID: payload.callerID });

        });

        socket.on("returningSignal", payload => {
            console.log(`${socket.id} has answered the offer of ${payload.callerID}.`)
            io.to(payload.callerID).emit('receivingReturnSignal', { signal: payload.signal, id: socket.id });
        });

        socket.on('disconnect', () => {
            console.log('🔥: A user disconnected');
            delete users[socket.id];


            const roomID = socketToRoom[socket.id];
            let room = roomUsers[roomID];
            if (room) {
                room = room.filter((id: any) => id !== socket.id);
                roomUsers[roomID] = room;
            }

        });

        // ---------

        /*         if (!peers?.socket?.id) {
                    peers[socket.id] = socket;
                }
        
                // Asking all other clients to setup the peer connection receiver
                for (let id in peers) {
                    if (id === socket.id) continue
                    console.log('sending init receive to ' + id)
                    peers[id].emit('initReceive', socket.id)
                }
        
                socket.on('signal', (data: any) => {
                    console.log('sending signal from ' + socket.id + ' to ', data)
                    if (!peers[data.socketID]) return;
                    peers[data.socketID].emit('signal', {
                        socketID: socket.id,
                        signal: data.signal
                    })
                })
        
                socket.on('disconnect', () => {
                    console.log('socket disconnected ' + socket.id)
                    socket.broadcast.emit('removePeer', socket.id)
                    delete peers[socket.id]
                })
        
                socket.on('initSend', (initSocketID: any) => {
                    console.log('INIT SEND by ' + socket.id + ' for ' + initSocketID)
                    peers[initSocketID].emit('initSend', socket.id)
                }) */
    });
}