import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";
import { Account, Avatars, Client, OAuthProvider } from "react-native-appwrite";

export const config = {
  platform: "com.aishub.aisville",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
};

export const client = new Client();
client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);

export async function login() {
  try {
    const redirectUri = Linking.createURL("/");

    // ✅ Using the new object-style API for OAuth2
    const response = await account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: redirectUri,
    });

    if (!response) throw new Error("Failed to login");

    // ✅ Open the browser session for authentication
    const browserResult = await openAuthSessionAsync(
      response.toString(),
      redirectUri,
    );

    if (browserResult.type !== "success") {
      throw new Error("Failed to authenticate with Google");
    }

    // ✅ Extract parameters from the callback URL
    const url = new URL(browserResult.url);

    // Using optional chaining + toString() ensures values are properly converted
    const secret = url.searchParams.get("secret")?.toString();
    const userId = url.searchParams.get("userId")?.toString();

    if (!secret || !userId) {
      throw new Error("Missing secret or userId in the callback URL");
    }

    // ✅ Correct for React Native: create a session with userId + secret
    const session = await account.createSession({ userId, secret });

    if (!session) {
      throw new Error("Failed to create a session");
    }

    return true;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

export async function logout() {
  try {
    await account.deleteSession({ sessionId: "current" });
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    // ✅ First confirm session exists
    const session = await account
      .getSession({ sessionId: "current" })
      .catch(() => null);
    if (!session) return null;

    // ✅ Now safely fetch user
    const user = await account.get();

    const userAvatar = avatar.getInitials({
      name: user.name || user.email,
    });

    return {
      ...user,
      avatar: userAvatar.toString(),
    };
  } catch (error: any) {
    // ✅ Silence expected guest errors
    if (error?.code === 401) {
      return null;
    }

    console.error("Get current user error:", error);
    return null;
  }
}

export default client;
