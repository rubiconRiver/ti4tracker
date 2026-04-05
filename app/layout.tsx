import type { Metadata } from "next";
import "./globals.css";
import VoiceAssistantWrapper from "@/components/voice-assistant-wrapper";

export const metadata: Metadata = {
  title: "TI4 Tracker",
  description: "Twilight Imperium 4 game tracker with turn timing and scoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <VoiceAssistantWrapper />
      </body>
    </html>
  );
}
