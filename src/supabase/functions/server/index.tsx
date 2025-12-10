import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Create Supabase client helper
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
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
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized - no access token provided' }, 401);
    }

    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      console.error('Error getting user profile:', error);
      return c.json({ error: 'Unauthorized - invalid access token' }, 401);
    }

    // Get user profile from KV store
    const profile = await kv.get(`user:${user.id}`);

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
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

    const supabase = getSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

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

// Health check
app.get('/make-server-8711c492/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch);
