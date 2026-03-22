import { getUserFavoritePropertyIds, togglePropertyFavorite } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

interface UseFavoritesResult {
  favoriteIds: Set<string>;
  loading: boolean;
  toggleFavorite: (propertyId: string) => Promise<boolean>;
  isTogglingFavorite: (propertyId: string) => boolean;
}

export const useFavorites = (): UseFavoritesResult => {
  const { user } = useGlobalContext();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const favoriteIdsRef = useRef(favoriteIds);
  const pendingIdsRef = useRef(pendingIds);

  useEffect(() => {
    favoriteIdsRef.current = favoriteIds;
  }, [favoriteIds]);

  useEffect(() => {
    pendingIdsRef.current = pendingIds;
  }, [pendingIds]);

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      if (!user?.$id) {
        if (isMounted) {
          setFavoriteIds(new Set());
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const ids = await getUserFavoritePropertyIds(user.$id);
        if (isMounted) {
          setFavoriteIds(new Set(ids));
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [user?.$id]);

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!user?.$id) {
        Alert.alert('Sign in required', 'Please sign in to save your favorite properties.');
        return false;
      }

      if (!propertyId || pendingIdsRef.current.has(propertyId)) {
        return favoriteIdsRef.current.has(propertyId);
      }

      const wasFavorite = favoriteIdsRef.current.has(propertyId);

      setPendingIds((current) => {
        const next = new Set(current);
        next.add(propertyId);
        return next;
      });

      setFavoriteIds((current) => {
        const next = new Set(current);
        if (next.has(propertyId)) {
          next.delete(propertyId);
        } else {
          next.add(propertyId);
        }
        return next;
      });

      try {
        const response = await togglePropertyFavorite({ userId: user.$id, propertyId });

        setFavoriteIds((current) => {
          const next = new Set(current);
          if (response.isFavorite) {
            next.add(propertyId);
          } else {
            next.delete(propertyId);
          }
          return next;
        });

        return response.isFavorite;
      } catch (error) {
        console.error('Error toggling favorite:', error);

        setFavoriteIds((current) => {
          const next = new Set(current);
          if (wasFavorite) {
            next.add(propertyId);
          } else {
            next.delete(propertyId);
          }
          return next;
        });

        Alert.alert('Action failed', 'We could not update your favorites. Please try again.');
        return wasFavorite;
      } finally {
        setPendingIds((current) => {
          const next = new Set(current);
          next.delete(propertyId);
          return next;
        });
      }
    },
    [user?.$id],
  );

  const isTogglingFavorite = useCallback(
    (propertyId: string) => pendingIds.has(propertyId),
    [pendingIds],
  );

  return {
    favoriteIds,
    loading,
    toggleFavorite,
    isTogglingFavorite,
  };
};

export default useFavorites;
