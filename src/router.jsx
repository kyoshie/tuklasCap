import { createBrowserRouter } from "react-router-dom";

import App from './App';
import Navbar from "./components/Navbar";
import About from './pages/About';
import Intro from './components/Intro';
import Marketplace from './pages/Marketplace';
import Home from './pages/Home';
import Homenav from './components/Homenav';
import Gallery from './pages/Gallery';
import Features from './pages/Features';
import Create from './pages/Create';

export const router = createBrowserRouter ([
    {
        path: "/",
        element: <App />,
        errorElement: <Error />,
      },
      {
        path: "/about",
        element: <>
          <Navbar/>
          <About/>
        </>
      },
      {
        path: "/",
        element: <>
         <Navbar/>
        <Intro/>
          </>
      },
      {
        path: "/marketplace",
        element: <>
        <Homenav/>
        <Marketplace/>
          </>
      },
      {
        path: "/home",
        element: <>
        <Homenav/>
        <Home/>
          </>
      },
      {
        path: "/gallery",
        element: <>
        <Homenav/>
        <Gallery/>
          </>
      },
      {
        path: "/create",
        element: <>
        <Homenav/>
        <Create/>
          </>
      },
      {
        path: "/features",
        element: <>
        <Navbar/>
        <Features/>
          </>
      },
]);