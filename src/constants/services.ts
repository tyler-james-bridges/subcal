import { ServiceIcon } from '../types/subscription';

interface ServiceConfig {
  name: string;
  icon: string;
  iconFamily: 'FontAwesome' | 'MaterialCommunityIcons' | 'Ionicons' | 'FontAwesome5' | 'MaterialIcons';
  color: string;
  backgroundColor: string;
}

export const serviceConfigs: Record<ServiceIcon, ServiceConfig> = {
  netflix: {
    name: 'Netflix',
    icon: 'netflix',
    iconFamily: 'MaterialCommunityIcons',
    color: '#E50914',
    backgroundColor: '#000000',
  },
  adobe: {
    name: 'Adobe',
    icon: 'adobe',
    iconFamily: 'MaterialCommunityIcons',
    color: '#FF0000',
    backgroundColor: '#1a0000',
  },
  apple: {
    name: 'Apple',
    icon: 'apple',
    iconFamily: 'FontAwesome',
    color: '#A2AAAD',
    backgroundColor: '#1a1a1a',
  },
  spotify: {
    name: 'Spotify',
    icon: 'spotify',
    iconFamily: 'FontAwesome',
    color: '#1DB954',
    backgroundColor: '#191414',
  },
  figma: {
    name: 'Figma',
    icon: 'figma',
    iconFamily: 'MaterialCommunityIcons',
    color: '#F24E1E',
    backgroundColor: '#1a1a1a',
  },
  slack: {
    name: 'Slack',
    icon: 'slack',
    iconFamily: 'FontAwesome',
    color: '#E01E5A',
    backgroundColor: '#1a1a1a',
  },
  notion: {
    name: 'Notion',
    icon: 'file-document',
    iconFamily: 'MaterialCommunityIcons',
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
  },
  github: {
    name: 'GitHub',
    icon: 'github',
    iconFamily: 'FontAwesome',
    color: '#ffffff',
    backgroundColor: '#24292e',
  },
  dropbox: {
    name: 'Dropbox',
    icon: 'dropbox',
    iconFamily: 'FontAwesome',
    color: '#0061FF',
    backgroundColor: '#1a1a1a',
  },
  google: {
    name: 'Google',
    icon: 'google',
    iconFamily: 'FontAwesome',
    color: '#4285F4',
    backgroundColor: '#1a1a1a',
  },
  microsoft: {
    name: 'Microsoft',
    icon: 'microsoft',
    iconFamily: 'MaterialCommunityIcons',
    color: '#00A4EF',
    backgroundColor: '#1a1a1a',
  },
  amazon: {
    name: 'Amazon',
    icon: 'amazon',
    iconFamily: 'FontAwesome',
    color: '#FF9900',
    backgroundColor: '#232F3E',
  },
  discord: {
    name: 'Discord',
    icon: 'discord',
    iconFamily: 'MaterialCommunityIcons',
    color: '#5865F2',
    backgroundColor: '#1a1a1a',
  },
  zoom: {
    name: 'Zoom',
    icon: 'video',
    iconFamily: 'FontAwesome',
    color: '#2D8CFF',
    backgroundColor: '#1a1a1a',
  },
  linear: {
    name: 'Linear',
    icon: 'linear',
    iconFamily: 'MaterialCommunityIcons',
    color: '#5E6AD2',
    backgroundColor: '#1a1a1a',
  },
  vercel: {
    name: 'Vercel',
    icon: 'triangle',
    iconFamily: 'Ionicons',
    color: '#ffffff',
    backgroundColor: '#000000',
  },
  openai: {
    name: 'OpenAI',
    icon: 'brain',
    iconFamily: 'MaterialCommunityIcons',
    color: '#10A37F',
    backgroundColor: '#1a1a1a',
  },
  custom: {
    name: 'Custom',
    icon: 'star',
    iconFamily: 'FontAwesome',
    color: '#888888',
    backgroundColor: '#1a1a1a',
  },
};

export const availableServices: ServiceIcon[] = [
  'netflix',
  'adobe',
  'apple',
  'spotify',
  'figma',
  'slack',
  'notion',
  'github',
  'dropbox',
  'google',
  'microsoft',
  'amazon',
  'discord',
  'zoom',
  'linear',
  'vercel',
  'openai',
  'custom',
];
