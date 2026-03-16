import { categories } from '@/constants/data';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

const Filters = () => {
  const params = useLocalSearchParams<{ filter?: string }>();
  const selectedCategory = useMemo(() => (params.filter ?? 'All').toString(), [params.filter]);

  const handleCategoryPress = (category: string) => {
    const newCategory =
      selectedCategory.toLowerCase() === category.toLowerCase() ? 'All' : category;
    router.setParams({ filter: newCategory === 'All' ? undefined : newCategory });
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2 mt-3">
      {categories.map((item, index) => (
        <TouchableOpacity
          onPress={() => handleCategoryPress(item.category)}
          key={index}
          className={`mr-4 flex flex-col items-start rounded-full px-4 py-2 ${selectedCategory.toLowerCase() === item.category.toLowerCase() ? 'bg-primary-300' : 'border border-primary-200 bg-primary-100'}`}
        >
          <Text
            className={`text-sm ${selectedCategory.toLowerCase() === item.category.toLowerCase() ? 'mt-0.5 font-rubik-bold text-white' : 'font-rubik-regular text-primary-300'}`}
          >
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default Filters;
