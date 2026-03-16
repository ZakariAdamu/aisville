import { Cards, FeaturedCards } from '@/components/Cards';
import Filters from '@/components/Filters';
import NotFound from '@/components/NotFound';
import Search from '@/components/Search';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { getLatestProperties, getProperties } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { useAppwrite } from '@/lib/useAppwrite';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FeaturedSkeleton = () => (
  <FlatList
    data={[1, 2, 3]}
    keyExtractor={(item) => item.toString()}
    horizontal
    bounces={false}
    showsHorizontalScrollIndicator={false}
    contentContainerClassName="mt-5 flex gap-5"
    renderItem={() => <View className="h-80 w-60 rounded-xl bg-primary-100" />}
  />
);

const RecommendationSkeleton = () => (
  <View className="mt-4 px-5">
    <View className="flex flex-row flex-wrap justify-between">
      {[1, 2, 3, 4].map((item) => (
        <View key={item} className="mb-4 h-64 w-44 rounded-lg bg-primary-100" />
      ))}
    </View>
  </View>
);

export default function Index() {
  const { user } = useGlobalContext();
  const [showFilters, setShowFilters] = useState(true);

  const params = useLocalSearchParams<{ query?: string; filter?: string }>();

  // get latest properties i.e. featured properties
  const { data: latestProperties, loading: latestPropertiesLoading } = useAppwrite({
    fn: getLatestProperties,
  });

  const queryValue = useMemo(() => (params.query ?? '').toString(), [params.query]);
  const normalizedQueryValue = useMemo(() => queryValue.trim(), [queryValue]);
  const filterValue = useMemo(() => (params.filter ?? 'all').toString(), [params.filter]);

  const { data: properties, loading: loadingProperties } = useAppwrite({
    fn: getProperties,
    params: {
      query: normalizedQueryValue,
      filter: filterValue,
      limit: 6,
    },
  });

  const featuredList = useMemo(() => latestProperties ?? [], [latestProperties]);
  const recommendationList = useMemo(() => properties ?? [], [properties]);
  const hasFeaturedProperties = featuredList.length > 0;
  const isFilterActive = showFilters || filterValue.toLowerCase() !== 'all';

  const handleCardPress = (propertyId: string) => router.push(`/properties/${propertyId}`);
  const toggleFilters = useCallback(() => {
    setShowFilters((current) => !current);
  }, []);

  return (
    <SafeAreaView className="h-full bg-white">
      <FlatList
        data={recommendationList}
        renderItem={({ item }) => <Cards item={item} onPress={() => handleCardPress(item.$id)} />}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={loadingProperties ? <RecommendationSkeleton /> : <NotFound />}
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
                  <Text className="font-rubik-regular text-xs text-black-100">Good morning</Text>
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
                <TouchableOpacity>
                  <Text className="font-rubik-bold text-base text-primary-300">See all</Text>
                </TouchableOpacity>
              </View>
              {/* Featured Cards */}
              {latestPropertiesLoading ? (
                <FeaturedSkeleton />
              ) : !hasFeaturedProperties ? (
                <NotFound />
              ) : (
                <FlatList
                  data={featuredList}
                  renderItem={({ item }) => (
                    <FeaturedCards item={item} onPress={() => handleCardPress(item.$id)} />
                  )}
                  keyExtractor={(item) => item.$id}
                  horizontal
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="flex gap-5 mt-5"
                ></FlatList>
              )}
            </View>
            <View className="flex flex-row items-center justify-between">
              <Text className="font-rubik-bold text-xl text-black-300">Our Recommendation</Text>
              <TouchableOpacity>
                <Text className="font-rubik-bold text-base text-primary-300">See all</Text>
              </TouchableOpacity>
            </View>
            {showFilters ? <Filters /> : null}
          </View>
        }
      ></FlatList>
    </SafeAreaView>
  );
}
