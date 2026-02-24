import { Image } from "expo-image";
import React, { ReactElement } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";
import images from "@/constants/images";

const SignIn = (): ReactElement => {
  const handleLogin = () => {};

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView contentContainerClassName="h-full">
        <Image
          source={images.onboarding}
          className="h-4/6 w-full"
          contentFit="contain"
        />

        <View className="px-10">
          <Text className="text-center font-rubik-semi-bold text-base uppercase text-black-200 ">
            Welcome to AISVILLE
          </Text>
          <Text className="mt-2 text-nowrap text-center font-rubik-bold text-3xl text-black-300">
            Let&apos;s Get You Closer to {"\n"}
            <Text className="text-primary-300">Your Ideal Home</Text>
          </Text>
          <Text className="font-rubik mt-5 text-center">
            Login to AisVille with Google
          </Text>

          <TouchableOpacity
            onPress={handleLogin}
            className="mt-5 w-full rounded-full bg-white py-4 shadow-md shadow-zinc-300"
          >
            <View className="flex flex-row items-center justify-center">
              <Image
                source={icons.google}
                className="h-5 w-5"
                contentFit="contain"
              />
              <Text className="ml-2 font-rubik-medium text-lg text-black-300">
                Continue with Google
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
