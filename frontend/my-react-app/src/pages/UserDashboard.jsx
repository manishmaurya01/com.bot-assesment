import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';
import { User, Settings, List, ThumbsUp, MessageSquare } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myFeatures, setMyFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyFeatures();
  }, [user, navigate]);

  const fetchMyFeatures = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/features/my-requests');
      setMyFeatures(data);
    } catch (err) {
      console.error('Error fetching features', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading your dashboard...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Profile Sidebar */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 text-center">{user.name}</h2>
            <p className="text-slate-500 text-sm text-center mb-6">{user.email}</p>
            
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Role</span>
                <span className="font-medium text-slate-900 capitalize">{user.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <span className={`font-medium ${user.isVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {user.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">My Requests</span>
                <span className="font-medium text-slate-900">{myFeatures.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <List className="w-5 h-5 text-brand-600" /> My Feature Requests
              </h3>
              <Link to="/projects" className="text-sm text-brand-600 hover:underline font-medium">
                Browse Projects
              </Link>
            </div>
            
            <div className="divide-y divide-slate-100">
              {myFeatures.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <p className="mb-4">You haven't submitted any feature requests yet.</p>
                  <Link to="/projects" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium transition-colors">
                    Browse Projects
                  </Link>
                </div>
              ) : (
                myFeatures.map(f => (
                  <Link key={f._id} to={`/projects/${f.project?._id || 'unknown'}/features/${f._id}`} className="block p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-slate-900">{f.title}</h4>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        {f.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{f.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {f.upvoteCount || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {f.commentCount || 0}</span>
                      <span>{new Date(f.createdAt).toLocaleDateString()}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
