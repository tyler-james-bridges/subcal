import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subscription } from '../types';

const SUBSCRIPTIONS_KEY = '@subcal_subscriptions';
const ONBOARDING_COMPLETE_KEY = '@subcal_onboarding_complete';

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

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
  } catch (error) {
    console.error('Error setting onboarding complete:', error);
    throw error;
  }
}
