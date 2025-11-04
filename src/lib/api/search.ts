/**
 * Search & Discovery API Functions
 * 
 * This module provides functions for searching assignments and freelancers,
 * managing saved searches, and handling search-related operations.
 */

import { supabase } from '@/lib/supabaseClient';
import type {
  SearchFilters,
  SavedSearch,
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
  Assignment,
  FreelancerProfile,
  SearchResult,
  SearchOptions
} from '@/types/search';

// ============================================================================
// ASSIGNMENT SEARCH
// ============================================================================

/**
 * Search for assignments with filters
 */
export async function searchAssignments(
  filters: SearchFilters,
  options: SearchOptions = {}
): Promise<SearchResult<Assignment>> {
  const {
    page = 1,
    pageSize = 20,
    sortBy = 'created_at_desc'
  } = options;

  let query = supabase
    .from('assignments')
    .select('*, client:profiles!client_id(*)', { count: 'exact' })
    .eq('status', 'open');

  // Apply text search
  if (filters.query) {
    query = query.textSearch(
      'title,description',
      filters.query.split(' ').join(' | ')
    );
  }

  // Apply location filters
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters.province) {
    query = query.eq('province', filters.province);
  }

  // Apply budget filters
  if (filters.budgetMin !== undefined) {
    query = query.gte('budget_max', filters.budgetMin);
  }
  if (filters.budgetMax !== undefined) {
    query = query.lte('budget_min', filters.budgetMax);
  }

  // Apply skills filter (array containment)
  if (filters.skills && filters.skills.length > 0) {
    query = query.contains('skills_required', filters.skills);
  }

  // Apply industry filter
  if (filters.industry) {
    query = query.eq('industry', filters.industry);
  }

  // Apply experience level filter
  if (filters.experienceLevel) {
    query = query.eq('experience_level', filters.experienceLevel);
  }

  // Apply date filter
  if (filters.postedWithin && filters.postedWithin !== 'all') {
    const date = new Date();
    if (filters.postedWithin === 'day') {
      date.setDate(date.getDate() - 1);
    } else if (filters.postedWithin === 'week') {
      date.setDate(date.getDate() - 7);
    } else if (filters.postedWithin === 'month') {
      date.setMonth(date.getMonth() - 1);
    }
    query = query.gte('created_at', date.toISOString());
  }

  // Apply sorting
  switch (sortBy) {
    case 'created_at_desc':
      query = query.order('created_at', { ascending: false });
      break;
    case 'created_at_asc':
      query = query.order('created_at', { ascending: true });
      break;
    case 'budget_desc':
      query = query.order('budget_max', { ascending: false, nullsFirst: false });
      break;
    case 'budget_asc':
      query = query.order('budget_min', { ascending: true, nullsFirst: false });
      break;
    case 'title_asc':
      query = query.order('title', { ascending: true });
      break;
    case 'title_desc':
      query = query.order('title', { ascending: false });
      break;
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error searching assignments:', error);
    throw new Error(`Failed to search assignments: ${error.message}`);
  }

  return {
    data: (data as Assignment[]) || [],
    total: count || 0,
    page,
    pageSize,
    hasMore: count ? count > page * pageSize : false
  };
}

// ============================================================================
// FREELANCER SEARCH
// ============================================================================

/**
 * Search for freelancers with filters
 */
export async function searchFreelancers(
  filters: SearchFilters,
  options: SearchOptions = {}
): Promise<SearchResult<FreelancerProfile>> {
  const {
    page = 1,
    pageSize = 20,
    sortBy = 'rating_desc'
  } = options;

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('role', 'job_seeker');

  // Apply text search
  if (filters.query) {
    query = query.textSearch(
      'display_name,desired_role,current_job_title',
      filters.query.split(' ').join(' | ')
    );
  }

  // Apply location filters
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }
  if (filters.province) {
    query = query.eq('province', filters.province);
  }

  // Apply skills filter
  if (filters.skills && filters.skills.length > 0) {
    query = query.contains('skills', filters.skills);
  }

  // Apply industry filter
  if (filters.industry) {
    query = query.eq('industry', filters.industry);
  }

  // Apply experience level filter
  if (filters.experienceLevel) {
    query = query.eq('experience_level', filters.experienceLevel);
  }

  // Apply rating filter
  if (filters.ratingMin !== undefined) {
    query = query.gte('rating', filters.ratingMin);
  }

  // Apply availability filter
  if (filters.availability) {
    query = query.eq('availability', filters.availability);
  }

  // Apply sorting
  switch (sortBy) {
    case 'rating_desc':
      query = query
        .order('rating', { ascending: false, nullsFirst: false })
        .order('completed_projects', { ascending: false, nullsFirst: false });
      break;
    case 'rating_asc':
      query = query.order('rating', { ascending: true, nullsFirst: false });
      break;
    case 'experience_desc':
      query = query.order('completed_projects', { ascending: false, nullsFirst: false });
      break;
    case 'experience_asc':
      query = query.order('completed_projects', { ascending: true, nullsFirst: false });
      break;
    case 'name_asc':
      query = query.order('display_name', { ascending: true });
      break;
    case 'name_desc':
      query = query.order('display_name', { ascending: false });
      break;
  }

  // Apply pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error searching freelancers:', error);
    throw new Error(`Failed to search freelancers: ${error.message}`);
  }

  return {
    data: (data as FreelancerProfile[]) || [],
    total: count || 0,
    page,
    pageSize,
    hasMore: count ? count > page * pageSize : false
  };
}

// ============================================================================
// SAVED SEARCHES
// ============================================================================

/**
 * Get all saved searches for the current user
 */
export async function getSavedSearches(userId: string): Promise<SavedSearch[]> {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved searches:', error);
    throw new Error(`Failed to fetch saved searches: ${error.message}`);
  }

  return data as SavedSearch[];
}

/**
 * Get a single saved search by ID
 */
export async function getSavedSearch(searchId: string): Promise<SavedSearch | null> {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('id', searchId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching saved search:', error);
    throw new Error(`Failed to fetch saved search: ${error.message}`);
  }

  return data as SavedSearch;
}

/**
 * Create a new saved search
 */
export async function createSavedSearch(
  userId: string,
  input: CreateSavedSearchInput
): Promise<SavedSearch> {
  const { data, error } = await supabase
    .from('saved_searches')
    .insert({
      user_id: userId,
      ...input
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating saved search:', error);
    throw new Error(`Failed to create saved search: ${error.message}`);
  }

  return data as SavedSearch;
}

/**
 * Update an existing saved search
 */
export async function updateSavedSearch(
  searchId: string,
  updates: UpdateSavedSearchInput
): Promise<SavedSearch> {
  const { data, error } = await supabase
    .from('saved_searches')
    .update(updates)
    .eq('id', searchId)
    .select()
    .single();

  if (error) {
    console.error('Error updating saved search:', error);
    throw new Error(`Failed to update saved search: ${error.message}`);
  }

  return data as SavedSearch;
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(searchId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', searchId);

  if (error) {
    console.error('Error deleting saved search:', error);
    throw new Error(`Failed to delete saved search: ${error.message}`);
  }
}

/**
 * Execute a saved search (run the search with saved filters)
 */
export async function executeSavedSearch(
  searchId: string,
  options: SearchOptions = {}
): Promise<SearchResult<Assignment | FreelancerProfile>> {
  const savedSearch = await getSavedSearch(searchId);

  if (!savedSearch) {
    throw new Error('Saved search not found');
  }

  if (savedSearch.search_type === 'assignments') {
    return searchAssignments(savedSearch.filters, options) as Promise<SearchResult<Assignment>>;
  } else {
    return searchFreelancers(savedSearch.filters, options) as Promise<SearchResult<FreelancerProfile>>;
  }
}

// ============================================================================
// ASSIGNMENT CRUD (for completeness)
// ============================================================================

/**
 * Get a single assignment by ID
 */
export async function getAssignment(assignmentId: string): Promise<Assignment | null> {
  const { data, error } = await supabase
    .from('assignments')
    .select('*, client:profiles!client_id(*)')
    .eq('id', assignmentId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching assignment:', error);
    throw new Error(`Failed to fetch assignment: ${error.message}`);
  }

  return data as Assignment;
}

/**
 * Get assignments created by a user
 */
export async function getUserAssignments(
  userId: string,
  status?: Assignment['status']
): Promise<Assignment[]> {
  let query = supabase
    .from('assignments')
    .select('*, client:profiles!client_id(*)')
    .eq('client_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user assignments:', error);
    throw new Error(`Failed to fetch user assignments: ${error.message}`);
  }

  return data as Assignment[];
}

// ============================================================================
// AUTOCOMPLETE / SUGGESTIONS
// ============================================================================

/**
 * Get skill suggestions based on partial input
 */
export async function getSkillSuggestions(partial: string, limit = 10): Promise<string[]> {
  if (!partial || partial.length < 2) {
    return [];
  }

  // Get skills from both assignments and profiles
  const [assignmentsResult, profilesResult] = await Promise.all([
    supabase
      .from('assignments')
      .select('skills_required')
      .not('skills_required', 'is', null)
      .limit(100),
    supabase
      .from('profiles')
      .select('skills')
      .not('skills', 'is', null)
      .limit(100)
  ]);

  const allSkills = new Set<string>();

  // Extract skills from assignments
  if (assignmentsResult.data) {
    assignmentsResult.data.forEach((assignment: { skills_required?: string[] }) => {
      assignment.skills_required?.forEach(skill => allSkills.add(skill));
    });
  }

  // Extract skills from profiles
  if (profilesResult.data) {
    profilesResult.data.forEach((profile: { skills?: string[] }) => {
      profile.skills?.forEach(skill => allSkills.add(skill));
    });
  }

  // Filter and sort by relevance
  const filtered = Array.from(allSkills)
    .filter(skill => skill.toLowerCase().includes(partial.toLowerCase()))
    .sort((a, b) => {
      // Prioritize matches at the start of the word
      const aStarts = a.toLowerCase().startsWith(partial.toLowerCase());
      const bStarts = b.toLowerCase().startsWith(partial.toLowerCase());
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.localeCompare(b);
    })
    .slice(0, limit);

  return filtered;
}

/**
 * Get location suggestions based on partial input
 */
export async function getLocationSuggestions(partial: string, limit = 10): Promise<string[]> {
  if (!partial || partial.length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from('assignments')
    .select('location')
    .not('location', 'is', null)
    .ilike('location', `%${partial}%`)
    .limit(limit);

  if (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }

  // Remove duplicates and sort
  const locations = Array.from(
    new Set(data.map((item: { location?: string }) => item.location).filter(Boolean))
  ).sort();

  return locations as string[];
}

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Get search statistics (for analytics)
 */
export async function getSearchStatistics() {
  const [assignmentsCount, freelancersCount, activeSearches] = await Promise.all([
    supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'job_seeker'),
    supabase.from('saved_searches').select('id', { count: 'exact', head: true }).eq('alert_enabled', true)
  ]);

  return {
    totalOpenAssignments: assignmentsCount.count || 0,
    totalFreelancers: freelancersCount.count || 0,
    activeAlerts: activeSearches.count || 0
  };
}

// ============================================================================
// RUN SAVED SEARCH
// ============================================================================

/**
 * Execute a saved search and update its metadata
 */
export async function runSavedSearch(searchId: string) {
  const savedSearch = await getSavedSearch(searchId);
  if (!savedSearch) {
    throw new Error('Saved search not found');
  }

  // Execute the appropriate search
  const result = savedSearch.search_type === 'assignments'
    ? await searchAssignments(savedSearch.filters)
    : await searchFreelancers(savedSearch.filters);

  // Note: Update last_run_at would require adding these fields to the saved_searches table
  // For now, just return the result
  return result;
}

// ============================================================================
// SEARCH HISTORY
// ============================================================================

/**
 * Get search history for current user
 */
export async function getSearchHistory(limit: number = 10): Promise<SavedSearch[]> {
  // For now, return empty array until search_history table is created
  // This function is ready for when the table exists
  return [];
}

/**
 * Add search to history
 */
export async function addSearchToHistory(
  searchType: 'assignments' | 'freelancers',
  filters: SearchFilters,
  resultCount: number
): Promise<void> {
  // For now, do nothing until search_history table is created
  // This function is ready for when the table exists
  return;
}

/**
 * Clear search history for current user
 */
export async function clearSearchHistory(): Promise<void> {
  // For now, do nothing until search_history table is created
  // This function is ready for when the table exists
  return;
}
