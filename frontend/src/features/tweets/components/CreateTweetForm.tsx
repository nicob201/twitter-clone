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
      className="border-b border-gray-100 px-4 py-3"
    >
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
          ?
        </div>
        <div className="min-w-0 flex-1">
          <textarea
            value={content}
            onChange={(e) => {
              handleContentChange(e.target.value);
            }}
            placeholder="What is happening?"
            rows={3}
            className="w-full resize-none border-0 p-0 text-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-0"
            disabled={isLoading}
          />

          {preview && (
            <div className="relative mt-3 overflow-hidden rounded-2xl border border-gray-100">
              <img src={preview} alt="Preview" className="max-h-64 w-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                &times;
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
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
                className="flex cursor-pointer items-center gap-1 text-sm text-blue-500 hover:text-blue-600"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
                </svg>
                Media
              </label>
              <div className="text-sm text-gray-500">
                {charsLeft <= 20 ? (
                  <span
                    className={
                      charsLeft < 0 ? 'font-semibold text-red-500' : 'font-semibold text-yellow-600'
                    }
                  >
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
                className="rounded-full bg-blue-500 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Posting...' : 'Tweet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default CreateTweetForm;
