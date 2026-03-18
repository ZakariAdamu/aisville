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

const normalizePropertyType = (value: string) => {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'all') return 'all';
  if (normalized === 'condos') return 'condo';
  if (normalized === 'duplexes') return 'duplex';
  if (normalized === 'studios') return 'studio';
  if (normalized === 'apartments') return 'apartment';
  if (normalized === 'townhomes') return 'townhouse';
  if (normalized === 'others') return 'other';

  return normalized;
};

export async function getLatestProperties({ limit = 4 }: { limit?: number } = {}) {
  try {
    const queries = [Query.orderDesc('$createdAt')];

    if (limit > 0) {
      queries.push(Query.limit(limit));
    }

    const response = await databases.listDocuments({
      databaseId: config.databaseId!,
      collectionId: config.propertiesTableId!,
      queries,
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
  filter?: string;
  query?: string;
  limit?: number;
}) {
  try {
    const queries = [Query.orderDesc('$createdAt')];
    const normalizedFilter = normalizePropertyType(filter ?? 'all');
    const normalizedQuery = (query ?? '').trim();

    if (normalizedFilter !== 'all') {
      const formattedType = normalizedFilter.charAt(0).toUpperCase() + normalizedFilter.slice(1);
      queries.push(Query.equal('type', formattedType));
    }

    if (normalizedQuery.length > 0) {
      queries.push(
        Query.or([
          Query.search('name', normalizedQuery),
          Query.search('address', normalizedQuery),
          Query.search('type', normalizedQuery),
        ]),
      );
    }

    if (limit && limit > 0) {
      queries.push(Query.limit(limit));
    }

    const response = await databases.listDocuments({
      databaseId: config.databaseId!,
      collectionId: config.propertiesTableId!,
      queries,
    });

    return response.documents;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

export async function getPropertyById(id: string) {
  try {
    const response = await databases.getDocument({
      databaseId: config.databaseId!,
      collectionId: config.propertiesTableId!,
      documentId: id,
    });
    const responseRecord = response as Record<string, unknown>;

    const getRelationshipId = (value: unknown): string | null => {
      if (typeof value === 'string') return value;

      if (value && typeof value === 'object' && '$id' in value) {
        const relatedId = (value as { $id?: unknown }).$id;
        return typeof relatedId === 'string' ? relatedId : null;
      }

      return null;
    };

    const getRelationshipIds = (value: unknown): string[] => {
      if (!Array.isArray(value)) return [];

      return value
        .map((item: unknown) => getRelationshipId(item))
        .filter(
          (relationshipId: string | null): relationshipId is string => relationshipId !== null,
        );
    };

    const fetchDocumentsByIds = async (collectionId: string, ids: string[]) => {
      const fetchedItems = await Promise.all(
        ids.map((documentId: string) =>
          databases
            .getDocument({
              databaseId: config.databaseId!,
              collectionId,
              documentId,
            })
            .catch(() => null),
        ),
      );

      return fetchedItems.filter((item) => item !== null);
    };

    const agentId = getRelationshipId(responseRecord.agent);
    const reviewIds = getRelationshipIds(responseRecord.reviews);
    const galleryIds = getRelationshipIds(responseRecord.gallery);

    const [agent, reviews, gallery] = await Promise.all([
      agentId
        ? databases
            .getDocument({
              databaseId: config.databaseId!,
              collectionId: config.agentsTableId!,
              documentId: agentId,
            })
            .catch(() => null)
        : Promise.resolve(null),
      fetchDocumentsByIds(config.reviewsTableId!, reviewIds),
      fetchDocumentsByIds(config.galleriesTableId!, galleryIds),
    ]);

    return {
      ...response,
      agent: agent ?? responseRecord.agent ?? null,
      reviews: reviews.length > 0 ? reviews : (responseRecord.reviews ?? []),
      gallery: gallery.length > 0 ? gallery : (responseRecord.gallery ?? []),
    };
  } catch (error) {
    console.error(`Error fetching property with ID ${id}:`, error);
    return null;
  }
}

export default client;
