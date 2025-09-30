import { PiggyBank } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-bold text-2xl text-primary transition-transform duration-300 ease-in-out hover:scale-105">
      <PiggyBank className="size-10" />
      <span className="text-foreground">SpendWise</span>
    </div>
  );
}
