// app/routes/blog/data/blogSlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface BlogState {
  sortBy: string;
  sortOrder: string;
  search: string;
  selectedBlog: any | null;
}

const initialState: BlogState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedBlog: null,
};

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    // ✅ Set sorting
    setSort(state, action: PayloadAction<{ sortBy: string; sortOrder: string }>) {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },

    // ✅ Set search
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    // ✅ Select / Deselect blog
    setSelectedBlog(state, action: PayloadAction<any | null>) {
      state.selectedBlog = action.payload;
    },

    // ✅ Reset filters
    resetFilters(state) {
      state.sortBy = "createdAt";
      state.sortOrder = "desc";
      state.search = "";
      state.selectedBlog = null;
    },
  },
});

export const { setSort, setSearch, setSelectedBlog, resetFilters } = blogSlice.actions;
export default blogSlice.reducer;