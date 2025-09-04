import type { Metadata } from "next";
import ClientPage from "./ClientPage";

export const metadata: Metadata = {
  title: "ThunderTyping — Ultra-advanced typing practice",
  description: "Calm, focused typing practice with elite UX and performance.",
};

export default function Page() {
  return <ClientPage />;
}
