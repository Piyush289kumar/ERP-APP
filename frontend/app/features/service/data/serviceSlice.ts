// app/routes/service/data/serviceSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface ServiceState {
  sortBy: string;
  sortOrder: string;
  search: string;
  selectedService: any | null;
}

const initialState: ServiceState = {
  sortBy: "createdAt",
  sortOrder: "desc",
  search: "",
  selectedService: null,
};

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    // ✅ Set sorting field and order
    setSort(state, action: PayloadAction<{ sortBy: string; sortOrder: string }>) {
      const { sortBy, sortOrder } = action.payload;
      state.sortBy = sortBy;
      state.sortOrder = sortOrder;
    },

    // ✅ Set search term
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    // ✅ Select / Deselect a service
    setSelectedService(state, action: PayloadAction<any | null>) {
      state.selectedService = action.payload;
    },

    // ✅ Clear all filters (useful for resets)
    resetFilters(state) {
      state.sortBy = "createdAt";
      state.sortOrder = "desc";
      state.search = "";
      state.selectedService = null;
    },
  },
});

export const { setSort, setSearch, setSelectedService, resetFilters } =
  serviceSlice.actions;

export default serviceSlice.reducer;
