import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/client';
import { ThumbsUp, MessageSquare, ArrowRight, Layout } from 'lucide-react';

export default function Roadmap() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/features');
      setFeatures(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load roadmap.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">Loading roadmap...</div>;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-red-500">{error}</div>;

  const planned = features.filter(f => f.status === 'Planned');
  const inProgress = features.filter(f => f.status === 'In Progress');
  const completed = features.filter(f => f.status === 'Completed');

  const Column = ({ title, items, bgColor, borderColor, titleColor }) => (
    <div className={`flex-1 min-w-[300px] bg-slate-50 rounded-xl p-4 border ${borderColor}`}>
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className={`font-bold text-sm uppercase tracking-wider ${titleColor}`}>{title}</h3>
        <span className="bg-white text-slate-500 text-xs font-bold px-2 py-1 rounded-full shadow-sm">{items.length}</span>
      </div>
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <div className="text-sm text-slate-400 text-center py-8">No items yet</div>
        ) : (
          items.map(feature => (
            <Link key={feature._id} to={`/features/${feature._id}`} 
              className={`block bg-white p-4 rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow ${bgColor} hover:border-transparent`}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{feature.category}</span>
                <span className="text-xs text-slate-400">{new Date(feature.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-2 line-clamp-2">{feature.title}</h4>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5" /> {feature.upvoteCount || 0}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {feature.commentCount || 0}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-brand-100 rounded-full mb-4 text-brand-600">
          <Layout className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Public Roadmap</h1>
        <p className="text-lg text-slate-600">See what we're working on, what's coming next, and what we've recently shipped.</p>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
        <Column title="Planned" items={planned} 
          bgColor="hover:ring-2 hover:ring-blue-400 hover:ring-offset-1" 
          borderColor="border-slate-200" titleColor="text-slate-600" />
        <Column title="In Progress" items={inProgress} 
          bgColor="hover:ring-2 hover:ring-amber-400 hover:ring-offset-1" 
          borderColor="border-amber-200" titleColor="text-amber-600" />
        <Column title="Completed" items={completed} 
          bgColor="hover:ring-2 hover:ring-emerald-400 hover:ring-offset-1" 
          borderColor="border-emerald-200" titleColor="text-emerald-600" />
      </div>
    </div>
  );
}