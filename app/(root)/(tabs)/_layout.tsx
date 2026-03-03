import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import icons from '@/constants/icons';

const TabIcon = ({ focused, icon, title }: { focused: boolean; icon: string; title: string }) => {
  return (
    <View className="mt-3 flex flex-1 flex-col items-center">
      <Image
        source={icon}
        style={{ width: 24, height: 24 }}
        contentFit="contain"
        tintColor={focused ? '#0061FF' : '#666876'}
      />
      <Text
        className={`mt-1 w-full text-center text-xs ${focused ? 'text-primary-300' : 'text-black-200'}`}
      >
        {title}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: 'white',
          position: 'absolute',
          borderTopColor: '#0061FF1A',
          borderTopWidth: 1,
          minHeight: 70,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon={icons.home} title="Home" />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.search} title="Explore" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.person} title="Profile" />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
