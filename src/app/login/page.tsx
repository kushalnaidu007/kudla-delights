import { Suspense } from 'react';
import LoginForm from '@/app/login/login-form';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-sm text-stone-500">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
