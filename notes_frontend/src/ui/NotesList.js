import React from 'react';

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return '';
  }
}

// PUBLIC_INTERFACE
export function NotesList({ notes, tagsById, onEdit, onDelete, onTogglePin, onToggleFavorite }) {
  /** List notes cards. */
  if (!notes?.length) {
    return <div className="Empty">No notes found.</div>;
  }

  return (
    <div className="NotesGrid" role="list">
      {notes.map((n) => (
        <article className="NoteCard" key={n.id} role="listitem">
          <div className="NoteCard-top">
            <div className="NoteTitleRow">
              <h3 className="NoteTitle">{n.title || 'Untitled'}</h3>
              <div className="BadgeRow">
                {n.pinned ? <span className="Pill Pill-pin">Pinned</span> : null}
                {n.favorited ? <span className="Pill Pill-fav">Favorite</span> : null}
              </div>
            </div>

            <div className="NoteMeta">
              <span className="Muted Small">Updated {formatDate(n.updated_at)}</span>
            </div>
          </div>

          <div className="NoteContentPreview">
            {n.content ? n.content.slice(0, 240) : <span className="Muted">No content</span>}
            {n.content && n.content.length > 240 ? '…' : ''}
          </div>

          {n.tags?.length ? (
            <div className="TagPills">
              {n.tags.map((t) => (
                <span className="Pill Pill-tag" key={t.id}>
                  {tagsById[t.id]?.name || t.name}
                </span>
              ))}
            </div>
          ) : null}

          <div className="NoteActions">
            <button className="btn btn-ghost" type="button" onClick={() => onTogglePin(n.id)}>
              {n.pinned ? 'Unpin' : 'Pin'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => onToggleFavorite(n.id)}>
              {n.favorited ? 'Unfavorite' : 'Favorite'}
            </button>
            <div className="Spacer" />
            <button className="btn btn-primary" type="button" onClick={() => onEdit(n)}>
              Edit
            </button>
            <button className="btn btn-danger" type="button" onClick={() => onDelete(n.id)}>
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
