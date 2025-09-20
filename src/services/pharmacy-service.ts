
import { db } from '@/lib/firebase';
import { collection, getDocs, GeoPoint } from 'firebase/firestore';

export interface Pharmacy {
    id: string;
    name: string;
    distance: number; // in km
    coordinates: GeoPoint;
}

// Haversine formula to calculate distance between two points on Earth
const getDistance = (
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
    const dLon = (coord2.longitude - coord1.longitude) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1.latitude * (Math.PI / 180)) *
        Math.cos(coord2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

export async function getNearbyPharmacies(
  center: { latitude: number; longitude: number },
  radius: number // in km
): Promise<Pharmacy[]> {
    try {
        const pharmaciesCollection = collection(db, 'pharmacies');
        const snapshot = await getDocs(pharmaciesCollection);

        const pharmacies: Pharmacy[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const pharmacyCoords = data.coordinates as GeoPoint;
            
            const distance = getDistance(center, {
                latitude: pharmacyCoords.latitude,
                longitude: pharmacyCoords.longitude
            });

            if (distance <= radius) {
                pharmacies.push({
                    id: doc.id,
                    name: data.name,
                    distance: distance,
                    coordinates: pharmacyCoords
                } as Pharmacy);
            }
        });

        // Sort by distance, closest first
        return pharmacies.sort((a, b) => a.distance - b.distance);

    } catch(error) {
        console.error("Error getting nearby pharmacies: ", error);
        throw new Error("Could not fetch pharmacies from Firestore.");
    }
}

// NOTE: You will need to add pharmacy data to your Firestore 'pharmacies' collection.
// Each document should have a 'name' (string) and 'coordinates' (GeoPoint) field.
// For example:
// {
//   "name": "City Health Pharmacy",
//   "coordinates": new GeoPoint(34.045, -118.255)
// }
// You can add this data manually in the Firebase Console.
