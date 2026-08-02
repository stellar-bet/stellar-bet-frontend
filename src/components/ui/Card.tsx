import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'bg-white border border-sp-border rounded shadow-sm',
        hover && 'hover:border-sp-green hover:shadow-md transition-all duration-150 cursor-pointer',
        onClick && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sp-green/50',
        className
      )}
    >
      {children}
    </div>
  );
}
