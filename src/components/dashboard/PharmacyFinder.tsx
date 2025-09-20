'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Globe, Loader2, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface Pharmacy {
  name: string;
  distance: string;
  lat: number;
  lng: number;
}

const allPharmacies: Omit<Pharmacy, 'distance'>[] = [
  { name: 'Community Pharmacy', lat: 34.0522, lng: -118.2437 },
  { name: 'Wellness Drug Store', lat: 34.055, lng: -118.25 },
  { name: 'HealthFirst Meds', lat: 34.049, lng: -118.24 },
  { name: 'The Corner Drugstore', lat: 34.06, lng: -118.23 },
  { name: 'City Health Pharmacy', lat: 34.045, lng: -118.255 },
];

const onlineOptions = [
    { name: 'Capsule' },
    { name: 'Amazon Pharmacy' },
];

// Haversine formula to calculate distance
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 3959; // Radius of the earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in miles
  return d;
};


const PharmacyFinder = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setUserLocation(location);

          const pharmaciesWithDistance = allPharmacies.map(p => ({
            ...p,
            distance: getDistance(location.lat, location.lng, p.lat, p.lng).toFixed(1),
          }))
          .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
          .map(p => ({...p, distance: `${p.distance} miles away`}));

          setPharmacies(pharmaciesWithDistance);
          setLoading(false);
        },
        (err) => {
          setError('Could not get your location. Please enable location services.');
          console.error(err);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  const openDirections = (pharmacy: Pharmacy) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${pharmacy.lat},${pharmacy.lng}`;
      window.open(url, '_blank');
    }
  };


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
            
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Finding pharmacies near you...</span>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center p-4 text-destructive">
                <AlertTriangle className="mr-2" />
                <span>{error}</span>
              </div>
            )}
            {!loading && !error && (
              <div className="space-y-2">
              {pharmacies.slice(0,3).map((pharmacy) => (
                  <div key={pharmacy.name} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                  <div>
                      <p className="font-semibold text-sm">{pharmacy.name}</p>
                      <p className="text-xs text-muted-foreground">{pharmacy.distance}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => openDirections(pharmacy)}>Directions</Button>
                  </div>
              ))}
              </div>
            )}
        </div>
        <Separator />
        <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2"><Globe size={16} /> Online Options</h3>
            <div className="space-y-2">
            {onlineOptions.map((pharmacy) => (
                <div key={pharmacy.name} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                <p className="font-semibold text-sm">{pharmacy.name}</p>
                <Button size="sm" variant="ghost" onClick={() => window.open(`https://www.${pharmacy.name.toLowerCase().replace(' ', '')}.com`, '_blank')}>Visit</Button>
                </div>
            ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PharmacyFinder;
