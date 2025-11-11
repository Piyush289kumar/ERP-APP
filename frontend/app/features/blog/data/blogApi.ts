// app/routes/blog/data/blogApi.ts - (using RTK Query)

// app/routes/blog/data/blogApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getToken } from "~/utils/auth";

interface PaginationParams {
    page?: number;
    limit?: number;
    search?: string;
}

interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface Blog {
    _id?: string;
    title: string;
    slug?: string;
    category?: string | null;
    short_description?: string;
    description?: string;
    thumbnail?: string | null;
    gallery_images?: string[];
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        metaKeywords?: string[];
    };
    isActive?: boolean;
    isFeature?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

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
        /* ------------------ 🟢 PUBLIC ------------------ */
        getPublicBlogs: builder.query<
            { data: Blog[]; pagination: PaginationMeta },
            PaginationParams
        >({
            query: ({ page = 1, limit = 10, search = "" }) =>
                `blog?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`,
            providesTags: ["Blog"],
        }),

        getBlogBySlug: builder.query<{ data: Blog }, string>({
            query: (slug) => `blog/${slug}`,
            providesTags: (result, error, slug) => [{ type: "Blog", id: slug }],
        }),

        /* ------------------ 🔒 ADMIN ------------------ */
        getBlogs: builder.query<
            { data: Blog[]; pagination: PaginationMeta },
            PaginationParams
        >({
            query: ({ page = 1, limit = 10, search = "" }) =>
                `blog/admin/all?page=${page}&limit=${limit}&search=${encodeURIComponent(
                    search
                )}`,
            providesTags: ["Blog"],
        }),

        createBlog: builder.mutation<{ message: string; data: Blog }, FormData>({
            query: (formData) => ({
                url: `blog/admin`,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Blog"],
        }),

        updateBlog: builder.mutation<
            { message: string; data: Blog },
            { slug: string; formData: FormData }
        >({
            query: ({ slug, formData }) => ({
                url: `blog/admin/${slug}`,
                method: "PUT",
                body: formData,
            }),
            invalidatesTags: (result, error, { slug }) => [
                { type: "Blog", id: slug },
                "Blog",
            ],
        }),

        partiallyUpdateBlog: builder.mutation<
            { message: string; data: Blog },
            { slug: string; data: Partial<Blog> }
        >({
            query: ({ slug, data }) => ({
                url: `blog/admin/${slug}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: (result, error, { slug }) => [
                { type: "Blog", id: slug },
                "Blog",
            ],
        }),

        deleteBlog: builder.mutation<{ message: string }, string>({
            query: (slug) => ({
                url: `blog/admin/${slug}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Blog"],
        }),
    }),
});

export const {
    useGetPublicBlogsQuery,
    useGetBlogBySlugQuery,
    useGetBlogsQuery,
    useCreateBlogMutation,
    useUpdateBlogMutation,
    usePartiallyUpdateBlogMutation,
    useDeleteBlogMutation,
} = blogApi;
