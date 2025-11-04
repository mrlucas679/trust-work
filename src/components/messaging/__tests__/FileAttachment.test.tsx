/**
 * FileAttachment Component Tests
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { FileAttachment, FileUploadPreview } from '../FileAttachment';

describe('FileAttachment', () => {
    const mockProps = {
        url: 'https://example.com/files/document.pdf',
        name: 'document.pdf',
        type: 'document' as const,
        size: 1024 * 100, // 100KB
    };

    describe('Image attachments', () => {
        it('should render image preview', () => {
            render(
                <FileAttachment
                    {...mockProps}
                    type="image"
                    name="photo.jpg"
                    url="https://example.com/photo.jpg"
                />
            );

            const img = screen.getByRole('img', { name: 'photo.jpg' });
            expect(img).toBeInTheDocument();
            expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
        });

        it('should show download button on hover', () => {
            render(
                <FileAttachment
                    {...mockProps}
                    type="image"
                    name="photo.jpg"
                    url="https://example.com/photo.jpg"
                />
            );

            const downloadLink = screen.getByRole('link');
            expect(downloadLink).toHaveAttribute('download', 'photo.jpg');
        });

        it('should fallback to generic display on image error', () => {
            render(
                <FileAttachment
                    {...mockProps}
                    type="image"
                    name="broken.jpg"
                    url="https://example.com/broken.jpg"
                />
            );

            const img = screen.getByRole('img');
            fireEvent.error(img);

            // Should show filename after error
            expect(screen.getByText('broken.jpg')).toBeInTheDocument();
        });
    });

    describe('Video attachments', () => {
        it('should render video player', () => {
            render(
                <FileAttachment
                    {...mockProps}
                    type="video"
                    name="video.mp4"
                    url="https://example.com/video.mp4"
                />
            );

            const video = screen.getByRole('video', { hidden: true });
            expect(video).toBeInTheDocument();
            expect(video).toHaveAttribute('src', 'https://example.com/video.mp4');
            expect(video).toHaveAttribute('controls');
        });
    });

    describe('Document attachments', () => {
        it('should render document icon and filename', () => {
            render(<FileAttachment {...mockProps} />);

            expect(screen.getByText('document.pdf')).toBeInTheDocument();
        });

        it('should display file size', () => {
            render(<FileAttachment {...mockProps} />);

            expect(screen.getByText('100.0 KB')).toBeInTheDocument();
        });

        it('should have download link', () => {
            render(<FileAttachment {...mockProps} />);

            const downloadLink = screen.getByRole('link');
            expect(downloadLink).toHaveAttribute('href', mockProps.url);
            expect(downloadLink).toHaveAttribute('download', mockProps.name);
        });

        it('should show FileText icon for documents', () => {
            const { container } = render(<FileAttachment {...mockProps} />);

            // Check for icon class
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });
    });

    describe('File type icons', () => {
        it('should show correct icon for image type', () => {
            render(
                <FileAttachment
                    {...mockProps}
                    type="image"
                    name="photo.jpg"
                    url="https://example.com/photo.jpg"
                />
            );

            // Image should be rendered, not icon
            const img = screen.getByRole('img');
            expect(img).toBeInTheDocument();
        });

        it('should show correct icon for video type', () => {
            const { container } = render(
                <FileAttachment
                    {...mockProps}
                    type="video"
                    name="video.mp4"
                />
            );

            const video = container.querySelector('video');
            expect(video).toBeInTheDocument();
        });

        it('should show paperclip icon for other type', () => {
            const { container } = render(
                <FileAttachment {...mockProps} type="other" name="file.zip" />
            );

            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
        });
    });
});

describe('FileUploadPreview', () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    it('should render file name', () => {
        render(<FileUploadPreview file={mockFile} />);

        expect(screen.getByText('test.txt')).toBeInTheDocument();
    });

    it('should display file size', () => {
        render(<FileUploadPreview file={mockFile} />);

        expect(screen.getByText(/12 B/)).toBeInTheDocument(); // 'test content' = 12 bytes
    });

    it('should show progress bar when uploading', () => {
        const { container } = render(
            <FileUploadPreview file={mockFile} progress={45} />
        );

        const progressBar = container.querySelector('[style*="width: 45%"]');
        expect(progressBar).toBeInTheDocument();
    });

    it('should not show progress bar when complete', () => {
        const { container } = render(
            <FileUploadPreview file={mockFile} progress={100} />
        );

        const progressBar = container.querySelector('[style*="width"]');
        expect(progressBar).not.toBeInTheDocument();
    });

    it('should call onRemove when remove button clicked', () => {
        const onRemove = jest.fn();
        render(<FileUploadPreview file={mockFile} onRemove={onRemove} />);

        const removeButton = screen.getByRole('button');
        fireEvent.click(removeButton);

        expect(onRemove).toHaveBeenCalled();
    });

    it('should not show remove button when onRemove not provided', () => {
        render(<FileUploadPreview file={mockFile} />);

        const removeButton = screen.queryByRole('button');
        expect(removeButton).not.toBeInTheDocument();
    });

    it('should generate image preview for image files', async () => {
        const imageFile = new File(['image data'], 'photo.jpg', {
            type: 'image/jpeg',
        });

        // Mock FileReader
        const mockFileReader = {
            readAsDataURL: jest.fn(),
            onloadend: jest.fn(),
            result: 'data:image/jpeg;base64,mockdata',
        };

        global.FileReader = jest.fn(() => mockFileReader) as unknown as typeof FileReader;

        render(<FileUploadPreview file={imageFile} />);

        expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(imageFile);
    });

    it('should show correct icon for non-image files', () => {
        const pdfFile = new File(['pdf data'], 'document.pdf', {
            type: 'application/pdf',
        });

        const { container } = render(<FileUploadPreview file={pdfFile} />);

        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
    });
});
