// store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // browser localStorage
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import settingsReducer from "./slices/settingsSlice";
import typingReducer from "./slices/typingSlice";

// combine
const rootReducer = combineReducers({
  settings: settingsReducer,
  typing: typingReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["settings"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ignore redux-persist action types
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// IMPORTANT: only call persistStore on the client side
export let persistor: ReturnType<typeof persistStore> | null = null;
if (typeof window !== "undefined") {
  persistor = persistStore(store);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
