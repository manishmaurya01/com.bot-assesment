import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API from '../api/client';
import FeatureCard from '../components/FeatureCard';
import CreateFeatureModal from '../components/CreateFeatureModal';
import { useAuth } from '../context/AuthContext';
import { Search, Plus } from 'lucide-react';

export default function Features() {
  const [features, setFeatures] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const categories = ['All', 'UI/UX', 'Integrations', 'Performance', 'General'];

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFeatures();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [search, category, sortBy]);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/features', {
        params: { search, category, sortBy, projectId }
      });
      setFeatures(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/features' } } });
      return;
    }
    setIsCreateOpen(true);
  };

  const handleFeatureCreated = (newFeature) => {
    setFeatures((prev) => [newFeature, ...prev]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feature Requests</h1>
          <p className="text-slate-500 text-sm">Vote on existing ideas or submit your own suggestions.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Suggest Feature</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search feature requests by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-500 transition"
          />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:border-brand-500 transition"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="upvotes">Most Upvoted</option>
          <option value="comments">Most Discussed</option>
        </select>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition whitespace-nowrap ${
              category === cat
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm animate-pulse">Loading requests...</div>
      ) : features.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          <p className="mb-3">No feature requests found matching your criteria.</p>
          <button
            onClick={handleOpenCreate}
            className="text-brand-600 font-semibold hover:underline"
          >
            Be the first to suggest one &rarr;
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {features.map((item) => (
            <FeatureCard key={item._id} feature={item} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateFeatureModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleFeatureCreated}
        projectId={projectId}
      />
    </div>
  );
}