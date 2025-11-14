'use client';

import { Button } from '@/components/ui/button';
import { Grid3x3, Columns3 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const isLanes = pathname === '/lanes';

  const handleToggle = () => {
    if (isLanes) {
      router.push('/');
    } else {
      router.push('/lanes');
    }
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={!isLanes ? 'default' : 'ghost'}
        size="sm"
        onClick={handleToggle}
        className="h-8 px-3"
      >
        <Grid3x3 className="h-4 w-4 mr-1.5" />
        Grade
      </Button>
      <Button
        variant={isLanes ? 'default' : 'ghost'}
        size="sm"
        onClick={handleToggle}
        className="h-8 px-3"
      >
        <Columns3 className="h-4 w-4 mr-1.5" />
        Lanes
      </Button>
    </div>
  );
}

