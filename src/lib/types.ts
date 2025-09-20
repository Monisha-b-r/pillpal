import type { GeoPoint } from 'firebase/firestore';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  quantity: number;
}

export interface DailyReminder {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  time: string;
  taken: boolean;
}

export type StockStatus = 'high' | 'medium' | 'low' | 'empty';

export interface Pharmacy {
    id: string;
    name: string;
    distance: number;
    coordinates: GeoPoint;
}
