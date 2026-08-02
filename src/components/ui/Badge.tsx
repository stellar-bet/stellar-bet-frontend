import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'win' | 'loss' | 'pending' | 'open' | 'cancelled';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:   'bg-gray-100 text-sp-muted',
  win:       'bg-green-100 text-green-700 border border-green-200',
  loss:      'bg-red-100 text-sp-live border border-red-200',
  pending:   'bg-yellow-100 text-yellow-700 border border-yellow-200',
  open:      'bg-blue-100 text-blue-700 border border-blue-200',
  cancelled: 'bg-gray-100 text-sp-muted border border-sp-border',
};

export default function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold',
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}
