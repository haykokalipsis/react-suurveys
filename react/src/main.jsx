import React from 'react'
import ReactDOM from 'react-dom/client'
import {ContextProvider} from "./contexts/ContextProvider.jsx";
import router from "./router.jsx";
import {RouterProvider} from "react-router-dom";

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ContextProvider>
            <RouterProvider router={router}/>
        </ContextProvider>
    </React.StrictMode>,
)
