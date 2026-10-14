import { createSlice } from "@reduxjs/toolkit";

// The bar currently in the editor: a new draft (id null) or an existing bar.
const initialState = {
  activeBar: {
    id: null,
    text: "",
  },
};

export const barsSlice = createSlice({
  name: "bars",
  initialState,
  reducers: {
    setActiveBar: (state, action) => {
      state.activeBar = { ...state.activeBar, ...action.payload };
    },
    clearActiveBar: (state) => {
      state.activeBar = initialState.activeBar;
    },
  },
});

export const { setActiveBar, clearActiveBar } = barsSlice.actions;

export const selectActiveBar = (state) => state.bars.activeBar;

export default barsSlice.reducer;
