import icons from '@/constants/icons';
import images from '@/constants/images';
import { getPropertyById, getUserBookings, logout, type BookingData } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { useAppwrite } from '@/lib/useAppwrite';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Alert, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsItemProps {
  title: string;
  icon: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
  iconElement?: React.ReactNode;
}

const SLOT_TIME_PATTERN = /^\d{1,2}:\d{2}\s?(AM|PM)$/i;

const formatInspectionTime = (inspectionTime: string) => {
  const normalizedValue = inspectionTime.trim();

  if (SLOT_TIME_PATTERN.test(normalizedValue)) {
    return normalizedValue.toUpperCase();
  }

  const parsedDate = new Date(normalizedValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return normalizedValue;
  }

  return parsedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-700' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  };

  const color = colors[status] || colors.pending;

  return (
    <View className={`rounded-full px-3 py-1 ${color.bg}`}>
      <Text className={`font-rubik-medium text-xs ${color.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
};

const BookingCard = ({
  booking,
  propertyName,
}: {
  booking: BookingData & { $id?: string };
  propertyName?: string;
}) => (
  <View className="mb-3 rounded-2xl border border-primary-100 bg-white p-4">
    <View className="flex flex-row items-start justify-between">
      <View className="flex-1">
        <Text className="font-rubik-bold text-base text-black-300">
          {propertyName || 'Property Name'}
        </Text>
        <Text className="mt-1 font-rubik-regular text-xs text-black-200">
          Type: {booking.inspectionType}
        </Text>
      </View>
      <StatusBadge status={booking.status} />
    </View>

    <View className="mt-3 border-t border-primary-100 pt-3">
      <View className="flex flex-row justify-between">
        <View className="flex-1">
          <Text className="font-rubik-regular text-xs text-black-200">Guest</Text>
          <Text className="font-rubik-medium text-sm text-black-300">{booking.fullName}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-rubik-regular text-xs text-black-200">Attendees</Text>
          <Text className="font-rubik-medium text-sm text-black-300">{booking.attendees}</Text>
        </View>
      </View>

      <View className="mt-2 flex flex-row justify-between">
        <View className="flex-1">
          <Text className="font-rubik-regular text-xs text-black-200">Contact</Text>
          <Text className="font-rubik-medium text-xs text-black-300">{booking.contactMethod}</Text>
        </View>
        {booking.interestType && (
          <View className="flex-1">
            <Text className="font-rubik-regular text-xs text-black-200">Interest</Text>
            <Text className="font-rubik-medium text-xs text-black-300">{booking.interestType}</Text>
          </View>
        )}
      </View>

      <View className="mt-2 flex flex-row justify-between">
        <View className="flex-1">
          <Text className="font-rubik-regular text-xs text-black-200">Date</Text>
          <Text className="font-rubik-medium text-xs text-black-300">
            {new Date(booking.inspectionDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-rubik-regular text-xs text-black-200">Time</Text>
          <Text className="font-rubik-medium text-xs text-black-300">
            {formatInspectionTime(booking.inspectionTime)}
          </Text>
        </View>
      </View>

      {booking.notes && (
        <View className="mt-2">
          <Text className="font-rubik-regular text-xs text-black-200">Notes</Text>
          <Text className="font-rubik-regular text-xs text-black-300">{booking.notes}</Text>
        </View>
      )}
    </View>
  </View>
);

const EmptyBookings = () => (
  <View className="items-center justify-center py-8">
    <Ionicons name="calendar-outline" size={48} color="#B8C5D6" />
    <Text className="mt-3 font-rubik-medium text-base text-black-200">No bookings yet</Text>
    <Text className="mt-1 text-center font-rubik-regular text-xs text-black-100">
      Start booking properties to see them here
    </Text>
  </View>
);

const SettingsItem = ({
  title,
  icon,
  onPress,
  textStyle,
  showArrow = true,
  iconElement,
}: SettingsItemProps) => {
  return (
    <TouchableOpacity className="flex flex-row items-center justify-between py-3" onPress={onPress}>
      <View className="flex flex-row items-center justify-between gap-3">
        {iconElement ?? (
          <Image source={icon} style={{ width: 20, height: 20 }} contentFit="contain" />
        )}
        <Text className={`font-rubik-medium text-lg text-black-300 ${textStyle}`}>{title}</Text>
      </View>
      {showArrow && (
        <Image source={icons.rightArrow} style={{ width: 16, height: 16 }} contentFit="contain" />
      )}
    </TouchableOpacity>
  );
};

const Profile = () => {
  const { user, refetch } = useGlobalContext();
  const [showBookings, setShowBookings] = React.useState(false);
  const [propertyNamesById, setPropertyNamesById] = React.useState<Record<string, string>>({});

  const { data: bookings, loading: bookingsLoading } = useAppwrite({
    fn: () => (user?.email ? getUserBookings(user.email) : Promise.resolve([])),
    params: {},
    skip: !user?.email,
  });

  const bookingsList = useMemo(() => bookings ?? [], [bookings]);

  useEffect(() => {
    let isMounted = true;

    const resolvePropertyNames = async () => {
      const ids = Array.from(
        new Set(
          bookingsList
            .filter((booking) => !booking?.propertyName)
            .map((booking) => booking?.propertyId)
            .filter((propertyId): propertyId is string => !!propertyId),
        ),
      );

      if (ids.length === 0) {
        if (isMounted) setPropertyNamesById({});
        return;
      }

      const resolved = await Promise.all(
        ids.map(async (propertyId) => {
          const property = await getPropertyById(propertyId);
          const record = property as Record<string, unknown> | null;
          const name =
            (typeof record?.name === 'string' && record.name.trim()) ||
            (typeof record?.title === 'string' && record.title.trim()) ||
            propertyId;

          return { propertyId, name };
        }),
      );

      if (!isMounted) return;

      const nextMap: Record<string, string> = {};
      resolved.forEach(({ propertyId, name }) => {
        nextMap[propertyId] = name;
      });
      setPropertyNamesById(nextMap);
    };

    resolvePropertyNames();

    return () => {
      isMounted = false;
    };
  }, [bookingsList]);

  const handleLogout = async () => {
    const response = await logout();
    if (response) {
      Alert.alert('Logout Successful', 'You have been logged out successfully.');
      refetch({});
    } else {
      Alert.alert('Logout Failed', 'An error occurred while logging out. Please try again.');
    }
  };

  // Bookings list screen
  if (showBookings) {
    return (
      <SafeAreaView className="h-full bg-white">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 px-5">
          <View className="mb-4 mt-5 flex flex-row items-center">
            <TouchableOpacity onPress={() => setShowBookings(false)}>
              <Ionicons name="chevron-back" size={24} color="#191D31" />
            </TouchableOpacity>
            <Text className="ml-4 font-rubik-bold text-xl text-black-300">My Bookings</Text>
          </View>

          {bookingsLoading ? (
            <View className="items-center justify-center py-8">
              <Text className="font-rubik-medium text-base text-black-200">
                Loading bookings...
              </Text>
            </View>
          ) : bookingsList.length === 0 ? (
            <EmptyBookings />
          ) : (
            <FlatList
              scrollEnabled={false}
              data={bookingsList}
              renderItem={({ item }) => (
                <BookingCard
                  booking={item as BookingData & { $id?: string }}
                  propertyName={
                    (item as BookingData).propertyName ||
                    propertyNamesById[(item as BookingData).propertyId]
                  }
                />
              )}
              keyExtractor={(item: any, index) => item?.$id || index.toString()}
              ListEmptyComponent={<EmptyBookings />}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 px-7">
        <View className="mt-5 flex flex-row items-center justify-between">
          <Text className="font-rubik-bold text-xl text-black-300">Profile</Text>
          <Image source={icons.bell} style={{ width: 20, height: 20 }} contentFit="contain" />
        </View>
        <View className="mt-5 flex flex-row justify-center">
          <View className="relative mt-5 flex flex-col items-center">
            <Image
              source={{
                uri:
                  user?.avatar || user?.name
                    ? `https://ui-avatars.com/api/?name=${user.name}&background=random`
                    : images.avatar,
              }}
              style={{ width: 80, height: 80, borderRadius: 40, position: 'relative' }}
              contentFit="contain"
            />
            <TouchableOpacity className="absolute bottom-11 right-4">
              <Image source={icons.edit} style={{ width: 9, height: 9 }} contentFit="contain" />
            </TouchableOpacity>
            <Text className="mt-3 font-rubik-semi-bold text-base text-black-300">{user?.name}</Text>
          </View>
        </View>

        {/* settings item */}
        <View className="mt-10 flex flex-col">
          {/*<SettingsItem title="Payments" icon={icons.wallet} onPress={() => { }} /> */}

          <SettingsItem
            title="Favorites"
            icon={icons.heart}
            iconElement={<Ionicons name="heart-outline" size={20} color="#191D31" />}
            onPress={() => router.push('/favorites')}
          />
          <SettingsItem
            title="My Bookings"
            icon={icons.calendar}
            onPress={() => setShowBookings(true)}
          />
        </View>
        {/* <View className="mt-5 flex flex-col border-t border-primary-200 pt-5">
          {settings.slice(2).map((item) => (
            <SettingsItem key={item.title} {...item} />
          ))}
        </View> */}

        <View className="mt-5 flex flex-col border-t border-primary-200 pt-5">
          <SettingsItem
            title="Logout"
            icon={icons.logout}
            onPress={handleLogout}
            textStyle="text-red-500"
            showArrow={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
