import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subscription } from '../types';

const SUBSCRIPTIONS_KEY = '@subcal_subscriptions';

export async function saveSubscriptions(subscriptions: Subscription[]): Promise<void> {
  try {
    const jsonValue = JSON.stringify(subscriptions);
    await AsyncStorage.setItem(SUBSCRIPTIONS_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving subscriptions:', error);
    throw error;
  }
}

export async function loadSubscriptions(): Promise<Subscription[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(SUBSCRIPTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading subscriptions:', error);
    return [];
  }
}

export async function clearSubscriptions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SUBSCRIPTIONS_KEY);
  } catch (error) {
    console.error('Error clearing subscriptions:', error);
    throw error;
  }
}
