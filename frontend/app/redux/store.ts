// app/redux/store.ts

import { configureStore } from "@reduxjs/toolkit";

// ⚙️ App Configuration Feature
import appConfigurationReducer from "~/features/app-configuration/data/appConfigurationSlice";
import { appConfigurationApi } from "~/features/app-configuration/data/appConfigurationApi";

// 🧍 Existing
import userReducer from "~/features/user/userSlice";

// 🗂 Blog Feature
import blogReducer from "~/features/blog/data/blogSlice";
import { blogApi } from "~/features/blog/data/blogApi";

// 🗂 Category Feature
import categoryReducer from "~/features/category/data/categorySlice";
import { categoryApi } from "~/features/category/data/categoryApi";

// ⚙️ Service Feature
import serviceReducer from "~/features/service/data/serviceSlice";
import { serviceApi } from "~/features/service/data/serviceApi";

// ⚙️  Policy Feature
import policyReducer from "~/features/policy/data/policySlice";
import { policyApi } from "~/features/policy/data/policyApi";

// ⚙️  Testimonial Feature
import testimonialReducer from "~/features/testimonial/data/testimonialSlice";
import { testimonialApi } from "~/features/testimonial/data/testimonialApi";

// ⚙️  Gallery Feature
import galleryReducer from "~/features/gallery/data/gallerySlice";
import { galleryApi } from "~/features/gallery/data/galleryApi";

export const store = configureStore({
  reducer: {
    // ✅ App Configuration state + API
    appConfiguration: appConfigurationReducer,
    [appConfigurationApi.reducerPath]: appConfigurationApi.reducer,

    // ✅ User state
    user: userReducer,

    // ✅ Blog state + API
    blog: blogReducer,
    [blogApi.reducerPath]: blogApi.reducer,


    // ✅ Category state + API
    category: categoryReducer,
    [categoryApi.reducerPath]: categoryApi.reducer,

    // ✅ Service state + API
    service: serviceReducer,
    [serviceApi.reducerPath]: serviceApi.reducer,


    // ✅ Policy state + API
    policy: policyReducer,
    [policyApi.reducerPath]: policyApi.reducer,

    // ✅ Testimonial state + API
    testimonial: testimonialReducer,
    [testimonialApi.reducerPath]: testimonialApi.reducer,

    // ✅ Gallery state + API
    gallery: galleryReducer,
    [galleryApi.reducerPath]: galleryApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      appConfigurationApi.middleware,
      blogApi.middleware,
      categoryApi.middleware,
      serviceApi.middleware,
      policyApi.middleware,
      testimonialApi.middleware,
      galleryApi.middleware,
    ),
});

// ✅ Type Inference
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
