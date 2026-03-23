import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import {
  apolloClient,
  getStoredToken,
  setStoredToken,
} from "../apollo/client";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  currency: string;
  darkMode: boolean;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
};

const initialState: AuthState = {
  token: getStoredToken(),
  user: null,
  hydrated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.hydrated = true;
      setStoredToken(action.payload.token);
    },
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.hydrated = true;
      setStoredToken(null);
      void apolloClient.clearStore();
    },
    setHydrated(state, action: PayloadAction<boolean>) {
      state.hydrated = action.payload;
    },
  },
});

export const { setCredentials, setUser, logout, setHydrated } =
  authSlice.actions;
