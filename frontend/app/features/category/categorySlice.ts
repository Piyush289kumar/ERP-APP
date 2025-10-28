// app/routes/category/categorySlice.ts

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface CategoryState {
  sortBy: string;
  sortOrder: string;
  search: string;
  modalOpen: boolean;
  selectedCategory: any | null;
}

const initialState: CategoryState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  modalOpen: false,
  selectedCategory: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setSort(state, action: PayloadAction<{ sortBy: string; sortOrder: string }>) {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },

    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    // ✅ Make payload optional
    openModal(state, action: PayloadAction<any | undefined>) {
      state.modalOpen = true;
      state.selectedCategory = action.payload || null;
    },

    closeModal(state) {
      state.modalOpen = false;
      state.selectedCategory = null;
    },
  },
});

export const { setSort, setSearch, openModal, closeModal } = categorySlice.actions;
export default categorySlice.reducer;
