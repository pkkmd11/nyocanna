import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { FaqItem, InsertFaqItem } from '@shared/schema';

export function useFaqItems() {
  return useQuery({
    queryKey: ['/api/faq'],
    queryFn: async () => {
      const response = await fetch('/api/faq');
      if (!response.ok) throw new Error('Failed to fetch FAQ items');
      return response.json() as Promise<FaqItem[]>;
    }
  });
}

export function useCreateFaqItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (faqItem: InsertFaqItem) => {
      const response = await apiRequest('POST', '/api/faq', faqItem);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faq'] });
    }
  });
}

export function useUpdateFaqItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, faqItem }: { id: string; faqItem: Partial<InsertFaqItem> }) => {
      const response = await apiRequest('PUT', `/api/faq/${id}`, faqItem);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faq'] });
    }
  });
}

export function useDeleteFaqItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/faq/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/faq'] });
    }
  });
}