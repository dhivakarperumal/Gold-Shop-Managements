import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { MainLayout } from "./components/Layout/MainLayout";
import { Login } from "./Auth/Login";
import { Register } from "./Auth/Register";
import { Dashboard } from "./Admin/Dashboard/Dashboard";
import { Customers } from "./Admin/Customers";
import { Home } from "./pages/Home";
import Loader from "./components/CommonComponents/Loader";
import { Toaster } from "./components/CommonComponents/Toaster";
import { PrivateRoute } from "./context/PrivateRoute";

const router = createBrowserRouter([
  // Public Landing Page
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
    ]
  },

  // Protected Admin Area
  {
    path: "/admin",
    element: (
      <PrivateRoute allowedRoles={["admin", "user"]}>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "customers",element: <Customers /> }
    ]
  },



  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <Toaster />
      <React.Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </React.Suspense>
    </AuthProvider>
  </StrictMode>
);
