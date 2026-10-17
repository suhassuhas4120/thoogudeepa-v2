import React from 'react';

export function generateStaticParams() {
  // Pre-generate menu items 1 through 8 for static deployment
  return Array.from({ length: 8 }, (_, i) => ({
    itemId: String(i + 1),
  }));
}

export default function ItemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
