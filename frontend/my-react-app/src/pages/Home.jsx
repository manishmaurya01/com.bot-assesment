import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
        Shape what we build next.
      </h1>
      <p className="text-slate-600 max-w-xl mx-auto mb-8 text-base leading-relaxed">
        Share a feature idea, vote on requests from other community members, and follow our public roadmap.
      </p>

      <div className="flex justify-center gap-3">
        <Link
          to="/features"
          className="bg-brand-600 text-white font-medium px-5 py-2.5 rounded-md hover:bg-brand-700 transition shadow-sm"
        >
          Submit a Feature
        </Link>
        <Link
          to="/roadmap"
          className="bg-white text-slate-700 font-medium px-5 py-2.5 rounded-md border border-slate-200 hover:bg-slate-50 transition"
        >
          View Roadmap
        </Link>
      </div>
    </div>
  );
}