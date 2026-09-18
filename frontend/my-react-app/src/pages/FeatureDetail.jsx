import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/client';
import ReactMarkdown from 'react-markdown';
import EditFeatureModal from '../components/EditFeatureModal';
import {
  ThumbsUp, MessageSquare, ArrowLeft, Calendar, User,
  Edit2, Trash2, AlertCircle, Send, Reply, MoreVertical
} from 'lucide-react';

export default function FeatureDetail() {
  const { id, projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [feature, setFeature] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Comment form
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchFeature();
    fetchComments();
  }, [id]);

  const fetchFeature = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/features/${id}`);
      setFeature(data);
      setUpvotes(data.upvoteCount || 0);
      setHasUpvoted(data.upvotes?.some(uid => uid.toString() === user?.id));
    } catch (err) {
      setError(err.response?.data?.message || 'Feature not found.');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await API.get(`/features/${id}/comments`);
      setComments(data);
    } catch { }
  };

  const handleUpvote = async () => {
    if (!user) return navigate('/login');
    const prev = upvotes; const prevS = hasUpvoted;
    setUpvotes(hasUpvoted ? upvotes - 1 : upvotes + 1);
    setHasUpvoted(!hasUpvoted);
    try {
      const { data } = await API.post(`/features/${id}/upvote`);
      setUpvotes(data.upvoteCount); setHasUpvoted(data.isUpvoted);
    } catch { setUpvotes(prev); setHasUpvoted(prevS); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this feature request permanently?')) return;
    try {
      setDeleting(true);
      await API.delete(`/features/${id}`);
      navigate(`/projects/${projectId}/features`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
      setDeleting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) return navigate('/login');
    try {
      setSubmittingComment(true);
      const { data } = await API.post(`/features/${id}/comments`, {
        content: commentText.trim(),
        parentComment: replyTo || undefined
      });
      setComments(prev => [...prev, data]);
      setCommentText('');
      setReplyTo(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      const { data } = await API.put(`/features/${id}/comments/${commentId}`, { content: editText.trim() });
      setComments(prev => prev.map(c => c._id === commentId ? data : c));
      setEditingComment(null); setEditText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/features/${id}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const statusColors = {
    'Under Review': 'bg-slate-100 text-slate-700 border-slate-200',
    'Planned': 'bg-blue-50 text-blue-700 border-blue-200',
    'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">Loading...</div>;
  }

  if (error || !feature) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 mb-2">{error || 'Not Found'}</h2>
        <Link to={`/projects/${projectId}/features`} className="text-sm text-brand-600 hover:underline">&larr; Back</Link>
      </div>
    );
  }

  const isAuthor = user && (user.id === feature.author?._id || user.role === 'admin');

  // Build threaded comments
  const topLevel = comments.filter(c => !c.parentComment);
  const replies = comments.filter(c => c.parentComment);
  const getReplies = (parentId) => replies.filter(r => r.parentComment === parentId);

  const CommentItem = ({ comment, depth = 0 }) => {
    const isOwn = user && (user.id === comment.author?._id || user.role === 'admin');
    const childReplies = getReplies(comment._id);
    return (
      <div className={`${depth > 0 ? 'ml-6 border-l-2 border-slate-100 pl-4' : ''}`}>
        <div className="py-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-800">{comment.author?.name || 'User'}</span>
              <span className="text-slate-400">
                {new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            {isOwn && editingComment !== comment._id && (
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditingComment(comment._id); setEditText(comment.content); }}
                  className="text-slate-400 hover:text-slate-600 p-1" title="Edit">
                  <Edit2 className="w-3 h-3" />
                </button>
                <button onClick={() => handleDeleteComment(comment._id)}
                  className="text-slate-400 hover:text-red-500 p-1" title="Delete">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {editingComment === comment._id ? (
            <div className="flex gap-2 mt-1">
              <input type="text" value={editText} onChange={e => setEditText(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:border-brand-500" />
              <button onClick={() => handleEditComment(comment._id)}
                className="px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded hover:bg-brand-700">Save</button>
              <button onClick={() => setEditingComment(null)}
                className="px-3 py-1.5 border border-slate-200 text-xs font-medium rounded hover:bg-slate-50">Cancel</button>
            </div>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed">{comment.content}</p>
          )}

          {user && depth < 2 && (
            <button onClick={() => { setReplyTo(comment._id); setCommentText(''); }}
              className="mt-1.5 text-xs text-slate-400 hover:text-brand-600 font-medium inline-flex items-center gap-1">
              <Reply className="w-3 h-3" /> Reply
            </button>
          )}
        </div>
        {childReplies.map(r => <CommentItem key={r._id} comment={r} depth={depth + 1} />)}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to={`/projects/${projectId}/features`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Feature Requests
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-xs">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-2.5 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusColors[feature.status] || ''}`}>
                {feature.status}
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200 font-medium">
                {feature.category}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-3">{feature.title}</h1>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{feature.author?.name || 'User'}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{new Date(feature.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <button onClick={handleUpvote}
            className={`flex md:flex-col items-center justify-center gap-1.5 px-4 py-2.5 md:p-3 rounded-lg border text-sm font-semibold transition self-start ${hasUpvoted ? 'bg-brand-50 border-brand-500 text-brand-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
            <ThumbsUp className={`w-5 h-5 ${hasUpvoted ? 'fill-brand-600' : ''}`} />
            <span>{upvotes}</span>
          </button>
        </div>

        {/* Description */}
        <div className="py-6 border-b border-slate-100">
          <div className="text-slate-800 text-sm leading-relaxed prose prose-slate max-w-none">
            <ReactMarkdown>{feature.description}</ReactMarkdown>
          </div>
        </div>

        {/* Author actions */}
        <div className="pt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <MessageSquare className="w-4 h-4" /><span>{comments.length} Comments</span>
          </div>
          {isAuthor && (
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50">
                <Trash2 className="w-3.5 h-3.5" /> {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Discussion</h2>

        {/* Comment form */}
        {user ? (
          <form onSubmit={handleAddComment} className="mb-6">
            {replyTo && (
              <div className="mb-2 text-xs text-slate-500 flex items-center gap-2">
                <Reply className="w-3 h-3" />
                Replying to a comment
                <button type="button" onClick={() => setReplyTo(null)} className="text-red-500 font-medium hover:underline">Cancel</button>
              </div>
            )}
            <div className="flex gap-2">
              <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..." required
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500" />
              <button type="submit" disabled={submittingComment}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> {submittingComment ? 'Sending...' : 'Post'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6 text-center py-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-500">
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link> to join the discussion
          </div>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No comments yet. Be the first to share your thoughts.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {topLevel.map(c => <CommentItem key={c._id} comment={c} />)}
          </div>
        )}
      </div>

      {isEditOpen && (
        <EditFeatureModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} feature={feature}
          onUpdated={(updated) => setFeature(updated)} />
      )}
    </div>
  );
}
