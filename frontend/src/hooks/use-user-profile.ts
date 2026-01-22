
import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { fetchUser } from '@/services/userService';
import { useToast } from './use-toast';

export const useUserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await fetchUser();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user profile:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  return { 
    user, 
    loading, 
    refreshUserProfile: loadUserProfile 
  };
};

// Export an alias for backward compatibility
export const useProfile = useUserProfile;
