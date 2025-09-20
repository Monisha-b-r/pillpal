'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useMedicineStore } from '@/hooks/use-medicine-store';
import { Circle, Package, PackageOpen, Info, PlusCircle } from 'lucide-react';
import type { StockStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Medicine } from '@/lib/types';

const getStockStatus = (quantity: number): StockStatus => {
  if (quantity <= 0) return 'empty';
  if (quantity <= 7) return 'low';
  if (quantity <= 15) return 'medium';
  return 'high';
};

const statusConfig: {
  [key in StockStatus]: { color: string; label: string };
} = {
  high: { color: 'text-green-500', label: 'In Stock' },
  medium: { color: 'text-yellow-500', label: 'Low Stock' },
  low: { color: 'text-orange-500', label: 'Very Low' },
  empty: { color: 'text-red-500', label: 'Out of Stock' },
};

const Inventory = () => {
  const { medicines, addStock } = useMedicineStore();
  const { toast } = useToast();
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [stockToAdd, setStockToAdd] = useState(30);

  const openAddStockDialog = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setStockToAdd(30); // Reset to default
  };

  const handleAddStock = () => {
    if (selectedMedicine) {
      addStock(selectedMedicine.name, stockToAdd);
      toast({
        title: 'Inventory Updated',
        description: `${stockToAdd} units of ${selectedMedicine.name} have been added.`,
      });
      setSelectedMedicine(null);
    }
  };

  const renderHeader = () => (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="text-primary" />
          <span>My Medicines</span>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 text-sm">
            <h4 className="font-semibold mb-2">Stock Status Guide</h4>
            <ul className="space-y-2">
              {Object.entries(statusConfig).map(([key, value]) => (
                <li key={key} className="flex items-center">
                  <Circle className={cn('h-2.5 w-2.5 fill-current mr-2', value.color)} />
                  <span className={cn('font-medium', value.color)}>{value.label}</span>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </CardTitle>
    </CardHeader>
  );

  return (
    <>
      <Card>
        {renderHeader()}
        <CardContent>
          {medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
              <PackageOpen className="w-12 h-12 mb-4" />
              <p className="font-semibold">Your medicine cabinet is empty.</p>
              <p className="text-sm">Scan a pill package or upload a prescription on the main page.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {medicines.map(medicine => {
                const status = getStockStatus(medicine.quantity);
                const config = statusConfig[status];
                return (
                  <div key={medicine.id} className="flex items-center p-3 bg-secondary rounded-lg">
                    <div className="flex-grow">
                      <p className="font-semibold text-base">{medicine.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {medicine.dosage} - {medicine.instructions}
                      </p>
                    </div>
                    <div className="text-right ml-4 flex items-center gap-4">
                      <div>
                        <p className="font-bold text-xl">{medicine.quantity}</p>
                        <div className="flex items-center justify-end gap-1.5">
                          <Circle className={cn('h-2.5 w-2.5 fill-current', config.color)} />
                          <p className={cn('text-xs font-medium', config.color)}>{config.label}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openAddStockDialog(medicine)}
                        aria-label={`Add stock for ${medicine.name}`}
                      >
                        <PlusCircle className="h-6 w-6 text-primary" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMedicine} onOpenChange={() => setSelectedMedicine(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock for {selectedMedicine?.name}</DialogTitle>
            <DialogDescription>
              Enter the quantity you'd like to add to your inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="stock-amount" className="text-right">
                Quantity
              </Label>
              <Input
                id="stock-amount"
                type="number"
                value={stockToAdd}
                onChange={e => setStockToAdd(parseInt(e.target.value, 10) || 0)}
                className="col-span-2"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddStock}>Add Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Inventory;
