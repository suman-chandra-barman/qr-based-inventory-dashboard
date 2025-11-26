import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface AuthUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  image?: string;
  verified?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
};

// Load from localStorage when app starts
if (typeof window !== "undefined") {
  try {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedToken) {
      initialState.token = storedToken;
      initialState.refreshToken = storedRefreshToken;
      initialState.user = storedUser ? JSON.parse(storedUser) : null;
      initialState.isAuthenticated = true;
    }
  } catch (error) {
    console.error("LocalStorage load failed:", error);
  }
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{
        user: AuthUser;
        token: string;
        refreshToken?: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;

      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
      if (action.payload.refreshToken) {
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
    },

    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };

        // Update localStorage
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    },
  },
});

export const { setUser, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
