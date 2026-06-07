import { useState, type FormEvent, useRef } from 'react';
import { useCreateTweet } from '../hooks/useCreateTweet.js';

const MAX_CONTENT_LENGTH = 280;
const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';

interface CreateTweetFormProps {
  onSuccess?: () => void;
}

function CreateTweetForm({ onSuccess }: CreateTweetFormProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { submit, isLoading, error } = useCreateTweet(onSuccess);

  function handleContentChange(value: string) {
    if (validationError) {
      setValidationError(null);
    }
    setContent(value);
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

    const created = await submit(trimmed, image ?? undefined);

    if (created) {
      setContent('');
      handleRemoveImage();
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
          handleContentChange(e.target.value);
        }}
        placeholder="What is happening?"
        rows={3}
        className="w-full resize-none rounded border border-gray-200 p-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
        disabled={isLoading}
      />

      {preview && (
        <div className="relative mt-2 inline-block">
          <img src={preview} alt="Preview" className="max-h-48 rounded object-contain" />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute right-1 top-1 rounded-full bg-black/50 px-2 text-white hover:bg-black/70"
          >
            &times;
          </button>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            onChange={handleImageSelect}
            className="hidden"
            id="image-upload"
            disabled={isLoading}
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer text-sm text-blue-500 hover:text-blue-600"
          >
            Media
          </label>
          <div className="text-sm text-gray-500">
            {charsLeft <= 20 ? (
              <span className={charsLeft < 0 ? 'text-red-500' : 'text-yellow-600'}>
                {charsLeft}
              </span>
            ) : null}
          </div>
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
