import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function Index() {
	return (
		<View className="flex-1 items-center justify-center bg-cyan-200 gap-4 px-6">
			<Text className="font-rubik-bold text-center text-3xl font-bold text-green-500">
				Welcome to AISVILLE Estate 🏡 
			</Text>
			<Link href="/sign-in" asChild>
				<Pressable className="rounded-md bg-blue-600 px-4 py-2">
					<Text className="font-semibold text-white">Sign In</Text>
				</Pressable>
			</Link>
			<Link href="/explore" asChild>
				<Text className="text-base font-medium text-blue-600">Explore</Text>
			</Link>
			<Link href="/profile" asChild>
				<Text className="text-base font-medium text-blue-600">
					Go to Profile
				</Text>
			</Link>
			<Link href="/properties/123" asChild>
				<Text className="text-base font-medium text-blue-600">
					Go to Property 123
				</Text>
			</Link>
		</View>
	);
}
