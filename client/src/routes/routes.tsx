import AuthRedirect from "../components/AuthRedirect";
import ProtectedRoute from "../components/ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";

export default [
  {
    element: (
      <AuthRedirect>
        <Home />
      </AuthRedirect>
    ),
    path: "/",
  },
  {
    element: (
      <AuthRedirect>
        <Login />
      </AuthRedirect>
    ),
    path: "/login",
  },
  {
    element: (
      <AuthRedirect>
        <Register />
      </AuthRedirect>
    ),
    path: "/register",
  },
  {
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    path: "/dashboard",
  },
];
