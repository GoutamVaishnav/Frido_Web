'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, ShieldAlert, User } from 'lucide-react';
import { formatDateTime } from '@/utils/formatters';
import { useToast } from '@/hooks/useToast';

export function NotesSection({ returnRequestId, notes = [], onNoteAdded }) {
  const { success, error } = useToast();
  const [text, setText] = useState('');
  const [agentName, setAgentName] = useState('Agent Sarah Davis');
  const [submitting, setSubmitting] = useState(false);

  async function handleAddNote(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/returns/${returnRequestId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentName: agentName.trim(),
          text: text.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to add note.');
      }

      success('Note recorded successfully');
      setText('');
      if (onNoteAdded) onNoteAdded(json.data);
    } catch (err) {
      error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Activity & Notes Feed
          </h3>
          <p className="text-xs text-slate-500">
            Immutable log. Notes cannot be edited or deleted once recorded.
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {notes.length} {notes.length === 1 ? 'Entry' : 'Entries'}
        </span>
      </div>

      {/* Chronological Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            No notes recorded yet.
          </p>
        ) : (
          notes.map((note, index) => (
            <div
              key={note.id || index}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-2 relative"
            >
              <div className="flex items-center justify-between text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                    {note.agentName?.charAt(0) || 'A'}
                  </div>
                  <span className="font-semibold text-slate-900">
                    {note.agentName}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {formatDateTime(note.createdAt)}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap pl-8">
                {note.text}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add New Note Form */}
      <form onSubmit={handleAddNote} className="space-y-3 pt-3 border-t border-slate-100">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Add Support Note
          </label>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your observation, customer communications, or resolution details..."
            required
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Posting as:</span>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none w-36"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Posting...' : 'Post Immutable Note'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
