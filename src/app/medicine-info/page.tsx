'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { useMedicineStore } from '@/hooks/use-medicine-store';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Pill, Info, PackagePlus, AlertTriangle } from 'lucide-react';

const MedicineInfoContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addStock } = useMedicineStore();
  const { toast } = useToast();

  const medicineName = searchParams.get('name') || 'Unknown Medicine';
  const usage = searchParams.get('usage') || 'No usage information available.';
  const isNew = searchParams.get('isNew') === 'true';

  const [stockAmount, setStockAmount] = useState<number>(30);

  const handleAddToInventory = () => {
    const success = addStock(medicineName, stockAmount);
    if (success) {
      toast({
        title: 'Inventory Updated',
        description: `${stockAmount} units of ${medicineName} added.`,
      });
      router.push('/inventory');
    } else {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: `Could not find ${medicineName} in your inventory. Add it from a prescription first.`,
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Pill className="text-primary" />
              <span>{medicineName}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isNew && (
              <div className="flex items-start p-3 text-sm text-destructive-foreground bg-destructive/80 rounded-lg">
                <AlertTriangle className="mr-3 mt-1 h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">New Medicine Detected</p>
                  <p>This medicine is not in your inventory. To add it, please upload a prescription first on the home page.</p>
                </div>
              </div>
            )}
            <div className="flex items-start">
              <Info className="mr-3 mt-1 h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Usage</h3>
                <p className="text-muted-foreground">{usage}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-amount" className="font-semibold">Add to Stock</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="stock-amount"
                  type="number"
                  value={stockAmount}
                  onChange={(e) => setStockAmount(parseInt(e.target.value, 10) || 0)}
                  className="w-24"
                  min="1"
                  disabled={isNew}
                />
                <Button onClick={handleAddToInventory} disabled={isNew} className="flex-grow">
                  <PackagePlus />
                  <span>Add to Inventory</span>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
             <Button variant="outline" className="w-full" onClick={() => router.push('/')}>
                Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};


export default function MedicineInfoPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MedicineInfoContent />
        </Suspense>
    )
}
