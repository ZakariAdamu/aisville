import icons from '@/constants/icons';
import images from '@/constants/images';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onPress?: () => void;
}

const cardShadowStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.18,
  shadowRadius: 10,
  elevation: 4,
};

export const FeaturedCards = ({ onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress} className="relative flex h-80 w-60 flex-col items-start">
      <Image source={images.japan} style={{ width: '100%', height: '100%', borderRadius: 10 }} />
      <Image
        source={images.cardGradient}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 10,
          position: 'absolute',
          bottom: 0,
        }}
      />
      <View className="absolute right-5 top-5 flex flex-row items-center rounded-full bg-white/90 px-2.5 py-1.5">
        <Image source={icons.star} style={{ width: 16, height: 16, borderRadius: 2 }} />
        <Text className="ml-1 font-rubik-bold text-xs text-primary-300">4.4</Text>
      </View>
      <View className="absolute inset-x-5 bottom-5 flex flex-col items-start">
        <Text className="font-rubik-extra-bold text-xl text-white" numberOfLines={1}>
          Modern Apartment
        </Text>
        <Text className="font-rubik-regular text-sm text-white">22 Sadam Avenue, Tokyo</Text>
        <View className="flex w-full flex-row items-center justify-between">
          <Text className="font-rubik-extra-bold text-xl text-white">$2,500</Text>
          <Image source={icons.heart} style={{ width: 20, height: 20 }} contentFit="contain" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const Cards = ({ onPress }: Props) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-2 mt-4 h-64 w-44 rounded-lg bg-white px-2 pb-3 pt-2"
      style={cardShadowStyle}
    >
      <View className="relative w-full" style={{ height: '60%' }}>
        <Image
          source={images.newYork}
          style={{ width: '100%', height: '100%', borderRadius: 10 }}
        />
        <View className="absolute right-3 top-1.5 flex flex-row items-center rounded-full bg-white/90 px-2.5 py-1.5">
          <Image source={icons.star} style={{ width: 10, height: 10, borderRadius: 2 }} />
          <Text className="ml-1 font-rubik-bold text-xs text-primary-300">4.4</Text>
        </View>
      </View>
      <View className="mt-2 flex-1 px-1">
        <Text className="font-rubik-bold text-base text-black-300" numberOfLines={1}>
          Cozy Studio
        </Text>
        <Text className="font-rubik-regular text-xs text-black-200">22 Sadam Avenue, Tokyo</Text>
        <View className="mt-2 flex w-full flex-row items-center justify-between">
          <Text className="font-rubik-bold text-base text-primary-300">$2,500</Text>
          <Image
            source={icons.heart}
            style={{ width: 20, height: 20, tintColor: '#191D31' }}
            contentFit="contain"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};
