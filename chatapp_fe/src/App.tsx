import { socket } from './socket';
import './App.css';
import Chat from './components/Chat';
import Video from './components/Video';
import Room from './components/VideoRoom';
import CreateRoom from './components/CreateRoom';
import { BrowserRouter, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      index: true,
      element: <CreateRoom />,
    },
    {
      path: "/room/:roomID",
      element: <Room socket={socket} />,
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;