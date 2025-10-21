import { createBrowserRouter } from "react-router-dom";
import type { RouteObject } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import ExplorePage from "../pages/ExplorePage";
import HowItWorksPage from "../pages/HowItWorksPage";
import TestimonialsPage from "../pages/TestimonialsPage";
import WhyUsPage from "../pages/WhyUsPage";
import ContactPage from "../pages/ContactPage";
import ProductPage from "../pages/ProductPage";
import NewsPage from "../pages/NewsPage";
import NotFoundPage from "../pages/NotFoundPage";

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
        path: "testimonials",
        element: <TestimonialsPage />,
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
        path: "news",
        element: <NewsPage />,
      },

      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
