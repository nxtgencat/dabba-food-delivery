import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CatalogStatus, CatalogValue, Dish, DishInput, Recipe } from '../types'
import { apiErrorMessage, bundledRecipes, fetchRecipes } from '../lib/api'
import { buildKitchens, recipeToDish } from '../data/demo'
import { readStorage, storageKeys, writeStorage } from '../lib/storage'

interface StoredOverrides {
  custom: Dish[]
  patches: Record<string, Partial<Dish>>
  deleted: string[]
}

const emptyOverrides: StoredOverrides = { custom: [], patches: {}, deleted: [] }

type CatalogSource = CatalogValue['source']

interface CatalogState {
  recipes: Recipe[]
  status: CatalogStatus
  source: CatalogSource
  fetchedAt: string | null
  error: string | null
}

export const CatalogContext = createContext<CatalogValue | null>(null)

function applyOverrides(recipes: Recipe[], overrides: StoredOverrides) {
  const base = recipes.map(recipeToDish)
  const patched = base
    .filter((dish) => !overrides.deleted.includes(dish.id))
    .map((dish) => {
      const patch = overrides.patches[dish.id]
      return patch ? { ...dish, ...patch } : dish
    })
  const custom = overrides.custom.filter((dish) => !overrides.deleted.includes(dish.id))
  return [...patched, ...custom]
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CatalogState>({
    recipes: [],
    status: 'loading',
    source: 'live',
    fetchedAt: null,
    error: null,
  })
  const [overrides, setOverrides] = useState<StoredOverrides>(() =>
    readStorage<StoredOverrides>(storageKeys.dishOverrides, emptyOverrides),
  )
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((prev) => ({ ...prev, status: 'loading', error: null }))
    fetchRecipes()
      .then((recipes) => {
        if (cancelled) return
        setState({
          recipes,
          status: 'ready',
          source: 'live',
          fetchedAt: new Date().toISOString(),
          error: null,
        })
      })
      .catch((error) => {
        if (cancelled) return
        const fallback = bundledRecipes()
        setState({
          recipes: fallback,
          // A network miss still leaves a complete, usable catalogue. The flag
          // keeps the interface honest about where the data came from.
          status: fallback.length ? 'degraded' : 'error',
          source: 'bundled',
          fetchedAt: new Date().toISOString(),
          error: apiErrorMessage(error),
        })
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const dishes = useMemo(
    () => applyOverrides(state.recipes, overrides),
    [state.recipes, overrides],
  )
  const kitchens = useMemo(() => buildKitchens(dishes), [dishes])

  const persist = useCallback((next: StoredOverrides) => {
    setOverrides(next)
    writeStorage(storageKeys.dishOverrides, next)
  }, [])

  const addDish = useCallback(
    (input: DishInput) => {
      const id = `d-${Date.now().toString(36)}`
      const dish: Dish = {
        id,
        recipeId: null,
        kitchenId: input.kitchenId,
        name: input.name.trim(),
        description: input.description.trim(),
        ingredients: [],
        instructions: [],
        image: input.image,
        price: input.price,
        category: input.category,
        cuisine: input.cuisine,
        diet: input.diet,
        available: input.available,
        soldOutAt: input.soldOutAt ?? null,
        soldOutCompare: null,
        rating: 0,
        reviewCount: 0,
        prepMinutes: input.prepMinutes,
        cookMinutes: 0,
        calories: 0,
        difficulty: 'Easy',
        custom: true,
      }
      const next: StoredOverrides = {
        ...overrides,
        custom: [dish, ...overrides.custom],
        deleted: overrides.deleted.filter((entry) => entry !== id),
      }
      persist(next)
    },
    [overrides, persist],
  )

  const updateDish = useCallback(
    (id: string, patch: Partial<DishInput>) => {
      if (overrides.custom.some((dish) => dish.id === id)) {
        const merged = overrides.custom.map((dish) => {
          if (dish.id !== id) return dish
          const mergedDish: Dish = {
            ...dish,
            name: patch.name?.trim() ?? dish.name,
            description: patch.description?.trim() ?? dish.description,
            price: patch.price ?? dish.price,
            category: patch.category ?? dish.category,
            cuisine: patch.cuisine ?? dish.cuisine,
            diet: patch.diet ?? dish.diet,
            image: patch.image ?? dish.image,
            available: patch.available ?? dish.available,
            kitchenId: patch.kitchenId ?? dish.kitchenId,
            prepMinutes: patch.prepMinutes ?? dish.prepMinutes,
            soldOutAt: patch.soldOutAt !== undefined ? patch.soldOutAt : dish.soldOutAt,
          }
          return mergedDish
        })
        persist({ ...overrides, custom: merged })
        return
      }
      const previous = overrides.patches[id] ?? {}
      const next: StoredOverrides = {
        ...overrides,
        patches: {
          ...overrides.patches,
          [id]: { ...previous, ...patch },
        },
      }
      persist(next)
    },
    [overrides, persist],
  )

  const deleteDish = useCallback(
    (id: string) => {
      const next: StoredOverrides = {
        ...overrides,
        custom: overrides.custom.filter((dish) => dish.id !== id),
        deleted: [...new Set([...overrides.deleted, id])],
      }
      persist(next)
    },
    [overrides, persist],
  )

  const getDish = useCallback(
    (id: string) => dishes.find((dish) => dish.id === id),
    [dishes],
  )
  const getKitchen = useCallback(
    (id: string) => kitchens.find((kitchen) => kitchen.id === id),
    [kitchens],
  )
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  const value = useMemo<CatalogValue>(
    () => ({
      dishes,
      kitchens,
      status: state.status,
      source: state.source,
      fetchedAt: state.fetchedAt,
      error: state.error,
      retry,
      addDish,
      updateDish,
      deleteDish,
      getDish,
      getKitchen,
    }),
    [
      dishes,
      kitchens,
      state.status,
      state.source,
      state.fetchedAt,
      state.error,
      retry,
      addDish,
      updateDish,
      deleteDish,
      getDish,
      getKitchen,
    ],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
