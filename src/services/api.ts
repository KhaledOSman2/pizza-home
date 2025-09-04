// API service for handling HTTP requests
const API_BASE_URL = '/api'; // Use proxy from vite.config.ts

interface ApiResponse<T = any> {
  success?: boolean;
  user?: T;
  token?: string;
  message?: string;
  error?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: {
    url: string;
    publicId: string;
  };
  phone?: string;
  address?: string;
  isBlocked?: boolean;
  blockReason?: string;
  blockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  dish: {
    _id: string;
    name: string;
    price: number;
    image?: {
      url: string;
      publicId: string;
    };
  };
  name: string;
  price: number;
  quantity: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    publicId: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Dish {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category: Category;
  image?: {
    url: string;
    publicId: string;
  };
  rating: number;
  prepTimeMin: number;
  serves: number;
  ingredients: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Order {
  _id: string;
  orderNumber?: string; // New numeric order number field
  user?: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
  statusHistory?: {
    status: 'pending' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';
    timestamp: string;
    updatedBy?: string;
    note?: string;
  }[];
  notes?: string;
  paymentMethod: 'cod' | 'card';
  createdAt: string;
  updatedAt: string;
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
    } else {
      config.headers = {
        ...options.headers,
      };
    }

    try {
      console.log('Making API request to:', url, 'with config:', config);
      const response = await fetch(url, config);
      const data = await response.json();
      
      console.log('API response status:', response.status, 'data:', data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error instanceof Error ? error : new Error('Network error occurred');
    }
  }

  // Authentication methods
  async login(credentials: LoginData): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: SignUpData): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.makeRequest('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/me');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/health');
  }

  // Orders methods
  async getOrders(): Promise<{ results: number; orders: Order[] }> {
    return this.makeRequest<{ results: number; orders: Order[] }>('/orders');
  }

  async getUserOrders(userId?: string): Promise<{ results: number; orders: Order[] }> {
    const endpoint = userId ? `/users/${userId}/orders` : '/orders';
    return this.makeRequest<{ results: number; orders: Order[] }>(endpoint);
  }

  async getOrder(orderId: string): Promise<{ order: Order }> {
    return this.makeRequest<{ order: Order }>(`/orders/${orderId}`);
  }

  async createOrder(orderData: {
    customer: {
      name: string;
      phone: string;
      address: string;
    };
    items: {
      dish: string;
      quantity: number;
    }[];
    notes?: string;
    paymentMethod?: 'cod' | 'card';
  }): Promise<{ order: Order }> {
    return this.makeRequest<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  // Categories methods
  async getCategories(): Promise<{ results: number; categories: Category[] }> {
    return this.makeRequest<{ results: number; categories: Category[] }>('/categories');
  }

  async getCategory(categoryId: string): Promise<{ category: Category }> {
    return this.makeRequest<{ category: Category }>(`/categories/${categoryId}`);
  }

  // Dishes methods
  async getDishes(categorySlug?: string, searchQuery?: string): Promise<{ results: number; dishes: Dish[] }> {
    const params = new URLSearchParams();
    if (categorySlug) params.append('category', categorySlug);
    if (searchQuery) params.append('q', searchQuery);
    
    const queryString = params.toString();
    const endpoint = `/dishes${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<{ results: number; dishes: Dish[] }>(endpoint);
  }

  // Admin method to get all dishes including unavailable ones
  async getAllDishes(categorySlug?: string, searchQuery?: string): Promise<{ results: number; dishes: Dish[] }> {
    const params = new URLSearchParams();
    if (categorySlug) params.append('category', categorySlug);
    if (searchQuery) params.append('q', searchQuery);
    params.append('includeUnavailable', 'true'); // Include unavailable dishes for admin
    
    const queryString = params.toString();
    const endpoint = `/dishes?${queryString}`;
    
    return this.makeRequest<{ results: number; dishes: Dish[] }>(endpoint);
  }

  async getDish(dishId: string): Promise<{ dish: Dish }> {
    return this.makeRequest<{ dish: Dish }>(`/dishes/${dishId}`);
  }

  // Admin methods for categories
  async createCategory(categoryData: FormData): Promise<{ category: Category }> {
    return this.makeRequest<{ category: Category }>('/categories', {
      method: 'POST',
      body: categoryData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async updateCategory(categoryId: string, categoryData: FormData): Promise<{ category: Category }> {
    return this.makeRequest<{ category: Category }>(`/categories/${categoryId}`, {
      method: 'PATCH',
      body: categoryData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async deleteCategory(categoryId: string): Promise<ApiResponse> {
    return this.makeRequest(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  // Admin methods for dishes
  async createDish(dishData: FormData): Promise<{ dish: Dish }> {
    return this.makeRequest<{ dish: Dish }>('/dishes', {
      method: 'POST',
      body: dishData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async updateDish(dishId: string, dishData: FormData): Promise<{ dish: Dish }> {
    return this.makeRequest<{ dish: Dish }>(`/dishes/${dishId}`, {
      method: 'PATCH',
      body: dishData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async deleteDish(dishId: string): Promise<ApiResponse> {
    return this.makeRequest(`/dishes/${dishId}`, {
      method: 'DELETE',
    });
  }

  // Admin methods for orders
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ order: Order }> {
    return this.makeRequest<{ order: Order }>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Admin methods for users (if needed)
  async getAllUsers(): Promise<{ results: number; users: User[] }> {
    return this.makeRequest<{ results: number; users: User[] }>('/users');
  }

  async getUser(userId: string): Promise<{ user: User }> {
    return this.makeRequest<{ user: User }>(`/users/${userId}`);
  }

  async getUserOrders(userId?: string): Promise<{ results: number; orders: Order[] }> {
    const endpoint = userId ? `/users/${userId}/orders` : '/orders';
    return this.makeRequest<{ results: number; orders: Order[] }>(endpoint);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<{ user: User }> {
    return this.makeRequest<{ user: User }>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    return this.makeRequest(`/users/${userId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export type { User, LoginData, SignUpData, ApiResponse, Order, OrderItem, Category, Dish };