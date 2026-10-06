import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Mail,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../common/Button';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      {/* Value Proposition Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 flex items-center justify-center shrink-0 shadow-lg">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free Expedited Shipping</h4>
              <p className="text-xs text-slate-400">On all orders exceeding $100</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">256-Bit Secure Checkout</h4>
              <p className="text-xs text-slate-400">Zero fraud liability guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-950/80 border border-amber-800/60 text-amber-400 flex items-center justify-center shrink-0 shadow-lg">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">30-Day Hassle-Free Returns</h4>
              <p className="text-xs text-slate-400">Instant full refund on return</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-950/80 border border-sky-800/60 text-sky-400 flex items-center justify-center shrink-0 shadow-lg">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Expert Support</h4>
              <p className="text-xs text-slate-400">Dedicated concierge assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white">
                Nexa<span className="text-indigo-400">Cart</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Curating tomorrow's high-performance technology, audio gear, and minimalist lifestyle goods. Designed for modern builders and forward-thinking creators.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Join the Nexa VIP Club
              </h5>
              {isSubscribed ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 p-3 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Welcome aboard! Check your inbox for $20 off.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      placeholder="Enter your work email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  </div>
                  <Button type="submit" size="sm" variant="primary">
                    Join
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Catalog</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/products?category=audio-acoustics" className="hover:text-white transition-colors">Audio & Acoustics</Link></li>
              <li><Link to="/products?category=wearables-smartwatches" className="hover:text-white transition-colors">Wearables</Link></li>
              <li><Link to="/products?category=computing-peripherals" className="hover:text-white transition-colors">Keyboards & Peripherals</Link></li>
              <li><Link to="/products?category=smart-home-living" className="hover:text-white transition-colors">Smart Living</Link></li>
              <li><Link to="/products?category=cameras-optics" className="hover:text-white transition-colors">Creator Cameras</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Order Status</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Shopping Cart</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">Manage Addresses</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Shipping & Returns FAQ</Link></li>
            </ul>
          </div>

          {/* Account & Company */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Platform</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/about" className="hover:text-white transition-colors">About NexaCart</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In / Demo Login</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li>
              <li><span className="text-indigo-400 font-semibold cursor-default">v1.0.0 (Portfolio Edition)</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright & Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} NexaCart Inc. Built with React, Node.js, TypeScript & PostgreSQL.</p>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          <span>•</span>
          <span className="hover:text-slate-400 cursor-pointer">Security Overview</span>
        </div>
      </div>
    </footer>
  );
};
