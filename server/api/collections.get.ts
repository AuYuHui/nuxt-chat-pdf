import type { CollectionType } from 'chromadb/src/types'

export default defineEventHandler(async (event) => {
  const res = await fetch('http://localhost:8000/api/v1/collections')
  return {
    code: 0,
    msg: 'success',
    collections: await res.json() as Array<CollectionType>,
  }
})
