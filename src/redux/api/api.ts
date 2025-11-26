import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL as string,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["inventory"],
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
        method: "PATCH",
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
        if (params?.category) searchParams.append("category", params.category);
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

    ///----------------- Notification Related APIs -----------------///
    //get admin notifications API
    getAdminNotifications: builder.query({
      query: () => ({
        url: "/notification/admin",
        method: "GET",
      }),
      providesTags: ["inventory"],
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
  useGetAdminNotificationsQuery,
  useGetAllCategoriesQuery,
  useGetCategoryDetailsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetAllOrdersQuery,
  useGetAllUsersQuery,
} = baseApi;
