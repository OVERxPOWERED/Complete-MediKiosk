'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PatientsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/queue');
  }, [router]);

  return null;
}
