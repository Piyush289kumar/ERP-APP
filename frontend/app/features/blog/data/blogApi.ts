// app/routes/blog/data/blogApi.ts - (using RTK Query)

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

export const blogApi = createApi({
    reducerPath: "blogApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_API_URL}/`,
        prepareHeaders: (headers) => {
            const token = getToken();
            if (token) headers.set("Authorization", `Bearer ${token}`);
            return headers;
        },
    }),
    tagTypes: ["Blog"],

    endpoints: (builder) => ({
        /**
         * 🟢 Public Routes
         */

        // ✅ Get all active blogs (paginated + searchable)
        getPublicBlogs: builder.query({
            query: ({ page = 1, limit = 10, search = "", sortBy = "createdAt", sortOrder = "desc" }) =>
                `blog?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
            providesTags: ["Blog"],
        }),

        // ✅ Get single public blog by slug
        getPublicBlogBySlug: builder.query({
            query: (slug: string) => `blog/${slug}`,
            providesTags: ["Blog"],
        }),

        /**
         * 🔒 Admin-Protected Routes
         */

        // ✅ Get all blogs (admin - paginated + searchable)
        getBlogs: builder.query({
            query: ({ page = 1, limit = 10, search = "", sortBy = "createdAt", sortOrder = "desc" }) =>
                `blog/admin/all?page=${page}&limit=${limit}&search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
            providesTags: ["Blog"],
        }),

        // ✅ Get single blog by slug (admin)
        getBlogBySlug: builder.query({
            query: (slug: string) => `blog/${slug}`,
            providesTags: ["Blog"],
        }),

        // ✅ Create new blog (multipart/form-data)
        createBlog: builder.mutation({
            query: (formData: FormData) => ({
                url: `blog/admin`,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Blog"],
        }),

        // ✅ Update blog (PUT)
        updateBlog: builder.mutation({
            query: ({ slug, formData }: { slug: string; formData: FormData }) => ({
                url: `blog/admin/${slug}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: ["Blog"],
        }),

        // ✅ Partial update (PATCH)
        partiallyUpdateBlog: builder.mutation({
            query: ({ slug, data }: { slug: string; data: any }) => ({
                url: `blog/admin/${slug}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["Blog"],
        }),

        // ✅ Delete blog
        deleteBlog: builder.mutation({
            query: (slug: string) => ({
                url: `blog/admin/${slug}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Blog"],
        }),
    }),
});

export const {
    useGetPublicBlogsQuery,
    useGetPublicBlogBySlugQuery,
    useGetBlogsQuery,
    useGetBlogBySlugQuery,
    useCreateBlogMutation,
    useUpdateBlogMutation,
    usePartiallyUpdateBlogMutation,
    useDeleteBlogMutation,
} = blogApi;