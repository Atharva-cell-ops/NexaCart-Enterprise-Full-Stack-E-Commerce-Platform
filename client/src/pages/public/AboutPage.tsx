import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Layers,
  ShieldCheck,
  Cpu,
  Globe2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Built for Creators & Engineers</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Crafting the Future of High-Performance Workspace Tech.
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          NexaCart is an enterprise-grade e-commerce platform built to showcase production-ready full-stack software architecture, scalable PostgreSQL data modeling, and modern responsive UI/UX principles.
        </p>
      </div>

      {/* Tech Stack Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Modern Frontend Core</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Built with React 18, TypeScript, Vite, Tailwind CSS, TanStack Query v5, and React Hook Form for lightning-fast client hydration and resilient state caching.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Decoupled REST API</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Powered by Node.js, Express, and Prisma ORM with strict Zod request schema validation, custom AppError handling, and atomic database transactions.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Enterprise Security</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Stateless JWT authentication, bcrypt password hashing, Role-Based Access Control (RBAC), Helmet HTTP protection, and express-rate-limit brute-force prevention.
          </p>
        </div>
      </div>

      {/* Portfolio Showcase CTA */}
      <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-2xl font-bold tracking-tight">Ready to Test the Platform?</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in with the built-in 1-click Demo Admin or Customer accounts to experience product management, inventory controls, and order processing.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link to="/login">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Try Demo Accounts
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" size="md" className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700">
              Browse Store
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
