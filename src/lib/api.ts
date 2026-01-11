const API_URLS = {
  auth: 'https://functions.poehali.dev/2d142dd1-d2aa-4a05-b3c4-9003993bc25f',
  data: 'https://functions.poehali.dev/fa319465-7bb5-4f51-bad3-57a7d7ad3018',
};

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export interface ProfileData {
  gender: 'male' | 'female';
  age: number;
  weight: number;
  height: number;
  activity: number;
  dailyNorm?: {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  };
}

export interface MealEntry {
  id: string;
  food: {
    name: string;
    category: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
  };
  grams: number;
  date: string;
  time: string;
}

class API {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  private clearToken() {
    localStorage.removeItem('auth_token');
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, password, name }),
    });
    const data = await response.json();
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password }),
    });
    const data = await response.json();
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(API_URLS.auth, {
        method: 'GET',
        headers: { 'X-Auth-Token': token },
      });
      const data = await response.json();
      return data.success ? data.user : null;
    } catch {
      return null;
    }
  }

  logout() {
    this.clearToken();
  }

  async getProfile(): Promise<ProfileData | null> {
    const token = this.getToken();
    if (!token) return null;

    const response = await fetch(`${API_URLS.data}?path=profile`, {
      method: 'GET',
      headers: { 'X-Auth-Token': token },
    });
    const data = await response.json();
    return data.profile;
  }

  async saveProfile(profile: ProfileData): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    const response = await fetch(`${API_URLS.data}?path=profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify(profile),
    });
    const data = await response.json();
    return data.success;
  }

  async getMeals(startDate?: string, endDate?: string): Promise<MealEntry[]> {
    const token = this.getToken();
    if (!token) return [];

    let url = `${API_URLS.data}?path=meals`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-Auth-Token': token },
    });
    const data = await response.json();
    return data.meals || [];
  }

  async addMeal(meal: Omit<MealEntry, 'id'>): Promise<string | null> {
    const token = this.getToken();
    if (!token) return null;

    const response = await fetch(`${API_URLS.data}?path=meals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token,
      },
      body: JSON.stringify(meal),
    });
    const data = await response.json();
    return data.success ? data.id : null;
  }

  async deleteMeal(id: string): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    const response = await fetch(`${API_URLS.data}?path=meals&id=${id}`, {
      method: 'DELETE',
      headers: { 'X-Auth-Token': token },
    });
    const data = await response.json();
    return data.success;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const api = new API();
