'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMedicineStore } from '@/hooks/use-medicine-store';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, ClipboardList } from 'lucide-react';

const Reminders = () => {
  const { dailyReminders, takeDose } = useMedicineStore();

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
        <div className="space-y-4">
          {dailyReminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                reminder.taken ? 'bg-secondary/50 text-muted-foreground' : 'bg-secondary'
              }`}
            >
              <Checkbox
                id={reminder.id}
                checked={reminder.taken}
                onCheckedChange={() => !reminder.taken && takeDose(reminder.id)}
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
                <p className={`text-sm ${reminder.taken ? 'text-muted-foreground/80' : 'text-muted-foreground'}`}>
                  {reminder.dosage}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold text-lg ${
                    reminder.taken ? '' : 'text-accent'
                  }`}
                >
                  {reminder.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Reminders;
