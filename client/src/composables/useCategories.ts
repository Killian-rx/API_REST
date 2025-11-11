import { ref, computed } from 'vue'
import type { Category } from '@/services/api'
import { apiService } from '@/services/api'

const categories = ref<Category[]>([])
const isLoadingCategories = ref(false)
const categoriesError = ref<string | null>(null)

export function useCategories() {
  const loadCategories = async () => {
    isLoadingCategories.value = true
    categoriesError.value = null

    try {
      const response = await apiService.getCategories()
      categories.value = response
      return response
    } catch (error) {
      categoriesError.value = error instanceof Error ? error.message : 'Erreur lors du chargement des catégories'
      throw error
    } finally {
      isLoadingCategories.value = false
    }
  }

  const getCategoryById = (id: number) => {
    return categories.value.find(cat => cat.id === id)
  }

  const clearError = () => {
    categoriesError.value = null
  }

  return {
    categories: computed(() => categories.value),
    isLoadingCategories: computed(() => isLoadingCategories.value),
    categoriesError: computed(() => categoriesError.value),
    loadCategories,
    getCategoryById,
    clearError
  }
}