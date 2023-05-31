import { socket } from './socket';
import './App.css';
import React, { useState, useEffect } from 'react';
import Room from './components/VideoRoom';
import CreateRoom from './components/CreateRoom';
import { BrowserRouter, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Chat from './components/Chat';
import Messenger from './pages/messenger/Messenger';
import Videocall from './pages/videocall/Videocall';
import LandingPage from './pages/landingPage/LandingPage';
import RoomInviter from './pages/roomInviter/RoomInviter';

function App() {
  const [amOwner, setAmOwner] = useState<boolean>(false);
  const [amInvited, setAmInvited] = useState<boolean>(false);

  useEffect(() => {

  }, []);

  const handleCreateRoom = () => {
    setAmOwner(true);
  }

  const handleInviteSubmit = () => {
    setAmInvited(true);
  }

  const router = createBrowserRouter([
    {
      path: "/",
      index: true,
      element: <LandingPage socket={socket} onSubmit={handleCreateRoom} />,
    },
    {
      path: "/videochat/:roomname/:username",
      element: <Videocall socket={socket} amInvited={amInvited} amOwner={amOwner} />,
    },
    {
      path: "/inviter/:roomname",
      element: <RoomInviter socket={socket} onSubmit={handleInviteSubmit} />
    }
    /* {
      path: "/",
      index: true,
      element: <CreateRoom />,
    },
    {
      path: "/room/:roomID",
      element: <Room socket={socket} />,
    }, */
    /* {
      path: "/",
      element: <Chat socket={socket} />
    } */
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;