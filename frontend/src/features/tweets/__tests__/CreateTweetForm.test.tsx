import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import CreateTweetForm from '../components/CreateTweetForm.js';

const { mockCreateTweet } = vi.hoisted(() => ({
  mockCreateTweet: vi.fn(),
}));

vi.mock('../api/createTweetApi.js', () => ({
  createTweet: mockCreateTweet,
}));

const mockOnSuccess = vi.fn();

class MockFileReader {
  onloadend: (() => void) | null = null;
  result: string | null = null;

  readAsDataURL(_file: File) {
    this.result = 'data:image/png;base64,fake-preview-content';
    if (this.onloadend) {
      this.onloadend();
    }
  }
}

function renderForm() {
  return render(<CreateTweetForm onSuccess={mockOnSuccess} />);
}

function createMockImage(): File {
  return new File(['fake-image'], 'test.png', { type: 'image/png' });
}

function selectImage(file: File): void {
  const input = document.getElementById('image-upload') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
}

function typeContent(text: string): void {
  fireEvent.change(screen.getByPlaceholderText('What is happening?'), {
    target: { value: text },
  });
}

function clickTweet(): void {
  fireEvent.click(screen.getByRole('button', { name: 'Tweet' }));
}

describe('CreateTweetForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('FileReader', MockFileReader);
  });

  describe('image selection', () => {
    it('should show a preview after selecting an image', async () => {
      renderForm();

      selectImage(createMockImage());

      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeDefined();
      });

      const img = screen.getByAltText('Preview');
      expect(img.getAttribute('src')).toBe('data:image/png;base64,fake-preview-content');
    });

    it('should remove the preview when the remove button is clicked', async () => {
      renderForm();

      selectImage(createMockImage());

      await waitFor(() => {
        expect(screen.getByAltText('Preview')).toBeDefined();
      });

      fireEvent.click(screen.getByRole('button', { name: '×' }));

      expect(screen.queryByAltText('Preview')).toBeNull();
    });
  });

  describe('submit with image', () => {
    it('should call createTweet with content and image on submit', async () => {
      mockCreateTweet.mockResolvedValue({
        id: '1',
        content: 'Photo tweet',
        imageUrl: '/uploads/fake.jpg',
        authorId: 'user-1',
        createdAt: new Date().toISOString(),
      });

      renderForm();

      typeContent('Photo tweet');
      const file = createMockImage();
      selectImage(file);

      clickTweet();

      await waitFor(() => {
        expect(mockCreateTweet).toHaveBeenCalledWith({
          content: 'Photo tweet',
          image: file,
        });
      });
    });

    it('should clear content and preview on successful submit with image', async () => {
      mockCreateTweet.mockResolvedValue({
        id: '1',
        content: 'Photo tweet',
        imageUrl: '/uploads/fake.jpg',
        authorId: 'user-1',
        createdAt: new Date().toISOString(),
      });

      renderForm();

      typeContent('Photo tweet');
      selectImage(createMockImage());

      clickTweet();

      await waitFor(() => {
        expect(mockCreateTweet).toHaveBeenCalled();
      });

      const textarea = screen.getByPlaceholderText<HTMLTextAreaElement>('What is happening?');
      expect(textarea.value).toBe('');
      expect(screen.queryByAltText('Preview')).toBeNull();
      expect(mockOnSuccess).toHaveBeenCalledOnce();
    });

    it('should fail when file type is not accepted', () => {
      renderForm();

      const input = document.getElementById('image-upload') as HTMLInputElement;
      expect(input).toHaveProperty('accept', 'image/jpeg,image/png,image/webp');
    });
  });

  describe('submit without image', () => {
    it('should call createTweet with only content', async () => {
      mockCreateTweet.mockResolvedValue({
        id: '1',
        content: 'Text only',
        authorId: 'user-1',
        createdAt: new Date().toISOString(),
      });

      renderForm();

      typeContent('Text only');
      clickTweet();

      await waitFor(() => {
        expect(mockCreateTweet).toHaveBeenCalledWith({ content: 'Text only' });
      });
    });

    it('should clear the content after successful submission', async () => {
      mockCreateTweet.mockResolvedValue({
        id: '1',
        content: 'Text only',
        authorId: 'user-1',
        createdAt: new Date().toISOString(),
      });

      renderForm();

      typeContent('Text only');
      clickTweet();

      await waitFor(() => {
        expect(mockCreateTweet).toHaveBeenCalled();
      });

      const textarea = screen.getByPlaceholderText<HTMLTextAreaElement>('What is happening?');
      expect(textarea.value).toBe('');
    });
  });

  // existing tests remain below
  it('should create a tweet and clear the form on success', async () => {
    mockCreateTweet.mockResolvedValue({
      id: '1',
      content: 'Hello',
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
    });

    renderForm();

    const textarea = screen.getByPlaceholderText('What is happening?');
    fireEvent.change(textarea, { target: { value: 'Hello' } });

    fireEvent.click(screen.getByRole('button', { name: 'Tweet' }));

    await waitFor(() => {
      expect(mockCreateTweet).toHaveBeenCalledWith({ content: 'Hello' });
    });

    expect((textarea as HTMLTextAreaElement).value).toBe('');
    expect(mockOnSuccess).toHaveBeenCalledOnce();
  });

  it('should keep form content when API request fails', async () => {
    mockCreateTweet.mockRejectedValue({
      response: { data: { error: 'Something went wrong' } },
    });

    renderForm();

    const textarea = screen.getByPlaceholderText('What is happening?');
    fireEvent.change(textarea, { target: { value: 'Hello world' } });

    fireEvent.click(screen.getByRole('button', { name: 'Tweet' }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeDefined();
    });

    expect((textarea as HTMLTextAreaElement).value).toBe('Hello world');
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should not clear form when API request fails', async () => {
    mockCreateTweet.mockRejectedValue(new Error('Network error'));

    renderForm();

    const textarea = screen.getByPlaceholderText('What is happening?');
    fireEvent.change(textarea, { target: { value: 'Persist this' } });

    fireEvent.click(screen.getByRole('button', { name: 'Tweet' }));

    await waitFor(() => {
      expect((textarea as HTMLTextAreaElement).value).toBe('Persist this');
    });
  });

  it('should call onSuccess when tweet is created', async () => {
    mockCreateTweet.mockResolvedValue({
      id: '1',
      content: 'Hello',
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
    });

    renderForm();

    fireEvent.change(screen.getByPlaceholderText('What is happening?'), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tweet' }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledOnce();
    });
  });

  it('should trigger refresh callback after successful tweet creation', async () => {
    mockCreateTweet.mockResolvedValue({
      id: '1',
      content: 'Hello',
      authorId: 'user-1',
      createdAt: new Date().toISOString(),
    });

    renderForm();

    fireEvent.change(screen.getByPlaceholderText('What is happening?'), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tweet' }));

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledOnce();
    });
  });

  it('should show validation error for empty content', () => {
    renderForm();

    const form = screen
      .getByPlaceholderText('What is happening?')
      .closest('form') as HTMLFormElement;
    fireEvent.submit(form);

    expect(screen.getByText('Content is required')).toBeDefined();
    expect(mockCreateTweet).not.toHaveBeenCalled();
  });

  it('should show API error message on failure', async () => {
    mockCreateTweet.mockRejectedValue({
      response: { data: { error: 'Something went wrong' } },
    });

    renderForm();

    fireEvent.change(screen.getByPlaceholderText('What is happening?'), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tweet' }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong')).toBeDefined();
    });
  });

  it('should disable submit button when content is only whitespace', () => {
    renderForm();

    fireEvent.change(screen.getByPlaceholderText('What is happening?'), {
      target: { value: '   ' },
    });

    expect(screen.getByRole('button', { name: 'Tweet' }).getAttribute('disabled')).toBe('');
  });

  it('should show posting state while submitting', async () => {
    mockCreateTweet.mockReturnValue(new Promise(() => {}));

    renderForm();

    fireEvent.change(screen.getByPlaceholderText('What is happening?'), {
      target: { value: 'Hello' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Tweet' }));

    expect(await screen.findByText('Posting...')).toBeDefined();
  });
});
