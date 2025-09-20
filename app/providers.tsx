// app/providers.tsx
"use client";

import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store } from "../store/store";
import { persistStore, Persistor } from "redux-persist";

const persistor: Persistor = persistStore(store);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
