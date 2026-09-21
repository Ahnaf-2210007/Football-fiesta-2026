'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, KeyRound, CheckCircle, AlertCircle, X } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const { isAdmin, loginAdmin, logoutAdmin } = useApp();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await loginAdmin(password);
    setLoading(false);

    if (success) {
      setPassword('');
      onClose();
    } else {
      setError('Invalid Admin Master Password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-md glass-panel-gold rounded-2xl p-6 sm:p-8 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-primary-yellow transition-colors p-1"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-primary-yellow/30 pb-4">
          <div className="p-3 bg-primary-yellow/10 rounded-xl border border-primary-yellow/40 text-primary-yellow">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bebas text-3xl tracking-wide text-primary-yellow">Admin Master Control</h3>
            <p className="text-xs text-gray-300 font-montserrat">Enter password to unlock organizer controls</p>
          </div>
        </div>

        {isAdmin ? (
          <div className="space-y-6 text-center py-4">
            <div className="flex flex-col items-center gap-3 bg-teal/10 border border-teal/30 p-4 rounded-xl">
              <CheckCircle className="w-12 h-12 text-teal animate-bounce" />
              <div>
                <p className="font-bebas text-2xl text-teal">Admin Access Active</p>
                <p className="text-xs text-gray-300">You have full permissions to manage auction, teams, scores & rules.</p>
              </div>
            </div>

            <button
              onClick={() => {
                logoutAdmin();
                onClose();
              }}
              className="w-full py-3 bg-fiery-red/80 hover:bg-fiery-red text-white font-bebas tracking-wider text-xl rounded-xl transition-all shadow-glow-red"
            >
              Lock Admin Session
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-300 mb-2">
                Admin Master Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full bg-charcoal/90 border border-light-cyan/30 rounded-xl px-4 py-3 pl-11 text-white placeholder-gray-500 focus:outline-none focus:border-primary-yellow focus:ring-1 focus:ring-primary-yellow"
                  required
                  autoFocus
                />
                <KeyRound className="absolute left-3.5 top-3.5 text-light-cyan w-5 h-5" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-fiery-red text-xs bg-fiery-red/10 border border-fiery-red/30 p-3 rounded-lg">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bebas text-lg rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-primary-yellow via-vibrant-orange to-fiery-red hover:opacity-95 text-charcoal font-bebas text-xl font-bold tracking-wider rounded-xl shadow-glow-yellow transition-all"
              >
                {loading ? 'Authenticating...' : 'Unlock Admin'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
