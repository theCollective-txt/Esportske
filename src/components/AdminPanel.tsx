import { useState, useEffect } from 'react';
import { Users, Settings, Download, Shield, Trash2, Save, Plus, X, Trophy, Edit, Calendar, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminPanelProps {
  accessToken: string;
  onNavigate: (page: string) => void;
}

export function AdminPanel({ accessToken, onNavigate }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'tournaments' | 'config' | 'leaderboard'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingTournament, setEditingTournament] = useState<any>(null);
  const [showTournamentForm, setShowTournamentForm] = useState(false);
  const [viewingParticipants, setViewingParticipants] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  
  // Helper function to auto-generate date display from fullDate
  const getDateDisplay = (fullDate: string): string => {
    if (!fullDate) return '';
    
    const selectedDate = new Date(fullDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const diffTime = selectedDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else {
      // Format as "Dec 12" or similar
      return selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'tournaments') {
      fetchTournaments();
      // Also fetch config to populate game dropdown
      if (!config) {
        fetchConfig();
      }
    } else if (activeTab === 'config') {
      fetchConfig();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/users`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      setUsers(data.users || []);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching tournaments from:', `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/tournaments`);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/tournaments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch tournaments (HTTP ${response.status})`);
      }

      setTournaments(data.tournaments || []);
    } catch (err: any) {
      console.error('Error fetching tournaments:', err);
      console.error('Error stack:', err.stack);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (tournamentId: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/tournament/${tournamentId}/participants`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch participants');
      }

      setParticipants(data.participants || []);
    } catch (err: any) {
      console.error('Error fetching participants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeParticipant = async (tournamentId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/tournament/${tournamentId}/participant/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove participant');
      }

      setSuccess('Participant removed successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      // Refresh participants list
      if (viewingParticipants) {
        fetchParticipants(viewingParticipants.id);
      }
    } catch (err: any) {
      console.error('Error removing participant:', err);
      setError(err.message);
    }
  };

  const fetchConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/config`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch config');
      }

      setConfig(data.config);
    } catch (err: any) {
      console.error('Error fetching config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/users/${userId}/role`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update role');
      }

      if (role === 'admin') {
        setSuccess('User role updated to admin. The user needs to sign out and sign back in to access admin features.');
      } else {
        setSuccess('User role updated successfully');
      }
      setTimeout(() => setSuccess(''), 5000);
      fetchUsers();
    } catch (err: any) {
      console.error('Error updating role:', err);
      setError(err.message);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      setSuccess('User deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message);
    }
  };

  const exportToCSV = () => {
    if (users.length === 0) {
      alert('No users to export');
      return;
    }

    const headers = ['Name', 'Email', 'Location', 'Favorite Game', 'Role', 'Joined At', 'Registered Tournaments'];
    const rows = users.map(user => [
      user.name || '',
      user.email || '',
      user.location || '',
      user.favoriteGame || '',
      user.role || 'user',
      user.joinedAt || '',
      (user.registeredTournaments || []).length,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `esports-ke-users-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveConfig = async () => {
    if (!config) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/config`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(config),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save config');
      }

      setSuccess('Configuration saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving config:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addConfigOption = (type: 'locationOptions' | 'gameOptions', value: string) => {
    if (!value.trim()) return;
    
    setConfig({
      ...config,
      [type]: [...(config[type] || []), value.trim()],
    });
  };

  const removeConfigOption = (type: 'locationOptions' | 'gameOptions', index: number) => {
    setConfig({
      ...config,
      [type]: config[type].filter((_: any, i: number) => i !== index),
    });
  };

  const addTournament = async (tournament: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/tournaments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tournament),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add tournament');
      }

      setSuccess('Tournament added successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchTournaments();
      setShowTournamentForm(false);
    } catch (err: any) {
      console.error('Error adding tournament:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTournament = async (tournament: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/tournaments/${tournament.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tournament),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update tournament');
      }

      setSuccess('Tournament updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchTournaments();
      setShowTournamentForm(false);
    } catch (err: any) {
      console.error('Error updating tournament:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTournament = async (tournamentId: string) => {
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/tournaments/${tournamentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete tournament');
      }

      setSuccess('Tournament deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchTournaments();
    } catch (err: any) {
      console.error('Error deleting tournament:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-black text-white">Admin Panel</h1>
          </div>
          <p className="text-muted-foreground">Manage users, tournaments, and platform configuration</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500">
            {success}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            User Management
          </Button>
          <Button
            variant={activeTab === 'tournaments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tournaments')}
            className="gap-2"
          >
            <Trophy className="w-4 h-4" />
            Tournaments
          </Button>
          <Button
            variant={activeTab === 'config' ? 'default' : 'outline'}
            onClick={() => setActiveTab('config')}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Configuration
          </Button>
          <Button
            variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('leaderboard')}
            className="gap-2"
          >
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Button>
        </div>

        {/* Content */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Total Users: <span className="text-white font-bold">{users.length}</span>
              </div>
              <Button onClick={exportToCSV} className="gap-2" variant="outline">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>

            {/* Users Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left text-sm text-muted-foreground">
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium">Email</th>
                        <th className="p-4 font-medium">Location</th>
                        <th className="p-4 font-medium">Game</th>
                        <th className="p-4 font-medium">Tournaments</th>
                        <th className="p-4 font-medium">Role</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            Loading users...
                          </td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-muted-foreground">
                            No users found
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4 text-white font-medium">{user.name}</td>
                            <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                            <td className="p-4 text-sm">{user.location || '-'}</td>
                            <td className="p-4 text-sm">{user.favoriteGame || '-'}</td>
                            <td className="p-4 text-sm">{user.registeredTournaments?.length || 0}</td>
                            <td className="p-4">
                              <select
                                value={user.role || 'user'}
                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                className="bg-muted text-white text-sm rounded px-2 py-1 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteUser(user.id)}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'tournaments' && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Total Tournaments: <span className="text-white font-bold">{tournaments.length}</span>
              </div>
              <Button onClick={() => setShowTournamentForm(true)} className="gap-2" variant="outline">
                <Plus className="w-4 h-4" />
                Add Tournament
              </Button>
            </div>

            {/* Tournaments Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border">
                      <tr className="text-left text-sm text-muted-foreground">
                        <th className="p-4 font-medium">Name</th>
                        <th className="p-4 font-medium">Game</th>
                        <th className="p-4 font-medium">Location</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            Loading tournaments...
                          </td>
                        </tr>
                      ) : tournaments.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-muted-foreground">
                            No tournaments found
                          </td>
                        </tr>
                      ) : (
                        tournaments.map((tournament) => (
                          <tr key={tournament.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4 text-white font-medium">{tournament.title}</td>
                            <td className="p-4 text-sm text-muted-foreground">{tournament.game}</td>
                            <td className="p-4 text-sm">{tournament.location || '-'}</td>
                            <td className="p-4 text-sm">{tournament.fullDate || '-'}</td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setViewingParticipants(tournament);
                                  fetchParticipants(tournament.id);
                                }}
                                className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                                title="View Participants"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingTournament(tournament);
                                  setShowTournamentForm(true);
                                }}
                                className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTournament(tournament.id)}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Tournament Form */}
            {showTournamentForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{editingTournament?.id ? 'Edit Tournament' : 'Add Tournament'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Tournament Title *</label>
                      <Input
                        placeholder="Enter tournament name..."
                        value={editingTournament?.title || ''}
                        onChange={(e) => setEditingTournament({ ...editingTournament, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-sm text-muted-foreground">Game *</label>
                      <Select 
                        value={editingTournament?.game || ''} 
                        onValueChange={(value) => setEditingTournament({ ...(editingTournament || {}), game: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select game" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {config?.gameOptions && Array.isArray(config.gameOptions) && config.gameOptions.length > 0 ? (
                            [...config.gameOptions].sort((a: string, b: string) => a.localeCompare(b)).map((game: string) => (
                              <SelectItem key={game} value={game}>{game}</SelectItem>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-muted-foreground">No games available</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Host</label>
                      <Input
                        placeholder="Enter host name..."
                        value={editingTournament?.host || ''}
                        onChange={(e) => setEditingTournament({ ...editingTournament, host: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Location *</label>
                      <Input
                        placeholder="Enter location..."
                        value={editingTournament?.location || ''}
                        onChange={(e) => setEditingTournament({ ...editingTournament, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Area</label>
                      <Input
                        placeholder="e.g., Westlands, Karen..."
                        value={editingTournament?.area || ''}
                        onChange={(e) => setEditingTournament({ ...editingTournament, area: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Full Date</label>
                      <Input
                        placeholder="Select date..."
                        type="date"
                        value={editingTournament?.fullDate || ''}
                        onChange={(e) => {
                          const newFullDate = e.target.value;
                          const autoDate = getDateDisplay(newFullDate);
                          setEditingTournament({ 
                            ...editingTournament, 
                            fullDate: newFullDate,
                            date: autoDate 
                          });
                        }}
                      />
                      {editingTournament?.fullDate && (
                        <p className="text-xs text-muted-foreground">
                          Display: <span className="text-primary font-medium">{editingTournament?.date}</span>
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Time</label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          min="1"
                          max="12"
                          placeholder="HH"
                          className="w-20"
                          value={editingTournament?.time ? editingTournament.time.split(':')[0] : ''}
                          onChange={(e) => {
                            const hour = e.target.value;
                            const currentTime = editingTournament?.time || ':00 PM EAT';
                            const parts = currentTime.split(':');
                            const minuteAndPeriod = parts[1] || '00 PM EAT';
                            setEditingTournament({ ...editingTournament, time: `${hour}:${minuteAndPeriod}` });
                          }}
                        />
                        <span className="text-muted-foreground">:</span>
                        <Input
                          type="number"
                          min="0"
                          max="59"
                          placeholder="MM"
                          className="w-20"
                          value={editingTournament?.time ? editingTournament.time.split(':')[1]?.split(' ')[0] : ''}
                          onChange={(e) => {
                            const minute = e.target.value.padStart(2, '0');
                            const currentTime = editingTournament?.time || '8:00 PM EAT';
                            const hour = currentTime.split(':')[0];
                            const period = currentTime.includes('AM') ? 'AM' : 'PM';
                            const timezone = currentTime.split(' ')[2] || 'EAT';
                            setEditingTournament({ ...editingTournament, time: `${hour}:${minute} ${period} ${timezone}` });
                          }}
                        />
                        <Select
                          value={editingTournament?.time?.includes('AM') ? 'AM' : 'PM'}
                          onValueChange={(value) => {
                            const currentTime = editingTournament?.time || '8:00 PM EAT';
                            const [timePart] = currentTime.split(' ');
                            const timezone = currentTime.split(' ')[2] || 'EAT';
                            setEditingTournament({ ...editingTournament, time: `${timePart} ${value} ${timezone}` });
                          }}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={editingTournament?.time?.split(' ')[2] || 'EAT'}
                          onValueChange={(value) => {
                            const currentTime = editingTournament?.time || '8:00 PM EAT';
                            const timeAndPeriod = currentTime.split(' ').slice(0, 2).join(' ');
                            setEditingTournament({ ...editingTournament, time: `${timeAndPeriod} ${value}` });
                          }}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EAT">EAT</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="GMT">GMT</SelectItem>
                            <SelectItem value="EST">EST</SelectItem>
                            <SelectItem value="PST">PST</SelectItem>
                            <SelectItem value="CST">CST</SelectItem>
                            <SelectItem value="MST">MST</SelectItem>
                            <SelectItem value="IST">IST</SelectItem>
                            <SelectItem value="JST">JST</SelectItem>
                            <SelectItem value="AEST">AEST</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Duration</label>
                      <div className="flex gap-2 items-center">
                        <Input
                          type="number"
                          min="1"
                          placeholder="0"
                          className="w-24"
                          value={editingTournament?.duration ? editingTournament.duration.split(' ')[0] : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const currentDuration = editingTournament?.duration || '0 hours';
                            const unit = currentDuration.split(' ')[1] || 'hours';
                            setEditingTournament({ ...editingTournament, duration: `${value} ${unit}` });
                          }}
                        />
                        <Select
                          value={editingTournament?.duration?.split(' ')[1] || 'hours'}
                          onValueChange={(value) => {
                            const currentDuration = editingTournament?.duration || '0 hours';
                            const number = currentDuration.split(' ')[0] || '0';
                            setEditingTournament({ ...editingTournament, duration: `${number} ${value}` });
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minutes">Minutes</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Format</label>
                      <Select 
                        value={editingTournament?.format || ''} 
                        onValueChange={(value) => setEditingTournament({ ...editingTournament, format: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1v1">1v1</SelectItem>
                          <SelectItem value="2v2">2v2</SelectItem>
                          <SelectItem value="3v3">3v3</SelectItem>
                          <SelectItem value="5v5">5v5</SelectItem>
                          <SelectItem value="Solo">Solo</SelectItem>
                          <SelectItem value="Duo">Duo</SelectItem>
                          <SelectItem value="Squad">Squad</SelectItem>
                          <SelectItem value="Team">Team</SelectItem>
                          <SelectItem value="Battle Royale">Battle Royale</SelectItem>
                          <SelectItem value="Single Elimination">Single Elimination</SelectItem>
                          <SelectItem value="Double Elimination">Double Elimination</SelectItem>
                          <SelectItem value="Round Robin">Round Robin</SelectItem>
                          <SelectItem value="Swiss">Swiss</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Competition Type *</label>
                      <Select 
                        value={editingTournament?.type || 'tournament'} 
                        onValueChange={(value) => setEditingTournament({ ...editingTournament, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tournament">Tournament</SelectItem>
                          <SelectItem value="scrim">Scrim / Practice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Prize Pool</label>
                      <Input
                        placeholder="e.g., KES 50,000..."
                        value={editingTournament?.prizePool || ''}
                        onChange={(e) => setEditingTournament({ ...editingTournament, prizePool: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Skill Level</label>
                      <Select 
                        value={editingTournament?.skillLevel || ''} 
                        onValueChange={(value) => setEditingTournament({ ...editingTournament, skillLevel: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Levels">All Levels</SelectItem>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Professional">Professional</SelectItem>
                          <SelectItem value="Open">Open</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">Max Attendees</label>
                      <Input
                        placeholder="Enter max number..."
                        type="number"
                        value={editingTournament?.maxAttendees || ''}
                        onChange={(e) => setEditingTournament({ ...editingTournament, maxAttendees: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-muted-foreground">Image URL</label>
                      <Input
                        placeholder="Enter image URL..."
                        value={editingTournament?.image || ''}
                        onChange={(e) => setEditingTournament({ ...editingTournament, image: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-muted-foreground">Tags</label>
                      <Input
                        placeholder="e.g., competitive, casual, beginner-friendly (comma separated)..."
                        value={editingTournament?.tags?.join(', ') || ''}
                        onChange={(e) => setEditingTournament({ ...editingTournament, tags: e.target.value.split(',').map((t: string) => t.trim()) })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-muted-foreground">Description</label>
                      <textarea
                        placeholder="Enter tournament description... (What is this tournament about? What can players expect?)"
                        value={editingTournament?.description || ''}
                        onChange={(e) => setEditingTournament({ ...editingTournament, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm resize-y min-h-[100px]"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm text-muted-foreground">Requirements</label>
                      <textarea
                        placeholder="Enter tournament requirements... (Rules, eligibility, what players need to bring/have)"
                        value={editingTournament?.requirements || ''}
                        onChange={(e) => setEditingTournament({ ...editingTournament, requirements: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm resize-y min-h-[100px]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingTournament(null);
                        setShowTournamentForm(false);
                      }}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (editingTournament?.id) {
                          updateTournament(editingTournament);
                        } else {
                          addTournament(editingTournament || {});
                        }
                        setEditingTournament(null);
                      }}
                      disabled={loading || !editingTournament?.title || !editingTournament?.game}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Participants Modal */}
            {viewingParticipants && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Tournament Participants</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {viewingParticipants.title} • {participants.length} registered
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setViewingParticipants(null);
                      setParticipants([]);
                    }}
                    className="text-muted-foreground hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Loading participants...
                    </div>
                  ) : participants.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No participants registered yet
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-border">
                          <tr className="text-left text-sm text-muted-foreground">
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Email</th>
                            <th className="p-4 font-medium">Location</th>
                            <th className="p-4 font-medium">Favorite Game</th>
                            <th className="p-4 font-medium">Gamertag</th>
                            <th className="p-4 font-medium">Registered</th>
                            <th className="p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map((participant) => (
                            <tr key={participant.userId} className="border-b border-border hover:bg-muted/30 transition-colors">
                              <td className="p-4 text-white font-medium">{participant.userName}</td>
                              <td className="p-4 text-sm text-muted-foreground">{participant.userEmail}</td>
                              <td className="p-4 text-sm">{participant.location || '-'}</td>
                              <td className="p-4 text-sm">{participant.favoriteGame || '-'}</td>
                              <td className="p-4 text-sm">
                                {participant.gamertag ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md border border-primary/20">
                                    {participant.gamertag}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="p-4 text-sm">
                                {participant.registeredAt ? new Date(participant.registeredAt).toLocaleDateString() : '-'}
                              </td>
                              <td className="p-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeParticipant(viewingParticipants.id, participant.userId)}
                                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                  title="Remove from tournament"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'config' && config && (
          <div className="space-y-6">
            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={saveConfig} disabled={loading} className="gap-2">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Location Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Location Options</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage available locations in signup</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {config.locationOptions?.map((location: string, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                      <span className="text-white">{location}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConfigOption('locationOptions', index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="pt-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('newLocation') as HTMLInputElement;
                        addConfigOption('locationOptions', input.value);
                        input.value = '';
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        name="newLocation"
                        placeholder="Add new location..."
                        className="flex-1"
                      />
                      <Button type="submit" size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>

              {/* Game Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Game Options</CardTitle>
                  <p className="text-sm text-muted-foreground">Manage available games in signup</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {config.gameOptions?.map((game: string, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                      <span className="text-white">{game}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConfigOption('gameOptions', index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="pt-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const input = e.currentTarget.elements.namedItem('newGame') as HTMLInputElement;
                        addConfigOption('gameOptions', input.value);
                        input.value = '';
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        name="newGame"
                        placeholder="Add new game..."
                        className="flex-1"
                      />
                      <Button type="submit" size="sm" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardManagement accessToken={accessToken} />
        )}
      </div>
    </div>
  );
}

// Leaderboard Management Component
function LeaderboardManagement({ accessToken }: { accessToken: string }) {
  const [selectedGame, setSelectedGame] = useState('');
  const [games, setGames] = useState<string[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPoints, setEditPoints] = useState('');
  const [editWins, setEditWins] = useState('');

  // Fetch available games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/top-games`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const gameNames = data.games.map((g: any) => g.game);
          setGames(gameNames);
          if (gameNames.length > 0) {
            setSelectedGame(gameNames[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchGames();
  }, []);

  // Fetch leaderboard for selected game
  useEffect(() => {
    if (!selectedGame) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/leaderboard/${encodeURIComponent(selectedGame)}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setLeaderboard(data.leaderboard || []);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedGame, accessToken]);

  const handleEdit = (userId: string, currentPoints: number, currentWins: number) => {
    setEditingUser(userId);
    setEditPoints(currentPoints.toString());
    setEditWins(currentWins.toString());
  };

  const handleSave = async (userId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/update-player-stats`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            game: selectedGame,
            points: parseInt(editPoints) || 0,
            wins: parseInt(editWins) || 0,
          }),
        }
      );

      if (response.ok) {
        // Refresh leaderboard
        const refreshResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/admin/leaderboard/${encodeURIComponent(selectedGame)}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setLeaderboard(data.leaderboard || []);
        }
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating player stats:', error);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditPoints('');
    setEditWins('');
  };

  return (
    <div className="space-y-6">
      {/* Game Selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Select Game:</label>
        <Select value={selectedGame} onValueChange={setSelectedGame}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Choose a game" />
          </SelectTrigger>
          <SelectContent>
            {games.map((game) => (
              <SelectItem key={game} value={game}>
                {game}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {selectedGame ? `${selectedGame} Leaderboard` : 'Leaderboard'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            View and manage player rankings and statistics
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="p-4 font-medium">Rank</th>
                  <th className="p-4 font-medium">Player</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Wins</th>
                  <th className="p-4 font-medium">Points</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading leaderboard...
                    </td>
                  </tr>
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No players on leaderboard yet
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((player, index) => (
                    <tr key={player.userId} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-white font-medium">#{index + 1}</td>
                      <td className="p-4 text-white font-medium">{player.player}</td>
                      <td className="p-4 text-sm text-muted-foreground">{player.email}</td>
                      <td className="p-4">
                        {editingUser === player.userId ? (
                          <Input
                            type="number"
                            value={editWins}
                            onChange={(e) => setEditWins(e.target.value)}
                            className="w-20"
                          />
                        ) : (
                          <span className="text-white">{player.wins}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingUser === player.userId ? (
                          <Input
                            type="number"
                            value={editPoints}
                            onChange={(e) => setEditPoints(e.target.value)}
                            className="w-20"
                          />
                        ) : (
                          <span className="text-white font-medium">{player.points}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingUser === player.userId ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSave(player.userId)}
                              className="gap-1"
                            >
                              <Save className="w-3 h-3" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancel}
                              className="gap-1"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(player.userId, player.points, player.wins)}
                            className="gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}