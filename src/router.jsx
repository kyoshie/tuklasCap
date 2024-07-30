import { createBrowserRouter } from "react-router-dom";

import App from './App';
import Navbar from "./components/Navbar";
import About from './components/About';
import Intro from './components/Intro';


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
        <Intro/>
        <Navbar/>
          </>
      },
]);