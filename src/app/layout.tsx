import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ProcessCore - Ultimate Process Documentation',
  description: 'Interactive process documentation with visual flowcharts, checklists, video guides, and AI-executable formats.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
