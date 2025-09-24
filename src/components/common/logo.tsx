import { Wallet } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-bold text-lg text-primary">
      <Wallet className="size-7" />
      <span className="text-foreground">SpendWise</span>
    </div>
  );
}
