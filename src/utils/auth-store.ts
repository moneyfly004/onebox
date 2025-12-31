import { LazyStore } from '@tauri-apps/plugin-store';
import { AuthService, LoginResponse, UserSubscription } from './auth-api';

const AUTH_TOKEN_KEY = 'auth_token';
const USER_EMAIL_KEY = 'user_email';
const USER_USERNAME_KEY = 'user_username';
const USER_SUBSCRIPTION_KEY = 'user_subscription';

const store = new LazyStore('auth.json', {
  defaults: {},
  autoSave: true,
});

/**
 * 认证状态管理
 */
export class AuthStore {
  /**
   * 保存登录信息
   */
  static async saveLoginInfo(loginResponse: LoginResponse): Promise<void> {
    await store.set(AUTH_TOKEN_KEY, loginResponse.token);
    await store.set(USER_EMAIL_KEY, loginResponse.email);
    await store.set(USER_USERNAME_KEY, loginResponse.username);
    await store.save();
  }

  /**
   * 获取 Token
   */
  static async getToken(): Promise<string | null> {
    const token = await store.get(AUTH_TOKEN_KEY);
    return token as string | null;
  }

  /**
   * 获取用户邮箱
   */
  static async getEmail(): Promise<string | null> {
    const email = await store.get(USER_EMAIL_KEY);
    return email as string | null;
  }

  /**
   * 获取用户名
   */
  static async getUsername(): Promise<string | null> {
    const username = await store.get(USER_USERNAME_KEY);
    return username as string | null;
  }

  /**
   * 检查是否已登录
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null && token !== undefined;
  }

  /**
   * 退出登录
   */
  static async logout(): Promise<void> {
    await store.clear();
    await store.save();
  }

  /**
   * 保存订阅信息
   */
  static async saveSubscription(subscription: UserSubscription): Promise<void> {
    await store.set(USER_SUBSCRIPTION_KEY, JSON.stringify(subscription));
    await store.save();
  }

  /**
   * 获取订阅信息
   */
  static async getSubscription(): Promise<UserSubscription | null> {
    const subscriptionStr = await store.get(USER_SUBSCRIPTION_KEY) as string | null;
    if (subscriptionStr) {
      try {
        return JSON.parse(subscriptionStr) as UserSubscription;
      } catch (e) {
        console.error('解析订阅信息失败:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * 刷新 Token（如果过期）
   */
  static async refreshTokenIfNeeded(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) {
      return false;
    }

    try {
      const newToken = await AuthService.refreshToken(token);
      await store.set(AUTH_TOKEN_KEY, newToken);
      await store.save();
      return true;
    } catch (error) {
      // Token 已失效，清除登录信息
      await this.logout();
      return false;
    }
  }

  /**
   * 获取认证状态
   */
  static async getAuthState(): Promise<{
    isAuthenticated: boolean;
    token: string | null;
    email: string | null;
    username: string | null;
  }> {
    return {
      isAuthenticated: await this.isAuthenticated(),
      token: await this.getToken(),
      email: await this.getEmail(),
      username: await this.getUsername(),
    };
  }
}

