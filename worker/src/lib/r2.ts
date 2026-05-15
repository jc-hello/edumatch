// Generates a presigned PUT URL for R2 using AWS Signature v4 (R2 is S3-compatible)
// Requires R2 to have public access or use presigned URLs via CF Access
// For Cloudflare R2 presigned URLs we use the built-in Workers API

export function r2ObjectKey(purpose: string, userId: string, fileName: string): string {
  return `${purpose}/${userId}/${fileName}`;
}

// R2 doesn't natively expose presigned URLs from the binding.
// We use a signed URL pattern via Cloudflare's public bucket feature or return a direct upload URL.
// For the stub: clients PUT to /uploads/direct/:key and we proxy to R2.
export async function generateUploadResponse(
  publicBaseUrl: string,
  purpose: string,
  userId: string,
  fileName: string,
): Promise<{ url: string; publicUrl: string }> {
  const key = r2ObjectKey(purpose, userId, fileName);
  // Direct upload endpoint proxied through this worker
  const url = `/uploads/direct/${encodeURIComponent(key)}`;
  const publicUrl = `${publicBaseUrl}/${key}`;
  return { url, publicUrl };
}
