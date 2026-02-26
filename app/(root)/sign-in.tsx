import { Image } from "expo-image";
import React, { ReactElement } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";
import images from "@/constants/images";
import { login } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Redirect } from "expo-router";

const SignIn = (): ReactElement => {
  const screenHeight = Dimensions.get("window").height;

  const { refetch, loading, isLoggedIn } = useGlobalContext();

  if (!loading && isLoggedIn) {
    return <Redirect href="/" />;
  }

  const handleLogin = async () => {
    const result = await login();

    if (result) {
      refetch({});
    } else {
      Alert.alert(
        "Login Failed",
        "Unable to login with Google. Please try again.",
      );
    }
  };

  return (
    <SafeAreaView className="mt-6 flex-1 bg-white">
      <ScrollView contentContainerClassName="h-full">
        <Image
          source={images.onboarding}
          style={{ width: "100%", height: screenHeight * 0.6 }}
          contentFit="contain"
        />

        <View className="px-10">
          <Text className="text-center font-rubik-semi-bold text-base uppercase text-black-200 ">
            Welcome to AISVILLE
          </Text>
          <Text className="mt-2 text-center font-rubik-bold text-2xl text-black-300">
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
                style={{ width: 20, height: 20 }}
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
