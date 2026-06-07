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

function renderForm() {
  return render(<CreateTweetForm onSuccess={mockOnSuccess} />);
}

describe('CreateTweetForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
