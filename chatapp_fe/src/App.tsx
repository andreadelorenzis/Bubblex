import { socket } from './socket';
import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Videocall from './pages/videocall/Videocall';
import LandingPage from './pages/landingPage/LandingPage';
import RoomInviter from './pages/roomInviter/RoomInviter';
import ErrorAlert from './components/errorAlert/ErrorAlert';
import LeaveCallPage from './pages/leaveCallPage/LeaveCallPage';

function App() {
  const [amOwner, setAmOwner] = useState<boolean>(false);
  const [amInvited, setAmInvited] = useState<boolean>(false);
  const [videoActive, setVideoActive] = useState<boolean>(true);
  const [microphoneActive, setMicrophoneActive] = useState<boolean>(false);

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
      element: <LandingPage
        socket={socket}
        onSubmit={handleCreateRoom}
      />,
    },
    {
      path: "/videochat/:roomname/:username",
      element: <Videocall
        socket={socket}
        amInvited={amInvited}
        amOwner={amOwner}
        initVideoValue={videoActive}
        initMicValue={microphoneActive}
      />,
    },
    {
      path: "/inviter/:roomname",
      element: <RoomInviter
        socket={socket}
        videoActive={videoActive}
        microphoneActive={microphoneActive}
        onSubmit={handleInviteSubmit}
        setVideoActive={setVideoActive}
        setMicrophoneActive={setMicrophoneActive}
      />
    },
    {
      path: "/leave/:roomname/:username",
      element: <LeaveCallPage socket={socket} />
    }
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;