import { cn } from '@/lib/utils';
import { DevicePreviewProps } from '../types';

export function DevicePreview({
  children,
  device = 'desktop',
  className = '',
}: DevicePreviewProps) {
  const deviceClasses = {
    desktop: 'w-full',
    tablet: 'w-[768px] mx-auto border-8 border-gray-800 rounded-2xl',
    mobile: 'w-[375px] mx-auto border-8 border-gray-800 rounded-[40px] h-[600px] overflow-y-auto',
  };

  const deviceFrames = {
    desktop: 'rounded-lg',
    tablet: 'rounded-lg',
    mobile: 'rounded-[32px]',
  };

  return (
    <div className={cn(
      'bg-white shadow-lg overflow-hidden transition-all duration-200',
      deviceClasses[device],
      className
    )}>
      <div className={cn(
        'h-full bg-white overflow-auto',
        deviceFrames[device]
      )}>
        {children}
      </div>
    </div>
  );
}
