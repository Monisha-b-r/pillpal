'use client';

import Header from '@/components/layout/Header';
import Reminders from '@/components/dashboard/Reminders';
import Actions from '@/components/dashboard/Actions';
import PharmacyFinder from '@/components/dashboard/PharmacyFinder';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Actions />
            <Reminders />
          </div>
          <div className="flex flex-col gap-6">
            <PharmacyFinder />
          </div>
        </div>
      </main>
    </div>
  );
}
