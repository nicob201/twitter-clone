import { useState, type FormEvent } from 'react';
import { useCreateTweet } from '../hooks/useCreateTweet.js';

const MAX_CONTENT_LENGTH = 280;

interface CreateTweetFormProps {
  onSuccess?: () => void;
}

function CreateTweetForm({ onSuccess }: CreateTweetFormProps) {
  const [content, setContent] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { submit, isLoading, error } = useCreateTweet(onSuccess);

  function handleChange(value: string) {
    if (validationError) {
      setValidationError(null);
    }
    setContent(value);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setValidationError(null);

    const trimmed = content.trim();

    if (!trimmed) {
      setValidationError('Content is required');
      return;
    }

    if (trimmed.length > MAX_CONTENT_LENGTH) {
      setValidationError('Content must be at most ' + String(MAX_CONTENT_LENGTH) + ' characters');
      return;
    }

    const created = await submit(trimmed);

    if (created) {
      setContent('');
    }
  }

  const charsLeft = MAX_CONTENT_LENGTH - content.length;

  return (
    <form
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      className="border-b border-gray-200 p-4"
    >
      <textarea
        value={content}
        onChange={(e) => {
          handleChange(e.target.value);
        }}
        placeholder="What is happening?"
        rows={3}
        className="w-full resize-none rounded border border-gray-200 p-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
        disabled={isLoading}
      />
      <div className="mt-2 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {charsLeft <= 20 ? (
            <span className={charsLeft < 0 ? 'text-red-500' : 'text-yellow-600'}>{charsLeft}</span>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {(validationError || error) && (
            <span className="text-sm text-red-500">{validationError ?? error}</span>
          )}
          <button
            type="submit"
            disabled={isLoading || content.trim().length === 0}
            className="rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Posting...' : 'Tweet'}
          </button>
        </div>
      </div>
    </form>
  );
}

export default CreateTweetForm;
