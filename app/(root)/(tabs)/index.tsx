import { useGlobalContext } from '@/lib/global-provider';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function Index() {
  const { isLoggedIn, user } = useGlobalContext();
  const userProfile = user as (typeof user & { firstName?: string; username?: string }) | null;
  const displayName =
    userProfile?.firstName?.trim() ||
    userProfile?.username?.trim() ||
    userProfile?.name?.trim().split(' ')[0] ||
    userProfile?.email?.split('@')[0] ||
    'User';

  return (
    <View className="flex-1 items-center justify-center gap-4 px-6">
      <Text className="text-center font-rubik-bold text-3xl font-bold text-black-300">
        Welcome to AisVille
      </Text>
      {isLoggedIn ? (
        <Text className="text-base font-medium text-blue-600">Welcome {displayName}</Text>
      ) : (
        <Link href="/sign-in" asChild>
          <Pressable className="rounded-md bg-blue-600 px-4 py-2">
            <Text className="font-semibold text-white">Sign In</Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
}
