'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useMedicineStore } from '@/hooks/use-medicine-store';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, ClipboardList, Sun, Moon, Sunset, Pill, CheckCircle2 } from 'lucide-react';
import type { DailyReminder } from '@/lib/types';
import { cn } from '@/lib/utils';

const ReminderItem = ({ reminder, onTakeDose }: { reminder: DailyReminder; onTakeDose: (id: string) => void }) => {
  const [isTaken, setIsTaken] = useState(reminder.taken);
  const [isRecentlyTaken, setIsRecentlyTaken] = useState(false);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    setIsTaken(reminder.taken);
  }, [reminder.taken]);

  const handleTakeDose = () => {
    if (!isTaken) {
      onTakeDose(reminder.id);
      setIsTaken(true);
      setIsRecentlyTaken(true);

      const hideTimer = setTimeout(() => {
        setIsHiding(true);
      }, 2000); // Start hiding after 2 seconds

      const recentTimer = setTimeout(() => {
        setIsRecentlyTaken(false);
      }, 2000);

      return () => {
        clearTimeout(hideTimer);
        clearTimeout(recentTimer);
      };
    }
  };

  const showReminder = !isTaken || isRecentlyTaken;

  if (!showReminder && isHiding) {
    // This allows the hide animation to complete
    return null;
  }
  
  const isAnimatingOut = isTaken && !isRecentlyTaken;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg transition-all duration-300 overflow-hidden',
        {
          'bg-secondary': !isRecentlyTaken,
          'bg-primary text-primary-foreground': isRecentlyTaken,
          'max-h-0 !p-0 !m-0 opacity-0': isAnimatingOut,
          'max-h-20': !isAnimatingOut,
        }
      )}
    >
      {isRecentlyTaken ? (
        <div className="flex-grow flex justify-between items-center">
            <span className="font-semibold text-base">Dose taken!</span>
            <div className="bg-white text-primary font-semibold px-3 py-1 rounded-md">
                <CheckCircle2 size={16} />
            </div>
        </div>
      ) : (
        <>
          <Checkbox
            id={reminder.id}
            checked={isTaken}
            onCheckedChange={handleTakeDose}
            aria-label={`Mark ${reminder.medicineName} as taken`}
            className={cn('w-6 h-6')}
          />
          <div className="flex-grow">
            <label htmlFor={reminder.id} className={cn('font-semibold text-base')}>
              {reminder.medicineName}
            </label>
            <p className={cn('text-sm flex items-center gap-1.5 text-muted-foreground')}>
              <Pill size={14} />
              <span>Take {reminder.dosage}</span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};


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
  const activeReminders = useMemo(() => reminders.filter(r => !r.taken), [reminders]);

  if (reminders.length === 0) return null;

  return (
    <div>
      <h3 className="flex items-center gap-2 font-semibold text-muted-foreground mb-2">
        {icon}
        <span>{title}</span>
      </h3>
      <div className="space-y-2">
        {reminders.map((reminder) => (
          <ReminderItem key={reminder.id} reminder={reminder} onTakeDose={onTakeDose} />
        ))}
        {activeReminders.length === 0 && (
           <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 text-muted-foreground text-sm">
                <CheckCircle2 className="text-green-500" size={16} />
                <span>All {title.toLowerCase()} doses taken.</span>
            </div>
        )}
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
