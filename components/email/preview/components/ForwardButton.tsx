import { Button } from '@/components/ui/button';
import { Forward, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ForwardButtonProps } from '../types';

export function ForwardButton({
  onClick,
  disabled = false,
  isForwarding = false,
  className = '',
}: ForwardButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isForwarding}
      className={cn('flex items-center gap-2', className)}
    >
      {isForwarding ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Forwarding...
        </>
      ) : (
        <>
          <Forward className="h-4 w-4" />
          Forward
        </>
      )}
    </Button>
  );
}
