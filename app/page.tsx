import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "ThunderTyping — Online Typing Test to Improve Speed & Accuracy",
  description:
    "Take the ThunderTyping test: a fast, futuristic online typing test to measure WPM and accuracy. Practice with distraction-free design and sharpen your skills.",
  openGraph: {
    title: "ThunderTyping — Online Typing Test",
    description:
      "Check your WPM and accuracy with ThunderTyping. Sleek, distraction-free typing test built for speed and precision.",
    url: "https://thundertyping.com",
    images: [
      {
        url: "https://thundertyping.com/logo.png",
        width: 1200,
        height: 630,
        alt: "ThunderTyping logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ThunderTyping — Online Typing Test",
    description:
      "Improve your typing speed with ThunderTyping. Measure WPM and accuracy instantly with futuristic UX.",
    images: ["https://thundertyping.com/logo.png"],
  },
};

export default function Page() {
  return <ClientPage />;
}
