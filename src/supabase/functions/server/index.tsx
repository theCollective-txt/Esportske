import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

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
      }
    }
  );
};

// Helper to check if user is admin
const checkAdmin = async (accessToken: string) => {
  if (!accessToken) {
    return { isAdmin: false, userId: null };
  }

  const supabase = getSupabaseClientWithAuth(accessToken);
  const { data: { user }, error } = await supabase.auth.getUser();

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

    const supabase = getSupabaseClientWithAuth(accessToken);
    console.log('Profile endpoint - Getting user from Supabase auth...');
    const { data: { user }, error } = await supabase.auth.getUser();

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

    const supabase = getSupabaseClientWithAuth(accessToken);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authorization error while registering for tournament:', authError);
      return c.json({ error: 'Unauthorized - invalid access token' }, 401);
    }

    const { tournamentId, tournamentTitle } = await c.req.json();

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

    // Add tournament registration
    registeredTournaments.push({
      tournamentId,
      tournamentTitle,
      registeredAt: new Date().toISOString(),
    });

    // Update user profile
    await kv.set(`user:${user.id}`, {
      ...profile,
      registeredTournaments,
    });

    // Store tournament registration (for tournament participant list)
    const registrationKey = `tournament:${tournamentId}:participant:${user.id}`;
    await kv.set(registrationKey, {
      userId: user.id,
      userName: profile.name,
      userEmail: profile.email,
      location: profile.location,
      favoriteGame: profile.favoriteGame,
      registeredAt: new Date().toISOString(),
    });

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

    const supabase = getSupabaseClientWithAuth(accessToken);
    const { data: { user }, error } = await supabase.auth.getUser();

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

// Health check
app.get('/make-server-8711c492/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);