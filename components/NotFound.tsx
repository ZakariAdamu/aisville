import images from '@/constants/images';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';

const NotFound = () => {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6 py-10">
      <Image
        source={images.noResult}
        style={{ width: 180, height: 180, marginBottom: 24 }}
        contentFit="contain"
      />
      <Text className="mb-2 text-center font-rubik-bold text-2xl text-black-300">
        No results found
      </Text>
      <Text className="text-center font-rubik-regular text-base text-black-200">
        We couldn&apos;t find any results for your search.{'\n'}
        Please try again with different keywords.
      </Text>
    </View>
  );
};

export default NotFound;
