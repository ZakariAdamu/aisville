import { Cards } from '@/components/Cards';
import icons from '@/constants/icons';
import { getFavoritePropertiesByUser } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { useAppwrite } from '@/lib/useAppwrite';
import { useFavorites } from '@/lib/useFavorites';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PropertyItem {
  $id: string;
}

const EmptyState = () => (
  <View className="items-center justify-center px-6 py-10">
    <Text className="text-center font-rubik-medium text-base text-black-200">
      You have no favorites yet. Tap the heart on any property to save it here.
    </Text>
  </View>
);

const Favorites = () => {
  const { user } = useGlobalContext();
  const {
    favoriteIds,
    toggleFavorite,
    isTogglingFavorite,
    loading: loadingFavorites,
  } = useFavorites();

  const { data: favoriteProperties, loading } = useAppwrite({
    fn: ({ userId }: { userId: string }) => getFavoritePropertiesByUser(userId),
    params: {
      userId: user?.$id ?? '',
    },
    skip: !user?.$id,
  });

  const filteredProperties = useMemo(() => {
    const current = favoriteProperties ?? [];
    return current.filter((property) => favoriteIds.has(property.$id));
  }, [favoriteIds, favoriteProperties]);

  return (
    <SafeAreaView className="h-full bg-white">
      <FlatList
        data={filteredProperties as PropertyItem[]}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Cards
            item={item}
            onPress={() => router.push(`/properties/${item.$id}`)}
            isFavorite={favoriteIds.has(item.$id)}
            onToggleFavorite={() => toggleFavorite(item.$id)}
            favoriteDisabled={loadingFavorites || isTogglingFavorite(item.$id)}
          />
        )}
        ListEmptyComponent={loading ? null : <EmptyState />}
        ListHeaderComponent={
          <View className="px-5">
            <View className="mt-5 flex flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.push('/profile')}
                className="flex size-11 flex-row items-center justify-center rounded-full bg-primary-100"
              >
                <Image
                  source={icons.backArrow}
                  style={{ width: 20, height: 20 }}
                  contentFit="contain"
                />
              </TouchableOpacity>
              <Text className="mr-2 text-center font-rubik-bold text-xl text-black-300">
                Favorites
              </Text>
              <View className="w-6" />
            </View>

            <Text className="mt-5 font-rubik-regular text-sm text-black-200">
              {filteredProperties.length}{' '}
              {filteredProperties.length === 1 ? 'saved property' : 'saved properties'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Favorites;
