import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface VoteTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
}

export const VoteTimer = ({ durationMinutes, onTimeUp }: VoteTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft <= 60;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
      isWarning ? 'bg-destructive/10 text-destructive' : 'bg-card text-card-foreground'
    } shadow-card`}>
      <Clock className="h-5 w-5" />
      <span className="font-semibold text-lg">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};
