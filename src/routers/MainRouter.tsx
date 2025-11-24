import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import OwnerLayout from "../layouts/OwnerLayout/OwnerLayout";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import HomePage from "../pages/Home/HomePage";
import ExplorePage from "../pages/Home/ExplorePage";
import HowItWorksPage from "../pages/Home/HowItWorksPage";
import ContractPage from "../pages/Home/ContractPage";
import WhyUsPage from "../pages/Home/WhyUsPage";
import ContactPage from "@/pages/Home/ContactPage";
import ProductPage from "../pages/Home/ProductPage";
import ProductDetailPage from "../pages/Home/ProductDetailPage";
import NewsPage from "../pages/Home/NewsPage";
import NotFoundPage from "../pages/Home/NotFoundPage";
import DashboardOwner from "../pages/Owner/Dashboard/Dashboard";
import CameraManagement from "../pages/Owner/CameraManagement/CameraManagement";
import AccessoryManagement from "../pages/Owner/AccessoryManagement/AccessoryManagement";
import UserManagement from "../pages/Owner/UserManagement/UserManagement";
import DashboardAdmin from "../pages/Admin/Dashboard/Dashboard";
import AccountManagement from "../pages/Admin/AccountManagement/AccountManagement";
import AgencyManagement from "../pages/Admin/AgencyManagement/AgencyManagement";
import DeviceManagement from "../pages/Admin/DeviceManagement/DeviceManagement";
import AdminSettings from "../pages/Admin/Settings/AdminSettings";
import AdminProfile from "../pages/Admin/Profile/AdminProfile";
import OwnerProfile from "../pages/Owner/Profile/OwnerProfile";
import VerificationManagement from "../pages/Owner/VerificationManagement/VerificationManagement";
import ManagerLayout from "../layouts/ManagerLayout/ManagerLayout";
import DashboardManager from "@/pages/Manager/Dashboard";
import BookingManagement from "@/pages/Manager/Booking";
import StaffLayout from "../layouts/StaffLayout/StaffLayout";
import CheckBooking from "../pages/Staff/CheckBooking";
import ManagerProfile from "../pages/Manager/ManagerProfile";
import StaffManagement from "../pages/Manager/StaffManagement";
import BookingDetail from "../pages/Staff/BookingDetail";
import Verifications from "../pages/Staff/InspectionsVerify";
import VerificationDetailPage from "../pages/Staff/VerificationDetailPage";
import RenterLayout from "../layouts/RenterLayout/RenterLayout";
import RenterDashboard from "@/pages/Renter/Dashboard";
import OrderPage from "@/pages/Renter/OrderPage";
import OrderDetailPage from "@/pages/Renter/OrderDetailPage";
import ProductManagementPage from "@/pages/Manager/ProductManagement";
import VerifyManagement from "@/pages/Manager/VerifyManagement";
import CheckoutPage from "@/pages/Renter/CheckoutPage";
import { ChatPage } from "@/pages/Renter/ChatPage";
import ComparePage from "@/pages/Home/ComparePage";
import CameraQrHistory from "@/pages/Owner/QRScanner/CameraQrHistory";
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
        path: "checkout",
        element: <CheckoutPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
      {
        path: "/compare",
        element: <ComparePage />,
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
        path: "accessories",
        element: <AccessoryManagement />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
      {
        path: "profile",
        element: <OwnerProfile />,
      },
      {
        path: "verifications",
        element: <VerificationManagement />,
      },
      {
        path: "qr-inspection",
        element: <CameraQrHistory />,
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
    element: (
      <ProtectedRoute requiredRole="BranchManager">
        <ManagerLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardManager />,
      },
      {
        path: "staff",
        element: <StaffManagement />,
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
        path: "products",
        element: <ProductManagementPage />,
      },
      {
        path: "verifications",
        element: <VerifyManagement />,
      },
      {
        path: "profile",
        element: <ManagerProfile />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
    ],
  },
  {
    path: "/staff",
    element: (
      <ProtectedRoute requiredRole="Staff">
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <DashboardManager />,
      },
      {
        path: "check-booking",
        element: <CheckBooking />,
      },
      {
        path: "verifications",
        element: <Verifications />,
      },
      {
        path: "verification/:id",
        element: <VerificationDetailPage />,
      },
      {
        path: "booking/:id",
        element: <BookingDetail />,
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
    path: "/renter",
    element: (
      <ProtectedRoute requiredRole="Renter">
        <RenterLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <RenterDashboard />,
      },
      {
        path: "my-orders",
        element: <OrderPage />,
      },
      {
        path: "my-orders/:orderId",
        element: <OrderDetailPage />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },

      // ...other routes
    ],
  },
];

export const router = createBrowserRouter(routes);
