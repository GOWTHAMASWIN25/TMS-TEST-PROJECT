import { Platform } from 'react-native';

export const typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }),
};

export const colors = {
  // Brand & Accents
  primary: '#2563EB',         // Modern Electric Blue
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  primaryMuted: '#DBEAFE',
  
  accent: '#7C3AED',          // Vibrant Violet
  accentLight: '#F5F3FF',

  // Canvas & Surfaces
  background: '#F8FAFC',      // Slate 50 clean background
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',   // Slate 100
  surfaceElevated: '#FFFFFF',

  // Typography
  ink: '#0F172A',             // Slate 900
  inkSecondary: '#334155',    // Slate 700
  muted: '#64748B',           // Slate 500
  mutedLight: '#94A3B8',      // Slate 400

  // Dividers & Borders
  line: '#E2E8F0',            // Slate 200
  lineLight: '#F1F5F9',
  
  // Status Colors (Vibrant & High Contrast)
  success: '#10B981',         // Emerald
  successLight: '#ECFDF5',
  warning: '#F59E0B',         // Amber
  warningLight: '#FFFBEB',
  danger: '#EF4444',          // Coral Red
  dangerLight: '#FEF2F2',
  info: '#0284C7',            // Sky Blue
  infoLight: '#F0F9FF',
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',
};

export const statusColor = (status) => {
  switch (status) {
    case 'Closed':
      return { tone: colors.success, bg: colors.successLight, label: 'Resolved' };
    case 'In-Progress':
      return { tone: colors.info, bg: colors.infoLight, label: 'In-Progress' };
    case 'Assigned':
      return { tone: colors.purple, bg: colors.purpleLight, label: 'Assigned' };
    case 'Onhold':
      return { tone: '#EC4899', bg: '#FDF2F8', label: 'On Hold' };
    case 'Pending':
    default:
      return { tone: colors.warning, bg: colors.warningLight, label: 'Pending' };
  }
};

export const priorityColor = (priority) => {
  switch (priority) {
    case 'Urgent':
    case 'High':
      return { tone: colors.danger, bg: colors.dangerLight };
    case 'Low':
      return { tone: colors.success, bg: colors.successLight };
    case 'Medium':
    default:
      return { tone: colors.warning, bg: colors.warningLight };
  }
};

export const shadows = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  primaryGlow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 5,
  },
};
