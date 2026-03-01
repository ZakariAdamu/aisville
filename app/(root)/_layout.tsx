import { useGlobalContext } from '@/lib/global-provider';
import { Redirect, Slot, usePathname } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AppLayout() {
  const { loading, isLoggedIn } = useGlobalContext();
  const pathname = usePathname();
  const isOnSignIn = pathname === '/sign-in';

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator className="text-primary-300" size="large" />
      </SafeAreaView>
    );
  }
  if (!isLoggedIn && !isOnSignIn) {
    return <Redirect href="/sign-in" />;
  }
  return <Slot />;
}
