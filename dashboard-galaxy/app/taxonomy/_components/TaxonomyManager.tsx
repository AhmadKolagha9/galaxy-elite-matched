"use client"

import { useMemo, useState } from 'react'
import { slugifyControlValue, taxonomyTypeOptions, type ControlTaxonomyItem, type TaxonomyMutationPayload, type TaxonomyType } from '@/lib/control-model'

type SaveState = 'idle' | 'saving' | 'archiving'

type FormState = TaxonomyMutationPayload & { slugTouched: boolean }

const emptyForm: FormState = {
  taxonomyType: 'country',
  label: '',
  slug: '',
  parentId: null,
  countryScope: null,
  isActive: true,
  sortOrder: 0,
  slugTouched: false
}

function cloneItem(item: ControlTaxonomyItem): ControlTaxonomyItem {
  return { ...item, children: [] }
}

function buildTaxonomyTree(items: ControlTaxonomyItem[]) {
  const byId = new Map<string, ControlTaxonomyItem>()
  const roots: ControlTaxonomyItem[] = []

  items.forEach((item) => byId.set(item.id, cloneItem(item)))
  byId.forEach((item) => {
    if (item.parentId && byId.has(item.parentId)) byId.get(item.parentId)!.children!.push(item)
    else roots.push(item)
  })

  const sortItems = (nodes: ControlTaxonomyItem[]) => {
    nodes.sort((a, b) => a.taxonomyType.localeCompare(b.taxonomyType) || a.sortOrder - b.sortOrder || a.label.localeCompare(b.label))
    nodes.forEach((node) => sortItems(node.children || []))
  }
  sortItems(roots)
  return roots
}

function descendantIds(items: ControlTaxonomyItem[], id?: string) {
  if (!id) return new Set<string>()
  const childrenByParent = new Map<string, string[]>()
  items.forEach((item) => {
    if (!item.parentId) return
    const children = childrenByParent.get(item.parentId) || []
    children.push(item.id)
    childrenByParent.set(item.parentId, children)
  })
  const ids = new Set<string>()
  const visit = (parentId: string) => {
    for (const childId of childrenByParent.get(parentId) || []) {
      ids.add(childId)
      visit(childId)
    }
  }
  visit(id)
  return ids
}

function TaxonomyTreeNode({ item, level, onEdit }: { item: ControlTaxonomyItem; level: number; onEdit: (item: ControlTaxonomyItem) => void }) {
  return (
    <li className="taxonomy-node" style={{ ['--taxonomy-depth' as string]: level }}>
      <div className="taxonomy-node-row">
        <span className={item.isActive ? 'taxonomy-dot active' : 'taxonomy-dot inactive'} />
        <div>
          <strong>{item.label}</strong>
          <span>{item.taxonomyType} / {item.slug}{item.countryScope ? ` / ${item.countryScope}` : ''}</span>
        </div>
        <button className="button button-outline button-small" type="button" onClick={() => onEdit(item)}>Edit</button>
      </div>
      {item.children?.length ? <ul>{item.children.map((child) => <TaxonomyTreeNode key={child.id} item={child} level={level + 1} onEdit={onEdit} />)}</ul> : null}
    </li>
  )
}

export function TaxonomyManager({ initialItems }: { initialItems: ControlTaxonomyItem[] }) {
  const [items, setItems] = useState(initialItems)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [state, setState] = useState<SaveState>('idle')
  const [message, setMessage] = useState('')

  const tree = useMemo(() => buildTaxonomyTree(items), [items])
  const blockedParents = useMemo(() => descendantIds(items, form.id), [form.id, items])
  const parentOptions = items.filter((item) => item.id !== form.id && !blockedParents.has(item.id) && item.taxonomyType === form.taxonomyType)
  const disabled = state !== 'idle'

  function updateLabel(label: string) {
    setForm((current) => ({ ...current, label, slug: current.slugTouched ? current.slug : slugifyControlValue(label) }))
  }

  function editItem(item: ControlTaxonomyItem) {
    setMessage('')
    setForm({
      id: item.id,
      taxonomyType: item.taxonomyType,
      label: item.label,
      slug: item.slug,
      parentId: item.parentId,
      countryScope: item.countryScope,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
      slugTouched: true
    })
  }

  function resetForm() {
    setMessage('')
    setForm(emptyForm)
  }

  async function save() {
    setMessage('')
    if (!form.label.trim() || !form.slug.trim()) {
      setMessage('Label and slug are required.')
      return
    }
    setState('saving')
    try {
      const response = await fetch(form.id ? `/api/control/taxonomy/${encodeURIComponent(form.id)}` : '/api/control/taxonomy', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form)
      })
      const body = (await response.json().catch(() => null)) as { ok?: boolean; item?: ControlTaxonomyItem; error?: string } | null
      if (!response.ok || body?.ok === false || !body?.item) throw new Error(body?.error || 'Could not save taxonomy item.')
      setItems((current) => {
        const exists = current.some((item) => item.id === body.item!.id)
        return exists ? current.map((item) => item.id === body.item!.id ? body.item! : item) : [body.item!, ...current]
      })
      setMessage('Taxonomy item saved and cache invalidated.')
      setForm({ ...emptyForm, taxonomyType: form.taxonomyType })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save taxonomy item.')
    } finally {
      setState('idle')
    }
  }

  async function archive() {
    if (!form.id) return
    setMessage('')
    setState('archiving')
    try {
      const response = await fetch(`/api/control/taxonomy/${encodeURIComponent(form.id)}`, { method: 'DELETE' })
      const body = (await response.json().catch(() => null)) as { ok?: boolean; item?: ControlTaxonomyItem; error?: string } | null
      if (!response.ok || body?.ok === false || !body?.item) throw new Error(body?.error || 'Could not archive taxonomy item.')
      setItems((current) => current.map((item) => item.id === body.item!.id ? body.item! : item))
      setMessage('Taxonomy item archived.')
      resetForm()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not archive taxonomy item.')
    } finally {
      setState('idle')
    }
  }

  return (
    <section className="taxonomy-workspace">
      <article className="admin-card taxonomy-tree-panel">
        <div className="section-heading-inline">
          <div><p className="eyebrow">Recursive tree</p><h2>Dropdown hierarchy</h2></div>
          <span>{items.length} options</span>
        </div>
        <ul className="taxonomy-tree">
          {tree.map((item) => <TaxonomyTreeNode key={item.id} item={item} level={0} onEdit={editItem} />)}
        </ul>
        {!tree.length ? <p className="form-note">No taxonomy items returned from the backend.</p> : null}
      </article>
      <article className="admin-card action-panel taxonomy-editor-panel">
        <div className="section-heading-inline">
          <div><p className="eyebrow">SuperAdmin editor</p><h2>{form.id ? 'Edit option' : 'Create option'}</h2></div>
          <button className="button button-outline button-small" type="button" disabled={disabled} onClick={resetForm}>New</button>
        </div>
        <label>Type<select value={form.taxonomyType} disabled={disabled || Boolean(form.id)} onChange={(event) => setForm((current) => ({ ...current, taxonomyType: event.target.value as TaxonomyType, parentId: null }))}>{taxonomyTypeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label>Label<input value={form.label} disabled={disabled} onChange={(event) => updateLabel(event.target.value)} /></label>
        <label>Slug<input value={form.slug} disabled={disabled} onChange={(event) => setForm((current) => ({ ...current, slug: slugifyControlValue(event.target.value), slugTouched: true }))} /></label>
        <label>Parent<select value={form.parentId || ''} disabled={disabled} onChange={(event) => setForm((current) => ({ ...current, parentId: event.target.value || null }))}><option value="">No parent</option>{parentOptions.map((item) => <option key={item.id} value={item.id}>{item.label} ({item.slug})</option>)}</select></label>
        <label>Country scope<select value={form.countryScope || ''} disabled={disabled} onChange={(event) => setForm((current) => ({ ...current, countryScope: event.target.value || null }))}><option value="">Global</option><option value="uae">UAE</option><option value="uk">UK</option><option value="india">India</option></select></label>
        <label>Sort order<input type="number" min="0" max="100000" value={form.sortOrder} disabled={disabled} onChange={(event) => setForm((current) => ({ ...current, sortOrder: Number(event.target.value) || 0 }))} /></label>
        <label className="checkbox"><input type="checkbox" checked={form.isActive} disabled={disabled} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /> Active option</label>
        {message ? <p className={message.includes('saved') || message.includes('archived') ? 'form-success' : 'form-error'}>{message}</p> : null}
        <div className="action-row">
          <button className="button button-gold" type="button" disabled={disabled} onClick={save}>{state === 'saving' ? 'Saving...' : 'Save Option'}</button>
          {form.id ? <button className="button button-dark" type="button" disabled={disabled} onClick={archive}>{state === 'archiving' ? 'Archiving...' : 'Archive Option'}</button> : null}
        </div>
      </article>
    </section>
  )
}
