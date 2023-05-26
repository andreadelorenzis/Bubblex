import { socket } from './socket';
import './App.css';
import Room from './components/VideoRoom';
import CreateRoom from './components/CreateRoom';
import { BrowserRouter, Route, createBrowserRouter, RouterProvider } from 'react-router-dom';
import Chat from './components/Chat';
import Messenger from './pages/messenger/Messenger';

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      index: true,
      element: <Chat socket={socket} />,
    },
    /* {
      path: "/",
      index: true,
      element: <CreateRoom />,
    },
    {
      path: "/room/:roomID",
      element: <Room socket={socket} />,
    }, */
  ]);

  return (
    <RouterProvider router={router} />
  );
}

export default App;