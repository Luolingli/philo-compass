// src/utils/analytics.ts - 简单的使用统计（隐私友好）

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

class Analytics {
  private enabled = false;

  constructor() {
    // 仅统计基本使用模式，不收集个人数据
    this.enabled = typeof window !== 'undefined';
  }

  /**
   * 记录事件（仅存储在本地）
   */
  track(event: AnalyticsEvent): void {
    if (!this.enabled) return;

    try {
      const stats = this.getStats();
      const key = `${event.category}:${event.action}`;
      stats[key] = (stats[key] || 0) + 1;
      localStorage.setItem('philo-stats', JSON.stringify(stats));
    } catch {
      // 静默失败
    }
  }

  /**
   * 获取统计数据
   */
  getStats(): Record<string, number> {
    try {
      const data = localStorage.getItem('philo-stats');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * 清空统计
   */
  clear(): void {
    try {
      localStorage.removeItem('philo-stats');
    } catch {
      // 静默失败
    }
  }
}

export const analytics = new Analytics();

// 便捷方法
export const trackTestStart = (version: 'standard' | 'deep') =>
  analytics.track({ action: 'start', category: 'test', label: version });

export const trackTestComplete = (version: 'standard' | 'deep') =>
  analytics.track({ action: 'complete', category: 'test', label: version });

export const trackShare = (method: 'link' | 'image') =>
  analytics.track({ action: 'share', category: 'result', label: method });

export const trackGalleryView = () =>
  analytics.track({ action: 'view', category: 'gallery' });
