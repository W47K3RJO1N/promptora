import {createRoot} from 'react-dom/client';
import { ClerkProvider, SignInButton, SignUpButton, useAuth } from '@clerk/react';
import App from './App.tsx';
import { PromptoraApi } from './services/api';
import './index.css';

function AuthenticationGate() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  PromptoraApi.setAuthTokenProvider(getToken);

  if (!isLoaded) {
    return <main className="min-h-screen grid place-items-center text-stone-600">Loading sign-in...</main>;
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#F7FAF7] px-4">
        <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="font-display text-2xl font-bold text-stone-900">Welcome to Promptora</h1>
          <p className="mt-2 text-sm text-stone-600">Sign in or create an account to use the prompt optimizer.</p>
          <div className="mt-6 flex justify-center gap-3">
            <SignInButton mode="modal">
              <button className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50">
                Create account
              </button>
            </SignUpButton>
          </div>
        </section>
      </main>
    );
  }

  return <App />;
}

function ConfigurationNotice() {
  return (
    <main className="min-h-screen grid place-items-center bg-[#F7FAF7] px-4">
      <section className="max-w-xl rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <h1 className="font-display text-xl font-bold text-stone-900">Promptora needs deployment setup</h1>
        <p className="mt-2 text-sm text-stone-600">
          Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to the Vercel project and redeploy to enable sign-in.
        </p>
      </section>
    </main>
  );
}

const root = createRoot(document.getElementById('root')!);
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (clerkPublishableKey) {
  root.render(
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <AuthenticationGate />
    </ClerkProvider>,
  );
} else if (import.meta.env.PROD) {
  root.render(<ConfigurationNotice />);
} else {
  root.render(<App />);
}
