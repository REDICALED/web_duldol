import HomePage from './pages/HomePage'
import WorksPage from './pages/Works'
import NotePage from './pages/NotePage'
import CvPage from './pages/CvPage'
import ContactPage from './pages/Contact'
import PostPage from './pages/PostPage'
import ErrPage from './pages/ErrPage'
import Editor from './pages/Editor'

import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom';
import NavBar from './components/NavBar'

const HeaderLayout = () => (
  <>
    <header>
      <NavBar />
    </header>
    <Outlet />
  </>
);

const router = createBrowserRouter([
  {
    element: <HeaderLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '*',
        element: <ErrPage />,
      },
      {
        path: '/Works',
      element: <WorksPage />,
      },
      {
        path: '/Note',
        element: <NotePage />,
      },
      {
        path: '/cv',
        element: <CvPage />,
      },
      {
        path: '/contact',
        element: <ContactPage />,
      },
      {
        path: '/Works/:id',
        element: <PostPage />,
      },
      {
        path: '/Editor',
        element: <Editor />,
      },
    ],
  },
]);

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
