import { createBrowserRouter } from "react-router-dom";

import App from './App';
import Navbar from "./components/Navbar";
import About from './pages/About';
import Intro from './components/Intro';
import Marketplace from './pages/Marketplace';


export const router = createBrowserRouter ([
    {
        path: "/",
        element: <App />,
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
        <Navbar/>
        <Marketplace/>
          </>
      },
      {
        path: "/home",
        element: <>
  
          </>
      },
]);