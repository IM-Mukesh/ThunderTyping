// store/slices/settingsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FillColor {
  code: string; // hex like '#FFFFFF' or identifier like 'gradient-cyan-blue'
  className: string; // Tailwind or CSS class (for gradients or classes)
}

interface SettingsState {
  fillColors: FillColor[];
  language: string;
  currentFillColor: string; // hex or identifier
  isInitialized: boolean;
}

const defaultColors: FillColor[] = [
  { code: "#FFFFFF", className: "bg-white text-black" },
  { code: "#FFFF00", className: "bg-yellow-300 text-black" },
  { code: "#00FF00", className: "bg-green-500 text-white" },
  { code: "#00FFFF", className: "bg-cyan-300 text-black" },
  // Use an identifier for gradients instead of putting classes in `code`
];

const initialState: SettingsState = {
  fillColors: defaultColors,
  language: "english",
  currentFillColor: "#FFFFFF",
  isInitialized: false,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    initializeSettings: (state) => {
      if (!state.fillColors || state.fillColors.length === 0) {
        state.fillColors = defaultColors;
      }
      state.currentFillColor = state.currentFillColor || "#FFFFFF";
      state.language = state.language || "english";
      state.isInitialized = true;
    },

    addColor: (state, action: PayloadAction<FillColor>) => {
      // avoid duplicates by code
      const exists = state.fillColors.some(
        (c) => c.code === action.payload.code
      );
      if (!exists) state.fillColors.push(action.payload);
    },

    removeColor: (state, action: PayloadAction<string>) => {
      state.fillColors = state.fillColors.filter(
        (color) => color.code !== action.payload
      );
      if (state.currentFillColor === action.payload) {
        state.currentFillColor = "#FFFFFF";
      }
    },

    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },

    setCurrentFillColor: (state, action: PayloadAction<string>) => {
      state.currentFillColor = action.payload;
    },

    resetToDefaults: (state) => {
      state.fillColors = defaultColors;
      state.language = "english";
      state.currentFillColor = "#FFFFFF";
      state.isInitialized = true;
    },
  },
});

export const {
  initializeSettings,
  addColor,
  removeColor,
  setLanguage,
  setCurrentFillColor,
  resetToDefaults,
} = settingsSlice.actions;

export default settingsSlice.reducer;
