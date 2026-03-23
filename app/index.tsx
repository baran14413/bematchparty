import { Redirect } from 'expo-router';
import { useAppStore } from '@/src/utils/store';

export default function Index() {
  const { user } = useAppStore();

  // Temporarily Bypass login/onboarding for fast visual testing
  return <Redirect href="/(tabs)" />;

  /*
  if (isLoading) {
    return null; // or a loading spinner
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!user.onboarded) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
  */
}
