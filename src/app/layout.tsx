import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArcCore — Learn. Challenge. Evolve.",
  description:
    "ArcCore is a collaborative learning and quiz platform designed to help a group of learners share knowledge, create quizzes, test their understanding, and track their progress together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
