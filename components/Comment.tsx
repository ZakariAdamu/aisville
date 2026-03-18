import { Text, View } from 'react-native';

import icons from '@/constants/icons';
import images from '@/constants/images';
import { Image } from 'expo-image';
import { Models } from 'react-native-appwrite';

type ReviewDocument = Models.Document & {
  avatar?: string;
  name?: string;
  review?: string;
};

interface Props {
  item: ReviewDocument;
}

const Comment = ({ item }: Props) => {
  return (
    <View className="flex flex-col items-start">
      <View className="flex flex-row items-center">
        <Image
          source={item.avatar ? { uri: item.avatar } : images.avatar}
          className="size-14 rounded-full"
          contentFit="cover"
        />
        <Text className="ml-3 text-start font-rubik-bold text-base text-black-300">
          {item.name ?? 'Anonymous'}
        </Text>
      </View>

      <Text className="font-rubik mt-2 text-base text-black-200">
        {item.review ?? 'No review provided.'}
      </Text>

      <View className="mt-4 flex w-full flex-row items-center justify-between">
        <View className="flex flex-row items-center">
          <Image source={icons.heart} style={{ width: 20, height: 20, tintColor: '#0061FF' }} />
          <Text className="ml-2 font-rubik-medium text-sm text-black-300">120</Text>
        </View>
        <Text className="font-rubik text-sm text-black-100">
          {new Date(item.$createdAt).toDateString()}
        </Text>
      </View>
    </View>
  );
};

export default Comment;
