'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { useMedicineStore } from '@/hooks/use-medicine-store';
import { Circle, Package, PackageOpen, Info } from 'lucide-react';
import type { StockStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

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
  const { medicines } = useMedicineStore();

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
                  <Circle
                    className={cn(
                      'h-2.5 w-2.5 fill-current mr-2',
                      value.color
                    )}
                  />
                  <span className={cn('font-medium', value.color)}>
                    {value.label}
                  </span>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </CardTitle>
    </CardHeader>
  );

  if (medicines.length === 0) {
    return (
      <Card>
        {renderHeader()}
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <PackageOpen className="w-12 h-12 mb-4" />
            <p className="font-semibold">Your medicine cabinet is empty.</p>
            <p className="text-sm">
              Scan a pill package or upload a prescription.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {renderHeader()}
      <CardContent>
        <div className="space-y-3">
          {medicines.map(medicine => {
            const status = getStockStatus(medicine.quantity);
            const config = statusConfig[status];
            return (
              <div
                key={medicine.id}
                className="flex items-center p-3 bg-secondary rounded-lg"
              >
                <div className="flex-grow">
                  <p className="font-semibold text-base">{medicine.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {medicine.dosage} - {medicine.instructions}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-xl">{medicine.quantity}</p>
                  <div className="flex items-center justify-end gap-1.5">
                    <Circle
                      className={cn('h-2.5 w-2.5 fill-current', config.color)}
                    />
                    <p className={cn('text-xs font-medium', config.color)}>
                      {config.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default Inventory;
