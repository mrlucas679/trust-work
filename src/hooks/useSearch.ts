/**
 * Search Hooks
 * 
 * Custom React hooks for search functionality using TanStack Query
 * for caching and state management.
 * 
 * @module hooks/useSearch
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import {
    searchAssignments,
    searchFreelancers,
    getSavedSearches,
    getSavedSearch,
    createSavedSearch,
    updateSavedSearch,
    deleteSavedSearch,
    runSavedSearch,
    getSearchHistory,
    addSearchToHistory,
    clearSearchHistory
} from '@/lib/api/search';
import type {
    SearchFilters,
    SearchOptions,
    AssignmentSearchResult,
    FreelancerSearchResult,
    SavedSearch,
    CreateSavedSearchInput,
    UpdateSavedSearchInput,
    SearchHistoryItem
} from '@/types/search';

// ============================================================================
// ASSIGNMENT SEARCH HOOK
// ============================================================================

/**
 * Hook for searching assignments with filters
 */
export function useAssignmentSearch(
    filters: SearchFilters,
    options: SearchOptions = {},
    enabled: boolean = true
) {
    const [currentFilters, setCurrentFilters] = useState<SearchFilters>(filters);

    const query = useQuery({
        queryKey: ['assignments', 'search', currentFilters, options],
        queryFn: async () => {
            const result = await searchAssignments(currentFilters, options);

            // Track search in history
            if (currentFilters.query || Object.keys(currentFilters).length > 0) {
                await addSearchToHistory('assignments', currentFilters, result.total);
            }

            return result;
        },
        enabled,
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 5 // 5 minutes
    });

    const updateFilters = useCallback((newFilters: SearchFilters) => {
        setCurrentFilters(newFilters);
    }, []);

    return {
        ...query,
        filters: currentFilters,
        updateFilters,
        results: query.data?.data || [],
        total: query.data?.total || 0,
        hasMore: query.data?.hasMore || false,
        page: query.data?.page || 1,
        pageSize: query.data?.pageSize || 20
    };
}

// ============================================================================
// FREELANCER SEARCH HOOK
// ============================================================================

/**
 * Hook for searching freelancers with filters
 */
export function useFreelancerSearch(
    filters: SearchFilters,
    options: SearchOptions = {},
    enabled: boolean = true
) {
    const [currentFilters, setCurrentFilters] = useState<SearchFilters>(filters);

    const query = useQuery({
        queryKey: ['freelancers', 'search', currentFilters, options],
        queryFn: async () => {
            const result = await searchFreelancers(currentFilters, options);

            // Track search in history
            if (currentFilters.query || Object.keys(currentFilters).length > 0) {
                await addSearchToHistory('freelancers', currentFilters, result.total);
            }

            return result;
        },
        enabled,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5
    });

    const updateFilters = useCallback((newFilters: SearchFilters) => {
        setCurrentFilters(newFilters);
    }, []);

    return {
        ...query,
        filters: currentFilters,
        updateFilters,
        results: query.data?.data || [],
        total: query.data?.total || 0,
        hasMore: query.data?.hasMore || false,
        page: query.data?.page || 1,
        pageSize: query.data?.pageSize || 20
    };
}

// ============================================================================
// SAVED SEARCHES HOOKS
// ============================================================================

/**
 * Hook to get all saved searches for current user
 */
export function useSavedSearches(userId: string) {
    return useQuery({
        queryKey: ['saved-searches', userId],
        queryFn: () => getSavedSearches(userId),
        staleTime: 1000 * 60 * 5,
        enabled: !!userId
    });
}

/**
 * Hook to get a single saved search
 */
export function useSavedSearch(searchId: string) {
    return useQuery({
        queryKey: ['saved-search', searchId],
        queryFn: () => getSavedSearch(searchId),
        staleTime: 1000 * 60 * 5,
        enabled: !!searchId
    });
}

/**
 * Hook to create a saved search
 */
export function useCreateSavedSearch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { userId: string; input: CreateSavedSearchInput }) =>
            createSavedSearch(params.userId, params.input),
        onSuccess: (_, variables) => {
            // Invalidate saved searches list
            queryClient.invalidateQueries({
                queryKey: ['saved-searches', variables.userId]
            });
        }
    });
}

/**
 * Hook to update a saved search
 */
export function useUpdateSavedSearch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { searchId: string; updates: UpdateSavedSearchInput }) =>
            updateSavedSearch(params.searchId, params.updates),
        onSuccess: (data, variables) => {
            // Update cache for this specific search
            queryClient.setQueryData(['saved-search', variables.searchId], data);

            // Invalidate list to refresh
            queryClient.invalidateQueries({
                queryKey: ['saved-searches']
            });
        }
    });
}

/**
 * Hook to delete a saved search
 */
export function useDeleteSavedSearch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (searchId: string) => deleteSavedSearch(searchId),
        onSuccess: (_, searchId) => {
            // Remove from cache
            queryClient.removeQueries({
                queryKey: ['saved-search', searchId]
            });

            // Invalidate list
            queryClient.invalidateQueries({
                queryKey: ['saved-searches']
            });
        }
    });
}

/**
 * Hook to run a saved search
 */
export function useRunSavedSearch() {
    return useMutation({
        mutationFn: (searchId: string) => runSavedSearch(searchId)
    });
}

// ============================================================================
// SEARCH HISTORY HOOKS
// ============================================================================

/**
 * Hook to get search history
 */
export function useSearchHistory(limit: number = 10) {
    return useQuery({
        queryKey: ['search-history', limit],
        queryFn: () => getSearchHistory(limit),
        staleTime: 1000 * 60 * 1 // 1 minute
    });
}

/**
 * Hook to clear search history
 */
export function useClearSearchHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: clearSearchHistory,
        onSuccess: () => {
            // Invalidate search history
            queryClient.invalidateQueries({
                queryKey: ['search-history']
            });
        }
    });
}

// ============================================================================
// SEARCH STATE HOOK (for managing search UI state)
// ============================================================================

/**
 * Hook for managing search UI state
 */
export function useSearchState(initialFilters: SearchFilters = {}) {
    const [filters, setFilters] = useState<SearchFilters>(initialFilters);
    const [isOpen, setIsOpen] = useState(false);

    const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({});
    }, []);

    const resetToInitial = useCallback(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    const hasActiveFilters = useCallback(() => {
        const { query, ...otherFilters } = filters;
        return Object.values(otherFilters).some(value => {
            if (Array.isArray(value)) return value.length > 0;
            return value !== undefined && value !== null && value !== '';
        });
    }, [filters]);

    return {
        filters,
        setFilters,
        updateFilter,
        clearFilters,
        resetToInitial,
        hasActiveFilters: hasActiveFilters(),
        isOpen,
        setIsOpen
    };
}
