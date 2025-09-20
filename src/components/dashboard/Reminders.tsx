'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMedicineStore } from '@/hooks/use-medicine-store';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, ClipboardList, Sun, Moon, Sunset, Pill, CheckCircle2 } from 'lucide-react';
import type { DailyReminder } from '@/lib/types';
import { cn } from '@/lib/utils';

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
  const sortedReminders = useMemo(() => {
    return [...reminders].sort((a, b) => (a.taken ? 1 : -1) - (b.taken ? 1 : -1));
  }, [reminders]);

  if (reminders.length === 0) return null;

  return (
    <div>
      <h3 className="flex items-center gap-2 font-semibold text-muted-foreground mb-2">
        {icon}
        <span>{title}</span>
      </h3>
      <div className="space-y-2">
        {sortedReminders.map((reminder) => (
          <div
            key={reminder.id}
            className={cn(
              'flex items-center gap-4 p-3 rounded-lg transition-all duration-500',
              {
                'bg-secondary': !reminder.taken,
                'bg-secondary/50 text-muted-foreground opacity-50': reminder.taken,
              }
            )}
            style={{
              maxHeight: reminder.taken ? '0' : '100px',
              paddingTop: reminder.taken ? '0' : '',
              paddingBottom: reminder.taken ? '0' : '',
              marginBottom: reminder.taken ? '0' : '',
              overflow: 'hidden',
            }}
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
                className={cn('font-semibold text-base', {
                  'line-through': reminder.taken,
                })}
              >
                {reminder.medicineName}
              </label>
              <p className={cn('text-sm flex items-center gap-1.5', {
                  'text-muted-foreground': !reminder.taken,
                  'text-muted-foreground/80': reminder.taken,
              })}>
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
  
  const { remindersByTime, allTaken } = useMemo(() => {
    const morning = dailyReminders.filter(r => r.time === 'Morning');
    const afternoon = dailyReminders.filter(r => r.time === 'Afternoon');
    const night = dailyReminders.filter(r => r.time === 'Night');
    const allTaken = dailyReminders.length > 0 && dailyReminders.every(r => r.taken);
    return { remindersByTime: { morning, afternoon, night }, allTaken };
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
        {allTaken ? (
          <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <CheckCircle2 className="w-16 h-16 mb-4 text-green-500" />
            <p className="font-semibold text-lg">All doses completed for today!</p>
            <p className="text-sm">Great job staying on track.</p>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default Reminders;
