import React, { useState, useEffect, useContext } from 'react';
import { StickyNote, Plus, Edit2, Trash2, Lock, Globe } from 'lucide-react';
import { getNotes, createNote, updateNote, deleteNote } from '../../services/noteService';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';

const NotesWidget = ({ entityType, entityId, entityName = '' }) => {
  const { user } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchNotesList = async () => {
    if (!entityType || !entityId) return;
    try {
      setLoading(true);
      const res = await getNotes({ entityType, entityId });
      setNotes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesList();
  }, [entityType, entityId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      if (editingNoteId) {
        await updateNote(editingNoteId, { title, content, isPrivate });
        addToast('Note updated successfully!', 'success');
      } else {
        await createNote({ entityType, entityId, title, content, isPrivate });
        addToast('Note added successfully!', 'success');
      }

      setTitle('');
      setContent('');
      setIsPrivate(false);
      setShowAddForm(false);
      setEditingNoteId(null);
      fetchNotesList();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save note', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (n) => {
    setEditingNoteId(n._id);
    setTitle(n.title);
    setContent(n.content);
    setIsPrivate(n.isPrivate);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      addToast('Note deleted', 'success');
      fetchNotesList();
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed', 'danger');
    }
  };

  return (
    <div className="card" style={{ marginTop: '16px' }}>
      <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 className="flex-row" style={{ fontSize: '1rem', fontWeight: 700, gap: '8px' }}>
          <StickyNote size={18} color="var(--primary)" />
          Notes & Annotations {entityName ? `(${entityName})` : ''} ({notes.length})
        </h4>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            if (showAddForm) {
              setShowAddForm(false);
              setEditingNoteId(null);
            } else {
              setTitle('');
              setContent('');
              setIsPrivate(false);
              setEditingNoteId(null);
              setShowAddForm(true);
            }
          }}
        >
          <Plus size={14} /> {showAddForm ? 'Cancel' : 'Add Note'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSave} style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '10px', marginBottom: '16px' }}>
          <div className="form-group">
            <label className="form-label">Note Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Proofreading Chapter 2 Feedback"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Note Content *</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Enter detailed notes..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="flex-row" style={{ justifyContent: 'space-between', marginTop: '10px' }}>
            <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <Lock size={12} /> Mark as Private Note
            </label>

            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Saving...' : editingNoteId ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading notes...</div>
      ) : notes.length === 0 ? (
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No notes added yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notes.map((n) => {
            const isOwner = n.author?._id === user?.id || n.author?._id === user?._id || user?.role === 'Admin';
            return (
              <div
                key={n._id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div className="flex-row" style={{ gap: '8px' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{n.title}</strong>
                    {n.isPrivate ? <Lock size={12} color="var(--warning)" title="Private" /> : <Globe size={12} color="var(--text-muted)" title="Public" />}
                  </div>

                  {isOwner && (
                    <div className="flex-row" style={{ gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(n)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                        title="Edit Note"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(n._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                        title="Delete Note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', margin: 0 }}>
                  {n.content}
                </p>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  By {n.author?.fullName} ({n.author?.role}) • {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotesWidget;
