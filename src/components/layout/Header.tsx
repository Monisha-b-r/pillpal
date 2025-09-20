import Link from 'next/link';
import PillPalLogo from '@/components/icons/PillPalLogo';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
            <Link href="/inventory" aria-label="My Medicines">
              <Button variant="ghost" size="icon" asChild>
                <Package className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
