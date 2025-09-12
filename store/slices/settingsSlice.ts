import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FillColor {
  code: string; // hex or rgb color code
  className: string; // Tailwind or CSS class
}

interface SettingsState {
  fillColors: FillColor[];
  language: string;
  currentFillColor: string; // store hex code of selected color
}

const initialState: SettingsState = {
  fillColors: [
    { code: "#FFFFFF", className: "text-black bg-white" }, // White background, black text
    { code: "#FFFF00", className: "text-black bg-yellow-300" }, // Yellow
    { code: "#00FF00", className: "text-white bg-green-500" }, // Green
    { code: "#FF0000", className: "text-white bg-red-500" }, // Red
    { code: "#00FFFF", className: "text-black bg-cyan-300" }, // Cyan
    {
      code: "text-transparent font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text",
      className:
        "text-transparent font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text",
    },
  ],
  language: "english",
  currentFillColor: "#FFFFFF", // default: white
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    addColor: (state, action: PayloadAction<FillColor>) => {
      state.fillColors.push(action.payload);
    },
    removeColor: (state, action: PayloadAction<string>) => {
      state.fillColors = state.fillColors.filter(
        (color) => color.code !== action.payload
      );
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setCurrentFillColor: (state, action: PayloadAction<string>) => {
      state.currentFillColor = action.payload;
    },
  },
});

export const { addColor, removeColor, setLanguage, setCurrentFillColor } =
  settingsSlice.actions;
export default settingsSlice.reducer;
