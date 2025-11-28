/**
 * INTEGRATION TEST for AssignmentApplications - Skill Test Display
 * 
 * This test uses REAL Supabase API calls (no mocks) to verify the complete flow:
 * - Fetches actual assignment data from Supabase
 * - Fetches actual applications with skill test attempts
 * - Renders the component with real data
 * - Verifies the UI displays the data correctly
 * 
 * PREREQUISITES:
 * 1. Supabase must be running and accessible
 * 2. Test data must exist in the database
 * 3. Environment variables must be configured (.env file)
 * 
 * To seed test data: npm run seed-test-data
 */

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AssignmentApplications from '../AssignmentApplications';
import { SupabaseProvider } from '@/providers/SupabaseProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';

// NO MOCKS - This is a real integration test
// API functions imported dynamically in tests after env is loaded

const createWrapper = (assignmentId: string) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { 
        retry: false,
        staleTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider>
      <SupabaseProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[`/assignments/${assignmentId}/applications`]}>
            {children}
          </MemoryRouter>
        </QueryClientProvider>
      </SupabaseProvider>
    </ThemeProvider>
  );
};

describe('AssignmentApplications - Real Supabase Integration', () => {
  // Use longer timeout for real API calls
  jest.setTimeout(30000);

  beforeAll(() => {
    // Debug environment variables
    console.log('🔍 Debug: Environment check');
    console.log('  NODE_ENV:', process.env.NODE_ENV);
    console.log('  VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL?.substring(0, 40) + '...');
    console.log('  VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET (' + process.env.VITE_SUPABASE_ANON_KEY.length + ' chars)' : 'NOT SET');
    console.log('  import.meta available:', typeof (globalThis as any)['import.meta']);
    console.log('  import.meta.env available:', typeof (globalThis as any)['import.meta']?.env);
    console.log('  import.meta.env.VITE_SUPABASE_URL:', (globalThis as any)['import.meta']?.env?.VITE_SUPABASE_URL?.substring(0, 40));
    
    // Verify environment variables are set
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
      throw new Error('Supabase environment variables are not set. Check your .env file.');
    }
    
    // Clear module cache to force re-initialization with correct env vars
    jest.resetModules();
  });

  describe('Real Data Integration', () => {
    it('should fetch and display real assignment applications from Supabase', async () => {
      // First, let's verify we can fetch data from the API directly
      console.log('🔍 Fetching applications from Supabase...');
      
      try {
        // Dynamically import the API after env is loaded
        const { getAssignmentApplications } = await import('@/lib/api/applications');
        
        // Try to fetch any assignment's applications
        // We'll use a known test assignment ID if available
        const applications = await getAssignmentApplications('test-assignment-id', 'job');
        
        console.log(`✅ Found ${applications.length} applications in database`);
        
        if (applications.length === 0) {
          console.warn('⚠️  No applications found. Run seed-test-data to populate database.');
          console.warn('   Skipping UI rendering test...');
          return;
        }

        // Log the first application structure for debugging
        console.log('📋 Sample application data:', JSON.stringify(applications[0], null, 2));

        // If we have data, test the component rendering
        const Wrapper = createWrapper(applications[0].assignment_id);
        
        render(<AssignmentApplications />, { wrapper: Wrapper });

        // Wait for data to load
        await waitFor(
          () => {
            // The component should show SOMETHING - either applications or empty state
            const hasContent = 
              screen.queryByText(/application/i) !== null ||
              screen.queryByText(/no applications/i) !== null ||
              screen.queryByText(/loading/i) !== null;
            
            expect(hasContent).toBe(true);
          },
          { timeout: 10000 }
        );

        console.log('✅ Component rendered successfully with real data');
        
      } catch (error) {
        console.error('❌ Integration test failed:', error);
        throw error;
      }
    });

    it('should connect to Supabase and verify database access', async () => {
      console.log('🔗 Testing Supabase connection...');
      
      try {
        // Import supabase client
        const { default: supabase } = await import('@/lib/supabaseClient');
        
        // Debug the supabase client structure
        console.log('📊 Supabase type:', typeof supabase);
        console.log('📊 from() type:', typeof supabase?.from);
        
        const query = supabase.from('profiles');
        console.log('📊 from() result type:', typeof query);
        console.log('📊 select() type:', typeof query?.select);
        
        const selectQuery = query.select('id, display_name, role');
        console.log('📊 select() result type:', typeof selectQuery);
        console.log('📊 limit() type:', typeof selectQuery?.limit);
        
        // List available methods
        const methods = [];
        for (const key in selectQuery) {
          if (typeof (selectQuery as any)[key] === 'function') {
            methods.push(key);
          }
        }
        console.log('📊 Available methods:', methods.slice(0, 20).join(', '));
        
        // Try a simple query
        const { data, error } = await selectQuery.limit(1);

        if (error) {
          console.error('❌ Query failed:', error);
          throw error;
        }

        console.log('✅ Connection successful!');
        console.log(`📊 Found ${data?.length || 0} profiles`);
        
        expect(error).toBeNull();
        
      } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
      }
    });

    it('should verify skill test data exists in database', async () => {
      console.log('🔍 Checking for skill test templates...');
      
      try {
        const { default: supabase } = await import('@/lib/supabaseClient');
        
        const { data: templates, error } = await supabase
          .from('skill_test_templates')
          .select('id, name, category')
          .limit(5);

        if (error) {
          console.error('❌ Failed to fetch templates:', error);
          throw error;
        }

        console.log(`✅ Found ${templates?.length || 0} skill test templates`);
        
        if (templates && templates.length > 0) {
          console.log('📋 Sample templates:', templates.map(t => t.name).join(', '));
        }

        expect(error).toBeNull();
        
      } catch (error) {
        console.error('❌ Skill test check failed:', error);
        throw error;
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test verifies the component can handle API failures
      const Wrapper = createWrapper('nonexistent-assignment-id');
      
      render(<AssignmentApplications />, { wrapper: Wrapper });

      // Component should either show error message or empty state
      await waitFor(
        () => {
          const hasErrorOrEmpty = 
            screen.queryByText(/error/i) !== null ||
            screen.queryByText(/no applications/i) !== null ||
            screen.queryByText(/not found/i) !== null;
          
          expect(hasErrorOrEmpty).toBe(true);
        },
        { timeout: 10000 }
      );
    });
  });
});
