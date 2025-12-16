import { Heart, MessageCircle, Share2, Calendar, Users, Gamepad2, MoreHorizontal, Clock, Trophy, TrendingUp, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function LiveFeed() {
  const [activeGame, setActiveGame] = useState('');
  const [games, setGames] = useState<string[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default games as fallback
  const defaultGames = ['FIFA', 'Valorant', 'COD', 'CS:GO', 'Apex Legends'];

  // Fetch top games on component mount
  useEffect(() => {
    const fetchTopGames = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/top-games`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch top games');
        }

        const data = await response.json();
        const topGames = data.games || [];
        
        console.log('Fetched top games:', topGames);
        
        // Use dynamic games if available, otherwise fall back to default
        const gamesToUse = topGames.length > 0 ? topGames : defaultGames;
        setGames(gamesToUse);
        
        // Set the first game as active if available
        if (gamesToUse.length > 0 && !activeGame) {
          setActiveGame(gamesToUse[0]);
        }
      } catch (err: any) {
        console.error('Error fetching top games:', err);
        // Fall back to default games on error
        setGames(defaultGames);
        if (!activeGame) {
          setActiveGame(defaultGames[0]);
        }
      }
    };

    fetchTopGames();
  }, []);

  // Fetch leaderboard data when game changes
  useEffect(() => {
    if (!activeGame) return;
    
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/leaderboard?game=${encodeURIComponent(activeGame)}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }

        const data = await response.json();
        setLeaderboardData(data.leaderboard || []);
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeGame]);

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-black mb-2">
              TOP <span className="text-primary">PLAYERS</span>
            </h2>
            <p className="text-muted-foreground">Nairobi's best competitive gamers</p>
          </div>
          <Badge variant="outline" className="gap-2 w-fit">
            <Trophy className="w-4 h-4 text-primary" />
            Updated Daily
          </Badge>
        </div>

        {/* No Games State */}
        {games.length === 0 && !loading && (
          <Card className="overflow-hidden">
            <CardContent className="p-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No tournament games with registered players yet. Register for a tournament to get started!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Game Tabs */}
        {games.length > 0 && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {games.map((game) => (
                <button
                  key={game}
                  onClick={() => setActiveGame(game)}
                  className={`px-6 py-3 rounded-full font-bold transition-all ${
                    activeGame === game
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  }`}
                >
                  {game}
                </button>
              ))}
            </div>

            {/* Leaderboard */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border font-bold text-sm">
                  <div className="col-span-1 text-center">RANK</div>
                  <div className="col-span-5 md:col-span-6">PLAYER</div>
                  <div className="col-span-2 text-center hidden md:block">WINS</div>
                  <div className="col-span-3 md:col-span-2 text-center">POINTS</div>
                  <div className="col-span-1 text-center"></div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="p-12 text-center text-muted-foreground">
                    Loading leaderboard...
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="p-12 text-center text-destructive">
                    Failed to load leaderboard. Please try again later.
                  </div>
                )}

                {/* Empty State */}
                {!loading && !error && leaderboardData.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    No players with points yet for {activeGame}. Be the first!
                  </div>
                )}

                {/* Leaderboard Rows */}
                {!loading && !error && leaderboardData.length > 0 && (
                  <div className="divide-y divide-border">
                    {leaderboardData.map((player) => (
                      <div
                        key={player.rank}
                        className={`grid grid-cols-12 gap-4 p-4 hover:bg-muted/30 transition-colors ${
                          player.rank <= 3 ? 'bg-muted/20' : ''
                        }`}
                      >
                        {/* Rank */}
                        <div className="col-span-1 flex items-center justify-center">
                          {player.rank === 1 && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <Trophy className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                          {player.rank === 2 && (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <Award className="w-4 h-4 text-foreground" />
                            </div>
                          )}
                          {player.rank === 3 && (
                            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                              <Award className="w-4 h-4 text-secondary" />
                            </div>
                          )}
                          {player.rank > 3 && (
                            <span className="font-bold text-muted-foreground">#{player.rank}</span>
                          )}
                        </div>

                        {/* Player */}
                        <div className="col-span-5 md:col-span-6 flex items-center gap-3">
                          <Avatar className="ring-2 ring-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                              {player.player.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-bold">{player.player}</span>
                        </div>

                        {/* Wins */}
                        <div className="col-span-2 hidden md:flex items-center justify-center text-muted-foreground">
                          {player.wins}
                        </div>

                        {/* Points */}
                        <div className="col-span-3 md:col-span-2 flex items-center justify-center">
                          <span className="font-bold text-primary">{player.points.toLocaleString()}</span>
                        </div>

                        {/* Trend */}
                        <div className="col-span-1 flex items-center justify-center">
                          {player.trend === 'up' && <TrendingUp className="w-4 h-4 text-primary" />}
                          {player.trend === 'down' && <TrendingUp className="w-4 h-4 text-secondary rotate-180" />}
                          {player.trend === 'same' && <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {!loading && !error && leaderboardData.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg" className="rounded-full">
                  View Full Rankings
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}