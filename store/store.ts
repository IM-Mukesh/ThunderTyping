// store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import settingsReducer from "./slices/settingsSlice";
import typingReducer from "./slices/typingSlice";

// 1️⃣ Combine reducers
const rootReducer = combineReducers({
  settings: settingsReducer,
  typing: typingReducer,
});

// 2️⃣ Persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["settings"], // only persist settings
};

// 3️⃣ Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4️⃣ Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist needs this
    }),
});

// 5️⃣ Persistor
export const persistor = persistStore(store);

// 6️⃣ Types
// ✅ Use store.getState (includes _persist) instead of rootReducer
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 7️⃣ Hooks
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
