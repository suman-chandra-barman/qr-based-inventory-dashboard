import App from "@/App";
import AboutUsPage from "@/pages/AboutUsPage";
import SettingsPage from "@/pages/SettingPage";
import EditAboutUsPage from "@/pages/EditAboutUsPage";
import EditPrivacyPolicyPage from "@/pages/EditPrivacyPolicyPage";
import ForgotPasswordPage from "@/pages/FotgotPasswordPage";
import OTPVerificationPage from "@/pages/OTPVerificationPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import SignInPage from "@/pages/SigninPage";
import { createBrowserRouter } from "react-router-dom";
import ProductsPage from "@/pages/ProductsPage";
import CategoriesPage from "@/pages/CategoriesPage";
import CustomersPage from "@/pages/CustomersPage";
import PersonalInformationPage from "@/pages/PersonalInformationPage";
import EditPersonalInformationPage from "@/pages/EditPersonalInformationPage";
import NotFoundPage from "@/pages/NotFoundPage";
import DashboardPage from "@/pages/DashboardPage";
import AdminRoute from "@/components/auth/AdminRoute";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import TermsConditionPage from "@/pages/TermsConditionPage";
import EditTermsConditionPage from "@/pages/EditTermsConditionPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import Assign from "@/pages/Assign";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "/",
        element: (
          <AdminRoute>
            <DashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: "/dashboard",
        element: (
          <AdminRoute>
            <DashboardPage />
          </AdminRoute>
        ),
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/categories",
        element: <CategoriesPage />,
      },
      {
        path: "/customers",
        element: <CustomersPage />,
      },
       {
        path: "/assign",
        element: <Assign />,
      },
      {
        path: "/settings",
        element: <SettingsPage />,
      },
      {
        path: "/settings/personal-information",
        element: <PersonalInformationPage />,
      },
      {
        path: "/settings/personal-information/edit",
        element: <EditPersonalInformationPage />,
      },
      {
        path: "/settings/change-password",
        element: <ChangePasswordPage />,
      },
      {
        path: "/settings/terms-condition",
        element: <TermsConditionPage />,
      },
      {
        path: "/settings/terms-condition/edit",
        element: <EditTermsConditionPage />,
      },
      {
        path: "/settings/privacy-policy",
        element: <PrivacyPolicyPage />,
      },
      {
        path: "/settings/privacy-policy/edit",
        element: <EditPrivacyPolicyPage />,
      },
      {
        path: "/settings/about-us",
        element: <AboutUsPage />,
      },
      {
        path: "/settings/about-us/edit",
        element: <EditAboutUsPage />,
      },
      
    ],
  },
  {
    path: "signin",
    element: <SignInPage />,
  },
  {
    path: "forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "otp-verification",
    element: <OTPVerificationPage />,
  },
  {
    path: "reset-password",
    element: <ResetPasswordPage />,
  },
   {
    path: "change-password",
    element: <ChangePasswordPage />,
  },
]);

export default router;
