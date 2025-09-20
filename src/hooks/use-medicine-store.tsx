'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Medicine, DailyReminder, Dosage } from '@/lib/types';
import type { PrescriptionAnalysisOutput } from '@/ai/flows/prescription-analysis';

interface MedicineContextType {
  medicines: Medicine[];
  dailyReminders: DailyReminder[];
  addFromPrescription: (data: PrescriptionAnalysisOutput['medicines']) => void;
  addStock: (medicineName: string, amount: number) => boolean;
  takeDose: (reminderId: string) => void;
  getMedicineByName: (name: string) => Medicine | undefined;
}

const MedicineContext = createContext<MedicineContextType | undefined>(undefined);

const parseInstructionsToReminders = (medicine: Medicine): DailyReminder[] => {
  const reminders: DailyReminder[] = [];
  const parts = medicine.instructions.split('-');
  
  if (parts.length === 3) {
    const [morning, afternoon, night] = parts;
    const dosage: Dosage = { morning, afternoon, night };

    if (parseFloat(dosage.morning) > 0) {
      reminders.push({
        id: `${medicine.id}-morning`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        dosage: dosage.morning,
        time: 'Morning',
        taken: false,
      });
    }
    if (parseFloat(dosage.afternoon) > 0) {
      reminders.push({
        id: `${medicine.id}-afternoon`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        dosage: dosage.afternoon,
        time: 'Afternoon',
        taken: false,
      });
    }
    if (parseFloat(dosage.night) > 0) {
      reminders.push({
        id: `${medicine.id}-night`,
        medicineId: medicine.id,
        medicineName: medicine.name,
        dosage: dosage.night,
        time: 'Night',
        taken: false,
      });
    }
  } else { // Fallback for simple text instructions
     const lowerCaseInstructions = medicine.instructions.toLowerCase();
      const timeMap: { [key: string]: ('Morning' | 'Afternoon' | 'Night')[] } = {
        'morning': ['Morning'],
        'afternoon': ['Afternoon'],
        'night': ['Night'],
        'evening': ['Night'],
        'once a day': ['Morning'],
        'twice a day': ['Morning', 'Night'],
        '3 times a day': ['Morning', 'Afternoon', 'Night'],
      };

      let addedTimes = new Set<string>();

      for (const key in timeMap) {
        if (lowerCaseInstructions.includes(key)) {
          timeMap[key].forEach(time => {
            if (!addedTimes.has(time)) {
              reminders.push({
                id: `${medicine.id}-${time}`,
                medicineId: medicine.id,
                medicineName: medicine.name,
                dosage: '1',
                time: time,
                taken: false,
              });
              addedTimes.add(time);
            }
          });
        }
      }
       if (reminders.length === 0) {
        reminders.push({
          id: `${medicine.id}-morning`,
          medicineId: medicine.id,
          medicineName: medicine.name,
          dosage: '1',
          time: 'Morning',
          taken: false,
        });
      }
  }

  return reminders;
};


export const MedicineProvider = ({ children }: { children: ReactNode }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [dailyReminders, setDailyReminders] = useState<DailyReminder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedMedicines = localStorage.getItem('pillpal-medicines');
      const storedReminders = localStorage.getItem('pillpal-reminders');
      const lastVisitDate = localStorage.getItem('pillpal-last-visit');
      const today = new Date().toDateString();
      
      const initialMedicines = storedMedicines ? JSON.parse(storedMedicines) : [];
      setMedicines(initialMedicines);
      
      if (storedReminders && lastVisitDate === today) {
        setDailyReminders(JSON.parse(storedReminders));
      } else {
        // Generate new reminders for today
        const newReminders = initialMedicines.flatMap(parseInstructionsToReminders);
        setDailyReminders(newReminders);
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setMedicines([]);
      setDailyReminders([]);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('pillpal-medicines', JSON.stringify(medicines));
        const today = new Date().toDateString();
        localStorage.setItem('pillpal-reminders', JSON.stringify(dailyReminders));
        localStorage.setItem('pillpal-last-visit', today);
      } catch (error) {
        console.error("Failed to save data to localStorage", error);
      }
    }
  }, [medicines, dailyReminders, isLoaded]);

  const addFromPrescription = (data: PrescriptionAnalysisOutput['medicines']) => {
    setMedicines(prev => {
      const newMedicines: Medicine[] = [...prev];
      data.forEach(item => {
        const exists = prev.some(med => med.name.toLowerCase() === item.name.toLowerCase());
        if (!exists) {
          newMedicines.push({
            id: crypto.randomUUID(),
            name: item.name,
            dosage: item.dosage,
            instructions: item.timing,
            quantity: 0
          });
        }
      });
      // Generate new reminders after adding medicines
      const newReminders = newMedicines.flatMap(parseInstructionsToReminders);
      setDailyReminders(newReminders);
      return newMedicines;
    });
  };

  const addStock = (medicineName: string, amount: number): boolean => {
    let success = false;
    setMedicines(prev => {
      const updatedMedicines = prev.map(med => {
        if (med.name.toLowerCase() === medicineName.toLowerCase()) {
          success = true;
          return { ...med, quantity: med.quantity + amount };
        }
        return med;
      });
      return updatedMedicines;
    });
    return success;
  };

  const takeDose = (reminderId: string) => {
    let medicineToUpdateId: string | null = null;
    let doseAmount = 0;
    
    setDailyReminders(prevReminders => prevReminders.map(rem => {
      if (rem.id === reminderId && !rem.taken) {
        medicineToUpdateId = rem.medicineId;
        doseAmount = parseFloat(rem.dosage) || 0;
        return { ...rem, taken: true };
      }
      return rem;
    }));

    if (medicineToUpdateId) {
      setMedicines(prevMeds => prevMeds.map(med => {
        if (med.id === medicineToUpdateId) {
          return { ...med, quantity: Math.max(0, med.quantity - doseAmount) };
        }
        return med;
      }));
    }
  };

  const getMedicineByName = useCallback((name: string) => {
    return medicines.find(med => med.name.toLowerCase() === name.toLowerCase());
  }, [medicines]);

  return (
    <MedicineContext.Provider value={{ medicines, dailyReminders, addFromPrescription, addStock, takeDose, getMedicineByName }}>
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicineStore = () => {
  const context = useContext(MedicineContext);
  if (context === undefined) {
    throw new Error('useMedicineStore must be used within a MedicineProvider');
  }
  return context;
};
