// Types pour l'API
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  status: 'ACTIVE' | 'SOLD' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    phone?: string;
  };
  category: {
    id: number;
    name: string;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  price: number;
  location: string;
  categoryId: number;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  message: string;
}

// Configuration de l'API
const API_BASE_URL = 'http://localhost:4000';

// Utilitaire pour gérer le token JWT
class TokenManager {
  private static readonly TOKEN_KEY = 'leboncoin_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Classe principale du service API
class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = TokenManager.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.message || 'Erreur API');
    }

    return response.json();
  }

  // Authentification
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    TokenManager.setToken(response.token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    TokenManager.setToken(response.token);
    return response;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  logout(): void {
    TokenManager.removeToken();
  }

  // Catégories
  async getCategories(): Promise<Category[]> {
    const response = await this.request<{ data: Category[]; message: string; count: number }>('/categories');
    return response.data;
  }

  // Annonces
  async getListings(params: {
    q?: string;
    categoryId?: number;
    page?: number;
    pageSize?: number;
  } = {}): Promise<{
    data: Listing[];
    meta: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/listings${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getListing(id: number): Promise<Listing> {
    return this.request<Listing>(`/listings/${id}`);
  }

  async createListing(listing: CreateListingRequest): Promise<Listing> {
    return this.request<Listing>('/listings', {
      method: 'POST',
      body: JSON.stringify(listing),
    });
  }

  async updateListing(id: number, updates: Partial<CreateListingRequest>): Promise<Listing> {
    return this.request<Listing>(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteListing(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/listings/${id}`, {
      method: 'DELETE',
    });
  }

  // Vérification de l'état d'authentification
  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }
}

// Export d'une instance singleton
export const apiService = new ApiService();
export { TokenManager };