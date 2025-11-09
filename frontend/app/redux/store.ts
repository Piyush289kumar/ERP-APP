// app/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";

// 🧍 Existing
import userReducer from "~/features/user/userSlice";

// 🗂 Category Feature
import categoryReducer from "~/features/category/data/categorySlice";
import { categoryApi } from "~/features/category/data/categoryApi";

// ⚙️ Service Feature
import serviceReducer from "~/features/service/data/serviceSlice";
import { serviceApi } from "~/features/service/data/serviceApi";

export const store = configureStore({
  reducer: {
    // User state
    user: userReducer,

    // Category state + API
    category: categoryReducer,
    [categoryApi.reducerPath]: categoryApi.reducer,

    // Service state + API
    service: serviceReducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(categoryApi.middleware, serviceApi.middleware),
});

// ✅ Type Inference (for useSelector / useDispatch)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
