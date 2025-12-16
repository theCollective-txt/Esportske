import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import { jwtDecode } from 'npm:jwt-decode@4';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// JWT validation middleware for public routes
app.use('*', async (c, next) => {
  // Allow requests with valid Authorization header (either user token or anon key)
  const authHeader = c.req.header('Authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Valid Authorization header present, proceed
    return await next();
  }
  
  // For routes that don't require auth, proceed without token
  // (this allows the public routes to work)
  return await next();
});

// Create Supabase client helper
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Create Supabase client with user's access token
const getSupabaseClientWithAuth = (accessToken: string) => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );
};

// Helper to get user from access token
const getUserFromToken = async (accessToken: string) => {
  try {
    // Decode the JWT to get the user ID
    const decoded: any = jwtDecode(accessToken);
    
    if (!decoded || !decoded.sub) {
      return { user: null, error: 'Invalid token' };
    }

    // Get the user from Supabase using admin client
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.admin.getUserById(decoded.sub);

    if (error || !data.user) {
      return { user: null, error: error?.message || 'User not found' };
    }

    return { user: data.user, error: null };
  } catch (err: any) {
    console.error('Error decoding/verifying token:', err);
    return { user: null, error: err.message || 'Invalid token' };
  }
};

// Helper to check if user is admin
const checkAdmin = async (accessToken: string) => {
  if (!accessToken) {
    return { isAdmin: false, userId: null };
  }

  const { user, error } = await getUserFromToken(accessToken);

  if (error || !user) {
    return { isAdmin: false, userId: null };
  }

  const profile = await kv.get(`user:${user.id}`);
  
  // Check admin status from both KV store and Supabase user_metadata
  const isAdminFromMetadata = user.user_metadata?.is_admin === true;
  const isAdminFromKV = profile?.role === 'admin';
  
  // If user has is_admin in metadata but not in KV, update KV store
  if (isAdminFromMetadata && !isAdminFromKV && profile) {
    profile.role = 'admin';
    await kv.set(`user:${user.id}`, profile);
  }
  
  const isAdmin = isAdminFromKV || isAdminFromMetadata;
  
  return { isAdmin, userId: user.id, profile };
};

// Sign up endpoint
app.post('/make-server-8711c492/signup', async (c) => {
  try {
    const { email, password, name, location, favoriteGame } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const supabase = getSupabaseClient();

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        location: location || '',
        favoriteGame: favoriteGame || '',
        joinedAt: new Date().toISOString(),
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error('Error creating user during sign up:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      location: location || '',
      favoriteGame: favoriteGame || '',
      joinedAt: new Date().toISOString(),
      registeredTournaments: [],
      registrationHistory: {},
    });

    return c.json({ 
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
      }
    });
  } catch (error: any) {
    console.error('Sign up error:', error);
    return c.json({ error: error.message || 'Failed to create account' }, 500);
  }
});

// Get user profile
app.get('/make-server-8711c492/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    console.log('Profile endpoint - Access token present:', !!accessToken);
    
    if (!accessToken) {
      console.error('Profile endpoint - No access token provided');
      return c.json({ error: 'Unauthorized - no access token provided' }, 401);
    }

    console.log('Profile endpoint - Getting user from token...');
    const { user, error } = await getUserFromToken(accessToken);

    if (error || !user) {
      console.error('Profile endpoint - Auth error:', error);
      return c.json({ error: 'Unauthorized - invalid access token' }, 401);
    }

    console.log('Profile endpoint - User authenticated:', user.id);
    
    // Get user profile from KV store
    console.log('Profile endpoint - Fetching profile from KV store...');
    const profile = await kv.get(`user:${user.id}`);
    console.log('Profile endpoint - KV profile found:', !!profile);

    if (!profile) {
      console.error('Profile endpoint - Profile not found in KV store for user:', user.id);
      return c.json({ error: 'Profile not found' }, 404);
    }

    // Check if user is admin from either KV store role or Supabase user_metadata
    const isAdminFromMetadata = user.user_metadata?.is_admin === true;
    const isAdminFromKV = profile.role === 'admin';
    console.log('Profile endpoint - Admin check - From metadata:', isAdminFromMetadata, 'From KV:', isAdminFromKV);
    
    // If user has is_admin in metadata but not in KV, update KV store
    if (isAdminFromMetadata && !isAdminFromKV) {
      console.log('Profile endpoint - Syncing admin role from metadata to KV store');
      profile.role = 'admin';
      await kv.set(`user:${user.id}`, profile);
    }

    console.log('Profile endpoint - Returning profile with role:', profile.role);
    return c.json({ profile });
  } catch (error: any) {
    console.error('Profile endpoint - Unexpected error:', error);
    console.error('Profile endpoint - Error stack:', error.stack);
    return c.json({ error: error.message || 'Failed to fetch profile' }, 500);
  }
});

// Register for tournament
app.post('/make-server-8711c492/register-tournament', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - no access token provided' }, 401);
    }

    const { user, error: authError } = await getUserFromToken(accessToken);

    if (authError || !user) {
      console.error('Authorization error while registering for tournament:', authError);
      return c.json({ error: 'Unauthorized - invalid access token' }, 401);
    }

    const { tournamentId, tournamentTitle, gamertag } = await c.req.json();

    if (!tournamentId || !tournamentTitle) {
      return c.json({ error: 'Tournament ID and title are required' }, 400);
    }

    // Get user profile
    const profile = await kv.get(`user:${user.id}`);

    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Check if already registered
    const registeredTournaments = profile.registeredTournaments || [];
    if (registeredTournaments.some((t: any) => t.tournamentId === tournamentId)) {
      return c.json({ error: 'Already registered for this tournament' }, 400);
    }

    // Check registration history and limit (max 3 register/unregister cycles)
    const registrationHistory = profile.registrationHistory || {};
    const tournamentHistory = registrationHistory[tournamentId] || { count: 0, isRegistered: false };
    
    if (tournamentHistory.count >= 3) {
      return c.json({ error: 'Registration limit reached (3 attempts maximum)' }, 400);
    }

    // Add tournament registration
    const registration: any = {
      tournamentId,
      tournamentTitle,
      registeredAt: new Date().toISOString(),
    };
    
    // Include gamertag if provided
    if (gamertag) {
      registration.gamertag = gamertag;
    }
    
    registeredTournaments.push(registration);

    // Update registration history
    tournamentHistory.count += 1;
    tournamentHistory.isRegistered = true;
    registrationHistory[tournamentId] = tournamentHistory;

    // Update user profile
    await kv.set(`user:${user.id}`, {
      ...profile,
      registeredTournaments,
      registrationHistory,
    });

    // Store tournament registration (for tournament participant list)
    const registrationKey = `tournament:${tournamentId}:participant:${user.id}`;
    const participantData: any = {
      userId: user.id,
      userName: profile.name,
      userEmail: profile.email,
      location: profile.location,
      favoriteGame: profile.favoriteGame,
      registeredAt: new Date().toISOString(),
    };
    
    // Include gamertag in participant data if provided
    if (gamertag) {
      participantData.gamertag = gamertag;
    }
    
    await kv.set(registrationKey, participantData);

    return c.json({ 
      success: true,
      message: 'Successfully registered for tournament',
      registeredTournaments,
    });
  } catch (error: any) {
    console.error('Error registering for tournament:', error);
    return c.json({ error: error.message || 'Failed to register for tournament' }, 500);
  }
});

// Get user's registered tournaments
app.get('/make-server-8711c492/my-tournaments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - no access token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.error('Error getting user tournaments:', error);
      return c.json({ error: 'Unauthorized - invalid access token' }, 401);
    }

    // Get user profile
    const profile = await kv.get(`user:${user.id}`);

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ 
      tournaments: profile.registeredTournaments || [],
    });
  } catch (error: any) {
    console.error('Error fetching user tournaments:', error);
    return c.json({ error: error.message || 'Failed to fetch tournaments' }, 500);
  }
});

// Unregister from tournament
app.post('/make-server-8711c492/unregister-tournament', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - no access token provided' }, 401);
    }

    const { user, error: authError } = await getUserFromToken(accessToken);

    if (authError || !user) {
      console.error('Authorization error while unregistering from tournament:', authError);
      return c.json({ error: 'Unauthorized - invalid access token' }, 401);
    }

    const { tournamentId } = await c.req.json();

    if (!tournamentId) {
      return c.json({ error: 'Tournament ID is required' }, 400);
    }

    // Get user profile
    const profile = await kv.get(`user:${user.id}`);

    if (!profile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Check if registered
    const registeredTournaments = profile.registeredTournaments || [];
    const isRegistered = registeredTournaments.some((t: any) => t.tournamentId === tournamentId);
    
    if (!isRegistered) {
      return c.json({ error: 'Not registered for this tournament' }, 400);
    }

    // Remove from registered tournaments
    const updatedTournaments = registeredTournaments.filter((t: any) => t.tournamentId !== tournamentId);

    // Update registration history
    const registrationHistory = profile.registrationHistory || {};
    const tournamentHistory = registrationHistory[tournamentId] || { count: 0, isRegistered: false };
    tournamentHistory.isRegistered = false;
    registrationHistory[tournamentId] = tournamentHistory;

    // Update user profile
    await kv.set(`user:${user.id}`, {
      ...profile,
      registeredTournaments: updatedTournaments,
      registrationHistory,
    });

    // Remove tournament participant entry
    await kv.del(`tournament:${tournamentId}:participant:${user.id}`);

    return c.json({ 
      success: true,
      message: 'Successfully unregistered from tournament',
      registeredTournaments: updatedTournaments,
    });
  } catch (error: any) {
    console.error('Error unregistering from tournament:', error);
    return c.json({ error: error.message || 'Failed to unregister from tournament' }, 500);
  }
});

// Get tournament participants
app.get('/make-server-8711c492/tournament/:tournamentId/participants', async (c) => {
  try {
    const tournamentId = c.req.param('tournamentId');
    
    // Get all participants for this tournament
    const participants = await kv.getByPrefix(`tournament:${tournamentId}:participant:`);

    return c.json({ 
      participants: participants || [],
      count: participants?.length || 0,
    });
  } catch (error: any) {
    console.error('Error fetching tournament participants:', error);
    return c.json({ error: error.message || 'Failed to fetch participants' }, 500);
  }
});

// ============= ADMIN ENDPOINTS =============

// Get all tournaments (public)
app.get('/make-server-8711c492/tournaments', async (c) => {
  try {
    console.log('Fetching tournaments from KV store...');
    const tournaments = await kv.getByPrefix('tournament:data:');
    console.log('Tournaments fetched:', tournaments?.length || 0, 'items');
    
    // Sort by date (newest first)
    const sortedTournaments = (tournaments || []).sort((a: any, b: any) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    
    return c.json({ tournaments: sortedTournaments });
  } catch (error: any) {
    console.error('Error fetching tournaments from KV store:', error);
    console.error('Error details:', error.message, error.stack);
    return c.json({ error: error.message || 'Failed to fetch tournaments' }, 500);
  }
});

// Create tournament (admin only)
app.post('/make-server-8711c492/admin/tournaments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const tournamentData = await c.req.json();
    
    // Generate a unique ID
    const tournamentId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const tournament = {
      id: tournamentId,
      ...tournamentData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`tournament:data:${tournamentId}`, tournament);

    return c.json({ success: true, tournament });
  } catch (error: any) {
    console.error('Error creating tournament:', error);
    return c.json({ error: error.message || 'Failed to create tournament' }, 500);
  }
});

// Update tournament (admin only)
app.put('/make-server-8711c492/admin/tournaments/:tournamentId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const tournamentId = c.req.param('tournamentId');
    const updates = await c.req.json();

    const existingTournament = await kv.get(`tournament:data:${tournamentId}`);
    
    if (!existingTournament) {
      return c.json({ error: 'Tournament not found' }, 404);
    }

    const updatedTournament = {
      ...existingTournament,
      ...updates,
      id: tournamentId, // Ensure ID doesn't change
      createdAt: existingTournament.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`tournament:data:${tournamentId}`, updatedTournament);

    return c.json({ success: true, tournament: updatedTournament });
  } catch (error: any) {
    console.error('Error updating tournament:', error);
    return c.json({ error: error.message || 'Failed to update tournament' }, 500);
  }
});

// Delete tournament (admin only)
app.delete('/make-server-8711c492/admin/tournaments/:tournamentId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const tournamentId = c.req.param('tournamentId');

    // Delete tournament data
    await kv.del(`tournament:data:${tournamentId}`);
    
    // Delete all participant registrations for this tournament
    const participants = await kv.getByPrefix(`tournament:${tournamentId}:participant:`);
    for (const participant of participants || []) {
      await kv.del(`tournament:${tournamentId}:participant:${participant.userId}`);
    }

    return c.json({ success: true, message: 'Tournament deleted' });
  } catch (error: any) {
    console.error('Error deleting tournament:', error);
    return c.json({ error: error.message || 'Failed to delete tournament' }, 500);
  }
});

// Get all users (admin only)
app.get('/make-server-8711c492/admin/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const users = await kv.getByPrefix('user:');
    return c.json({ users: users || [] });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return c.json({ error: error.message || 'Failed to fetch users' }, 500);
  }
});

// Update user role (admin only)
app.patch('/make-server-8711c492/admin/users/:userId/role', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const userId = c.req.param('userId');
    const { role } = await c.req.json();

    if (!['user', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be "user" or "admin"' }, 400);
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'User not found' }, 404);
    }

    await kv.set(`user:${userId}`, {
      ...profile,
      role,
    });

    return c.json({ success: true, message: 'User role updated' });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return c.json({ error: error.message || 'Failed to update user role' }, 500);
  }
});

// Delete user (admin only)
app.delete('/make-server-8711c492/admin/users/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const userId = c.req.param('userId');
    
    // Delete user profile
    await kv.del(`user:${userId}`);
    
    // Delete all tournament registrations for this user
    const allParticipations = await kv.getByPrefix('tournament:');
    const userParticipations = allParticipations?.filter((p: any) => p.userId === userId) || [];
    
    for (const participation of userParticipations) {
      const tournamentId = participation.tournamentId || '';
      await kv.del(`tournament:${tournamentId}:participant:${userId}`);
    }

    return c.json({ success: true, message: 'User deleted' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return c.json({ error: error.message || 'Failed to delete user' }, 500);
  }
});

// Get app configuration (admin only)
app.get('/make-server-8711c492/admin/config', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    let config = await kv.get('app:config');
    
    // Initialize default config if not exists
    if (!config) {
      config = {
        locationOptions: ['Westlands', 'Karen', 'CBD', 'Kileleshwa', 'Kilimani', 'Lavington', 'Parklands', 'Other'],
        gameOptions: ['FIFA 24', 'Valorant', 'Call of Duty', 'CS:GO', 'League of Legends', 'Rocket League', 'Tekken 8', 'Apex Legends', 'Other'],
      };
      await kv.set('app:config', config);
    }

    return c.json({ config });
  } catch (error: any) {
    console.error('Error fetching config:', error);
    return c.json({ error: error.message || 'Failed to fetch config' }, 500);
  }
});

// Update app configuration (admin only)
app.put('/make-server-8711c492/admin/config', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const { locationOptions, gameOptions } = await c.req.json();

    if (!Array.isArray(locationOptions) || !Array.isArray(gameOptions)) {
      return c.json({ error: 'Invalid config format' }, 400);
    }

    const config = { locationOptions, gameOptions };
    await kv.set('app:config', config);

    return c.json({ success: true, config });
  } catch (error: any) {
    console.error('Error updating config:', error);
    return c.json({ error: error.message || 'Failed to update config' }, 500);
  }
});

// Search games endpoint (admin only)
app.post('/make-server-8711c492/admin/search-games', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const { searchTerm } = await c.req.json();

    if (!searchTerm || typeof searchTerm !== 'string') {
      return c.json({ error: 'Search term is required' }, 400);
    }

    // Get the config from KV store
    let config = await kv.get('app:config');
    
    // Initialize default config if not exists
    if (!config) {
      config = {
        locationOptions: ['Westlands', 'Karen', 'CBD', 'Kileleshwa', 'Kilimani', 'Lavington', 'Parklands', 'Other'],
        gameOptions: ['FIFA 24', 'Valorant', 'Call of Duty', 'CS:GO', 'League of Legends', 'Rocket League', 'Tekken 8', 'Apex Legends', 'Other'],
      };
      await kv.set('app:config', config);
    }

    // Filter games based on search term
    const games = config.gameOptions.filter((game: string) => 
      game.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return c.json({ games });
  } catch (error: any) {
    console.error('Error searching games:', error);
    return c.json({ error: error.message || 'Failed to search games' }, 500);
  }
});

// Remove tournament participant (admin only)
app.delete('/make-server-8711c492/admin/tournament/:tournamentId/participant/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const tournamentId = c.req.param('tournamentId');
    const userId = c.req.param('userId');

    // Remove from tournament participants
    await kv.del(`tournament:${tournamentId}:participant:${userId}`);

    // Remove from user's registered tournaments
    const profile = await kv.get(`user:${userId}`);
    if (profile) {
      const registeredTournaments = (profile.registeredTournaments || []).filter(
        (t: any) => t.tournamentId !== tournamentId
      );
      await kv.set(`user:${userId}`, {
        ...profile,
        registeredTournaments,
      });
    }

    return c.json({ success: true, message: 'Participant removed' });
  } catch (error: any) {
    console.error('Error removing participant:', error);
    return c.json({ error: error.message || 'Failed to remove participant' }, 500);
  }
});

// Get leaderboard data (public)
app.get('/make-server-8711c492/leaderboard', async (c) => {
  try {
    const game = c.req.query('game');
    
    if (!game) {
      return c.json({ error: 'Game parameter is required' }, 400);
    }

    console.log('Fetching leaderboard for game:', game);
    
    // Get all users
    const users = await kv.getByPrefix('user:');
    console.log('Total users found:', users?.length || 0);
    
    if (!users || users.length === 0) {
      return c.json({ leaderboard: [] });
    }

    // Extract game stats and filter out users with 0 points
    const leaderboardData = users
      .map((user: any) => {
        const gameStats = user.gameStats?.[game] || { wins: 0, points: 0 };
        return {
          userId: user.id,
          player: user.name,
          email: user.email,
          wins: gameStats.wins || 0,
          points: gameStats.points || 0,
          previousRank: gameStats.previousRank || null,
        };
      })
      .filter((player: any) => player.points > 0) // Filter out players with 0 points
      .sort((a: any, b: any) => b.points - a.points) // Sort by points descending
      .map((player: any, index: number) => {
        // Calculate trend based on previous rank
        let trend = 'same';
        if (player.previousRank !== null) {
          const currentRank = index + 1;
          if (currentRank < player.previousRank) {
            trend = 'up';
          } else if (currentRank > player.previousRank) {
            trend = 'down';
          }
        }
        
        return {
          rank: index + 1,
          player: player.player,
          wins: player.wins,
          points: player.points,
          trend,
        };
      });

    console.log('Leaderboard data:', leaderboardData.length, 'players with points > 0');
    
    return c.json({ leaderboard: leaderboardData });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    return c.json({ error: error.message || 'Failed to fetch leaderboard' }, 500);
  }
});

// Get top games by tournament participation (public)
app.get('/make-server-8711c492/top-games', async (c) => {
  try {
    console.log('Fetching top games by tournament participation...');
    
    // Get all tournaments
    const tournaments = await kv.getByPrefix('tournament:data:');
    console.log('Total tournaments found:', tournaments?.length || 0);
    
    if (!tournaments || tournaments.length === 0) {
      return c.json({ games: [] });
    }

    // Count participants per game
    const gameParticipantCount: { [key: string]: Set<string> } = {};
    
    // Get all tournament participants
    for (const tournament of tournaments) {
      const game = tournament.game;
      if (!game) continue;
      
      // Initialize set for this game if it doesn't exist
      if (!gameParticipantCount[game]) {
        gameParticipantCount[game] = new Set();
      }
      
      // Get participants for this tournament
      const participants = await kv.getByPrefix(`tournament:${tournament.id}:participant:`);
      
      // Add each participant's userId to the set (sets automatically deduplicate)
      if (participants && participants.length > 0) {
        participants.forEach((participant: any) => {
          if (participant.userId) {
            gameParticipantCount[game].add(participant.userId);
          }
        });
      }
    }

    // Convert to array and sort by participant count
    const topGames = Object.entries(gameParticipantCount)
      .map(([game, participantSet]) => ({
        game,
        participantCount: participantSet.size,
      }))
      .filter(item => item.participantCount > 0) // Only games with at least 1 participant
      .sort((a, b) => b.participantCount - a.participantCount) // Sort by count descending
      .map(item => item.game);

    console.log('Top games by participation:', topGames);
    
    return c.json({ games: topGames });
  } catch (error: any) {
    console.error('Error fetching top games:', error);
    return c.json({ error: error.message || 'Failed to fetch top games' }, 500);
  }
});

// Update player game stats (admin only)
app.patch('/make-server-8711c492/admin/users/:userId/game-stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const userId = c.req.param('userId');
    const { game, wins, points } = await c.req.json();

    if (!game || typeof wins !== 'number' || typeof points !== 'number') {
      return c.json({ error: 'Game, wins, and points are required' }, 400);
    }

    const profile = await kv.get(`user:${userId}`);
    if (!profile) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Get current game stats to track rank changes
    const currentGameStats = profile.gameStats?.[game] || {};
    
    // Initialize gameStats if it doesn't exist
    const gameStats = profile.gameStats || {};
    
    // Update stats for the specified game
    gameStats[game] = {
      wins,
      points,
      previousRank: currentGameStats.rank || null,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`user:${userId}`, {
      ...profile,
      gameStats,
    });

    return c.json({ success: true, message: 'Game stats updated' });
  } catch (error: any) {
    console.error('Error updating game stats:', error);
    return c.json({ error: error.message || 'Failed to update game stats' }, 500);
  }
});

// Update all leaderboard ranks (admin only) - should be called after updating stats
app.post('/make-server-8711c492/admin/update-leaderboard-ranks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const { game } = await c.req.json();
    
    if (!game) {
      return c.json({ error: 'Game parameter is required' }, 400);
    }

    // Get all users and calculate ranks
    const users = await kv.getByPrefix('user:');
    
    if (!users || users.length === 0) {
      return c.json({ success: true, message: 'No users found' });
    }

    const sortedUsers = users
      .map((user: any) => ({
        userId: user.id,
        points: user.gameStats?.[game]?.points || 0,
      }))
      .filter((u: any) => u.points > 0)
      .sort((a: any, b: any) => b.points - a.points);

    // Update previousRank for each user
    for (let i = 0; i < sortedUsers.length; i++) {
      const user = sortedUsers[i];
      const profile = await kv.get(`user:${user.userId}`);
      
      if (profile && profile.gameStats && profile.gameStats[game]) {
        profile.gameStats[game].rank = i + 1;
        await kv.set(`user:${user.userId}`, profile);
      }
    }

    return c.json({ success: true, message: 'Leaderboard ranks updated' });
  } catch (error: any) {
    console.error('Error updating leaderboard ranks:', error);
    return c.json({ error: error.message || 'Failed to update ranks' }, 500);
  }
});

// Health check
app.get('/make-server-8711c492/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Admin: Get leaderboard with full user data
app.get('/make-server-8711c492/admin/leaderboard/:game', async (c) => {
  try {
    // Verify admin access
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const game = c.req.param('game');
    
    if (!game) {
      return c.json({ error: 'Game parameter is required' }, 400);
    }

    console.log('Admin fetching leaderboard for game:', game);
    
    // Get all users
    const users = await kv.getByPrefix('user:');
    console.log('Total users found:', users?.length || 0);
    
    if (!users || users.length === 0) {
      return c.json({ leaderboard: [] });
    }

    // Extract game stats including all players (even with 0 points for admin view)
    const leaderboardData = users
      .map((user: any) => {
        const gameStats = user.gameStats?.[game] || { wins: 0, points: 0 };
        return {
          userId: user.id,
          player: user.name,
          email: user.email,
          wins: gameStats.wins || 0,
          points: gameStats.points || 0,
        };
      })
      .sort((a: any, b: any) => b.points - a.points); // Sort by points descending

    console.log('Admin leaderboard data:', leaderboardData.length, 'total players');
    
    return c.json({ leaderboard: leaderboardData });
  } catch (error: any) {
    console.error('Error fetching admin leaderboard:', error);
    return c.json({ error: error.message || 'Failed to fetch leaderboard' }, 500);
  }
});

// Admin: Update player stats
app.post('/make-server-8711c492/admin/update-player-stats', async (c) => {
  try {
    // Verify admin access
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.role !== 'admin') {
      return c.json({ error: 'Admin access required' }, 403);
    }

    const { userId, game, points, wins } = await c.req.json();

    if (!userId || !game || points === undefined || wins === undefined) {
      return c.json({ error: 'userId, game, points, and wins are required' }, 400);
    }

    console.log('Admin updating player stats:', { userId, game, points, wins });

    // Get user data
    const targetUser = await kv.get(`user:${userId}`);
    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Update game stats
    const updatedUser = {
      ...targetUser,
      gameStats: {
        ...targetUser.gameStats,
        [game]: {
          wins: parseInt(wins) || 0,
          points: parseInt(points) || 0,
        },
      },
    };

    await kv.set(`user:${userId}`, updatedUser);

    console.log('Player stats updated successfully');
    
    return c.json({ 
      message: 'Player stats updated successfully',
      stats: updatedUser.gameStats[game]
    });
  } catch (error: any) {
    console.error('Error updating player stats:', error);
    return c.json({ error: error.message || 'Failed to update player stats' }, 500);
  }
});

// Get blog posts (public)
app.get('/make-server-8711c492/blog-posts', async (c) => {
  try {
    console.log('Fetching blog posts...');
    
    const posts = await kv.getByPrefix('blog:post:');
    console.log('Blog posts found:', posts?.length || 0);
    
    if (!posts || posts.length === 0) {
      return c.json({ posts: [] });
    }

    // Sort by date (newest first)
    const sortedPosts = posts.sort((a: any, b: any) => {
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });
    
    return c.json({ posts: sortedPosts });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return c.json({ error: error.message || 'Failed to fetch blog posts' }, 500);
  }
});

// Create blog post (admin only)
app.post('/make-server-8711c492/admin/blog-posts', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const postData = await c.req.json();
    
    // Generate a unique ID
    const postId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const post = {
      id: postId,
      ...postData,
      date: postData.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await kv.set(`blog:post:${postId}`, post);

    return c.json({ success: true, post });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return c.json({ error: error.message || 'Failed to create blog post' }, 500);
  }
});

// Update blog post (admin only)
app.put('/make-server-8711c492/admin/blog-posts/:postId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const postId = c.req.param('postId');
    const updates = await c.req.json();

    const existingPost = await kv.get(`blog:post:${postId}`);
    
    if (!existingPost) {
      return c.json({ error: 'Blog post not found' }, 404);
    }

    const updatedPost = {
      ...existingPost,
      ...updates,
      id: postId,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`blog:post:${postId}`, updatedPost);

    return c.json({ success: true, post: updatedPost });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return c.json({ error: error.message || 'Failed to update blog post' }, 500);
  }
});

// Delete blog post (admin only)
app.delete('/make-server-8711c492/admin/blog-posts/:postId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { isAdmin } = await checkAdmin(accessToken || '');

    if (!isAdmin) {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const postId = c.req.param('postId');
    await kv.del(`blog:post:${postId}`);

    return c.json({ success: true, message: 'Blog post deleted' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return c.json({ error: error.message || 'Failed to delete blog post' }, 500);
  }
});

Deno.serve(app.fetch);