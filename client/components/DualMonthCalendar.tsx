import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DualMonthCalendarProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateSelect: (date: Date, isStart: boolean) => void;
  onRangeComplete?: (start: Date, end: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export default function DualMonthCalendar({
  startDate,
  endDate,
  onDateSelect,
  onRangeComplete,
  minDate,
  maxDate,
}: DualMonthCalendarProps) {
  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  
  const [isSelectingStart, setIsSelectingStart] = useState(!startDate);

  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  // Get the first and second month to display
  const month1 = new Date(displayMonth.getFullYear(), displayMonth.getMonth(), 1);
  const month2 = new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, adjust to Monday = 0)
  const getFirstDayOfMonth = (date: Date) => {
    let day = date.getDay() - 1;
    if (day === -1) day = 6;
    return day;
  };

  // Check if date is in range
  const isInRange = (date: Date): boolean => {
    if (!startDate || !endDate) return false;
    const checkDate = new Date(date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return checkDate >= start && checkDate <= end;
  };

  // Check if date is start or end
  const isStartDate = (date: Date): boolean => {
    if (!startDate) return false;
    return date.toDateString() === startDate.toDateString();
  };

  const isEndDate = (date: Date): boolean => {
    if (!endDate) return false;
    return date.toDateString() === endDate.toDateString();
  };

  // Check if date is disabled
  const isDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return;

    if (isSelectingStart) {
      onDateSelect(date, true);
      setIsSelectingStart(false);
    } else {
      // When selecting end date
      if (startDate) {
        const start = new Date(startDate);
        const end = new Date(date);

        // If clicked date is before start date, swap them
        if (end < start) {
          onDateSelect(end, true);
          onDateSelect(start, false);
          onRangeComplete?.(end, start);
        } else {
          onDateSelect(date, false);
          onRangeComplete?.(start, end);
        }
      }
      setIsSelectingStart(true);
    }
  };

  // Navigate months
  const handlePrevMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1));
  };

  // Render month grid
  const renderMonthGrid = (month: Date) => {
    const daysInMonth = getDaysInMonth(month);
    const firstDay = getFirstDayOfMonth(month);
    const days: (number | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const month1Days = renderMonthGrid(month1);
  const month2Days = renderMonthGrid(month2);

  const monthName = (date: Date) =>
    date.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-12">
          <h3 className="font-semibold text-sm text-foreground min-w-32 text-center">
            {monthName(month1)}
          </h3>
          <h3 className="font-semibold text-sm text-foreground min-w-32 text-center">
            {monthName(month2)}
          </h3>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Two Month Grid */}
      <div className="grid grid-cols-2 gap-8 px-2">
        {/* Month 1 */}
        <div>
          <div className="grid grid-cols-7 gap-2 mb-3">
            {weekDays.map((day) => (
              <div
                key={`m1-${day}`}
                className="w-10 h-10 flex items-center justify-center text-xs font-bold text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {month1Days.map((day, idx) => (
              <div key={`m1-day-${idx}`} className="w-10 h-10">
                {day ? (
                  <button
                    onClick={() =>
                      handleDateClick(
                        new Date(month1.getFullYear(), month1.getMonth(), day)
                      )
                    }
                    disabled={isDisabled(
                      new Date(month1.getFullYear(), month1.getMonth(), day)
                    )}
                    className={cn(
                      "w-full h-full rounded-lg text-sm font-semibold transition-all duration-150",
                      isDisabled(
                        new Date(month1.getFullYear(), month1.getMonth(), day)
                      )
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : "cursor-pointer",
                      isStartDate(
                        new Date(month1.getFullYear(), month1.getMonth(), day)
                      )
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 hover:bg-primary/90"
                        : isEndDate(
                            new Date(month1.getFullYear(), month1.getMonth(), day)
                          )
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 hover:bg-primary/90"
                          : isInRange(
                              new Date(month1.getFullYear(), month1.getMonth(), day)
                            )
                            ? "bg-primary/25 text-foreground hover:bg-primary/35"
                            : "text-foreground hover:bg-muted/50"
                    )}
                  >
                    {day}
                  </button>
                ) : (
                  <div />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Month 2 */}
        <div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={`m2-${day}`}
                className="w-8 h-8 flex items-center justify-center text-xs font-semibold text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {month2Days.map((day, idx) => (
              <div key={`m2-day-${idx}`} className="w-8 h-8">
                {day ? (
                  <button
                    onClick={() =>
                      handleDateClick(
                        new Date(month2.getFullYear(), month2.getMonth(), day)
                      )
                    }
                    disabled={isDisabled(
                      new Date(month2.getFullYear(), month2.getMonth(), day)
                    )}
                    className={cn(
                      "w-full h-full rounded-lg text-sm transition-all duration-150 font-medium",
                      isDisabled(
                        new Date(month2.getFullYear(), month2.getMonth(), day)
                      )
                        ? "text-muted-foreground/40 cursor-not-allowed"
                        : "cursor-pointer hover:bg-muted/50",
                      isStartDate(
                        new Date(month2.getFullYear(), month2.getMonth(), day)
                      )
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 hover:bg-primary"
                        : isEndDate(
                            new Date(month2.getFullYear(), month2.getMonth(), day)
                          )
                          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 hover:bg-primary"
                          : isInRange(
                              new Date(month2.getFullYear(), month2.getMonth(), day)
                            )
                            ? "bg-primary/20 text-foreground hover:bg-primary/25"
                            : "text-foreground hover:bg-accent/50"
                    )}
                  >
                    {day}
                  </button>
                ) : (
                  <div />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selection Status */}
      {startDate && !endDate && (
        <div className="text-xs text-center text-muted-foreground py-2 bg-muted/30 rounded-lg">
          Start date selected • Click to select end date
        </div>
      )}
    </div>
  );
}
