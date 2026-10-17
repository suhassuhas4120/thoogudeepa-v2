import React from 'react';

export const dynamicParams = true;

export function generateStaticParams() {
  // Pre-generate menu items 1 through 10 for static deployment
  return Array.from({ length: 10 }, (_, i) => ({
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
