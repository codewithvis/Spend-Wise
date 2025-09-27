import { PiggyBank } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-bold text-lg text-primary transition-transform duration-300 ease-in-out hover:scale-105">
      <PiggyBank className="size-7" />
      <span className="text-foreground">SpendWise</span>
    </div>
  );
}
