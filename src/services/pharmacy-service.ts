
import { db } from '@/lib/firebase';
import * as geofirestore from 'geofirestore';
import type { GeoPoint } from 'firebase/firestore';

export interface Pharmacy {
    id: string;
    name: string;
    distance: number; // in km
    coordinates: GeoPoint;
}

const GeoFirestore = geofirestore.initializeApp(db);

const pharmaciesCollection = GeoFirestore.collection('pharmacies');

export async function getNearbyPharmacies(
  center: { latitude: number; longitude: number },
  radius: number // in km
): Promise<Pharmacy[]> {
    try {
        const query = pharmaciesCollection.near({ center, radius });

        const snapshot = await query.get();

        // Note: The geofirestore library on its own returns documents with distance in km.
        // The documents also have `g` (geohash) and `l` (GeoPoint) fields.
        const pharmacies = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                distance: doc.distance,
                coordinates: data.l as GeoPoint // 'l' is the default GeoPoint field for geofirestore
            } as Pharmacy;
        });

        return pharmacies;

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
