import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ContactInfo, InsertContactInfo } from '@shared/schema';

export function useContactInfo() {
  return useQuery({
    queryKey: ['/api/contacts'],
    queryFn: async () => {
      const response = await fetch('/api/contacts');
      if (!response.ok) throw new Error('Failed to fetch contact info');
      return response.json() as Promise<ContactInfo[]>;
    }
  });
}

export function useUpdateContactInfo() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ platform, contactInfo }: { platform: string; contactInfo: Partial<InsertContactInfo> }) => {
      console.log('Updating contact info via mutation:', { platform, contactInfo });
      const response = await apiRequest('PUT', `/api/contacts/${platform}`, contactInfo);
      const result = await response.json();
      console.log('Mutation response result:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Mutation succeeded, invalidating queries. Response data:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    },
    onError: (error) => {
      console.error('Mutation failed:', error);
    }
  });
}