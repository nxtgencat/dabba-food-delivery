import { useMemo } from 'react'
import type { Dish } from '../types'

export type MealFilter = 'all' | 'veg' | 'nonveg'

export const normalize = (value: string) => value.trim().toLowerCase()

/** The search matches the name, the cuisine, the description and the ingredient list,
 *  so "tofu" or "basmati" finds a dish even though the card only shows the first line. */
export function matchDish(dish: Dish, query: string): boolean {
  if (!query) return true
  const needle = normalize(query)
  return (
    normalize(dish.name).includes(needle) ||
    normalize(dish.cuisine).includes(needle) ||
    normalize(dish.description).includes(needle) ||
    dish.ingredients.some((item) => normalize(item).includes(needle))
  )
}

export function filterDishes(
  dishes: Dish[],
  options: {
    query?: string
    category?: string
    diet?: MealFilter
    kitchenId?: string
    availableOnly?: boolean
  },
): Dish[] {
  return dishes.filter((dish) => {
    if (options.kitchenId && dish.kitchenId !== options.kitchenId) return false
    if (options.category && options.category !== 'all' && dish.category !== options.category) return false
    if (options.diet && options.diet !== 'all' && dish.diet !== options.diet) return false
    if (options.availableOnly && !dish.available) return false
    if (options.query && !matchDish(dish, options.query)) return false
    return true
  })
}

export function sortDishes(dishes: Dish[], sort: string): Dish[] {
  const list = [...dishes]
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return list
  }
}

export const useDerivedKitchenStats = (dishes: Dish[]) =>
  useMemo(() => {
    const byKitchen = new Map<string, Dish[]>()
    for (const dish of dishes) {
      const list = byKitchen.get(dish.kitchenId) ?? []
      list.push(dish)
      byKitchen.set(dish.kitchenId, list)
    }
    return byKitchen
  }, [dishes])

export const dishRating = (dishes: Dish[]) => {
  if (!dishes.length) return 0
  const reviewed = dishes.filter((dish) => dish.reviewCount > 0)
  if (!reviewed.length) return 0
  const weighted = reviewed.reduce((sum, dish) => sum + dish.rating * dish.reviewCount, 0)
  const reviews = reviewed.reduce((sum, dish) => sum + dish.reviewCount, 0)
  return Math.round((weighted / reviews) * 10) / 10
}

export const dishReviewTotal = (dishes: Dish[]) =>
  dishes.reduce((sum, dish) => sum + dish.reviewCount, 0)

export const dishPriceFrom = (dishes: Dish[]) =>
  dishes.length ? Math.min(...dishes.map((dish) => dish.price)) : 0
