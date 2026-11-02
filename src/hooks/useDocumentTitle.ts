import { useEffect } from 'react'

/** Keeps a document title honest per page without pulling in a library. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title
    document.title = title === 'Dabba' ? 'Dabba · Dinner service' : `${title} · Dabba`
    return () => {
      document.title = previous
    }
  }, [title])
}
