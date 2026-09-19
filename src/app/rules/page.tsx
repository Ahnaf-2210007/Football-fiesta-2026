'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TournamentRule } from '@/types';
import { 
  BookOpen, 
  Plus, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  Lock, 
  CheckCircle2, 
  ShieldAlert, 
  X,
  FileText
} from 'lucide-react';

export default function RulesPage() {
  const { isAdmin, rules, addRule, updateRule, deleteRule, resetRulesToDefault } = useApp();

  // Add rule state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'BUDGET' | 'SQUAD' | 'BIDDING' | 'MATCH' | 'GENERAL'>('BUDGET');

  // Edit rule state
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState<'BUDGET' | 'SQUAD' | 'BIDDING' | 'MATCH' | 'GENERAL'>('BUDGET');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    addRule({
      title: newTitle,
      description: newDesc,
      category: newCategory
    });

    setNewTitle('');
    setNewDesc('');
    setIsAddModalOpen(false);
  };

  const startEdit = (rule: TournamentRule) => {
    setEditingRuleId(rule.id);
    setEditTitle(rule.title);
    setEditDesc(rule.description);
    setEditCategory(rule.category);
  };

  const handleEditSave = (ruleId: string) => {
    updateRule({
      id: ruleId,
      title: editTitle,
      description: editDesc,
      category: editCategory
    });
    setEditingRuleId(null);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'BUDGET': return 'bg-primary-yellow/20 text-primary-yellow border-primary-yellow/30';
      case 'SQUAD': return 'bg-teal/20 text-teal border-teal/30';
      case 'BIDDING': return 'bg-vibrant-orange/20 text-vibrant-orange border-vibrant-orange/30';
      case 'MATCH': return 'bg-light-cyan/20 text-light-cyan border-light-cyan/30';
      default: return 'bg-gray-800 text-gray-300';
    }
  };

  return (
    <div className="visual-rally rally-rules max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-primary-yellow to-vibrant-orange rounded-xl text-charcoal shadow-glow-yellow">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-bebas text-5xl text-white tracking-wide">RULES & REGULATIONS</h1>
            <p className="text-xs text-light-cyan font-montserrat">Official departmental rulebook for auction bidding, squad composition, and match scoring</p>
          </div>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-primary-yellow text-charcoal font-bebas text-lg font-bold rounded-xl shadow-glow-yellow hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus size={18} />
              <span>Add New Rule</span>
            </button>

            <button
              onClick={resetRulesToDefault}
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bebas text-lg rounded-xl border border-gray-700 transition-all flex items-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Reset Rules to Default</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-charcoal/80 px-4 py-2 rounded-xl border border-gray-700">
            <Lock size={16} className="text-primary-yellow" />
            <span>Admin login required to edit rules</span>
          </div>
        )}
      </div>

      {/* Rules List */}
      <div className="space-y-6">
        {rules.map((rule, idx) => {
          const isEditing = editingRuleId === rule.id;

          return (
            <div
              key={rule.id}
              className="glass-panel p-6 rounded-2xl space-y-4 hover:border-primary-yellow/40 transition-all relative group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-deep-blue border border-primary-yellow/30 flex items-center justify-center font-bebas text-2xl text-primary-yellow shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bebas text-2xl text-white">{rule.title}</h3>
                      <span className={`text-[10px] font-bebas px-2 py-0.5 rounded border ${getCategoryBadge(rule.category)}`}>
                        {rule.category}
                      </span>
                    </div>
                  </div>
                </div>

                {isAdmin && !isEditing && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(rule)}
                      className="p-2 bg-charcoal hover:bg-primary-yellow hover:text-charcoal text-gray-300 rounded-lg border border-gray-700 transition-colors"
                      title="Edit Rule"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 bg-charcoal hover:bg-fiery-red text-white rounded-lg border border-gray-700 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="p-4 bg-charcoal/95 border border-primary-yellow/40 rounded-xl space-y-3">
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Rule Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className="w-full bg-deep-blue border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-primary-yellow focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Rule Category</label>
                    <select
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value as any)}
                      className="w-full bg-deep-blue border border-gray-700 rounded px-3 py-2 text-xs text-white focus:border-primary-yellow focus:outline-none"
                    >
                      <option value="BUDGET">BUDGET</option>
                      <option value="SQUAD">SQUAD</option>
                      <option value="BIDDING">BIDDING</option>
                      <option value="MATCH">MATCH</option>
                      <option value="GENERAL">GENERAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">Rule Description</label>
                    <textarea
                      rows={3}
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      className="w-full bg-deep-blue border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-primary-yellow focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setEditingRuleId(null)}
                      className="px-3 py-1.5 bg-gray-800 text-xs text-gray-300 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleEditSave(rule.id)}
                      className="px-4 py-1.5 bg-primary-yellow text-charcoal font-bebas text-base font-bold rounded hover:opacity-90"
                    >
                      Save Rule Changes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 text-sm leading-relaxed font-montserrat pl-13">
                  {rule.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Rule Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-lg glass-panel-gold rounded-3xl p-8 text-white space-y-6">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 border-b border-primary-yellow/30 pb-4">
              <FileText className="w-8 h-8 text-primary-yellow" />
              <div>
                <h3 className="font-bebas text-3xl text-primary-yellow">Add Custom Rule</h3>
                <p className="text-xs text-gray-300">Add a new tournament regulation to the public rulebook</p>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Rule Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Yellow Card Penalty Fine"
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary-yellow focus:outline-none"
                >
                  <option value="BUDGET">BUDGET</option>
                  <option value="SQUAD">SQUAD</option>
                  <option value="BIDDING">BIDDING</option>
                  <option value="MATCH">MATCH</option>
                  <option value="GENERAL">GENERAL</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Rule Description</label>
                <textarea
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Provide full description of the regulation..."
                  className="w-full bg-deep-blue border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-yellow focus:outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-800 text-gray-300 font-bebas text-lg rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary-yellow text-charcoal font-bebas text-xl font-bold rounded-xl shadow-glow-yellow"
                >
                  Add Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
