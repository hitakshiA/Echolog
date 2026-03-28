const BASE_URL = '/api'

export interface ApiError {
  error: {
    code: string
    message: string
    details: Record<string, unknown>
  }
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    const response = await fetch(url, { ...options, headers })

    if (response.status === 204) {
      return undefined as T
    }

    const data = await response.json()

    if (!response.ok) {
      throw data as ApiError
    }

    return data as T
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return this.request<T>(`${path}${query}`)
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
    })
  }

  async delete(path: string): Promise<void> {
    return this.request<void>(path, { method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
