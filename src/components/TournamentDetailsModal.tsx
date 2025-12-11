import { X, Calendar, Users, MapPin, Clock, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TournamentDetailsModalProps {
  tournament: any;
  onClose: () => void;
  user?: any;
  accessToken?: string;
  onOpenAuthModal?: () => void;
  onRegistrationSuccess?: () => void;
}

export function TournamentDetailsModal({ tournament, onClose, user, accessToken, onOpenAuthModal, onRegistrationSuccess }: TournamentDetailsModalProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState('');
  const [registrationCount, setRegistrationCount] = useState(0);
  const [isAtLimit, setIsAtLimit] = useState(false);

  useEffect(() => {
    // Check if user is already registered and get registration history
    if (user) {
      const registered = user.registeredTournaments?.some((t: any) => t.tournamentId === tournament.id);
      setIsRegistered(registered);

      // Get registration count from history
      const history = user.registrationHistory?.[tournament.id];
      if (history) {
        setRegistrationCount(history.count || 0);
        setIsAtLimit(history.count >= 3);
      } else {
        setRegistrationCount(0);
        setIsAtLimit(false);
      }
    }
  }, [user, tournament.id]);

  const handleRegister = async () => {
    if (!user || !accessToken) {
      onOpenAuthModal?.();
      return;
    }

    if (isRegistered) {
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/register-tournament`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tournamentId: tournament.id,
            tournamentTitle: tournament.title,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      setIsRegistered(true);
      onRegistrationSuccess?.();
      
      // Show success message briefly then close
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error registering for tournament:', err);
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!user || !accessToken) {
      return;
    }

    if (!isRegistered) {
      return;
    }

    if (!confirm('Are you sure you want to unregister from this tournament?')) {
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/unregister-tournament`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tournamentId: tournament.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unregister');
      }

      setIsRegistered(false);
      onRegistrationSuccess?.();
      
      // Show success message briefly then close
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error unregistering from tournament:', err);
      setError(err.message);
    } finally {
      setIsRegistering(false);
    }
  };

  if (!tournament) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-2 border-primary/30 rounded-2xl shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Header with image */}
        <div className="relative h-48 overflow-hidden rounded-t-2xl">
          <img
            src={tournament.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'}
            alt={tournament.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          
          {/* Tournament title overlay */}
          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-3xl font-black text-white mb-1">{tournament.title}</h2>
            <p className="text-white/80">Hosted by {tournament.host || 'ESPORTS-KE'}</p>
          </div>

          {/* Live badge */}
          {tournament.isLive && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1 glow">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-xs text-white font-medium">LIVE NOW</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-bold">{tournament.date || 'TBA'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-bold">{tournament.time || 'TBA'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-bold">{tournament.location || 'TBA'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Players</p>
                <p className="font-bold">{tournament.attendees || 0}/{tournament.maxAttendees || 0}</p>
              </div>
            </div>
          </div>

          {/* Additional info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {tournament.game && (
              <div>
                <span className="text-muted-foreground">Game:</span>
                <span className="ml-2 font-bold">{tournament.game}</span>
              </div>
            )}
            {tournament.format && (
              <div>
                <span className="text-muted-foreground">Format:</span>
                <span className="ml-2 font-bold">{tournament.format}</span>
              </div>
            )}
            {tournament.skillLevel && (
              <div>
                <span className="text-muted-foreground">Skill Level:</span>
                <span className="ml-2 font-bold">{tournament.skillLevel}</span>
              </div>
            )}
            {tournament.prizePool && (
              <div>
                <span className="text-muted-foreground">Prize Pool:</span>
                <span className="ml-2 font-bold text-primary">{tournament.prizePool}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {tournament.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                About This Tournament
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {tournament.description}
              </p>
            </div>
          )}

          {/* Requirements */}
          {tournament.requirements && (
            <div className="space-y-2">
              <h3 className="text-lg font-black">Requirements</h3>
              <div className="p-4 bg-muted/30 border border-primary/20 rounded-lg">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {tournament.requirements}
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {tournament.tags && tournament.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tournament.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3 pt-4">
            {error && (
              <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                {error}
              </div>
            )}
            
            {/* Registration count indicator */}
            {user && registrationCount > 0 && (
              <div className="p-3 bg-muted/30 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Registration attempts: <span className="text-primary font-bold">{registrationCount}/3</span>
                  {isAtLimit && <span className="text-red-500 ml-2">(Limit reached)</span>}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {isRegistered ? (
                <Button 
                  variant="outline"
                  className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10 text-lg py-6"
                  onClick={handleUnregister}
                  disabled={isRegistering}
                >
                  {isRegistering ? 'Processing...' : 'Unregister'}
                </Button>
              ) : (
                <Button 
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg py-6"
                  onClick={handleRegister}
                  disabled={isRegistering || isAtLimit || !user}
                >
                  {isRegistering 
                    ? 'Registering...' 
                    : !user 
                      ? 'Sign In to Register'
                      : isAtLimit
                        ? 'Registration Limit Reached'
                        : 'Register Now'
                  }
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={onClose}
                className="px-8"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}