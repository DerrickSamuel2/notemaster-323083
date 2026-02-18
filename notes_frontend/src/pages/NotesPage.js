import React, { useEffect, useMemo, useState } from 'react';
import { NoteEditorModal } from '../ui/NoteEditorModal';
import { TagSidebar } from '../ui/TagSidebar';
import { NotesList } from '../ui/NotesList';

// PUBLIC_INTERFACE
export function NotesPage({ api, me }) {
  /** Main notes UI: sidebar tags + list + editor modal. */
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState([]);

  const [selectedTagId, setSelectedTagId] = useState(null);
  const [q, setQ] = useState('');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [favoritedOnly, setFavoritedOnly] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const filtersLabel = useMemo(() => {
    const bits = [];
    if (selectedTagId) bits.push('tag');
    if (q) bits.push('search');
    if (pinnedOnly) bits.push('pinned');
    if (favoritedOnly) bits.push('favorite');
    return bits.length ? bits.join(' • ') : 'all';
  }, [selectedTagId, q, pinnedOnly, favoritedOnly]);

  async function refresh() {
    setBusy(true);
    setError(null);
    try {
      const [tagsRes, notesRes] = await Promise.all([
        api.listTags(),
        api.listNotes({
          q,
          tagId: selectedTagId,
          pinnedOnly,
          favoritedOnly,
        }),
      ]);
      setTags(tagsRes);
      setNotes(notesRes);
    } catch (err) {
      setError(err.message || 'Failed to load notes');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTagId, pinnedOnly, favoritedOnly]);

  useEffect(() => {
    const t = setTimeout(() => {
      refresh();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function handleSave(noteDraft) {
    const payload = {
      title: noteDraft.title,
      content: noteDraft.content,
      tag_ids: noteDraft.tag_ids,
    };

    if (editingNote) {
      await api.updateNote(editingNote.id, payload);
    } else {
      await api.createNote(payload);
    }

    setEditorOpen(false);
    setEditingNote(null);
    await refresh();
  }

  async function handleDelete(noteId) {
    await api.deleteNote(noteId);
    await refresh();
  }

  async function handleTogglePin(noteId) {
    await api.togglePin(noteId);
    await refresh();
  }

  async function handleToggleFavorite(noteId) {
    await api.toggleFavorite(noteId);
    await refresh();
  }

  async function handleCreateTag(name) {
    const t = await api.createTag(name);
    setTags((prev) => [t, ...prev]);
  }

  async function handleDeleteTag(tagId) {
    await api.deleteTag(tagId);
    if (selectedTagId === tagId) setSelectedTagId(null);
    await refresh();
  }

  return (
    <div className="NotesLayout">
      <aside className="Sidebar">
        <TagSidebar
          me={me}
          tags={tags}
          selectedTagId={selectedTagId}
          onSelectTagId={setSelectedTagId}
          onCreateTag={handleCreateTag}
          onDeleteTag={handleDeleteTag}
        />
      </aside>

      <section className="Content">
        <div className="Toolbar">
          <div className="Toolbar-left">
            <div className="H2">Notes</div>
            <div className="Muted Small">Showing: {filtersLabel}</div>
          </div>

          <div className="Toolbar-right">
            <div className="ToggleGroup" role="group" aria-label="Filters">
              <button
                type="button"
                className={`btn btn-ghost ${pinnedOnly ? 'is-active' : ''}`}
                onClick={() => setPinnedOnly((v) => !v)}
              >
                Pinned
              </button>
              <button
                type="button"
                className={`btn btn-ghost ${favoritedOnly ? 'is-active' : ''}`}
                onClick={() => setFavoritedOnly((v) => !v)}
              >
                Favorite
              </button>
            </div>

            <button
              className="btn btn-primary"
              type="button"
              onClick={() => {
                setEditingNote(null);
                setEditorOpen(true);
              }}
            >
              New note
            </button>
          </div>
        </div>

        <div className="SearchRow">
          <input
            className="Input"
            placeholder="Search notes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search notes"
          />
        </div>

        {error ? <div className="Alert" role="alert">{error}</div> : null}
        {busy ? <div className="Muted">Loading…</div> : null}

        <NotesList
          notes={notes}
          tagsById={Object.fromEntries(tags.map((t) => [t.id, t]))}
          onEdit={(note) => {
            setEditingNote(note);
            setEditorOpen(true);
          }}
          onDelete={handleDelete}
          onTogglePin={handleTogglePin}
          onToggleFavorite={handleToggleFavorite}
        />
      </section>

      <NoteEditorModal
        open={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSave}
        note={editingNote}
        tags={tags}
      />
    </div>
  );
}
