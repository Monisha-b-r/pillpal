'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMedicineStore } from '@/hooks/use-medicine-store';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, ClipboardList, Sun, Moon, Sunset, Pill } from 'lucide-react';
import type { DailyReminder } from '@/lib/types';

const TimeSlot = ({
  title,
  icon,
  reminders,
  onTakeDose,
}: {
  title: string;
  icon: React.ReactNode;
  reminders: DailyReminder[];
  onTakeDose: (id: string) => void;
}) => {
  if (reminders.length === 0) return null;

  return (
    <div>
      <h3 className="flex items-center gap-2 font-semibold text-muted-foreground mb-2">
        {icon}
        <span>{title}</span>
      </h3>
      <div className="space-y-2">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
              reminder.taken ? 'bg-secondary/50 text-muted-foreground' : 'bg-secondary'
            }`}
          >
            <Checkbox
              id={reminder.id}
              checked={reminder.taken}
              onCheckedChange={() => !reminder.taken && onTakeDose(reminder.id)}
              aria-label={`Mark ${reminder.medicineName} as taken`}
              className="w-6 h-6"
            />
            <div className="flex-grow">
              <label
                htmlFor={reminder.id}
                className={`font-semibold text-base ${
                  reminder.taken ? 'line-through' : ''
                }`}
              >
                {reminder.medicineName}
              </label>
              <p className={`text-sm flex items-center gap-1.5 ${reminder.taken ? 'text-muted-foreground/80' : 'text-muted-foreground'}`}>
                <Pill size={14} />
                <span>
                  Take {reminder.dosage}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


const Reminders = () => {
  const { dailyReminders, takeDose } = useMedicineStore();
  
  const remindersByTime = useMemo(() => {
    const morning = dailyReminders.filter(r => r.time === 'Morning');
    const afternoon = dailyReminders.filter(r => r.time === 'Afternoon');
    const night = dailyReminders.filter(r => r.time === 'Night');
    return { morning, afternoon, night };
  }, [dailyReminders]);


  if (dailyReminders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="text-primary" />
            <span>Today's Doses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <ClipboardList className="w-12 h-12 mb-4" />
            <p className="font-semibold">No reminders for today.</p>
            <p className="text-sm">Upload a prescription to get started.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="text-primary" />
          <span>Today's Doses</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <TimeSlot
            title="Morning"
            icon={<Sun size={18} />}
            reminders={remindersByTime.morning}
            onTakeDose={takeDose}
          />
          <TimeSlot
            title="Afternoon"
            icon={<Sunset size={18} />}
            reminders={remindersByTime.afternoon}
            onTakeDose={takeDose}
          />
          <TimeSlot
            title="Night"
            icon={<Moon size={18} />}
            reminders={remindersByTime.night}
            onTakeDose={takeDose}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default Reminders;
