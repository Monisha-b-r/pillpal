import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Globe } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

const pharmacies = [
  { name: 'Community Pharmacy', distance: '0.5 miles away' },
  { name: 'Wellness Drug Store', distance: '1.2 miles away' },
  { name: 'HealthFirst Meds', distance: '2.4 miles away' },
];

const onlineOptions = [
    { name: 'Capsule' },
    { name: 'Amazon Pharmacy' },
]

const PharmacyFinder = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="text-primary" />
          <span>Refill Options</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2"><MapPin size={16} /> Nearby Pharmacies</h3>
            <div className="space-y-2">
            {pharmacies.map((pharmacy) => (
                <div key={pharmacy.name} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                <div>
                    <p className="font-semibold text-sm">{pharmacy.name}</p>
                    <p className="text-xs text-muted-foreground">{pharmacy.distance}</p>
                </div>
                <Button size="sm" variant="ghost">Directions</Button>
                </div>
            ))}
            </div>
        </div>
        <Separator />
        <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2"><Globe size={16} /> Online Options</h3>
            <div className="space-y-2">
            {onlineOptions.map((pharmacy) => (
                <div key={pharmacy.name} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                <p className="font-semibold text-sm">{pharmacy.name}</p>
                <Button size="sm" variant="ghost">Visit</Button>
                </div>
            ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyFinder;
