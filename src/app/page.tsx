'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/seat/12');
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white text-black">
      <div className="text-center font-bold text-sm">
        Entering Seat #12...
      </div>
    </div>
  );
}
