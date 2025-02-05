import WorksPage from './pages/Works'
import NotePage from './pages/NotePage'
import CvPage from './pages/CvPage'
import ContactPage from './pages/Contact'
import PostPage from './pages/PostPage'
import ErrPage from './pages/ErrPage'
import Editor from './pages/Editor'
import HomePage from './pages/HomePage'
import '@mantine/core/styles.css';

import { MantineProvider } from '@mantine/core';

import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from 'react-router-dom';
import NavBar from './components/NavBar'
import ScrollToTop from './components/ScrolToTop'
import ModalProvider from './providers/ModalProvider'
import { RecoilRoot } from 'recoil'
import TestPage from './pages/Test'
import LoginPage from './pages/Login'
import MemoPage from './pages/Memo'

const HeaderLayout = () => (
  <>
    <header>
      <NavBar />
    </header>
    <Outlet />
    <ScrollToTop />

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
        path: '/test',
        element: <TestPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/memo',
        element: <MemoPage />,
      }
    ],
    
  },
  {
    path: '/Editor',
    element: <Editor />,
  },
]);

function App() {

  return (
    <>
      <RecoilRoot>
        <ModalProvider>
          <MantineProvider>
          <RouterProvider router={router}/>

          </MantineProvider>
        </ModalProvider>    
      </RecoilRoot>
        </>
  )
}

export default App
