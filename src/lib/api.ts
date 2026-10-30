import axios from 'axios'
import recipesSnapshot from '../data/recipes.json'
import type { Recipe } from '../types'

const client = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 9000,
  headers: { Accept: 'application/json' },
})

export interface RecipeResponse {
  recipes: Recipe[]
  total: number
  skip: number
  limit: number
}

/** Live catalogue from DummyJSON. Throws on a timeout or a bad response. */
export async function fetchRecipes(): Promise<Recipe[]> {
  const { data } = await client.get<RecipeResponse>('/recipes', {
    params: { limit: 50 },
  })
  if (!Array.isArray(data.recipes) || data.recipes.length < 10) {
    throw new Error('The recipe service returned an incomplete list.')
  }
  return data.recipes
}

/** Bundled snapshot of the same API, used when the network is unavailable. */
export function bundledRecipes(): Recipe[] {
  return recipesSnapshot as Recipe[]
}

export const apiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') return 'The catalogue took too long to answer.'
    if (!error.response) return 'No connection to the recipe service.'
    if (error.response.status >= 500) return 'The recipe service is having trouble.'
    return `The recipe service answered ${error.response.status}.`
  }
  if (error instanceof Error) return error.message
  return 'The catalogue could not be loaded.'
}
