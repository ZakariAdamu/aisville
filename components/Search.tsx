import icons from '@/constants/icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { useDebouncedCallback } from 'use-debounce';

const Search = () => {
  const path = usePathname();
  const router = useRouter();
  const params = useLocalSearchParams<{ query?: string }>();
  const [search, setSearch] = useState(params.query ?? '');

  const debouncedSearch = useDebouncedCallback((text: string) => {
    router.setParams({ query: text });
  }, 500);

  const handleSearch = (text: string) => {
    setSearch(text);
    debouncedSearch(text);
  };
  return (
    <View className="mt-5 flex w-full flex-row items-center justify-between rounded-lg border border-primary-100 bg-accent-100 px-4 py-2">
      <View className="z-50 flex flex-1 flex-row items-center justify-start">
        <Image source={icons.search} style={{ width: 20, height: 20 }} contentFit="contain" />
        <TextInput
          value={search || ''}
          onChangeText={handleSearch}
          placeholder="Search..."
          className="ml-2 flex-1 font-rubik-regular text-sm text-black-300"
        />
      </View>
      <TouchableOpacity>
        <Image source={icons.filter} style={{ width: 20, height: 20 }} contentFit="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default Search;
