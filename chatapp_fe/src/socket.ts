import { io, Socket } from 'socket.io-client';
import { getApiUrl } from './utils/appUtils';

/* const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000'; */

export const socket: Socket = io(getApiUrl());