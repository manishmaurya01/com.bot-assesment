import { useState } from 'react';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';

export default function FeatureCard({ feature }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upvotes, setUpvotes] = useState(feature.upvoteCount || 0);
  const [hasUpvoted, setHasUpvoted] = useState(feature.upvotes?.includes(user?.id));

  const handleUpvote = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');

    // Optimistic UI update
    const previousVotes = upvotes;
    const previousState = hasUpvoted;

    setUpvotes(hasUpvoted ? upvotes - 1 : upvotes + 1);
    setHasUpvoted(!hasUpvoted);

    try {
      const { data } = await API.post(`/features/${feature._id}/upvote`);
      setUpvotes(data.upvoteCount);
      setHasUpvoted(data.isUpvoted);
    } catch (err) {
      // Rollback on failure
      setUpvotes(previousVotes);
      setHasUpvoted(previousState);
    }
  };

  const statusColors = {
    'Under Review': 'bg-slate-100 text-slate-700 border-slate-200',
    'Planned': 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 hover:border-slate-300 transition shadow-sm flex items-start gap-4">
      <button
        onClick={handleUpvote}
        className={`flex flex-col items-center justify-center p-2.5 min-w-[52px] rounded-md border text-xs font-semibold transition ${
          hasUpvoted
            ? 'bg-brand-50 border-brand-500 text-brand-600'
            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
        }`}
      >
        <ThumbsUp className={`w-4 h-4 mb-1 ${hasUpvoted ? 'fill-brand-600' : ''}`} />
        <span>{upvotes}</span>
      </button>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2 mb-1">
          <Link to={`/features/${feature._id}`} className="font-semibold text-slate-900 hover:text-brand-600 text-base">
            {feature.title}
          </Link>
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusColors[feature.status] || statusColors['Under Review']}`}>
            {feature.status}
          </span>
        </div>

        <p className="text-slate-600 text-sm line-clamp-2 mb-3">{feature.description}</p>

        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{feature.category}</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              {feature.commentCount || 0}
            </span>
          </div>
          <span>By {feature.author?.name || 'User'}</span>
        </div>
      </div>
    </div>
  );
}