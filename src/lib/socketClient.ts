'use client'
const apiUrl = process.env.NEXT_PUBLIC_URL;
const appPort = process.env.NEXT_PUBLIC_APP_PORT;
import { io } from "socket.io-client";
let socketIO;
if (!socketIO) {
    socketIO = io(`${apiUrl}:${appPort}`, {
      transports: ["websocket"], // Giúp ổn định hơn
    });
  }
export const socket = socketIO;