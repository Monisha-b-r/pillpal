'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin, Globe, Loader2, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { getNearbyPharmacies, Pharmacy } from '@/services/pharmacy-service';

const onlineOptions = [
    { name: 'Capsule' },
    { name: 'Amazon Pharmacy' },
];

const PharmacyFinder = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacies = async (coords: GeolocationCoordinates) => {
        try {
            const center = { latitude: coords.latitude, longitude: coords.longitude };
            setUserLocation(center);
            const nearby = await getNearbyPharmacies(center, 10); // 10km radius
            setPharmacies(nearby);
        } catch (e) {
            console.error(e);
            setError('Could not fetch pharmacy data. Make sure you have pharmacies in your database.');
        } finally {
            setLoading(false);
        }
    }

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPharmacies(position.coords);
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
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${pharmacy.coordinates.latitude},${pharmacy.coordinates.longitude}`;
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
              <div className="flex items-center justify-center p-4 text-destructive text-center">
                <AlertTriangle className="mr-2" />
                <span>{error}</span>
              </div>
            )}
            {!loading && !error && pharmacies.length === 0 && (
                 <div className="flex items-center justify-center p-4 text-muted-foreground text-center">
                    <span>No pharmacies found within 10km.</span>
                </div>
            )}
            {!loading && !error && pharmacies.length > 0 && (
              <div className="space-y-2">
              {pharmacies.map((pharmacy) => (
                  <div key={pharmacy.id} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                  <div>
                      <p className="font-semibold text-sm">{pharmacy.name}</p>
                      <p className="text-xs text-muted-foreground">{pharmacy.distance.toFixed(1)} km away</p>
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
