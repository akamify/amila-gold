'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';

type Props = {
  sources: Array<string | null | undefined>;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  compact?: boolean;
  eager?: boolean;
  onSourceResolved?: (source: string) => void;
};

export const normalizeImageSources = (sources: Array<string | null | undefined>) =>
  Array.from(new Set(sources.map((source) => String(source || '').trim()).filter(Boolean)));

const addRetryToken = (source: string, retryVersion: number) => {
  if (!retryVersion || source.startsWith('data:') || source.startsWith('blob:')) return source;
  return `${source}${source.includes('?') ? '&' : '?'}imageRetry=${retryVersion}`;
};

export default function ResilientProductImage({
  sources,
  alt,
  className = 'h-full w-full object-cover',
  fallbackClassName = 'bg-surface-variant text-on-surface-variant',
  compact = false,
  eager = false,
  onSourceResolved,
}: Props) {
  const sourceKey = sources.map((source) => String(source || '').trim()).filter(Boolean).join('|');
  const normalizedSources = useMemo(
    () => normalizeImageSources(sourceKey.split('|')),
    [sourceKey]
  );
  const [sourceIndex, setSourceIndex] = useState(0);
  const [retryVersion, setRetryVersion] = useState(0);
  const [failed, setFailed] = useState(normalizedSources.length === 0);

  useEffect(() => {
    setSourceIndex(0);
    setRetryVersion(0);
    setFailed(normalizedSources.length === 0);
  }, [sourceKey, normalizedSources.length]);

  const currentSource = normalizedSources[sourceIndex];

  const handleError = () => {
    if (sourceIndex < normalizedSources.length - 1) {
      setSourceIndex((current) => current + 1);
      return;
    }
    setFailed(true);
  };

  const retry = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setSourceIndex(0);
    setFailed(normalizedSources.length === 0);
    setRetryVersion(Date.now());
  };

  if (failed || !currentSource) {
    return (
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 text-center ${fallbackClassName}`}>
        <span className={`material-symbols-outlined opacity-60 ${compact ? 'text-lg' : 'text-2xl'}`}>broken_image</span>
        <button
          type="button"
          onClick={retry}
          aria-label="Retry product image"
          className={`rounded-full border border-current/25 bg-white/80 font-bold uppercase tracking-wider text-current shadow-sm transition hover:bg-white ${
            compact ? 'h-5 w-5 text-[0]' : 'px-3 py-1 text-[10px]'
          }`}
        >
          {compact ? <span className="material-symbols-outlined text-xs">refresh</span> : 'Try again'}
        </button>
      </div>
    );
  }

  return (
    <img
      key={`${currentSource}-${retryVersion}`}
      src={addRetryToken(currentSource, retryVersion)}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      onError={handleError}
      onLoad={() => onSourceResolved?.(currentSource)}
    />
  );
}
