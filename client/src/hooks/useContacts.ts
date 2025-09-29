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
      const response = await apiRequest('PUT', `/api/contacts/${platform}`, contactInfo);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    }
  });
}