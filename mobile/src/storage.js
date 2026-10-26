import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export const storage = {
  async getItem(key) {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        return await SecureStore.getItemAsync(key);
      }
    } catch (e) {
      console.warn('SecureStore unavailable, using fallback:', e);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },

  async setItem(key, value) {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        return await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      console.warn('SecureStore unavailable, using fallback:', e);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  },

  async deleteItem(key) {
    try {
      if (Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())) {
        return await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      console.warn('SecureStore unavailable, using fallback:', e);
    }

    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  },
};

export default storage;
