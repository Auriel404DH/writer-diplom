import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

interface AuthState {
  user: { name: string; email: string } | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: Cookies.get("token") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{
        user: { name: string; email: string };
        token: string;
      }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      Cookies.set("token", action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      Cookies.remove("token");
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
