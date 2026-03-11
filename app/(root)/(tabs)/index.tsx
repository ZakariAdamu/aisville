import { Cards, FeaturedCards } from '@/components/Cards';
import Filters from '@/components/Filters';
import Search from '@/components/Search';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { Image } from 'expo-image';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-5">
          <View className="mt-5 flex flex-row items-center justify-between">
            <View className="flex flex-row items-center">
              <Image
                source={images.avatar}
                style={{ width: 40, height: 40, borderRadius: 100 }}
                contentFit="contain"
              />
              <View className="ml-2 flex flex-col items-start justify-center">
                <Text className="font-rubik-regular text-xs text-black-100">Good morning</Text>
                <Text className="font-rubik-medium text-base text-black-300">Zakari AO</Text>
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5">
              <View className="flex flex-row gap-5 pr-5">
                <FeaturedCards />
                <FeaturedCards />
                <FeaturedCards />
              </View>
            </ScrollView>
          </View>

          <View className="flex flex-row items-center justify-between">
            <Text className="font-rubik-bold text-xl text-black-300">Our Recommendation</Text>
            <TouchableOpacity>
              <Text className="font-rubik-bold text-base text-primary-300">See all</Text>
            </TouchableOpacity>
          </View>
          <Filters />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-5">
            <View className="flex flex-row gap-5 pr-5">
              <Cards />
              <Cards />
            </View>
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
