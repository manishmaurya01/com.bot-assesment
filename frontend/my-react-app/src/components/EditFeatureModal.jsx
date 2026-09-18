import { useState } from 'react';
import { X, Eye, Edit3, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import API from '../api/client';

export default function EditFeatureModal({ isOpen, onClose, feature, onUpdated }) {
  const [title, setTitle] = useState(feature?.title || '');
  const [category, setCategory] = useState(feature?.category || 'General');
  const [description, setDescription] = useState(feature?.description || '');
  const [activeTab, setActiveTab] = useState('write');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['UI/UX', 'Integrations', 'Performance', 'General'];

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please provide both title and description');
      return;
    }

    try {
      setSubmitting(true);
      const { data } = await API.put(`/features/${feature._id}`, {
        title: title.trim(),
        description: description.trim(),
        category
      });
      onUpdated(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update feature request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Edit Feature Request</h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Title
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:border-brand-500 transition"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Description (Markdown Supported)
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                    activeTab === 'write'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition ${
                    activeTab === 'preview'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {activeTab === 'write' ? (
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:border-brand-500 transition"
              />
            ) : (
              <div className="min-h-[120px] max-h-[220px] overflow-y-auto p-3 border border-slate-200 rounded-lg bg-slate-50 text-sm prose prose-sm max-w-none text-slate-700">
                {description ? (
                  <ReactMarkdown>{description}</ReactMarkdown>
                ) : (
                  <span className="text-slate-400 italic">Nothing to preview.</span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition shadow-sm"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
