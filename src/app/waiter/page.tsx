'use client';

import React, { useState, useEffect } from 'react';
import MobileCockpitMaster from '@/components/waiter-mobile/MobileCockpitMaster';
import { TabletCockpitMaster } from '@/components/waiter-tablet/TabletCockpitMaster';

export default function WaiterIndexPage() {
  const [isTablet, setIsTablet] = useState<boolean | null>(null);

  useEffect(() => {
    const checkViewport = () => {
      setIsTablet(window.innerWidth >= 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  if (isTablet === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm font-medium">
        Loading Waiter Cockpit...
      </div>
    );
  }

  return isTablet ? <TabletCockpitMaster /> : <MobileCockpitMaster />;
}
