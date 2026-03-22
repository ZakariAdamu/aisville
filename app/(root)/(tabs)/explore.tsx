import { Cards } from '@/components/Cards';
import Filters from '@/components/Filters';
import Search from '@/components/Search';
import icons from '@/constants/icons';
import { getProperties } from '@/lib/appwrite';
import { useAppwrite } from '@/lib/useAppwrite';
import { useFavorites } from '@/lib/useFavorites';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StyleProp,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PropertyItem {
  $id: string;
}

interface PulseBlockProps {
  style?: StyleProp<ViewStyle>;
}

const PulseBlock = ({ style }: PulseBlockProps) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return <Animated.View style={[{ backgroundColor: '#E8ECF2', opacity }, style]} />;
};

// Recommendation Skeleton Component
const RecommendationSkeleton = () => (
  <FlatList
    data={[1, 2, 3, 4, 5, 6]}
    keyExtractor={(item) => item.toString()}
    numColumns={2}
    scrollEnabled={false}
    columnWrapperClassName="flex gap-5 px-5"
    contentContainerClassName="mt-4"
    renderItem={() => (
      <PulseBlock style={{ marginBottom: 16, height: 256, width: '48%', borderRadius: 8 }} />
    )}
  />
);

const EmptyState = ({ title }: { title: string }) => (
  <View className="items-center justify-center px-6 py-8">
    <Text className="text-center font-rubik-medium text-base text-black-200">{title}</Text>
  </View>
);

export default function Explore() {
  const [showFilters, setShowFilters] = useState(true);
  const [showAllRecommended] = useState(false);
  const {
    favoriteIds,
    toggleFavorite,
    isTogglingFavorite,
    loading: loadingFavorites,
  } = useFavorites();

  const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  const queryValue = useMemo(() => (params.query ?? '').toString().trim(), [params.query]);
  const filterValue = useMemo(() => (params.filter ?? 'all').toString(), [params.filter]);

  const recommendationLimit = showAllRecommended ? undefined : 20;

  const { data: properties, loading: loadingProperties } = useAppwrite({
    fn: getProperties,
    params: {
      query: queryValue,
      filter: filterValue,
      limit: recommendationLimit ?? 0,
    },
  });

  const recommendationList = useMemo(() => properties ?? [], [properties]);
  const isFilterActive = showFilters || filterValue.toLowerCase() !== 'all';

  const handleCardPress = (propertyId: string) => router.push(`/properties/${propertyId}`);

  const toggleFilters = () => setShowFilters((current) => !current);

  return (
    <SafeAreaView className="h-full bg-white">
      <FlatList
        data={recommendationList as PropertyItem[]}
        renderItem={({ item }) => (
          <Cards
            item={item}
            onPress={() => handleCardPress(item.$id)}
            isFavorite={favoriteIds.has(item.$id)}
            onToggleFavorite={() => toggleFavorite(item.$id)}
            favoriteDisabled={loadingFavorites || isTogglingFavorite(item.$id)}
            showFavorite={false}
          />
        )}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loadingProperties ? (
            <RecommendationSkeleton />
          ) : (
            <EmptyState title="No recommendation found for your current filter/search." />
          )
        }
        ListHeaderComponent={
          <View className="px-5">
            <View className="mt-5 flex flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex size-11 flex-row items-center justify-center rounded-full bg-primary-100"
              >
                <Image
                  source={icons.backArrow}
                  style={{ width: 20, height: 20 }}
                  contentFit="contain"
                />
              </TouchableOpacity>
              <Text className="mr-2 text-center font-rubik-medium text-base text-black-300">
                Search for Your Ideal Home
              </Text>
              <Image source={icons.bell} style={{ width: 24, height: 24 }} contentFit="contain" />
            </View>
            <Search
              query={queryValue}
              onFilterPress={toggleFilters}
              isFilterActive={isFilterActive}
            />
            <View className="my-5">
              {showFilters ? <Filters /> : null}

              <Text className="text-md mt-5 font-rubik-regular">
                Found {recommendationList.length}{' '}
                {recommendationList.length === 1 ? 'property' : 'properties'}
              </Text>
            </View>
          </View>
        }
      ></FlatList>
    </SafeAreaView>
  );
}
