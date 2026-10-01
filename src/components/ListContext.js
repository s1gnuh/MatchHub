import { createContext } from 'react'

// How match lists render: `dense` = compact rows (desktop side column), `selectedId` = match highlighted as open.
export const ListContext = createContext({ dense: false, selectedId: null })
