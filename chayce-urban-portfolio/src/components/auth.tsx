import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const Auth = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) setError(error.message);
    else router.push('/dashboard'); // Redirect on successful signup
  };

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) setError(error.message);
    else router.push('/dashboard'); // Redirect on successful login
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <input
          type="name"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input input-bordered w-full mb-4"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full mb-4"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input input-bordered w-full mb-4"
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <button onClick={handleSignUp} className="btn btn-primary w-full mb-2">Sign Up</button>
        <button onClick={handleSignIn} className="btn btn-secondary w-full">Sign In</button>
      </div>
    </div>
  );
};

export default Auth;
