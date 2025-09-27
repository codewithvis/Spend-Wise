import { CircleDollarSign } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-bold text-lg text-primary">
      <CircleDollarSign className="size-7" />
      <span className="text-foreground">SpendWise</span>
    </div>
  );
}
