import { zlibSync, unzlibSync } from "fflate";

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  let standardB64 = base64
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .replace(/ /g, "+");

  const pad = standardB64.length % 4;
  if (pad) {
    standardB64 += "=".repeat(4 - pad);
  }

  const binaryString = atob(standardB64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function compressBase64(base64Str: string): string {
  const bytes = base64ToBytes(base64Str);
  const compressed = zlibSync(bytes, { level: 9 });
  const rawB64 = bytesToBase64(compressed);

  return rawB64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decompressBase64(compressedUrlSafeBase64: string): string {
  const bytes = base64ToBytes(compressedUrlSafeBase64);
  const decompressed = unzlibSync(bytes);
  return bytesToBase64(decompressed);
}

export function base64ToText(base64: string): string {
  const bytes = base64ToBytes(base64);
  return new TextDecoder().decode(bytes);
}

export function textToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return bytesToBase64(bytes);
}
