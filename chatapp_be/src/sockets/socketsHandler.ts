import { Socket } from 'socket.io';

const users: any = {};
const roomUsers: any = {};
const socketToRoom: any = {};


/**
 * Quando una persona accede ad una stanza in cui sono presenti altre persone, quella persona diventa l'initiator del collegamento.
 * Il nuovo arrivato notifica tutti gli altri che si è unito con l'evento 'joinVideoRoom'. A quella persona viene restituito un'array dei socket id di tutti gli altri partecipanti ('allUsers'), eccetto se stesso.  Per ognuno degli utenti ricevuti, creo
 * un nuovo peer con initiator: true, ossia invio un'offerta a tutti gli altri partecipanti di connettersi con me, mediante il metodo
 * createPeer(). Quest'azione genera subito un evento di signal, che sul server viene ricevuto. A questo punto, il server genera
 * un evento 'userJoined' che gli altri partecipanti ricevono e dopo il quale chiamano il metodo addPeer(), che permette di accettare
 * la connessione. Mediante peer.signal() viene generato l'evento 'signal', che viene catturato dagli altri partecipanti e il quale 
 * emette a sua volta l'evento 'returningSignal'. Questo viene ricevuto dal server, che invia all'iniziatore l'evento 'receivingReturnedSignal',
 * che viene catturato dall'inizatore. In corrispondenza dell'evento di accettazione da parte dei partecipanti, l'iniziatore deve cercare
 * il peer con che ha appena accettato la connessione, e accettare il segnale di ritorno, e ciò completa l'handshake.
 */


// Run when client connects
export const initializeSocket = (io: any) => {
    io.on('connection', (socket: Socket) => {
        console.log(`⚡:  ${socket.id} user just connected.`);

        /* socket.on('joinRoom', (data: any) => {
            socket.join(data);
            socket.emit("myID", socket.id);
            console.log(`Room ${data} joined`)
        }); */

        socket.on("callUser", (data: any) => {
            console.log("call user")
            io.to(data.userToCall).emit('hey', { signal: data.signalData, from: data.from });
        });

        socket.on("acceptCall", (data: any) => {
            console.log("Call accepted")
            io.to(data.to).emit('callAccepted', data.signal);
        });

        socket.on('joinChat', (data: any) => {
            const roomID: any = data.roomID;
            const username: any = data.username;
            socket.join(roomID);
            if (roomUsers[roomID]) {
                const length: number = roomUsers[roomID].length;
                if (length >= 4) {
                    console.log("roomFull")
                    socket.emit("roomFull");
                    return;
                }
                roomUsers[roomID].push({
                    name: username,
                    id: socket.id
                });
            } else {
                roomUsers[roomID] = [{
                    name: username,
                    id: socket.id
                }];
            }
            socketToRoom[socket.id] = roomID;
            const usersInThisRoom = roomUsers[roomID];
            console.log("Users in this room", usersInThisRoom)
            console.log(`${socket.id} user joined the room.`)
            console.log("users ", roomUsers[roomID])
            console.log("My user ", { id: socket.id, name: username })
            socket.emit("allChatUsers", { users: usersInThisRoom, myUser: { id: socket.id, name: username } });
        });

        socket.on('joinRoom', (data: any) => {
            const roomID: any = data.roomID;
            const username: any = data.username;
            socket.join(roomID);
            /*             if (roomUsers[roomID]) {
                            const length: number = roomUsers[roomID].length;
                            if (length >= 4) {
                                console.log("roomFull")
                                socket.emit("roomFull");
                                return;
                            }
                            roomUsers[roomID].push({
                                name: username,
                                id: socket.id
                            });
                        } else {
                            roomUsers[roomID] = [{
                                name: username,
                                id: socket.id
                            }];
                        } */
            socketToRoom[socket.id] = roomID;
            const usersInThisRoom = roomUsers[roomID];
            console.log("users ", roomUsers[roomID])
            socket.emit("allUsers", { users: usersInThisRoom, myUser: { id: socket.id, name: username } });
        });

        socket.on("sendingSignal", (payload: any) => {
            const userToSignalID = payload.userToSignalID;
            const caller = payload.caller;
            const signal = payload.signal;

            console.log(`${caller.id} has sent an offer to ${userToSignalID}`);
            io.to(userToSignalID).emit('userJoined', { signal: signal, caller: caller });
        });

        socket.on("returningSignal", (payload: any) => {
            const caller = payload.caller;
            const signal = payload.signal;

            console.log(`${socket.id} has answered the offer of ${caller.id}.`)
            io.to(caller.id).emit('receivingReturnSignal', { signal: signal, id: socket.id });
        });

        socket.on('sendTextMessage', (data: any) => {
            console.log("Message: " + data.message.textContent + ", To room: " + data.room);
            socket.to(data.room).emit("receiveTextMessage", data.message);
        });

        socket.on('votePollOption', (data: any) => {
            console.log(data.option)
            console.log("User " + data.voter.id + " voted " + data.option.id + " of message " + data.messageID + " in room: " + data.room);
            socket.to(data.room).emit("updatePollMessage", data);
        });

        // Generated by admin
        socket.on("muteForAll", (id: any) => {
            console.log("Admin muted the mic of user " + id);
            io.to(id).emit('muteMic');
        });
        socket.on("unmuteForAll", (id: any) => {
            console.log("Admin enabled the mic of user " + id);
            io.to(id).emit('unmuteMic');
        });
        socket.on("hideCamForAll", (id: any) => {
            console.log("Admin has hidden the camera of user " + id);
            io.to(id).emit('hideCam');
        });
        socket.on("showCamForAll", (id: any) => {
            console.log("Admin enabled the camera of user " + id);
            io.to(id).emit('showCam');
        });

        // Generated by user when toggling camera and video (even in consequence of admin action)
        socket.on('userHideCam', (id: any) => {
            console.log(`User ${id} hid the camera`);
            socket.broadcast.emit("cameraHiddenByUser", id);
        })
        socket.on('userShowCamera', (id: any) => {
            console.log(`User ${id} showed the camera`);
            socket.broadcast.emit("cameraShowedByUser", id);
        })
        socket.on('userMuteMic', (id: any) => {
            console.log(`User ${id} muted the microphone`);
            socket.broadcast.emit("micMutedByUser", id);
        })
        socket.on('userUnmuteMic', (id: any) => {
            console.log(`User ${id} unmuted the microphone`);
            socket.broadcast.emit("micUnmutedByUser", id);
        })

        socket.on('disconnect', () => {
            console.log('🔥: user ' + socket.id + ' disconnected');
            delete users[socket.id];

            const roomID = socketToRoom[socket.id];
            let room = roomUsers[roomID];
            if (room) {
                room = room.filter((user: any) => user.id !== socket.id);
                roomUsers[roomID] = room;
            }
            console.log("Users in this room", roomUsers[roomID])
            socket.broadcast.emit('userLeft', socket.id);
        });

    });
};