import * as Linking from 'expo-linking';
import { openAuthSessionAsync } from 'expo-web-browser';
import { Account, Avatars, Client, Databases, OAuthProvider, Query } from 'react-native-appwrite';

export const config = {
  platform: 'com.aishub.aisville',
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  galleriesTableId: process.env.EXPO_PUBLIC_APPWRITE_GALLERIES_TABLE_ID,
  reviewsTableId: process.env.EXPO_PUBLIC_APPWRITE_REVIEWS_TABLE_ID,
  agentsTableId: process.env.EXPO_PUBLIC_APPWRITE_AGENTS_TABLE_ID,
  propertiesTableId: process.env.EXPO_PUBLIC_APPWRITE_PROPERTIES_TABLE_ID,
};

export const client = new Client();
if (!config.endpoint || !config.projectId || !config.platform) {
  throw new Error('Appwrite environment variables are not set. Please check your .env file.');
}
client.setEndpoint(config.endpoint).setProject(config.projectId).setPlatform(config.platform);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

export async function login() {
  try {
    const redirectUri = Linking.createURL('/explore');

    // ✅ Using the new object-style API for OAuth2
    const response = await account.createOAuth2Token({
      provider: OAuthProvider.Google,
      success: redirectUri,
    });

    if (!response) throw new Error('Failed to login');

    // ✅ Open the browser session for authentication
    const browserResult = await openAuthSessionAsync(response.toString(), redirectUri);

    if (browserResult.type !== 'success') {
      throw new Error('Failed to authenticate with Google');
    }

    // ✅ Extract parameters from the callback URL
    const url = new URL(browserResult.url);

    // Using optional chaining + toString() ensures values are properly converted
    const secret = url.searchParams.get('secret')?.toString();
    const userId = url.searchParams.get('userId')?.toString();

    if (!secret || !userId) {
      throw new Error('Missing secret or userId in the callback URL');
    }

    // ✅ Correct for React Native: create a session with userId + secret
    const session = await account.createSession({ userId, secret });

    if (!session) {
      throw new Error('Failed to create a session');
    }

    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

export async function logout() {
  try {
    await account.deleteSession({ sessionId: 'current' });
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

export async function getCurrentUser() {
  try {
    // ✅ First confirm session exists
    const session = await account.getSession({ sessionId: 'current' }).catch(() => null);
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

    console.error('Get current user error:', error);
    return null;
  }
}

export async function getLatestProperties() {
  try {
    const response = await databases.listDocuments({
      databaseId: config.databaseId!,
      collectionId: config.propertiesTableId!,
      queries: [Query.orderAsc('$createdAt'), Query.limit(5)],
    });

    return response.documents;
  } catch (error) {
    console.error('Error fetching latest properties:', error);
    return [];
  }
}

export async function getProperties({
  filter,
  query,
  limit,
}: {
  filter: string;
  query: string;
  limit?: number;
}) {
  try {
    const buildQuery = [Query.orderDesc('$createdAt')];

    if (filter && filter !== 'all') {
      buildQuery.push(Query.equal('type', filter));
    }
    if (query) {
      buildQuery.push(
        Query.or([
          Query.search('name', query),
          Query.search('address', query),
          Query.search('type', query),
        ]),
      );
    }
    if (limit) {
      buildQuery.push(Query.limit(limit));
    }

    const response = await databases.listDocuments({
      databaseId: config.databaseId!,
      collectionId: config.propertiesTableId!,
      queries: buildQuery,
    });

    return response.documents;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

export default client;
