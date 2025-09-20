import type { GeoPoint } from 'firebase/firestore';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  quantity: number;
}

export interface Dosage {
  morning: string;
  afternoon: string;
  night: string;
}

export interface DailyReminder {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  time: 'Morning' | 'Afternoon' | 'Night';
  taken: boolean;
}

export type StockStatus = 'high' | 'medium' | 'low' | 'empty';

export interface Pharmacy {
    id: string;
    name: string;
    distance: number;
    coordinates: GeoPoint;
}
