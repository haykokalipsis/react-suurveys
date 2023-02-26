import {createBrowserRouter, Navigate} from "react-router-dom";

// Components
import Dashboard from "./views/Dashboard.jsx";
import Surveys from "./views/Surveys.jsx";
import Login from "./views/Login.jsx";
import Signup from "./views/Signup.jsx";
import GuestLayout from "./layouts/GuestLayout.jsx";
import DefaultLayout from "./layouts/DefaultLayout.jsx";
import SurveyCreate from "./views/SurveyCreate.jsx";
import SurveyPublicView from "./views/SurveyPublicView.jsx";

// Router
const router = createBrowserRouter([
    {
        path: '/',
        element: <DefaultLayout />,
        children: [
            {
                path: '/dashboard',
                element: <Navigate to='/' />
            },
            {
                path: '/',
                element: <Dashboard />
            },
            {
                path: '/surveys',
                element: <Surveys />
            },
            {
                path: '/surveys/create',
                element: <SurveyCreate />
            },
            {
                path: '/surveys/:id',
                element: <SurveyCreate />
            },
        ]
    },

    {
        // path: '/guest', // http://localhost:3000/guest/login, http://localhost:3000/guest/signup
        path: '/', // http://localhost:3000/login, http://localhost:3000/signup
        element: <GuestLayout />,
        children: [
            {
                path: 'login',
                element: <Login />
            },
            {
                path: 'signup',
                element: <Signup />
            },
        ]
    },
    {
        path: '/surveys/public/:slug',
        element: <SurveyPublicView />
    }
]);

export default router;
