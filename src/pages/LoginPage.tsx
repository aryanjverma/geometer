import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch {
      setError('Sign-in failed. Check your Firebase configuration and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Geometer</h1>
        <p className="tagline">Learn geometry by doing — right triangles, area, perimeter, and the Pythagorean theorem.</p>
        <button type="button" className="btn btn-google" onClick={handleSignIn} disabled={loading}>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>
        {error && <p className="feedback feedback-wrong">{error}</p>}
      </div>
    </div>
  );
}
