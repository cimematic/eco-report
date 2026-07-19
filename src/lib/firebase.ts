const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
}

const PROJECT_ID = firebaseConfig.projectId
const API_KEY = firebaseConfig.apiKey
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`

function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null }
  if (typeof val === 'string') return { stringValue: val }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: String(val) }
    return { doubleValue: val }
  }
  if (typeof val === 'boolean') return { booleanValue: val }
  if (val instanceof Date) return { timestampValue: val.toISOString() }
  if (val && typeof val === 'object' && 'toMillis' in val) return { timestampValue: new Date(val.toMillis()).toISOString() }
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {}
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined && v !== null) fields[k] = toFirestoreValue(v)
    }
    return { mapValue: { fields } }
  }
  return { stringValue: String(val) }
}

function parseFirestoreValue(val: any): any {
  if (val === null || val === undefined) return null
  if ('stringValue' in val) return val.stringValue
  if ('integerValue' in val) return Number(val.integerValue)
  if ('doubleValue' in val) return val.doubleValue
  if ('booleanValue' in val) return val.booleanValue
  if ('timestampValue' in val) return new Date(val.timestampValue).getTime()
  if ('arrayValue' in val) return (val.arrayValue.values || []).map(parseFirestoreValue)
  if ('mapValue' in val) {
    const obj: Record<string, any> = {}
    if (val.mapValue.fields) {
      for (const [k, v] of Object.entries(val.mapValue.fields)) {
        obj[k] = parseFirestoreValue(v)
      }
    }
    return obj
  }
  return null
}

function parseFirestoreDoc(doc: any): Record<string, any> {
  const id = doc.name.split('/').pop()
  const data = parseFirestoreValue({ mapValue: { fields: doc.fields } })
  return { ...data, id }
}

export async function restGetDocs(collectionPath: string, opts?: { orderBy?: string; desc?: boolean; limit?: number }): Promise<Record<string, any>[]> {
  let url = `${BASE}/${collectionPath}?key=${API_KEY}`
  if (opts?.orderBy) {
    const dir = opts.desc ? 'desc' : 'asc'
    url += `&orderBy=${opts.orderBy} ${dir}`
  }
  if (opts?.limit) url += `&pageSize=${opts.limit}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
  const json = await res.json()
  return (json.documents || []).map(parseFirestoreDoc)
}

export async function restGetDoc(collectionPath: string, docId: string): Promise<Record<string, any> | null> {
  const url = `${BASE}/${collectionPath}/${docId}?key=${API_KEY}`
  const res = await fetch(url)
  if (res.status === 404) return null
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
  const json = await res.json()
  return parseFirestoreDoc(json)
}

export async function restAddDoc(collectionPath: string, data: Record<string, any>): Promise<string> {
  const fields: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) fields[key] = toFirestoreValue(value)
  }
  const url = `${BASE}/${collectionPath}?key=${API_KEY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
  const json = await res.json()
  return json.name.split('/').pop()
}

export async function restUpdateDoc(collectionPath: string, docId: string, data: Record<string, any>): Promise<void> {
  const fields: Record<string, any> = {}
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) fields[key] = toFirestoreValue(value)
  }
  const url = `${BASE}/${collectionPath}/${docId}?key=${API_KEY}&currentDocument.exists=true`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
}

export async function restDeleteDoc(collectionPath: string, docId: string): Promise<void> {
  const url = `${BASE}/${collectionPath}/${docId}?key=${API_KEY}`
  const res = await fetch(url, { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
}

const hasFirebaseKeys = !!(PROJECT_ID && API_KEY)

export { PROJECT_ID, API_KEY, hasFirebaseKeys }
