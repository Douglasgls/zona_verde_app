import { createHashRouter } from "react-router-dom";
import { Applayout } from "./components/layouts/AppLayout";


import Dashboard from "./pages/Dashboard";
import Devices from "./pages/devices/Devices";
import Clients from "./pages/clients/Clients";
import Spots from "./pages/spot/Spot";
import SpotsDetails from "./pages/spot/SpotDetails";
import Reservations from "./pages/reservations/Reservations";

export const router = createHashRouter([
    {
        path: "/",
        element: <Applayout />,
        children: [
            {
                path: "",
                element: <Dashboard />,
            },
            {
                path: "clients",
                element: <Clients />,
            },  
            {
                path: "devices",
                element: <Devices />,
            },
            {
                path: "spots",
                element: <Spots />,
            },
            {
                path: "reservations",
                element: <Reservations />,
            },
            {
                path: "spotsDetails/:spotId",
                element: <SpotsDetails />,
            }
        ],
    },
])
