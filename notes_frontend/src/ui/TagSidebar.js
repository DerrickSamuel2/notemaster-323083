import React, { useMemo, useState } from 'react';

// PUBLIC_INTERFACE
export function TagSidebar({
  me,
  tags,
  selectedTagId,
  onSelectTagId,
  onCreateTag,
  onDeleteTag,
}) {
  /** Tag sidebar: list + create + select. */
  const [newTag, setNewTag] = useState('');
  const [err, setErr] = useState(null);

  const tagCount = tags.length;

  const selectedLabel = useMemo(() => {
    if (!selectedTagId) return 'All notes';
    const t = tags.find((x) => x.id === selectedTagId);
    return t ? `Tag: ${t.name}` : 'Tag';
  }, [selectedTagId, tags]);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    const name = newTag.trim();
    if (!name) return;
    try {
      await onCreateTag(name);
      setNewTag('');
    } catch (error) {
      setErr(error.message || 'Failed to create tag');
    }
  }

  return (
    <div className="SidebarInner">
      <div className="SidebarHeader">
        <div className="H2">Tags</div>
        <div className="Muted Small">{tagCount} total</div>
      </div>

      {me ? <div className="Muted Small">Signed in as {me.email}</div> : null}

      <button
        type="button"
        className={`SidebarItem ${!selectedTagId ? 'is-active' : ''}`}
        onClick={() => onSelectTagId(null)}
        aria-current={!selectedTagId ? 'true' : 'false'}
      >
        <span className="Dot Dot-all" aria-hidden="true" />
        All notes
      </button>

      <div className="SidebarList" aria-label="Tag list">
        {tags.map((t) => (
          <div className="SidebarRow" key={t.id}>
            <button
              type="button"
              className={`SidebarItem ${selectedTagId === t.id ? 'is-active' : ''}`}
              onClick={() => onSelectTagId(t.id)}
              aria-current={selectedTagId === t.id ? 'true' : 'false'}
              title={t.name}
            >
              <span className="Dot" aria-hidden="true" />
              <span className="Ellipsis">{t.name}</span>
            </button>
            <button
              type="button"
              className="IconBtn"
              title="Delete tag"
              aria-label={`Delete tag ${t.name}`}
              onClick={() => onDeleteTag(t.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="SidebarFooter">
        <div className="Muted Small">{selectedLabel}</div>

        {err ? <div className="Alert" role="alert">{err}</div> : null}

        <form onSubmit={submit} className="Row">
          <input
            className="Input"
            placeholder="New tag…"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            maxLength={32}
            aria-label="New tag name"
          />
          <button className="btn btn-accent" type="submit">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
