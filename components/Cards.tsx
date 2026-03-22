import icons from '@/constants/icons';
import images from '@/constants/images';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { GestureResponderEvent, Text, TouchableOpacity, View } from 'react-native';

interface PropertyItem {
  $id: string;
  name?: string;
  address?: string;
  price?: number;
  rating?: number;
  image?: string;
}

interface Props {
  item?: PropertyItem;
  onPress?: () => void;
  showFavorite?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  favoriteDisabled?: boolean;
}

const getImageSource = (
  value: string | undefined,
  fallback: string | number,
): { uri: string } | string | number => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return fallback;
  }

  // Only use network sources for absolute http/https URLs.
  if (/^https?:\/\//i.test(normalizedValue)) {
    return { uri: normalizedValue };
  }

  return fallback;
};

const cardShadowStyle = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.18,
  shadowRadius: 10,
  elevation: 4,
};

export const FeaturedCards = ({
  item,
  onPress,
  showFavorite = true,
  isFavorite = false,
  onToggleFavorite,
  favoriteDisabled = false,
}: Props) => {
  const name = item?.name ?? 'Modern Apartment';
  const address = item?.address ?? '22 Sadam Avenue, Tokyo';
  const rating = item?.rating ?? 4.4;
  const price = item?.price ?? 2500;

  const handleFavoritePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onToggleFavorite?.();
  };

  return (
    <TouchableOpacity onPress={onPress} className="relative flex h-80 w-60 flex-col items-start">
      <Image
        source={getImageSource(item?.image, images.japan)}
        style={{ width: '100%', height: '100%', borderRadius: 10 }}
        contentFit="cover"
      />
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
        <Text className="ml-1 font-rubik-bold text-xs text-primary-300">{rating.toFixed(1)}</Text>
      </View>
      <View className="absolute inset-x-5 bottom-5 flex flex-col items-start">
        <Text className="font-rubik-extra-bold text-xl text-white" numberOfLines={1}>
          {name}
        </Text>
        <Text className="font-rubik-regular text-sm text-white">{address}</Text>
        <View className="flex w-full flex-row items-center justify-between">
          <Text className="font-rubik-extra-bold text-xl text-white">
            ${price.toLocaleString()}
          </Text>
          {showFavorite ? (
            <TouchableOpacity
              onPress={handleFavoritePress}
              disabled={favoriteDisabled}
              className="rounded-full bg-white/10 p-1"
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              accessibilityState={{ disabled: favoriteDisabled, selected: isFavorite }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : '#FFFFFF'}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const Cards = ({
  item,
  onPress,
  showFavorite = true,
  isFavorite = false,
  onToggleFavorite,
  favoriteDisabled = false,
}: Props) => {
  const name = item?.name ?? 'Cozy Studio';
  const address = item?.address ?? '22 Sadam Avenue, Tokyo';
  const rating = item?.rating ?? 4.4;
  const price = item?.price ?? 2500;

  const handleFavoritePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onToggleFavorite?.();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-2 mt-4 h-64 w-44 rounded-lg bg-white px-2 pb-3 pt-2"
      style={cardShadowStyle}
    >
      <View className="relative w-full" style={{ height: '60%' }}>
        <Image
          source={getImageSource(item?.image, images.newYork)}
          style={{ width: '100%', height: '100%', borderRadius: 10 }}
          contentFit="cover"
        />
        <View className="absolute right-3 top-1.5 flex flex-row items-center rounded-full bg-white/90 px-2.5 py-1.5">
          <Image source={icons.star} style={{ width: 10, height: 10, borderRadius: 2 }} />
          <Text className="ml-1 font-rubik-bold text-xs text-primary-300">{rating.toFixed(1)}</Text>
        </View>
      </View>
      <View className="mt-2 flex-1 px-1">
        <Text className="font-rubik-bold text-base text-black-300" numberOfLines={1}>
          {name}
        </Text>
        <Text className="font-rubik-regular text-xs text-black-200">{address}</Text>
        <View className="mt-2 flex w-full flex-row items-center justify-between">
          <Text className="font-rubik-bold text-base text-primary-300">
            ${price.toLocaleString()}
          </Text>
          {showFavorite ? (
            <TouchableOpacity
              onPress={handleFavoritePress}
              disabled={favoriteDisabled}
              className="p-1"
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              accessibilityState={{ disabled: favoriteDisabled, selected: isFavorite }}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : '#191D31'}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};
