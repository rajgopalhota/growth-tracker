import { notification } from 'antd';

/**
 * Toast-like wrapper around Ant Design notification API
 * Usage: Same as react-hot-toast API
 */
export const toast = {
  success: (message) => {
    notification.success({
      message,
      placement: 'topRight',
      duration: 3,
    });
  },
  
  error: (message) => {
    notification.error({
      message,
      placement: 'topRight',
      duration: 3,
    });
  },
  
  info: (message) => {
    notification.info({
      message,
      placement: 'topRight',
      duration: 3,
    });
  },
  
  warning: (message) => {
    notification.warning({
      message,
      placement: 'topRight',
      duration: 3,
    });
  },
  
  loading: (message) => {
    const key = `loading-${Date.now()}`;
    notification.open({
      message,
      key,
      duration: 0,
      placement: 'topRight',
    });
    return key;
  },
  
  dismiss: (key) => {
    notification.close(key);
  },
};

export default toast;
