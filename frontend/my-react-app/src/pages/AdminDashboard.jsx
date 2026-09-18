import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';
import { LayoutDashboard, Users, MessageSquare, List, Activity, Trash2, Edit } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [features, setFeatures] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('features'); // features, users, stats

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, featuresRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/features'),
        API.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setFeatures(featuresRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error fetching admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await API.patch(`/admin/features/${id}/status`, { status: newStatus });
      setFeatures(features.map(f => f._id === id ? { ...f, status: newStatus } : f));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteFeature = async (id) => {
    if (!window.confirm('Delete this feature? This cannot be undone.')) return;
    try {
      await API.delete(`/admin/features/${id}`);
      setFeatures(features.filter(f => f._id !== id));
    } catch (err) {
      alert('Failed to delete feature');
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading admin data...</div>;

  const TabButton = ({ id, icon: Icon, label }) => (
    <button onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
        activeTab === id ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
      }`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8 text-brand-600" /> Admin Dashboard
        </h1>
        <p className="text-slate-500 mt-2">Manage feature requests, users, and site settings.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><List className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Total Features</p><p className="text-2xl font-bold text-slate-900">{stats?.totalFeatures || 0}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Users className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Total Users</p><p className="text-2xl font-bold text-slate-900">{stats?.totalUsers || 0}</p></div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><MessageSquare className="w-6 h-6" /></div>
          <div><p className="text-sm font-medium text-slate-500">Total Comments</p><p className="text-2xl font-bold text-slate-900">{stats?.totalComments || 0}</p></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        <TabButton id="features" icon={List} label="Features" />
        <TabButton id="users" icon={Users} label="Users" />
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'features' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {features.map(f => (
                  <tr key={f._id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <p className="font-medium text-slate-900 line-clamp-1">{f.title}</p>
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">{f.category}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{f.author?.name || 'Unknown'}</td>
                    <td className="p-4">
                      <select 
                        value={f.status} 
                        onChange={(e) => updateStatus(f._id, e.target.value)}
                        className="text-sm border border-slate-200 rounded p-1 text-slate-700 bg-white focus:outline-brand-500">
                        <option value="Under Review">Under Review</option>
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{new Date(f.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => navigate(`/projects/${f.project?._id || 'unknown'}/features/${f._id}`)} className="text-blue-600 hover:text-blue-800 p-1 mr-2"><Edit className="w-4 h-4 inline" /></button>
                      <button onClick={() => deleteFeature(f._id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="w-4 h-4 inline" /></button>
                    </td>
                  </tr>
                ))}
                {features.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500">No features found</td></tr>}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Verified</th>
                  <th className="p-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="p-4 font-medium text-slate-900">{u.name}</td>
                    <td className="p-4 text-sm text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {u.isVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
