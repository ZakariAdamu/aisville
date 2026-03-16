import icons from '@/constants/icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDebouncedCallback } from 'use-debounce';

interface SearchProps {
  query?: string;
  debounceMs?: number;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
}

const Search = ({
  query = '',
  debounceMs = 500,
  onFilterPress,
  isFilterActive = false,
}: SearchProps) => {
  const router = useRouter();
  const [search, setSearch] = useState(query);

  useEffect(() => {
    setSearch(query);
  }, [query]);

  const normalizedQuery = useMemo(() => query.trim(), [query]);

  const debouncedSearch = useDebouncedCallback((text: string) => {
    const normalizedText = text.trim();

    if (normalizedText === normalizedQuery) return;

    router.setParams({ query: normalizedText.length > 0 ? normalizedText : undefined });
  }, debounceMs);

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSearch = useCallback(
    (text: string) => {
      setSearch(text);
      debouncedSearch(text);
    },
    [debouncedSearch],
  );

  const clearSearch = useCallback(() => {
    debouncedSearch.cancel();
    setSearch('');
    router.setParams({ query: undefined });
  }, [debouncedSearch, router]);

  const hasSearchValue = search.trim().length > 0;

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

      {hasSearchValue ? (
        <TouchableOpacity onPress={clearSearch} className="mr-3 rounded-full bg-white px-2 py-1">
          <Text className="font-rubik-medium text-xs text-black-300">Clear</Text>
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        onPress={onFilterPress}
        className={`rounded-full p-1 ${isFilterActive ? 'bg-primary-100' : ''}`}
      >
        <Image source={icons.filter} style={{ width: 20, height: 20 }} contentFit="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default memo(Search);
