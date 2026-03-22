import { settings } from '@/constants/data';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { logout } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SettingsItemProps {
  title: string;
  icon: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
  iconElement?: React.ReactNode;
}

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

  const handleLogout = async () => {
    const response = await logout();
    if (response) {
      Alert.alert('Logout Successful', 'You have been logged out successfully.');
      refetch({});
    } else {
      Alert.alert('Logout Failed', 'An error occurred while logging out. Please try again.');
    }
  };
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
          <SettingsItem title="My Bookings" icon={icons.calendar} onPress={() => {}} />
          <SettingsItem title="Payments" icon={icons.wallet} onPress={() => {}} />
          <SettingsItem
            title="Favorites"
            icon={icons.heart}
            iconElement={<Ionicons name="heart-outline" size={20} color="#191D31" />}
            onPress={() => router.push('/favorites')}
          />
        </View>
        <View className="mt-5 flex flex-col border-t border-primary-200 pt-5">
          {settings.slice(2).map((item) => (
            <SettingsItem key={item.title} {...item} />
          ))}
        </View>

        <View className="mt-5 flex flex-col border-t border-primary-200 pt-5">
          <SettingsItem
            title="Logout"
            icon={icons.logout}
            onPress={handleLogout}
            textStyle="text-danger"
            showArrow={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
