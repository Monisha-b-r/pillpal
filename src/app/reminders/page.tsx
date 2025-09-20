
'use client';

import Header from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMedicineStore } from '@/hooks/use-medicine-store';
import { AlertTriangle, BellRing, PackageOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const LowStockReminders = () => {
  const { medicines } = useMedicineStore();
  const router = useRouter();

  const lowStockMedicines = medicines.filter(
    (medicine) => medicine.quantity <= 7
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8 flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BellRing className="text-primary" />
              <span>Low Stock Reminders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockMedicines.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                <PackageOpen className="w-12 h-12 mb-4" />
                <p className="font-semibold">No low-stock medicines.</p>
                <p className="text-sm">Your inventory is well-stocked for now.</p>
                 <Button variant="outline" className="mt-6" onClick={() => router.push('/inventory')}>
                    View Inventory
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start p-3 text-sm text-yellow-800 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-lg">
                    <AlertTriangle className="mr-3 mt-1 h-5 w-5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Action Required</p>
                        <p>The following medicines are running low. Plan to refill them soon.</p>
                    </div>
                </div>
                <div className="space-y-3">
                  {lowStockMedicines.map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                      <div>
                        <p className="font-semibold text-base">{medicine.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {medicine.dosage} - {medicine.instructions}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-destructive">{medicine.quantity}</p>
                        <p className="text-xs text-destructive">doses left</p>
                      </div>
                    </div>
                  ))}
                </div>
                 <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/inventory')}>
                    Manage Full Inventory
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LowStockReminders;
