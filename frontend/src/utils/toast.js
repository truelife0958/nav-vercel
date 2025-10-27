/**
 * 老王的前端提示系统
 * 艹！再也不用那个SB的alert了！
 */

// 提示类型
const ToastType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// 提示图标
const ToastIcon = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
};

// 提示颜色
const ToastColor = {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6'
};

class Toast {
  constructor() {
    this.container = null;
    this.initContainer();
  }

  initContainer() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'toast-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    `;
    document.body.appendChild(this.container);
  }

  show(message, type = ToastType.INFO, duration = 3000) {
    const toast = document.createElement('div');
    const icon = ToastIcon[type];
    const color = ToastColor[type];

    toast.style.cssText = `
      background: white;
      border-left: 4px solid ${color};
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: flex-start;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
      max-width: 100%;
      word-wrap: break-word;
    `;

    toast.innerHTML = `
      <span style="font-size: 20px; line-height: 1;">${icon}</span>
      <div style="flex: 1; color: #333; font-size: 14px; line-height: 1.5;">
        ${message}
      </div>
      <button style="
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        line-height: 1;
      ">×</button>
    `;

    // 添加动画样式
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(400px);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // 关闭按钮
    const closeBtn = toast.querySelector('button');
    closeBtn.addEventListener('click', () => {
      this.remove(toast);
    });

    this.container.appendChild(toast);

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }

    return toast;
  }

  remove(toast) {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  success(message, duration) {
    return this.show(message, ToastType.SUCCESS, duration);
  }

  error(message, duration) {
    return this.show(message, ToastType.ERROR, duration);
  }

  warning(message, duration) {
    return this.show(message, ToastType.WARNING, duration);
  }

  info(message, duration) {
    return this.show(message, ToastType.INFO, duration);
  }
}

// 创建全局实例
const toast = new Toast();

export default toast;
export { ToastType };
