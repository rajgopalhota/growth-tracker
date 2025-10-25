import { theme } from 'antd';

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    // Primary colors
    colorPrimary: '#ff6b35',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // Text colors
    colorText: '#ffffff',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    colorTextTertiary: 'rgba(255, 255, 255, 0.45)',
    colorTextQuaternary: 'rgba(255, 255, 255, 0.25)',
    
    // Background colors
    colorBgBase: '#141414',
    colorBgContainer: 'rgba(0, 0, 0, 0.2)',
    colorBgElevated: 'rgba(0, 0, 0, 0.4)',
    colorBgLayout: 'transparent',
    colorBgSpotlight: 'rgba(0, 0, 0, 0.6)',
    
    // Border colors
    colorBorder: 'rgba(255, 255, 255, 0.1)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.05)',
    
    // Component specific colors
    colorFill: 'rgba(255, 255, 255, 0.1)',
    colorFillSecondary: 'rgba(255, 255, 255, 0.05)',
    colorFillTertiary: 'rgba(255, 255, 255, 0.02)',
    colorFillQuaternary: 'rgba(255, 255, 255, 0.01)',
    
    // Link colors
    colorLink: '#ff6b35',
    colorLinkHover: '#ff8c42',
    colorLinkActive: '#ff8c42',
    
    // Control colors
    colorControlItemBg: 'rgba(255, 255, 255, 0.1)',
    colorControlItemBgHover: 'rgba(255, 255, 255, 0.2)',
    colorControlItemBgActive: 'rgba(255, 107, 53, 0.2)',
    colorControlItemBgActiveHover: 'rgba(255, 107, 53, 0.3)',
    
    // Font
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Border radius
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,
    
    // Box shadow
    boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
    
    // Motion
    motionDurationSlow: '0.3s',
    motionDurationMid: '0.2s',
    motionDurationFast: '0.1s',
    
    // Z-index
    zIndexBase: 0,
    zIndexPopupBase: 1000,
  },
  components: {
    Layout: {
      bodyBg: 'transparent',
      headerBg: 'rgba(0, 0, 0, 0.2)',
      siderBg: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(15, 23, 42, 0.8) 100%)',
    },
    Card: {
      colorBgContainer: 'rgba(0, 0, 0, 0.2)',
      colorBorderSecondary: 'rgba(255, 255, 255, 0.1)',
    },
    Button: {
      colorPrimary: '#ff6b35',
      colorPrimaryHover: '#ff8c42',
      colorPrimaryActive: '#ff8c42',
    },
    Input: {
      colorBgContainer: 'rgba(0, 0, 0, 0.4)',
      colorBorder: 'rgba(255, 255, 255, 0.2)',
      colorText: '#ffffff',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
    },
    Select: {
      colorBgContainer: 'rgba(0, 0, 0, 0.4)',
      colorBorder: 'rgba(255, 255, 255, 0.2)',
      colorText: '#ffffff',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
    },
    DatePicker: {
      colorBgContainer: 'rgba(0, 0, 0, 0.4)',
      colorBorder: 'rgba(255, 255, 255, 0.2)',
      colorText: '#ffffff',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
    },
    Menu: {
      colorBgContainer: 'transparent',
      colorItemBg: 'transparent',
      colorItemBgHover: 'rgba(255, 255, 255, 0.1)',
      colorItemBgSelected: 'linear-gradient(135deg, rgba(255, 140, 0, 0.2) 0%, rgba(255, 0, 0, 0.1) 100%)',
      colorItemText: 'rgba(255, 255, 255, 0.7)',
      colorItemTextHover: '#ffffff',
      colorItemTextSelected: '#ffffff',
    },
    Dropdown: {
      colorBgElevated: 'rgba(0, 0, 0, 0.9)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
    },
    Modal: {
      colorBgElevated: 'rgba(0, 0, 0, 0.9)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
    },
    Drawer: {
      colorBgElevated: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(15, 23, 42, 0.8) 100%)',
    },
    Typography: {
      colorText: '#ffffff',
      colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    },
    Tag: {
      colorBgContainer: 'rgba(255, 255, 255, 0.1)',
      colorBorder: 'rgba(255, 255, 255, 0.2)',
      colorText: '#ffffff',
    },
    Progress: {
      colorSuccess: '#ff6b35',
    },
    Empty: {
      colorTextDescription: 'rgba(255, 255, 255, 0.65)',
    },
    List: {
      colorText: '#ffffff',
      colorTextDescription: 'rgba(255, 255, 255, 0.65)',
      colorBorder: 'rgba(255, 255, 255, 0.1)',
    },
    Avatar: {
      colorBgContainer: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
    },
    Tooltip: {
      colorBgSpotlight: 'rgba(0, 0, 0, 0.9)',
      colorTextLightSolid: '#ffffff',
    },
    Form: {
      labelColor: '#ffffff',
      colorTextDescription: 'rgba(255, 255, 255, 0.65)',
    },
    Badge: {
      colorError: '#ff6b35',
    },
    Spin: {
      colorPrimary: '#ff6b35',
    },
    Rate: {
      colorFillContent: '#ff6b35',
    },
    Upload: {
      colorBgContainer: 'rgba(0, 0, 0, 0.4)',
      colorBorder: 'rgba(255, 255, 255, 0.2)',
    },
    Table: {
      colorBgContainer: 'transparent',
      colorBorderSecondary: 'rgba(255, 255, 255, 0.1)',
      colorText: '#ffffff',
      colorTextHeading: '#ffffff',
      colorFillSecondary: 'rgba(255, 255, 255, 0.05)',
    },
    Timeline: {
      colorText: '#ffffff',
      colorPrimary: '#ff6b35',
    },
    Divider: {
      colorSplit: 'rgba(255, 255, 255, 0.1)',
    },
    Slider: {
      colorPrimary: '#ff6b35',
      colorPrimaryHover: '#ff8c42',
    },
    Statistic: {
      colorText: '#ffffff',
      colorTextDescription: 'rgba(255, 255, 255, 0.65)',
    },
    InputNumber: {
      colorBgContainer: 'rgba(0, 0, 0, 0.4)',
      colorBorder: 'rgba(255, 255, 255, 0.2)',
      colorText: '#ffffff',
    },
  },
};

export default darkTheme;
