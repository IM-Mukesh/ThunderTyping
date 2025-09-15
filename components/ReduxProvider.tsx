"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/store/store";
import type { PropsWithChildren, ReactNode } from "react";

export default function ReduxProvider({
  children,
}: PropsWithChildren<{ children?: ReactNode }>) {
  return (
    <Provider store={store}>
      {persistor ? (
        <PersistGate persistor={persistor} loading={null}>
          {children}
        </PersistGate>
      ) : (
        children
      )}
    </Provider>
  );
}
