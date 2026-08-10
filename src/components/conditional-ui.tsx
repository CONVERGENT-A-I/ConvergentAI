'use client';

import { usePathname } from 'next/navigation';

export function ConditionalUI({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname === '/sandbox/affordability') {
    return null;
  }
  
  return <>{children}</>;
}
