import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: (import.meta.env.VITE_API_BASE_URL as string) + "/api/v1",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["inventory", "notifications", "assignedProducts"],
  endpoints: (builder) => ({
    //user registration API
    getUserRegister: builder.query({
      query: (featured) => {
        const params = new URLSearchParams();
        if (featured) {
          params.append("featured", featured);
        }
        return {
          url: `auth/register`,
          method: "POST",
          params: params,
        };
      },
      providesTags: ["inventory"],
    }),

    ///----------------- Password Related APIs -----------------///
    //user login API
    userLogin: builder.mutation({
      query: (newUserLogin) => ({
        url: "/auth/login",
        method: "POST",
        body: newUserLogin,
      }),
      invalidatesTags: ["inventory"],
    }),

    //forgot password API
    forgotPassword: builder.mutation({
      query: (userForgotPassword) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: userForgotPassword,
      }),
      invalidatesTags: ["inventory"],
    }),

    //change password API
    changePassword: builder.mutation({
      query: (userChangePassword) => ({
        url: "/auth/change-password",
        method: "POST",
        body: userChangePassword,
      }),
      invalidatesTags: ["inventory"],
    }),
    //reset password API
    resetPassword: builder.mutation({
      query: (userResetPassword) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: userResetPassword,
      }),
      invalidatesTags: ["inventory"],
    }),

    //verify email API
    verifyEmail: builder.mutation({
      query: (userVerifyEmail) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: userVerifyEmail,
      }),
      invalidatesTags: ["inventory"],
    }),

    ///----------------- Product Related APIs -----------------///
    //get all products API
    getAllProducts: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.category)
          searchParams.append("searchTerm", params.category);
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        return {
          url: `/product/get-all-products?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["inventory"],
    }),

    //get single product API
    getSingleProduct: builder.query({
      query: (id) => ({
        url: `/product/get-details/${id}`,
        method: "GET",
      }),
      providesTags: ["inventory"],
    }),

    //delete product API
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/product/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["inventory"],
    }),

    //update product API
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/product/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["inventory"],
    }),

    //create product API
    createProduct: builder.mutation({
      query: (data) => ({
        url: "/product/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["inventory"],
    }),

    ///----------------- Notification Related APIs -----------------///
    //get admin notifications API
    getAdminNotifications: builder.query({
      query: () => ({
        url: `/notification/admin`,
        method: "GET",
      }),
      providesTags: ["notifications"],
    }),

    //mark notification as read API
    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `/notification/admin${id ? `/${id}` : ""}`,
        method: "PATCH",
      }),
      invalidatesTags: ["notifications"],
    }),

    ///----------------- Category Related APIs -----------------///
    //get all categories API
    getAllCategories: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        return {
          url: `/category/get-all?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["inventory"],
    }),

    //get category details API
    getCategoryDetails: builder.query({
      query: (id) => ({
        url: `/category/get-details/${id}`,
        method: "GET",
      }),
      providesTags: ["inventory"],
    }),

    //create category API
    createCategory: builder.mutation({
      query: (data) => ({
        url: "/category/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["inventory"],
    }),

    //update category API
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/category/update/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["inventory"],
    }),

    ///----------------- Order Related APIs -----------------///
    //get all orders API
    getAllOrders: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        return {
          url: `/order/get-all-order?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["inventory"],
    }),

    ///----------------- User Related APIs -----------------///
    //get all users API
    getAllUsers: builder.query({
      query: (params) => {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append("page", params.page.toString());
        if (params?.limit)
          searchParams.append("limit", params.limit.toString());
        return {
          url: `/user/get-all-users?${searchParams.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["inventory"],
    }),

    ///----------------- Inventory Related APIs -----------------///

    ///----------------- Dashboard Related APIs -----------------///
    //get dashboard statistics API
    getDashboardStatistics: builder.query({
      query: () => ({
        url: `/dashboard/get-all-data`,
        method: "GET",
      }),
      providesTags: ["inventory"],
    }),

    //get earning chart data API
    getEarningChartData: builder.query({
      query: (year) => ({
        url: `/dashboard/get-earning-chart-data${year ? `?year=${year}` : ""}`,
        method: "GET",
      }),
      providesTags: ["inventory"],
    }),

    ///----------------- Assign Product Related APIs -----------------///
    //get all assigned customers for a product API
    getAssignedCustomers: builder.query({
      query: (productId) => ({
        url: `/assign-product/get-all-data/${productId}`,
        method: "GET",
      }),
      providesTags: ["assignedProducts"],
    }),

    //delete assigned customer API
    deleteAssignedCustomer: builder.mutation({
      query: (assignId) => ({
        url: `/assign-product/delete-assign-product/${assignId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["assignedProducts"],
    }),

    ///----------------- Setting Related APIs -----------------///
    //get terms conditions API
    getTermsConditions: builder.query({
      query: () => ({
        url: `/setting/get/terms-conditions`,
        method: "GET",
      }),
      providesTags: ["inventory"],
    }),

    //update terms conditions API
    updateTermsConditions: builder.mutation({
      query: (data) => ({
        url: `/setting/update/terms-conditions`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["inventory"],
    }),

    //get privacy policy API
    getPrivacyPolicy: builder.query({
      query: () => ({
        url: `/setting/get/privacy-policy`,
        method: "GET",
      }),
      providesTags: ["inventory"],
    }),

    //update privacy policy API
    updatePrivacyPolicy: builder.mutation({
      query: (data) => ({
        url: `/setting/update/privacy-policy`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["inventory"],
    }),

    //get about us API
    getAboutUs: builder.query({
      query: () => ({
        url: `/setting/get/about-us`,
        method: "GET",
      }),
      providesTags: ["inventory"],
    }),

    //update about us API
    updateAboutUs: builder.mutation({
      query: (data) => ({
        url: `/setting/update/about-us`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["inventory"],
    }),
  }),
});

export const {
  useGetUserRegisterQuery,
  useUserLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useChangePasswordMutation,
  useGetAllProductsQuery,
  useGetSingleProductQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useCreateProductMutation,
  useGetAdminNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useGetAllCategoriesQuery,
  useGetCategoryDetailsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetAllOrdersQuery,
  useGetAllUsersQuery,
  useGetDashboardStatisticsQuery,
  useGetEarningChartDataQuery,
  useGetAssignedCustomersQuery,
  useDeleteAssignedCustomerMutation,
  useGetTermsConditionsQuery,
  useUpdateTermsConditionsMutation,
  useGetPrivacyPolicyQuery,
  useUpdatePrivacyPolicyMutation,
  useGetAboutUsQuery,
  useUpdateAboutUsMutation,
} = baseApi;
