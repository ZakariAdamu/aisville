import { Cards, FeaturedCards } from '@/components/Cards';
import Filters from '@/components/Filters';
import Search from '@/components/Search';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { getLatestProperties, getProperties } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { useAppwrite } from '@/lib/useAppwrite';
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

const FeaturedSkeleton = () => (
  <FlatList
    data={[1, 2, 3, 4]}
    keyExtractor={(item) => item.toString()}
    horizontal
    bounces={false}
    showsHorizontalScrollIndicator={false}
    contentContainerClassName="mt-5 flex gap-5"
    renderItem={() => <PulseBlock style={{ height: 320, width: 240, borderRadius: 12 }} />}
  />
);

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

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function Index() {
  const { user } = useGlobalContext();
  const [showFilters, setShowFilters] = useState(true);
  const [showAllFeatured, setShowAllFeatured] = useState(false);
  const [showAllRecommended, setShowAllRecommended] = useState(false);
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());

  useEffect(() => {
    setGreeting(getTimeBasedGreeting());

    const intervalId = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60_000);

    return () => clearInterval(intervalId);
  }, []);

  const params = useLocalSearchParams<{ query?: string; filter?: string }>();
  const queryValue = useMemo(() => (params.query ?? '').toString().trim(), [params.query]);
  const filterValue = useMemo(() => (params.filter ?? 'all').toString(), [params.filter]);

  const featuredLimit = showAllFeatured ? undefined : 4;
  const recommendationLimit = showAllRecommended ? undefined : 6;

  const { data: latestProperties, loading: latestPropertiesLoading } = useAppwrite({
    fn: getLatestProperties,
    params: {
      limit: featuredLimit ?? 0,
    },
  });

  const { data: properties, loading: loadingProperties } = useAppwrite({
    fn: getProperties,
    params: {
      query: queryValue,
      filter: filterValue,
      limit: recommendationLimit ?? 0,
    },
  });

  const featuredList = useMemo(() => latestProperties ?? [], [latestProperties]);
  const recommendationList = useMemo(() => properties ?? [], [properties]);
  const isFilterActive = showFilters || filterValue.toLowerCase() !== 'all';

  const handleCardPress = (propertyId: string) => router.push(`/properties/${propertyId}`);

  const handleFeaturedToggle = () => {
    setShowAllFeatured((current) => !current);
  };

  const handleRecommendationToggle = () => {
    setShowAllRecommended((current) => !current);
  };

  const toggleFilters = () => setShowFilters((current) => !current);

  return (
    <SafeAreaView className="h-full bg-white">
      <FlatList
        data={recommendationList as PropertyItem[]}
        renderItem={({ item }) => (
          <Cards item={item} onPress={() => handleCardPress(item.$id)} showFavorite={false} />
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
              <View className="flex flex-row items-center">
                <Image
                  source={{
                    uri:
                      user?.avatar || user?.name
                        ? `https://ui-avatars.com/api/?name=${user.name}&background=random`
                        : images.avatar,
                  }}
                  style={{ width: 40, height: 40, borderRadius: 100 }}
                  contentFit="contain"
                />
                <View className="ml-2 flex flex-col items-start justify-center">
                  <Text className="font-rubik-regular text-xs text-black-100">{greeting}</Text>
                  <Text className="font-rubik-medium text-base text-black-300">{user?.name}</Text>
                </View>
              </View>
              <Image source={icons.bell} style={{ width: 24, height: 24 }} contentFit="contain" />
            </View>

            <Search
              query={queryValue}
              onFilterPress={toggleFilters}
              isFilterActive={isFilterActive}
            />
            <View className="my-5">
              <View className="flex flex-row items-center justify-between">
                <Text className="font-rubik-bold text-xl text-black-300">Featured</Text>
                <TouchableOpacity onPress={handleFeaturedToggle}>
                  <Text className="font-rubik-bold text-base text-primary-300">
                    {showAllFeatured ? 'Show less' : 'See all'}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* Featured Cards */}
              {latestPropertiesLoading ? (
                <FeaturedSkeleton />
              ) : featuredList.length === 0 ? (
                <EmptyState title="No featured properties available right now." />
              ) : (
                <FlatList
                  data={featuredList as PropertyItem[]}
                  renderItem={({ item }) => (
                    <FeaturedCards
                      item={item}
                      onPress={() => handleCardPress(item.$id)}
                      showFavorite={false}
                    />
                  )}
                  keyExtractor={(item) => item.$id}
                  horizontal
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="mt-5 flex gap-5"
                />
              )}
            </View>
            <View className="flex flex-row items-center justify-between">
              <Text className="font-rubik-bold text-xl text-black-300">Our Recommendation</Text>
              <TouchableOpacity onPress={handleRecommendationToggle}>
                <Text className="font-rubik-bold text-base text-primary-300">
                  {showAllRecommended ? 'Show less' : 'See all'}
                </Text>
              </TouchableOpacity>
            </View>
            {showFilters ? <Filters /> : null}
          </View>
        }
      ></FlatList>
    </SafeAreaView>
  );
}
