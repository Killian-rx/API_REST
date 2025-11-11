import { ref, computed } from 'vue'
import type { User } from '@/services/api'
import { apiService } from '@/services/api'

// État global de l'authentification
const currentUser = ref<User | null>(null)
const isLoadingAuth = ref(false)
const authError = ref<string | null>(null)

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value)

  const login = async (email: string, password: string) => {
    isLoadingAuth.value = true
    authError.value = null

    try {
      const response = await apiService.login({ email, password })
      currentUser.value = response.user
      return response
    } catch (error) {
      authError.value = error instanceof Error ? error.message : 'Erreur de connexion'
      throw error
    } finally {
      isLoadingAuth.value = false
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    isLoadingAuth.value = true
    authError.value = null

    try {
      const response = await apiService.register({ name, email, password, phone })
      currentUser.value = response.user
      return response
    } catch (error) {
      authError.value = error instanceof Error ? error.message : 'Erreur d\'inscription'
      throw error
    } finally {
      isLoadingAuth.value = false
    }
  }

  const logout = () => {
    apiService.logout()
    currentUser.value = null
    authError.value = null
  }

  const checkAuth = async () => {
    if (!apiService.isAuthenticated()) return

    try {
      const response = await apiService.getMe()
      currentUser.value = response.user
    } catch (error) {
      // Token invalide ou expiré
      logout()
    }
  }

  const clearError = () => {
    authError.value = null
  }

  return {
    currentUser: computed(() => currentUser.value),
    isAuthenticated,
    isLoadingAuth: computed(() => isLoadingAuth.value),
    authError: computed(() => authError.value),
    login,
    register,
    logout,
    checkAuth,
    clearError
  }
}