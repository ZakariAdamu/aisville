import { Cards, FeaturedCards } from '@/components/Cards';
import Filters from '@/components/Filters';
import Search from '@/components/Search';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { useGlobalContext } from '@/lib/global-provider';
import { Image } from 'expo-image';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  const { user } = useGlobalContext();
  return (
    <SafeAreaView className="h-full bg-white">
      <FlatList
        data={[1, 2, 3, 4]}
        renderItem={({ item }) => <Cards />}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerClassName="pb-32"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
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

            <Search />
            <View className="my-5">
              <View className="flex flex-row items-center justify-between">
                <Text className="font-rubik-bold text-xl text-black-300">Featured</Text>
                <TouchableOpacity>
                  <Text className="font-rubik-bold text-base text-primary-300">See all</Text>
                </TouchableOpacity>
              </View>
              {/* Featured Cards */}
              <FlatList
                data={[1, 2, 3, 4]}
                renderItem={({ item }) => <FeaturedCards />}
                keyExtractor={(item) => item.toString()}
                horizontal
                bounces={false}
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="flex gap-5 mt-5"
              ></FlatList>
            </View>

            <View className="flex flex-row items-center justify-between">
              <Text className="font-rubik-bold text-xl text-black-300">Our Recommendation</Text>
              <TouchableOpacity>
                <Text className="font-rubik-bold text-base text-primary-300">See all</Text>
              </TouchableOpacity>
            </View>
            <Filters />
          </View>
        }
      ></FlatList>
    </SafeAreaView>
  );
}
