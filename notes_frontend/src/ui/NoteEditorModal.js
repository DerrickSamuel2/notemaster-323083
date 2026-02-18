import React, { useEffect, useMemo, useState } from 'react';

function normalizeNote(note) {
  return {
    title: note?.title || '',
    content: note?.content || '',
    tag_ids: (note?.tags || []).map((t) => t.id),
  };
}

// PUBLIC_INTERFACE
export function NoteEditorModal({ open, onClose, onSave, note, tags }) {
  /** Modal note editor. */
  const isEdit = !!note;
  const [draft, setDraft] = useState(() => normalizeNote(note));
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(normalizeNote(note));
      setErr(null);
      setBusy(false);
    }
  }, [open, note]);

  const title = useMemo(() => (isEdit ? 'Edit note' : 'New note'), [isEdit]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await onSave({
        title: draft.title.trim(),
        content: draft.content,
        tag_ids: draft.tag_ids,
      });
    } catch (error) {
      setErr(error.message || 'Failed to save');
      setBusy(false);
    }
  }

  function toggleTag(tagId) {
    setDraft((d) => {
      const set = new Set(d.tag_ids);
      if (set.has(tagId)) set.delete(tagId);
      else set.add(tagId);
      return { ...d, tag_ids: Array.from(set) };
    });
  }

  return (
    <div className="ModalOverlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="Modal">
        <div className="ModalHeader">
          <div className="H2">{title}</div>
          <button className="IconBtn" type="button" onClick={onClose} aria-label="Close editor">
            ×
          </button>
        </div>

        {err ? <div className="Alert" role="alert">{err}</div> : null}

        <form onSubmit={submit} className="Form">
          <label className="Label">
            Title
            <input
              className="Input"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              placeholder="Note title"
              maxLength={120}
            />
          </label>

          <label className="Label">
            Content
            <textarea
              className="Textarea"
              value={draft.content}
              onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
              placeholder="Write your note…"
              rows={10}
            />
          </label>

          <div className="Label">
            Tags
            <div className="TagSelect">
              {tags?.length ? (
                tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`Pill Pill-tagSelect ${draft.tag_ids.includes(t.id) ? 'is-active' : ''}`}
                    onClick={() => toggleTag(t.id)}
                  >
                    {t.name}
                  </button>
                ))
              ) : (
                <div className="Muted Small">No tags yet. Create one in the sidebar.</div>
              )}
            </div>
          </div>

          <div className="ModalFooter">
            <button className="btn btn-ghost" type="button" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
