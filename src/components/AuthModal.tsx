import { useState, useEffect } from 'react';
import { X, Mail, Lock, User, MapPin, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (accessToken: string, user: any) => void;
  initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [location, setLocation] = useState('');
  const [favoriteGame, setFavoriteGame] = useState('');
  const [otherLocation, setOtherLocation] = useState('');
  const [otherFavoriteGame, setOtherFavoriteGame] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState<any>(null);

  const supabase = getSupabaseClient();

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/config`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setConfig(data.config);
        } else {
          // Use defaults if config fetch fails
          setConfig({
            locationOptions: ['Westlands', 'Karen', 'CBD', 'Kileleshwa', 'Kilimani', 'Lavington', 'Parklands', 'Other'],
            gameOptions: ['FIFA 24', 'Valorant', 'Call of Duty', 'CS:GO', 'League of Legends', 'Rocket League', 'Tekken 8', 'Apex Legends', 'Other'],
          });
        }
      } catch (err) {
        console.error('Error fetching config:', err);
        // Use defaults on error
        setConfig({
          locationOptions: ['Westlands', 'Karen', 'CBD', 'Kileleshwa', 'Kilimani', 'Lavington', 'Parklands', 'Other'],
          gameOptions: ['FIFA 24', 'Valorant', 'Call of Duty', 'CS:GO', 'League of Legends', 'Rocket League', 'Tekken 8', 'Apex Legends', 'Other'],
        });
      }
    };

    fetchConfig();
  }, []);

  // Update mode when initialMode changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      // Clear form when modal opens
      setEmail('');
      setPassword('');
      setName('');
      setBirthday('');
      setLocation('');
      setFavoriteGame('');
      setOtherLocation('');
      setOtherFavoriteGame('');
      setError('');
    }
  }, [isOpen, initialMode]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate age (must be 18 or older)
      if (birthday) {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 18) {
          setError('You must be 18 years or older to register');
          setLoading(false);
          return;
        }
      }

      console.log('Starting signup process...');
      console.log('Signup data:', { email, name, birthday, location, favoriteGame });
      
      // Call our server endpoint to create user
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/signup`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            name,
            birthday,
            location: location === 'Other' ? otherLocation : location,
            favoriteGame: favoriteGame === 'Other' ? otherFavoriteGame : favoriteGame,
          }),
        }
      );

      console.log('Signup response status:', response.status);
      const data = await response.json();
      console.log('Signup response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      console.log('Account created successfully, now signing in...');
      
      // Now sign in the user
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Sign in error after signup:', signInError);
        throw signInError;
      }

      console.log('Sign in successful!');
      onAuthSuccess(signInData.session.access_token, signInData.user);
      onClose();
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      onAuthSuccess(data.session.access_token, data.user);
      onClose();
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <Card className="relative w-full max-w-md bg-card/95 backdrop-blur-xl border-border animate-in fade-in zoom-in duration-300">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 rounded-full"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        <CardHeader>
          <CardTitle className="text-2xl font-black">
            {mode === 'signin' ? (
              <>SIGN IN TO <span className="gradient-text">ESPORTS-KE</span></>
            ) : (
              <>JOIN <span className="gradient-text">ESPORTS-KE</span></>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {mode === 'signin' 
              ? 'Welcome back! Sign in to register for tournaments.'
              : 'Create your account to start competing in Nairobi.'}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    required
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                  />
                </div>
                <p className="text-xs text-muted-foreground">You must be 18 or older to register</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="gamer@esports-ke.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location in Nairobi</label>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="w-full bg-transparent border-0 focus:outline-none focus:ring-0"
                    >
                      <option value="">Select your area</option>
                      {config?.locationOptions.map((option: string) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {location === 'Other' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Specify Location</label>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter your location"
                        value={otherLocation}
                        onChange={(e) => setOtherLocation(e.target.value)}
                        required
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Favorite Game</label>
                  <div className="bg-muted/50 rounded-lg px-3 py-2">
                    <select
                      value={favoriteGame}
                      onChange={(e) => setFavoriteGame(e.target.value)}
                      required
                      className="w-full bg-transparent border-0 focus:outline-none focus:ring-0"
                    >
                      <option value="">Select your main game</option>
                      {config?.gameOptions.map((option: string) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {favoriteGame === 'Other' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Specify Game</label>
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter your favorite game"
                        value={otherFavoriteGame}
                        onChange={(e) => setOtherFavoriteGame(e.target.value)}
                        required
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:opacity-90"
              disabled={loading}
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>

            <div className="text-center text-sm">
              {mode === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}