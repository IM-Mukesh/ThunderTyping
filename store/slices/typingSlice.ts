import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface TypingState {
  mode: "randomWords" | "stories" | "custom";
  wordCount: number;
}

const initialState: TypingState = {
  mode: "randomWords",
  wordCount: 300,
};

const typingSlice = createSlice({
  name: "typing",
  initialState,
  reducers: {
    setMode: (state, action: PayloadAction<TypingState["mode"]>) => {
      state.mode = action.payload;
    },
    setWordCount: (state, action: PayloadAction<number>) => {
      state.wordCount = action.payload;
    },
  },
});

export const { setMode, setWordCount } = typingSlice.actions;
export default typingSlice.reducer;
