'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';

export const SiteHeaderWrapper = () => {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;
  return <SiteHeader />;
};
