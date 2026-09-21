export const getGoogleDriveFileId = (value: string): string | null => {
  if (!value || typeof value !== 'string') return null;
  const match = value.match(/(?:\/file\/d\/|[?&]id=|\/uc\?id=|\/d\/|[?&]file_id=)([a-zA-Z0-9_-]+)/);
  return match?.[1] ?? null;
};

export const normalizeImageUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;

  const url = value.trim();
  if (!url) return undefined;

  const fileId = getGoogleDriveFileId(url);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return url;
};

export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  originalUrl?: string
) => {
  const target = e.currentTarget;
  const fileId = originalUrl ? getGoogleDriveFileId(originalUrl) : null;

  if (fileId && !target.dataset.triedFallback) {
    target.dataset.triedFallback = 'true';
    target.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  } else {
    target.style.display = 'none';
  }
};
