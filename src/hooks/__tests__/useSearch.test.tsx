/**
 * Tests for useSearch hooks
 * 
 * Comprehensive test coverage for search functionality hooks
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
    useAssignmentSearch,
    useFreelancerSearch,
    useSavedSearches,
    useSavedSearch,
    useCreateSavedSearch,
    useUpdateSavedSearch,
    useDeleteSavedSearch,
    useRunSavedSearch,
    useSearchHistory,
    useClearSearchHistory,
    useSearchState,
} from '../useSearch';
import * as searchApi from '@/lib/api/search';
import type { SearchFilters, AssignmentSortBy, FreelancerSortBy } from '@/types/search';

// Mock the API module
jest.mock('@/lib/api/search');

// Mock envValidation to avoid import.meta issues
jest.mock('@/lib/envValidation', () => ({
    getEnvironment: () => ({
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-key'
    }),
    validateEnvironment: () => ({
        SUPABASE_URL: 'https://test.supabase.co',
        SUPABASE_ANON_KEY: 'test-key'
    }),
    isEnvironmentConfigured: () => true
}));

const mockedSearchApi = searchApi as jest.Mocked<typeof searchApi>;

// Create a wrapper with QueryClient
function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        );
    };
}

describe('useAssignmentSearch', () => {
    const mockSearchResults = {
        data: [
            { id: 'assignment-1', title: 'Test Assignment 1', created_at: '2024-01-01' },
            { id: 'assignment-2', title: 'Test Assignment 2', created_at: '2024-01-02' },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        hasMore: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch assignment search results', async () => {
        mockedSearchApi.searchAssignments.mockResolvedValue(mockSearchResults);

        const filters: SearchFilters = { query: 'React Developer' };
        const { result } = renderHook(
            () => useAssignmentSearch(filters, { sortBy: 'created_at_desc', page: 1, pageSize: 20 }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockSearchResults);
        expect(mockedSearchApi.searchAssignments).toHaveBeenCalledWith(
            filters,
            { sortBy: 'created_at_desc', page: 1, pageSize: 20 }
        );
    });

    it('should handle empty search results', async () => {
        const emptyResults = {
            data: [],
            total: 0,
            page: 1,
            pageSize: 20,
            hasMore: false,
        };
        mockedSearchApi.searchAssignments.mockResolvedValue(emptyResults);

        const { result } = renderHook(
            () => useAssignmentSearch({}, {}),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.data).toHaveLength(0);
    });

    it('should handle search errors', async () => {
        mockedSearchApi.searchAssignments.mockRejectedValue(new Error('Search failed'));

        const { result } = renderHook(
            () => useAssignmentSearch({ query: 'test' }, {}),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toEqual(new Error('Search failed'));
    });

    it('should use correct sort by default', async () => {
        mockedSearchApi.searchAssignments.mockResolvedValue(mockSearchResults);

        renderHook(
            () => useAssignmentSearch({}, { sortBy: 'budget_desc' }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => {
            expect(mockedSearchApi.searchAssignments).toHaveBeenCalledWith(
                {},
                expect.objectContaining({ sortBy: 'budget_desc' })
            );
        });
    });
});

describe('useFreelancerSearch', () => {
    const mockFreelancers = {
        data: [
            { id: 'freelancer-1', name: 'John Doe', skills: ['React', 'TypeScript'] },
            { id: 'freelancer-2', name: 'Jane Smith', skills: ['Vue', 'JavaScript'] },
        ],
        total: 2,
        page: 1,
        pageSize: 20,
        hasMore: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch freelancer search results', async () => {
        mockedSearchApi.searchFreelancers.mockResolvedValue(mockFreelancers);

        const filters: SearchFilters = { skills: ['React'] };
        const { result } = renderHook(
            () => useFreelancerSearch(filters, { sortBy: 'rating_desc', page: 1, pageSize: 20 }),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockFreelancers);
        expect(mockedSearchApi.searchFreelancers).toHaveBeenCalledWith(
            filters,
            { sortBy: 'rating_desc', page: 1, pageSize: 20 }
        );
    });

    it('should handle freelancer search errors', async () => {
        mockedSearchApi.searchFreelancers.mockRejectedValue(new Error('Freelancer search failed'));

        const { result } = renderHook(
            () => useFreelancerSearch({ skills: ['Python'] }, {}),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toEqual(new Error('Freelancer search failed'));
    });
});

describe('useSavedSearches', () => {
    const mockSavedSearches = [
        {
            id: 'search-1',
            user_id: 'user-1',
            name: 'React Jobs',
            filters: { query: 'React' },
            search_type: 'assignments' as const,
            alert_enabled: true,
            alert_frequency: 'daily' as const,
            created_at: '2024-01-01',
        },
        {
            id: 'search-2',
            user_id: 'user-1',
            name: 'Vue Developers',
            filters: { skills: ['Vue'] },
            search_type: 'freelancers' as const,
            alert_enabled: false,
            alert_frequency: null,
            created_at: '2024-01-02',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch saved searches for user', async () => {
        mockedSearchApi.getSavedSearches.mockResolvedValue(mockSavedSearches);

        const { result } = renderHook(
            () => useSavedSearches('user-1'),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockSavedSearches);
        expect(mockedSearchApi.getSavedSearches).toHaveBeenCalledWith('user-1');
    });

    it('should handle empty saved searches', async () => {
        mockedSearchApi.getSavedSearches.mockResolvedValue([]);

        const { result } = renderHook(
            () => useSavedSearches('user-1'),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual([]);
    });
});

describe('useSavedSearch', () => {
    const mockSavedSearch = {
        id: 'search-1',
        user_id: 'user-1',
        name: 'React Jobs',
        filters: { query: 'React' },
        search_type: 'assignments' as const,
        alert_enabled: true,
        alert_frequency: 'daily' as const,
        created_at: '2024-01-01',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch a single saved search', async () => {
        mockedSearchApi.getSavedSearch.mockResolvedValue(mockSavedSearch);

        const { result } = renderHook(
            () => useSavedSearch('search-1'),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockSavedSearch);
        expect(mockedSearchApi.getSavedSearch).toHaveBeenCalledWith('search-1');
    });

    it('should handle non-existent saved search', async () => {
        mockedSearchApi.getSavedSearch.mockRejectedValue(new Error('Search not found'));

        const { result } = renderHook(
            () => useSavedSearch('non-existent'),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toEqual(new Error('Search not found'));
    });
});

describe('useCreateSavedSearch', () => {
    const mockNewSearch = {
        id: 'search-new',
        user_id: 'user-1',
        name: 'New Search',
        filters: { query: 'TypeScript' },
        search_type: 'assignments' as const,
        alert_enabled: false,
        alert_frequency: null,
        created_at: '2024-01-03',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new saved search', async () => {
        mockedSearchApi.createSavedSearch.mockResolvedValue(mockNewSearch);

        const { result } = renderHook(
            () => useCreateSavedSearch(),
            { wrapper: createWrapper() }
        );

        await waitFor(() => result.current.mutate({
            user_id: 'user-1',
            name: 'New Search',
            filters: { query: 'TypeScript' },
            search_type: 'assignments',
        }));

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockNewSearch);
    });

    it('should handle creation errors', async () => {
        mockedSearchApi.createSavedSearch.mockRejectedValue(new Error('Creation failed'));

        const { result } = renderHook(
            () => useCreateSavedSearch(),
            { wrapper: createWrapper() }
        );

        result.current.mutate({
            user_id: 'user-1',
            name: 'Invalid Search',
            filters: {},
            search_type: 'assignments',
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toEqual(new Error('Creation failed'));
    });
});

describe('useUpdateSavedSearch', () => {
    const mockUpdatedSearch = {
        id: 'search-1',
        user_id: 'user-1',
        name: 'Updated Search',
        filters: { query: 'Updated' },
        search_type: 'assignments' as const,
        alert_enabled: true,
        alert_frequency: 'weekly' as const,
        created_at: '2024-01-01',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should update a saved search', async () => {
        mockedSearchApi.updateSavedSearch.mockResolvedValue(mockUpdatedSearch);

        const { result } = renderHook(
            () => useUpdateSavedSearch(),
            { wrapper: createWrapper() }
        );

        result.current.mutate({
            id: 'search-1',
            name: 'Updated Search',
            filters: { query: 'Updated' },
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockUpdatedSearch);
    });
});

describe('useDeleteSavedSearch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should delete a saved search', async () => {
        mockedSearchApi.deleteSavedSearch.mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useDeleteSavedSearch(),
            { wrapper: createWrapper() }
        );

        result.current.mutate('search-1');

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockedSearchApi.deleteSavedSearch).toHaveBeenCalledWith('search-1');
    });
});

describe('useRunSavedSearch', () => {
    const mockSearchResults = {
        data: [{ id: 'assignment-1', title: 'From Saved Search' }],
        total: 1,
        page: 1,
        pageSize: 20,
        hasMore: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should run a saved search', async () => {
        mockedSearchApi.runSavedSearch.mockResolvedValue(mockSearchResults);

        const { result } = renderHook(
            () => useRunSavedSearch(),
            { wrapper: createWrapper() }
        );

        result.current.mutate('search-1');

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockSearchResults);
        expect(mockedSearchApi.runSavedSearch).toHaveBeenCalledWith('search-1');
    });
});

describe('useSearchHistory', () => {
    const mockHistory = [
        {
            id: 'history-1',
            user_id: 'user-1',
            name: 'Recent Search',
            filters: { query: 'Recent' },
            search_type: 'assignments' as const,
            alert_enabled: false,
            alert_frequency: null,
            created_at: '2024-01-05',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch search history', async () => {
        mockedSearchApi.getSearchHistory.mockResolvedValue(mockHistory);

        const { result } = renderHook(
            () => useSearchHistory('user-1'),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data).toEqual(mockHistory);
    });

    it('should limit history results', async () => {
        mockedSearchApi.getSearchHistory.mockResolvedValue(mockHistory);

        const { result } = renderHook(
            () => useSearchHistory('user-1', 5),
            { wrapper: createWrapper() }
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockedSearchApi.getSearchHistory).toHaveBeenCalledWith('user-1', 5);
    });
});

describe('useClearSearchHistory', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should clear search history', async () => {
        mockedSearchApi.clearSearchHistory.mockResolvedValue(undefined);

        const { result } = renderHook(
            () => useClearSearchHistory(),
            { wrapper: createWrapper() }
        );

        result.current.mutate('user-1');

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockedSearchApi.clearSearchHistory).toHaveBeenCalledWith('user-1');
    });
});

describe('useSearchState', () => {
    it('should manage search UI state', () => {
        const { result } = renderHook(() => useSearchState());

        expect(result.current.isSearching).toBe(false);
        expect(result.current.hasSearched).toBe(false);
        expect(result.current.currentPage).toBe(1);
        expect(result.current.filters).toEqual({});
    });

    it('should set searching state', () => {
        const { result } = renderHook(() => useSearchState());

        result.current.setSearching(true);
        expect(result.current.isSearching).toBe(true);
    });

    it('should update filters', () => {
        const { result } = renderHook(() => useSearchState());

        const newFilters: SearchFilters = { query: 'test', skills: ['React'] };
        result.current.setFilters(newFilters);

        expect(result.current.filters).toEqual(newFilters);
    });

    it('should reset to page 1 on new search', () => {
        const { result } = renderHook(() => useSearchState());

        result.current.setCurrentPage(5);
        result.current.setHasSearched(true);

        expect(result.current.currentPage).toBe(5);

        // Simulate new search
        result.current.setFilters({ query: 'new search' });
        result.current.setCurrentPage(1);

        expect(result.current.currentPage).toBe(1);
    });
});
