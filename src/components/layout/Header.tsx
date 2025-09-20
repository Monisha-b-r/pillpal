import PillPalLogo from '@/components/icons/PillPalLogo';

const Header = () => {
  return (
    <header className="bg-card border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <PillPalLogo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              PillPal
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
