import { ref, computed } from 'vue'
import type { Listing, CreateListingRequest } from '@/services/api'
import { apiService } from '@/services/api'

const listings = ref<Listing[]>([])
const isLoadingListings = ref(false)
const listingsError = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const total = ref(0)

export function useListings() {
  const loadListings = async (params: {
    q?: string;
    categoryId?: number;
    page?: number;
  } = {}) => {
    isLoadingListings.value = true
    listingsError.value = null

    try {
      const response = await apiService.getListings({
        ...params,
        page: params.page || 1,
        pageSize: 10
      })
      
      listings.value = response.data
      currentPage.value = response.meta.page
      totalPages.value = response.meta.totalPages
      total.value = response.meta.total
      
      return response
    } catch (error) {
      listingsError.value = error instanceof Error ? error.message : 'Erreur lors du chargement des annonces'
      throw error
    } finally {
      isLoadingListings.value = false
    }
  }

  const createListing = async (listingData: CreateListingRequest) => {
    try {
      const newListing = await apiService.createListing(listingData)
      // Ajouter la nouvelle annonce en début de liste
      listings.value.unshift(newListing)
      return newListing
    } catch (error) {
      listingsError.value = error instanceof Error ? error.message : 'Erreur lors de la création de l\'annonce'
      throw error
    }
  }

  const deleteListing = async (id: number) => {
    try {
      await apiService.deleteListing(id)
      // Retirer l'annonce de la liste
      listings.value = listings.value.filter(listing => listing.id !== id)
    } catch (error) {
      listingsError.value = error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'annonce'
      throw error
    }
  }

  const addFavorite = async (id: number) => {
    try {
      await apiService.addFavorite(id)
    } catch (error) {
      listingsError.value = error instanceof Error ? error.message : 'Erreur lors de l\'ajout au favoris'
      throw error
    }
  }

  const removeFavorite = async (id: number) => {
    try {
      await apiService.removeFavorite(id)
    } catch (error) {
      listingsError.value = error instanceof Error ? error.message : 'Erreur lors de la suppression du favoris'
      throw error
    }
  }

  const loadFavorites = async () => {
    try {
      isLoadingListings.value = true
      const response = await apiService.getMyFavorites()
      // Ne pas réécrire la liste principale ici — retourner seulement les favoris
      return response.data
    } catch (error) {
      listingsError.value = error instanceof Error ? error.message : 'Erreur lors du chargement des favoris'
      throw error
    } finally {
      isLoadingListings.value = false
    }
  }

  const clearError = () => {
    listingsError.value = null
  }

  return {
    listings: computed(() => listings.value),
    isLoadingListings: computed(() => isLoadingListings.value),
    listingsError: computed(() => listingsError.value),
    currentPage: computed(() => currentPage.value),
    totalPages: computed(() => totalPages.value),
    total: computed(() => total.value),
    loadListings,
    createListing,
    deleteListing,
    addFavorite,
    removeFavorite,
    loadFavorites,
    clearError
  }
}