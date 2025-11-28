import { uploadCv } from '../storage';

// Mock supabaseClient
jest.mock('../supabaseClient', () => ({
  __esModule: true,
  default: {
    storage: {
      from: jest.fn(),
    },
  },
}));

// Import the mocked module
import supabase from '../supabaseClient';

describe('uploadCv', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw helpful error when bucket is not found', async () => {
    // Mock the storage response for bucket not found
    const mockUpload = jest.fn().mockResolvedValue({
      error: new Error('Bucket "resumes" does not exist'),
    });
    const mockGetPublicUrl = jest.fn();

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });

    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const userId = 'test-user-id';

    await expect(uploadCv(mockFile, userId)).rejects.toThrow(
      /Storage bucket 'resumes' not found.*create the bucket/i
    );
  });

  it('should throw error when user is not authenticated', async () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    await expect(uploadCv(mockFile, '')).rejects.toThrow('Not authenticated');
  });

  it('should upload file successfully and return URL', async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/resumes/test-user-id/test.pdf' },
    });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });

    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const userId = 'test-user-id';

    const result = await uploadCv(mockFile, userId);

    expect(result.url).toBe('https://example.com/resumes/test-user-id/test.pdf');
    expect(result.path).toMatch(/^test-user-id\/\d+-test\.pdf$/);
    expect(mockUpload).toHaveBeenCalled();
    expect(mockGetPublicUrl).toHaveBeenCalled();
  });

  it('should handle upload error properly', async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      error: new Error('Network error'),
    });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
    });

    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const userId = 'test-user-id';

    await expect(uploadCv(mockFile, userId)).rejects.toThrow('Network error');
  });

  it('should sanitize file names properly', async () => {
    const mockUpload = jest.fn().mockResolvedValue({
      error: null,
    });
    const mockGetPublicUrl = jest.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/resumes/test-user-id/file.pdf' },
    });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });

    const mockFile = new File(
      ['test content'],
      'My Resume (Final) @2024!.pdf',
      { type: 'application/pdf' }
    );
    const userId = 'test-user-id';

    const result = await uploadCv(mockFile, userId);

    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringMatching(/^test-user-id\/\d+-My_Resume__Final___2024_.pdf$/),
      mockFile,
      expect.any(Object)
    );
  });
});
