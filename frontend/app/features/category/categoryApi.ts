// app/routes/category/categoryApi.ts - (using RTK Query)

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const categoryApi = createApi({
    reducerPath: "categoryApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_URL}/`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Category"],
    endpoints: (builder) => ({
        getCategories: builder.query({
            query: ({ page = 1, limit = 20 }) => `categories?page=${page}&limit=${limit}`,
            // transformErrorResponse : (response) => response.data
            providesTags: ["Category"],
        }),

        getCategoryById: builder.query({
            query: (id) => `categories/${id}`,
            providesTags: ["Category"],
        }),

        createCategory: builder.mutation({
            query: (body) => ({
                url: "categories",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Category"],
        }),

        updateCategory: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `categories/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Category"],
        }),

        deleteCategory: builder.mutation({
            query: (id) => ({
                url: `categories/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Category"],
        }),
    }),
});

export const {
    useGetCategoriesQuery,
    useGetCategoryByIdQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi;
