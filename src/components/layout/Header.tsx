import Link from 'next/link';
import PillPalLogo from '@/components/icons/PillPalLogo';
import { Package, Circle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { StockStatus } from '@/lib/types';


const statusConfig: {
  [key in StockStatus]: { color: string; label: string };
} = {
  high: { color: 'text-green-500', label: 'In Stock (> 15 doses)' },
  medium: { color: 'text-yellow-500', label: 'Low Stock (8-15 doses)' },
  low: { color: 'text-orange-500', label: 'Very Low (1-7 doses)' },
  empty: { color: 'text-red-500', label: 'Out of Stock' },
};


const Header = () => {
  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <PillPalLogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              PillPal
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <TooltipProvider>
               <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/reminders" aria-label="Reminders">
                    <Button variant="ghost" size="icon" className="hover:text-primary">
                      <Bell className="h-6 w-6" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                   <p>Reminders</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/inventory" aria-label="My Medicines">
                    <Button variant="ghost" size="icon">
                      <Package className="h-6 w-6" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="w-60">
                   <div>
                    <h4 className="font-semibold mb-2">My Medicines</h4>
                    <p className='text-xs text-muted-foreground mb-3'>Click to view your inventory. Below is a guide to the stock status colors.</p>
                    <ul className="space-y-2">
                      {Object.entries(statusConfig).map(([key, value]) => (
                        <li key={key} className="flex items-center">
                          <Circle className={cn('h-2.5 w-2.5 fill-current mr-2', value.color)} />
                          <div>
                            <span className={cn('font-medium text-xs', value.color)}>{value.label.split(' (')[0]}</span>
                            <p className="text-xs text-muted-foreground">{value.label.includes('(') ? `(${value.label.split(' (')[1]}` : ''}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                   </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
