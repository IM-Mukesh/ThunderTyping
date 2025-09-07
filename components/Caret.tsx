"use client";

interface CaretProps {
  height?: number;
  width?: number;
}

export default function Caret({ height = 24, width = 2 }: CaretProps) {
  return (
    <span
      className="inline-block align-middle animate-pulse"
      style={{
        width,
        height,
        background:
          "linear-gradient(90deg, rgb(34 211 238) 0%, rgb(59 130 246) 100%)",
        marginRight: 1,
      }}
      aria-hidden="true"
    />
  );
}
