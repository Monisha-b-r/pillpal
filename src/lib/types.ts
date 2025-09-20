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
