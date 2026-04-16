import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { MainLayout } from "./components/Layout/MainLayout";
import { Login } from "./Auth/Login";
import { Register } from "./Auth/Register";
import { Dashboard } from "./Admin/Dashboard/Dashboard";
import { Customers } from "./Admin/Customers/Customers";
import { CustomerForm } from "./Admin/Customers/CustomerForm";
import { CustomerProfile } from "./Admin/Customers/CustomerProfile";
import { Loans } from "./Admin/Loans/Loans";
import { LoanForm } from "./Admin/Loans/LoanForm";
import { Payments } from "./Admin/Payments/Payments";
import { GoldRelease } from "./Admin/Loans/GoldRelease";
import { Dealers } from "./Admin/Dealers/Dealers";
import { Reports } from "./Admin/Reports/Reports";
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
      { path: "customers", element: <Customers /> },
      { path: "customers/new", element: <CustomerForm /> },
      { path: "customers/view/:id", element: <CustomerProfile /> },
      { path: "customers/edit/:id", element: <CustomerForm /> },
      { path: "loans", element: <Loans /> },
      { path: "loans/new", element: <LoanForm /> },
      { path: "loans/release/:id", element: <GoldRelease /> },
      { path: "payments", element: <Payments /> },
      { path: "dealers", element: <Dealers /> },
      { path: "reports", element: <Reports /> }
    ]
  },



  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <DataProvider>
        <Toaster />
        <React.Suspense fallback={<Loader />}>
          <RouterProvider router={router} />
        </React.Suspense>
      </DataProvider>
    </AuthProvider>
  </StrictMode>
);
