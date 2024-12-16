import { createBrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import About from './pages/About';
import Intro from './components/Intro';
import Marketplace from './pages/Marketplace';
import Guide from './pages/Guide';
import Home from './pages/Home';
import Homenav from './components/Homenav';
import Gallery from './pages/Gallery';
import Features from './pages/Features';
import Create from './pages/Create';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';
import Error from './components/Error'; // Make sure you have this component

export const router = createBrowserRouter([
    {
        path: "/",
        element: <>
            <Navbar />
            <Intro />
        </>,
        errorElement: <Error />,
    },
    {
        path: "/about",
        element: <>
            <Navbar />
            <About />
        </>
    },
    {
        path: "/guide",
        element: <>
            <Navbar />
            <Guide />
        </>
    },
    {
        path: "/marketplace",
        element: <ProtectedRoute>
            <Homenav />
            <Marketplace />
        </ProtectedRoute>
    },
    {
        path: "/home",
        element: <ProtectedRoute>
            <Homenav />
            <Home />
        </ProtectedRoute>
    },
    {
        path: "/gallery",
        element: <ProtectedRoute>
            <Homenav />
            <Gallery />
        </ProtectedRoute>
    },
    {
        path: "/create",
        element: <ProtectedRoute>
            <Homenav />
            <Create />
        </ProtectedRoute>
    },
    {
        path: "/features",
        element: <>
            <Navbar />
            <Features />
        </>
    },
    {
        path: "/admin",
        element: <ProtectedRoute requireAdmin={true}>
            <Admin />
        </ProtectedRoute>
    },
]);