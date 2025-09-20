'use client';

import Header from '@/components/layout/Header';
import Inventory from '@/components/dashboard/Inventory';

export default function InventoryPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <Inventory />
      </main>
    </div>
  );
}
