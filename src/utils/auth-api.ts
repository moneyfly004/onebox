import { fetch } from '@tauri-apps/plugin-http';

const BASE_URL = 'https://dy.moneyfly.top';
const API_BASE = `${BASE_URL}/api/v1`;

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  verification_code?: string;
  invite_code?: string;
}

export interface ForgotPasswordRequest {
  email: string;
  verification_code: string;
  new_password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  username: string;
}

export interface UserSubscription {
  universal_url: string;
  subscription_url?: string;
  expire_time: string;
  device_limit: number;
  current_devices: number;
  upload_traffic: number;
  download_traffic: number;
  total_traffic: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * 认证 API 服务
 */
export class AuthService {
  /**
   * 登录
   */
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const body = await response.text();
      
      if (!response.ok) {
        // 尝试解析错误响应
        try {
          const errorData = JSON.parse(body) as ApiResponse<any>;
          throw new Error(errorData.message || '登录失败，请检查网络连接');
        } catch (e) {
          throw new Error('登录失败，请检查网络连接');
        }
      }

      const data = JSON.parse(body) as ApiResponse<{
        access_token: string;
        user: {
          email: string;
          username?: string;
        };
      }>;

      if (data.success && data.data) {
        return {
          token: data.data.access_token,
          email: data.data.user.email,
          username: data.data.user.username || data.data.user.email,
        };
      } else {
        throw new Error(data.message || '登录失败');
      }
    } catch (error: any) {
      let errorMsg = '登录失败，请检查网络连接';
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMsg = '连接超时，请检查网络连接';
        } else if (error.message.includes('SSL') || error.message.includes('ssl')) {
          errorMsg = 'SSL 连接错误，请检查网络设置';
        } else if (error.message.includes('failed to connect') || error.message.includes('Failed to connect')) {
          errorMsg = '无法连接到服务器，请检查网络';
        } else {
          errorMsg = error.message;
        }
      }
      throw new Error(errorMsg);
    }
  }

  /**
   * 注册
   */
  static async register(
    username: string,
    email: string,
    password: string,
    verificationCode?: string,
    inviteCode?: string
  ): Promise<string> {
    try {
      const body: RegisterRequest = {
        username,
        email,
        password,
      };
      if (verificationCode) body.verification_code = verificationCode;
      if (inviteCode) body.invite_code = inviteCode;

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const responseBody = await response.text();
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseBody) as ApiResponse<any>;
          throw new Error(errorData.message || '注册失败，请检查网络连接');
        } catch (e) {
          throw new Error('注册失败，请检查网络连接');
        }
      }

      const data = JSON.parse(responseBody) as ApiResponse<any>;

      if (data.success) {
        return data.message || '注册成功';
      } else {
        throw new Error(data.message || '注册失败');
      }
    } catch (error: any) {
      const errorMsg = error.message || '注册失败，请检查网络连接';
      throw new Error(errorMsg);
    }
  }

  /**
   * 发送验证码
   */
  static async sendVerificationCode(email: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/auth/verification/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          type: 'email', // 后端要求 type 为 "email"
        }),
      });

      const body = await response.text();
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(body) as ApiResponse<any>;
          throw new Error(errorData.message || '发送失败，请检查网络连接');
        } catch (e) {
          throw new Error('发送失败，请检查网络连接');
        }
      }

      const data = JSON.parse(body) as ApiResponse<any>;

      if (data.success) {
        return data.message || '验证码已发送';
      } else {
        throw new Error(data.message || '发送失败');
      }
    } catch (error: any) {
      let errorMsg = '发送失败，请检查网络连接';
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMsg = '连接超时，请检查网络连接';
        } else if (error.message.includes('SSL') || error.message.includes('ssl')) {
          errorMsg = 'SSL 连接错误，请检查网络设置';
        } else {
          errorMsg = error.message;
        }
      }
      throw new Error(errorMsg);
    }
  }

  /**
   * 忘记密码（发送重置密码验证码）
   */
  static async forgotPassword(email: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const body = await response.text();
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(body) as ApiResponse<any>;
          throw new Error(errorData.message || '发送失败，请检查网络连接');
        } catch (e) {
          throw new Error('发送失败，请检查网络连接');
        }
      }

      const data = JSON.parse(body) as ApiResponse<any>;

      if (data.success) {
        return data.message || '验证码已发送';
      } else {
        throw new Error(data.message || '发送失败');
      }
    } catch (error: any) {
      let errorMsg = '发送失败，请检查网络连接';
      if (error.message) {
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
          errorMsg = '连接超时，请检查网络连接';
        } else if (error.message.includes('SSL') || error.message.includes('ssl')) {
          errorMsg = 'SSL 连接错误，请检查网络设置';
        } else {
          errorMsg = error.message;
        }
      }
      throw new Error(errorMsg);
    }
  }

  /**
   * 重置密码
   */
  static async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          verification_code: code,
          new_password: newPassword,
        }),
      });

      const body = await response.text();
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(body) as ApiResponse<any>;
          throw new Error(errorData.message || '重置失败，请检查网络连接');
        } catch (e) {
          throw new Error('重置失败，请检查网络连接');
        }
      }

      const data = JSON.parse(body) as ApiResponse<any>;

      if (data.success) {
        return data.message || '密码重置成功';
      } else {
        throw new Error(data.message || '重置失败');
      }
    } catch (error: any) {
      const errorMsg = error.message || '重置失败，请检查网络连接';
      throw new Error(errorMsg);
    }
  }

  /**
   * 刷新 Token
   */
  static async refreshToken(token: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        // Tauri fetch 可以不发送 body，或者发送空字符串
      });

      const body = await response.text();
      
      if (response.status === 401) {
        // Token 已完全失效，需要重新登录
        throw new Error('登录已过期，请重新登录');
      }
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(body) as ApiResponse<any>;
          throw new Error(errorData.message || 'Token 刷新失败');
        } catch (e) {
          throw new Error('Token 刷新失败');
        }
      }

      const data = JSON.parse(body) as ApiResponse<{ token: string }>;

      if (data.success && data.data) {
        return data.data.token;
      } else {
        throw new Error(data.message || 'Token 刷新失败');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Token 刷新失败';
      throw new Error(errorMsg);
    }
  }

  /**
   * 获取用户订阅
   */
  static async getUserSubscription(token: string): Promise<UserSubscription> {
    try {
      const response = await fetch(`${API_BASE}/subscriptions/user-subscription`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const body = await response.text();
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(body) as ApiResponse<any>;
          throw new Error(errorData.message || '获取订阅失败');
        } catch (e) {
          throw new Error('获取订阅失败');
        }
      }

      const data = JSON.parse(body) as ApiResponse<{
        universal_url: string;
        subscription_url?: string;
        expire_time?: string;
        device_limit?: number;
        current_devices?: number;
        upload_traffic?: number;
        download_traffic?: number;
        total_traffic?: number;
      }>;

      if (data.success && data.data) {
        return {
          universal_url: data.data.universal_url || '',
          subscription_url: data.data.subscription_url,
          expire_time: data.data.expire_time || '未设置',
          device_limit: data.data.device_limit || 0,
          current_devices: data.data.current_devices || 0,
          upload_traffic: data.data.upload_traffic || 0,
          download_traffic: data.data.download_traffic || 0,
          total_traffic: data.data.total_traffic || 0,
        };
      } else {
        throw new Error(data.message || '获取订阅失败');
      }
    } catch (error: any) {
      const errorMsg = error.message || '获取订阅失败';
      throw new Error(errorMsg);
    }
  }
}

