import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TimeInputWithAmPmProps {
  value: string; // HH:mm format (24-hour)
  onChange: (value: string) => void; // Returns HH:mm format (24-hour)
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function TimeInputWithAmPm({
  value,
  onChange,
  label,
  placeholder = "HH:MM",
  disabled = false,
}: TimeInputWithAmPmProps) {
  const [displayTime, setDisplayTime] = useState("");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  // Convert 24-hour format to 12-hour format
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight, keep 12 for noon
      const displayTimeStr = `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
      setDisplayTime(displayTimeStr);
      setPeriod(period);
    } else {
      setDisplayTime("");
      setPeriod("AM");
    }
  }, [value]);

  // Convert 12-hour format back to 24-hour format
  const convertTo24Hour = (timeStr: string, period: "AM" | "PM"): string => {
    if (!timeStr || !timeStr.includes(":")) return "";
    
    const [displayHours, minutes] = timeStr.split(":").map(Number);
    let hours = displayHours;

    if (period === "AM") {
      if (hours === 12) hours = 0; // 12 AM = 00:00
    } else {
      if (hours !== 12) hours += 12; // 1 PM = 13:00, but 12 PM stays 12
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const handleTimeChange = (newTimeStr: string) => {
    setDisplayTime(newTimeStr);
    const converted = convertTo24Hour(newTimeStr, period);
    if (converted) {
      onChange(converted);
    }
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setPeriod(newPeriod);
    const converted = convertTo24Hour(displayTime, newPeriod);
    if (displayTime && converted) {
      onChange(converted);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-muted-foreground block">{label}</label>}
      
      <div className="flex gap-2 items-center">
        <input
          type="time"
          value={value}
          onChange={(e) => {
            const timeStr = e.target.value;
            onChange(timeStr);
          }}
          disabled={disabled}
          className="flex-1 px-2 py-1 rounded border border-border text-sm bg-background disabled:opacity-50 disabled:cursor-not-allowed"
          title="Select time (24-hour format)"
        />

        {/* AM/PM Toggle */}
        <div className="flex border border-border rounded-lg bg-background overflow-hidden">
          <button
            onClick={() => handlePeriodChange("AM")}
            disabled={disabled}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              period === "AM"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
            title="AM - Morning (00:00 - 11:59)"
          >
            AM
          </button>
          <div className="w-px bg-border" />
          <button
            onClick={() => handlePeriodChange("PM")}
            disabled={disabled}
            className={cn(
              "px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              period === "PM"
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:text-foreground"
            )}
            title="PM - Afternoon/Evening (12:00 - 23:59)"
          >
            PM
          </button>
        </div>
      </div>

      {/* Display Format Helper */}
      {displayTime && (
        <div className="text-xs text-muted-foreground">
          {displayTime} {period} (24h: {convertTo24Hour(displayTime, period)})
        </div>
      )}
    </div>
  );
}
