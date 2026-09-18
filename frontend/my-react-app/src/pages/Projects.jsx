import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Plus, Folder } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/projects' } } });
      return;
    }
    if (!newTitle.trim()) return;

    try {
      const { data } = await API.post('/projects', {
        title: newTitle,
        description: newDescription
      });
      setProjects([data, ...projects]);
      setIsCreating(false);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 text-sm">Select a project to view its features and roadmap.</p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateProject} className="bg-white p-6 rounded-xl border border-slate-200 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Create New Project</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm"
                placeholder="e.g., Mobile App Redesign"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm"
                placeholder="Briefly describe this project..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-md hover:bg-brand-700 shadow-sm"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm animate-pulse">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 text-slate-500 text-sm">
          <p className="mb-3">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}/features`)}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-600 group-hover:bg-brand-100 transition">
                  <Folder className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-brand-600 transition">{project.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{project.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
