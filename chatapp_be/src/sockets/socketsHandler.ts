import { Socket } from 'socket.io';

const roomUsers: any = {};
const socketToRoom: any = {};


// Run when client connects
export const initializeSocket = (io: any) => {
    io.on('connection', (socket: Socket) => {
        console.log(`⚡:  ${socket.id} user just connected.`);

        // Call a user in a videocall with only two users
        socket.on("callUser", (data: any) => {
            console.log("call user")
            io.to(data.userToCall).emit('hey', { signal: data.signalData, from: data.from });
        });

        // Accept the call of the other user
        socket.on("acceptCall", (data: any) => {
            console.log("Call accepted")
            io.to(data.to).emit('callAccepted', data.signal);
        });

        // Join the chat
        socket.on('joinChat', (data: any) => {
            const roomID: any = data.roomID;
            const username: any = data.username;
            socket.join(roomID);

            // If the room already exists
            if (roomUsers[roomID]) {
                const length: number = roomUsers[roomID].length;

                // If the room is not full
                if (length >= 4) {
                    console.log("roomFull")
                    socket.emit("roomFull");
                    return;
                }

                // Add the user to the room
                roomUsers[roomID].push({
                    name: username,
                    id: socket.id
                });
            } else {
                // Create a new room and add the user
                roomUsers[roomID] = [{
                    name: username,
                    id: socket.id
                }];
            }
            socketToRoom[socket.id] = roomID;

            // Send the info about all the participants to the new user in the chat
            const usersInThisRoom = roomUsers[roomID];
            console.log("Users in this room", usersInThisRoom)
            console.log(`${socket.id} user joined the room.`)
            console.log("users ", roomUsers[roomID])
            console.log("My user ", { id: socket.id, name: username })
            socket.emit("allChatUsers", { users: usersInThisRoom, myUser: { id: socket.id, name: username } });
        });

        // Join the videocall (this is called after the user has joined the chat, so the room object already exists)
        socket.on('joinRoom', (data: any) => {
            // Join the room
            const roomID: any = data.roomID;
            const username: any = data.username;
            socket.join(roomID);
            socketToRoom[socket.id] = roomID;

            // Send the info about all the participants to the new user in the videocall
            const usersInThisRoom = roomUsers[roomID];
            console.log("users ", roomUsers[roomID])
            socket.emit("allUsers", { users: usersInThisRoom, myUser: { id: socket.id, name: username } });
        });

        // Initiate the connection
        socket.on("sendingSignal", (payload: any) => {
            const userToSignalID = payload.userToSignalID;
            const caller = payload.caller;
            const signal = payload.signal;

            console.log(`${caller.id} has sent an offer to ${userToSignalID}`);
            io.to(userToSignalID).emit('userJoined', { signal: signal, caller: caller });
        });

        // Accept the connection
        socket.on("returningSignal", (payload: any) => {
            const caller = payload.caller;
            const signal = payload.signal;

            console.log(`${socket.id} has answered the offer of ${caller.id}.`)
            io.to(caller.id).emit('receivingReturnSignal', { signal: signal, id: socket.id });
        });

        // Send a message
        socket.on('sendTextMessage', (data: any) => {
            console.log("Message: " + data.message.textContent + ", To room: " + data.room);
            socket.to(data.room).emit("receiveTextMessage", data.message);
        });

        // Vote a poll message
        socket.on('votePollOption', (data: any) => {
            console.log(data.option)
            console.log("User " + data.voter.id + " voted " + data.option.id + " of message " + data.messageID + " in room: " + data.room);
            socket.to(data.room).emit("updatePollMessage", data);
        });

        // Mute this user for all participants (admin controls)
        socket.on("muteForAll", (id: any) => {
            console.log("Admin muted the mic of user " + id);
            io.to(id).emit('muteMic');
        });
        // Unmute the user for all participants (admin controls)
        socket.on("unmuteForAll", (id: any) => {
            console.log("Admin enabled the mic of user " + id);
            io.to(id).emit('unmuteMic');
        });
        // Hide the cam of the user for all participants (admin controls)
        socket.on("hideCamForAll", (id: any) => {
            console.log("Admin has hidden the camera of user " + id);
            io.to(id).emit('hideCam');
        });
        // Give permission to show the cam of the user to all participants (admin controls)
        socket.on("showCamForAll", (id: any) => {
            console.log("Admin enabled the camera of user " + id);
            io.to(id).emit('showCam');
        });

        // Event emitted when a user wants to hide his camera
        socket.on('userHideCamera', (id: any) => {
            console.log(`User ${id} hid the camera`);
            socket.broadcast.emit("cameraHiddenByUser", id);
        })
        // Event emitted when a user wants to show his camera
        socket.on('userShowCamera', (id: any) => {
            console.log(`User ${id} showed the camera`);
            socket.broadcast.emit("cameraShowedByUser", id);
        })
        // Event emitted when a user wants to mute his mic
        socket.on('userMuteMic', (id: any) => {
            console.log(`User ${id} muted the microphone`);
            socket.broadcast.emit("micMutedByUser", id);
        })
        // Event emitted when a user wants to unmute his mic
        socket.on('userUnmuteMic', (id: any) => {
            console.log(`User ${id} unmuted the microphone`);
            socket.broadcast.emit("micUnmutedByUser", id);
        })

        socket.on('disconnect', () => {
            console.log('🔥: user ' + socket.id + ' disconnected');

            // Remove the user from the room 
            const roomID = socketToRoom[socket.id];
            let room = roomUsers[roomID];
            if (room) {
                room = room.filter((user: any) => user.id !== socket.id);
                roomUsers[roomID] = room;
            }
            console.log("Users in this room", roomUsers[roomID])

            // Broadcast to all participants
            socket.broadcast.emit('userLeft', socket.id);
        });

    });
};