import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import OwnerLayout from "../layouts/OwnerLayout/OwnerLayout";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import HomePage from "../pages/HomePage";
import ExplorePage from "../pages/ExplorePage";
import HowItWorksPage from "../pages/HowItWorksPage";
import ContractPage from "../pages/ContractPage";
import WhyUsPage from "../pages/WhyUsPage";
import ContactPage from "@/pages/ContactPage";
import ProductPage from "../pages/ProductPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import NewsPage from "../pages/NewsPage";
import NotFoundPage from "../pages/NotFoundPage";
import DashboardOwner from "../pages/Owner/Dashboard/Dashboard";
import CameraManagement from "../pages/Owner/CameraManagement/CameraManagement";
import OrderManagement from "../pages/Owner/OrderManagement/OrderManagement";
import UserManagement from "../pages/Owner/UserManagement/UserManagement";
import DashboardAdmin from "../pages/Admin/Dashboard/Dashboard";
import AccountManagement from "../pages/Admin/AccountManagement/AccountManagement";
import AgencyManagement from "../pages/Admin/AgencyManagement/AgencyManagement";
import DeviceManagement from "../pages/Admin/DeviceManagement/DeviceManagement";
import AdminSettings from "../pages/Admin/Settings/AdminSettings";
import AdminProfile from "../pages/Admin/Profile/AdminProfile";
import OwnerProfile from "../pages/Owner/Profile/OwnerProfile";
import ManagerLayout from "../layouts/ManagerLayout/ManagerLayout";
import DashboardManager from "@/pages/Manager/Dashboard";
import BookingManagement from "@/pages/Manager/Booking";
import StaffLayout from "../layouts/StaffLayout/StaffLayout";
import MyAssignments from "../pages/Staff/MyAssignments";
const routes: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "explore",
        element: <ExplorePage />,
      },
      {
        path: "how-it-works",
        element: <HowItWorksPage />,
      },
      {
        path: "contract",
        element: <ContractPage />,
      },
      {
        path: "why-us",
        element: <WhyUsPage />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "products",
        element: <ProductPage />,
      },
      {
        path: "products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "news",
        element: <NewsPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: "/owner",
    element: (
      <ProtectedRoute requiredRole="Owner">
        <OwnerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardOwner />,
      },
      {
        path: "cameras",
        element: <CameraManagement />,
      },
      {
        path: "orders",
        element: <OrderManagement />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "profile",
        element: <OwnerProfile />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="Admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardAdmin />,
      },
      {
        path: "account",
        element: <AccountManagement />,
      },
      {
        path: "agencies",
        element: <AgencyManagement />,
      },
      {
        path: "devices",
        element: <DeviceManagement />,
      },
      {
        path: "profile",
        element: <AdminProfile />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
    ],
  },
  {
    path: "/manager",
    element: <ManagerLayout />,
    children: [
      {
        path: "dashboard",
        element: <DashboardManager />,
      },
      {
        path: "account",
        element: <AccountManagement />,
      },
      {
        path: "booking",
        element: <BookingManagement />,
      },
      {
        path: "devices",
        element: <DeviceManagement />,
      },
      {
        path: "profile",
        element: <AdminProfile />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
    ],
  },
  {
    path: "/staff",
    element: <StaffLayout />,
    children: [
      {
        path: "dashboard",
        element: <DashboardManager />,
      },
      {
        path: "my-assignments",
        element: <MyAssignments />,
      },
      {
        path: "profile",
        element: <AdminProfile />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
