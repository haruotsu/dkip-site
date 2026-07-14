import { Suspense } from 'react';
import Verifier from '@/components/Verifier';

export default function Page() {
  return (
    <Suspense>
      <Verifier />
    </Suspense>
  );
}
