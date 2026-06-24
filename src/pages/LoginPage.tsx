import { useState } from 'react';
import { GeometerAvatar } from '@/components/GeometerAvatar';
import { useAuth } from '@/contexts/AuthContext';

const BENEFITS = [
  'Interactive, challenging problems you solve by doing.',
  'Concepts introduced gradually, then reinforced.',
  'Built for learners of all levels.',
];

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
        <div className="login-intro">
          <GeometerAvatar size={72} />
          <h1>Geometer</h1>
          <p className="tagline">A hands-on geometry app built for 8th graders.</p>
        </div>
        <ul className="benefit-list">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="benefit-item">
              {benefit}
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-google" onClick={handleSignIn} disabled={loading}>
          {loading ? 'Signing in…' : 'Continue with Google'}
        </button>
        {error && <p className="feedback feedback-wrong">{error}</p>}
      </div>
    </div>
  );
}
