import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

import { facilities } from '@/constants/data';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { getPropertyById } from '@/lib/appwrite';

import Comment from '@/components/Comment';
import { useAppwrite } from '@/lib/useAppwrite';
import { useFavorites } from '@/lib/useFavorites';
import { Ionicons } from '@expo/vector-icons';
import { Models } from 'react-native-appwrite';

interface Agent {
  name?: string;
  email?: string;
  avatar?: string;
}

interface GalleryItem {
  $id: string;
  image?: string;
}

interface PropertyDetails {
  $id: string;
  name?: string;
  image?: string;
  type?: string;
  rating?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  description?: string;
  address?: string;
  price?: number;
  agent?: Agent | null;
  reviews?: unknown;
  gallery?: unknown;
  facilities?: string[];
}

const PropertyDetailsSkeleton = () => (
  <View className="flex-1 bg-white">
    <View className="h-80 w-full bg-primary-100" />
    <View className="px-5 py-6">
      <View className="h-8 w-2/3 rounded-md bg-primary-100" />
      <View className="mt-4 h-5 w-1/3 rounded-md bg-primary-100" />
      <View className="mt-6 flex flex-row items-center justify-between">
        <View className="h-16 w-16 rounded-full bg-primary-100" />
        <View className="h-16 w-16 rounded-full bg-primary-100" />
        <View className="h-16 w-16 rounded-full bg-primary-100" />
      </View>
      <View className="mt-8 h-5 w-1/2 rounded-md bg-primary-100" />
      <View className="mt-3 h-4 w-full rounded-md bg-primary-100" />
      <View className="mt-2 h-4 w-5/6 rounded-md bg-primary-100" />
      <View className="mt-2 h-4 w-4/6 rounded-md bg-primary-100" />
    </View>
  </View>
);

const Property = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [showMapPreview, setShowMapPreview] = useState(false);
  const [mapPreviewFailed, setMapPreviewFailed] = useState(false);
  const {
    favoriteIds,
    toggleFavorite,
    isTogglingFavorite,
    loading: loadingFavorites,
  } = useFavorites();

  const windowHeight = Dimensions.get('window').height;

  const { data: property, loading } = useAppwrite<PropertyDetails | null, { id: string }>({
    fn: ({ id: propertyId }) => getPropertyById(propertyId) as Promise<PropertyDetails | null>,
    params: {
      id: id ?? '',
    },
    skip: !id,
  });

  const reviews = (Array.isArray(property?.reviews) ? property.reviews : []).filter(
    (item): item is Models.Document => typeof item === 'object' && item !== null,
  );

  const gallery = (Array.isArray(property?.gallery) ? property.gallery : [])
    .map((item): GalleryItem | null => {
      if (!item || typeof item !== 'object') return null;

      const galleryItem = item as { $id?: unknown; image?: unknown };
      if (typeof galleryItem.$id !== 'string') return null;

      return {
        $id: galleryItem.$id,
        image: typeof galleryItem.image === 'string' ? galleryItem.image : undefined,
      };
    })
    .filter((item): item is GalleryItem => item !== null);
  const propertyFacilities = Array.isArray(property?.facilities) ? property.facilities : [];
  const isFavorite = property?.$id ? favoriteIds.has(property.$id) : false;
  const favoriteDisabled = !property?.$id || loadingFavorites || isTogglingFavorite(property.$id);

  const googleMapPreviewUrl = useMemo(() => {
    const location = (property?.address ?? '').trim();

    if (!location) {
      return null;
    }

    const encodedLocation = encodeURIComponent(location);

    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
  }, [property?.address]);

  if (loading) {
    return <PropertyDetailsSkeleton />;
  }

  if (!property) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-5">
        <Text className="font-rubik-medium text-base text-black-200">Property not found.</Text>
      </View>
    );
  }

  return (
    <View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 bg-white">
        <View className="relative w-full" style={{ height: windowHeight / 2 }}>
          <Image
            source={{ uri: property?.image }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
          <Image
            source={images.whiteGradient}
            className="absolute top-0 z-40 w-full"
            contentFit="cover"
          />

          <View
            className="absolute inset-x-7 z-50"
            style={{
              top: Platform.OS === 'ios' ? 70 : 40,
            }}
          >
            <View className="flex w-full flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex size-11 flex-row items-center justify-center rounded-full bg-primary-200"
              >
                <Image
                  source={icons.backArrow}
                  style={{ width: 20, height: 20 }}
                  contentFit="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="mt-7 flex gap-2 px-5">
          <View className="flex flex-row items-center justify-between gap-3">
            <Text className="font-rubik-extrabold text-2xl">{property?.name}</Text>
            <TouchableOpacity
              disabled={favoriteDisabled}
              onPress={() => {
                if (!property?.$id) return;
                toggleFavorite(property.$id);
              }}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              accessibilityState={{ disabled: favoriteDisabled, selected: isFavorite }}
              className="p-2"
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorite ? '#EF4444' : '#191D31'}
              />
            </TouchableOpacity>
            {/* <Image source={icons.send} style={{ width: 28, height: 28 }} contentFit="contain" /> */}
          </View>
          <View className="flex flex-row items-center gap-3">
            <View className="flex flex-row items-center rounded-full bg-primary-100 px-4 py-2">
              <Text className="font-rubik-bold text-xs text-primary-300">{property?.type}</Text>
            </View>

            <View className="flex flex-row items-center gap-2">
              <Image source={icons.star} style={{ width: 20, height: 20 }} contentFit="contain" />
              <Text className="mt-1 font-rubik-medium text-sm text-black-200">
                {property?.rating ?? 0} ({reviews.length} reviews)
              </Text>
            </View>
          </View>

          <View className="mt-5 flex flex-row items-center">
            <View className="flex size-10 flex-row items-center justify-center rounded-full bg-primary-100">
              <Image source={icons.bed} style={{ width: 16, height: 16 }} contentFit="contain" />
            </View>
            <Text className="ml-2 font-rubik-medium text-sm text-black-300">
              {property?.bedrooms} Beds
            </Text>
            <View className="ml-7 flex size-10 flex-row items-center justify-center rounded-full bg-primary-100">
              <Image source={icons.bath} style={{ width: 16, height: 16 }} contentFit="contain" />
            </View>
            <Text className="ml-2 font-rubik-medium text-sm text-black-300">
              {property?.bathrooms} Baths
            </Text>
            <View className="ml-7 flex size-10 flex-row items-center justify-center rounded-full bg-primary-100">
              <Image source={icons.area} style={{ width: 16, height: 16 }} contentFit="contain" />
            </View>
            <Text className="ml-2 font-rubik-medium text-sm text-black-300">
              {property?.area} sqft
            </Text>
          </View>

          <View className="mt-5 w-full border-t border-primary-200 pt-7">
            <Text className="font-rubik-bold text-xl text-black-300">Agent</Text>

            <View className="mt-4 flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <Image
                  source={property?.agent?.avatar ? { uri: property.agent.avatar } : images.avatar}
                  style={{ width: 56, height: 56, borderRadius: 28 }}
                  contentFit="cover"
                />

                <View className="ml-3 flex flex-col items-start justify-center">
                  <Text className="text-start font-rubik-bold text-lg text-black-300">
                    {property?.agent?.name ?? 'Unknown Agent'}
                  </Text>
                  <Text className="text-start font-rubik-medium text-sm text-black-200">
                    {property?.agent?.email ?? 'No email provided'}
                  </Text>
                </View>
              </View>

              <View className="flex flex-row items-center gap-3">
                <Image source={icons.chat} style={{ width: 28, height: 28 }} contentFit="contain" />
                <Image
                  source={icons.phone}
                  style={{ width: 28, height: 28 }}
                  contentFit="contain"
                />
              </View>
            </View>
          </View>

          <View className="mt-7">
            <Text className="font-rubik-bold text-xl text-black-300">Overview</Text>
            <Text className="font-rubik mt-2 text-base text-black-200">
              {property?.description}
            </Text>
          </View>

          <View className="mt-7">
            <Text className="font-rubik-bold text-xl text-black-300">Facilities</Text>

            {propertyFacilities.length > 0 && (
              <View className="mt-2 flex flex-row flex-wrap items-start justify-start gap-5">
                {propertyFacilities.map((item: string, index: number) => {
                  const facility = facilities.find(
                    (facilityItem) => facilityItem.title.toLowerCase() === item.toLowerCase(),
                  );

                  return (
                    <View
                      key={index}
                      className="flex min-w-16 max-w-20 flex-1 flex-col items-center"
                    >
                      <View className="flex size-14 items-center justify-center rounded-full bg-primary-100">
                        <Image
                          source={facility ? facility.icon : icons.info}
                          style={{ width: 24, height: 24 }}
                          contentFit="contain"
                        />
                      </View>

                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="font-rubik mt-1.5 text-center text-sm text-black-300"
                      >
                        {item}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {gallery.length > 0 && (
            <View className="mt-7">
              <Text className="font-rubik-bold text-xl text-black-300">Gallery</Text>
              <FlatList
                contentContainerStyle={{ paddingRight: 20 }}
                data={gallery}
                keyExtractor={(item) => item.$id}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Image
                    source={item?.image ? { uri: item.image } : images.newYork}
                    className="size-40 rounded-xl"
                    contentFit="cover"
                  />
                )}
                contentContainerClassName="flex gap-4 mt-3"
              />
            </View>
          )}

          <View className="mt-7">
            <Text className="font-rubik-bold text-xl text-black-300">Location</Text>
            <View className="mt-4 flex flex-row items-center justify-start gap-2">
              <Image
                source={icons.location}
                style={{ width: 28, height: 28 }}
                contentFit="contain"
              />
              <Text className="font-rubik-medium text-sm text-black-200">{property?.address}</Text>
            </View>

            {!showMapPreview ? (
              <TouchableOpacity
                onPress={() => {
                  setShowMapPreview(true);
                  setMapPreviewFailed(false);
                }}
                className="bg-primary-50 mt-5 items-center rounded-full border border-primary-200 py-3"
              >
                <Text className="font-rubik-medium text-sm text-primary-300">
                  Show Google map preview
                </Text>
              </TouchableOpacity>
            ) : mapPreviewFailed || !googleMapPreviewUrl ? (
              <Image
                source={images.map}
                className="mt-5 h-52 w-full rounded-xl"
                contentFit="cover"
              />
            ) : (
              <View className="mt-5 h-52 overflow-hidden rounded-xl border border-primary-100">
                <WebView
                  source={{ uri: googleMapPreviewUrl }}
                  onError={() => setMapPreviewFailed(true)}
                  startInLoadingState
                  javaScriptEnabled
                  domStorageEnabled
                  style={{ flex: 1 }}
                />
              </View>
            )}
          </View>

          {reviews.length > 0 && (
            <View className="mt-7">
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center">
                  <Image
                    source={icons.star}
                    style={{ width: 24, height: 24 }}
                    contentFit="contain"
                  />
                  <Text className="ml-2 font-rubik-bold text-xl text-black-300">
                    {property?.rating ?? 0} ({reviews.length} reviews)
                  </Text>
                </View>

                <TouchableOpacity>
                  <Text className="font-rubik-bold text-base text-primary-300">View All</Text>
                </TouchableOpacity>
              </View>

              <View className="mt-5">
                <Comment item={reviews[0]} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full rounded-t-2xl border-l border-r border-t border-primary-200 bg-white p-7 pb-12 shadow-md shadow-zinc-400">
        <View className="flex flex-row items-center justify-between gap-10 pb-5">
          <View className="flex flex-col items-start">
            <Text className="font-rubik-medium text-xs text-black-200">Price</Text>
            <Text
              numberOfLines={1}
              className="text-start font-rubik-bold text-2xl text-primary-300"
            >
              ${property?.price}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/booking-details',
                params: { propertyId: property.$id },
              })
            }
            className="flex flex-1 flex-row items-center justify-center rounded-full bg-primary-300 py-3 shadow-md shadow-zinc-400"
          >
            <Text className="text-center font-rubik-bold text-lg text-white">Book Inspection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Property;
