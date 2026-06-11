import React from "react";

export const metadata = {
  title: "HabitFlow AI - Ambient Wellness System",
  description: "An interactive, beautiful ambient wellness and focus tracker featuring multi-screen experiences.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] flex flex-col font-sans selection:bg-[#95d4b3]/30">
      {children}
    </div>
  );
}
