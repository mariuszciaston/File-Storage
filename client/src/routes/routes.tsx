import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

export default [
  {
    element: <Home />,
    // errorElement: <Error />,
    path: "/",
  },
  { element: <Login />, path: "/login" },
  { element: <Register />, path: "/register" },
  { element: <Dashboard />, path: "/dashboard" },
];
