/**
 * Fails when an image committed to the repository still carries embedded
 * metadata (EXIF, XMP, IPTC or text chunks), which can leak GPS coordinates,
 * device details or names. Strip it before committing, e.g. `exiftool -all= <file>`.
 */
import { readdir, readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const ROOTS = ["public", "src"];
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const ascii = (bytes: Uint8Array, start: number, length: number): string =>
  String.fromCharCode(...bytes.subarray(start, start + length));

const startsWith = (bytes: Uint8Array, offset: number, text: string): boolean =>
  ascii(bytes, offset, text.length) === text;

const view = (bytes: Uint8Array): DataView =>
  new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

function jpegMetadata(bytes: Uint8Array): string[] {
  const found: string[] = [];
  const data = view(bytes);
  let offset = 2;
  while (offset + 4 <= bytes.length && data.getUint8(offset) === 0xff) {
    const marker = data.getUint8(offset + 1);
    // Start of scan or end of image: no more metadata segments follow.
    if (marker === 0xda || marker === 0xd9) break;
    const length = data.getUint16(offset + 2);
    const payload = offset + 4;
    if (marker === 0xe1 && startsWith(bytes, payload, "Exif\0\0"))
      found.push("EXIF");
    if (
      marker === 0xe1 &&
      startsWith(bytes, payload, "http://ns.adobe.com/xap/1.0/")
    ) {
      found.push("XMP");
    }
    if (marker === 0xed && startsWith(bytes, payload, "Photoshop 3.0"))
      found.push("IPTC");
    offset += 2 + length;
  }
  return found;
}

function pngMetadata(bytes: Uint8Array): string[] {
  const found: string[] = [];
  const data = view(bytes);
  let offset = 8;
  while (offset + 8 <= bytes.length) {
    const length = data.getUint32(offset);
    const type = ascii(bytes, offset + 4, 4);
    if (type === "eXIf") found.push("EXIF");
    if (type === "tEXt" || type === "zTXt" || type === "iTXt") {
      const keywordEnd = bytes.indexOf(0, offset + 8);
      const keyword = ascii(
        bytes,
        offset + 8,
        Math.max(0, keywordEnd - offset - 8),
      );
      found.push(keyword === "XML:com.adobe.xmp" ? "XMP" : `text (${keyword})`);
    }
    if (type === "IEND") break;
    offset += 12 + length;
  }
  return found;
}

function webpMetadata(bytes: Uint8Array): string[] {
  const found: string[] = [];
  const data = view(bytes);
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const type = ascii(bytes, offset, 4);
    const size = data.getUint32(offset + 4, true);
    if (type === "EXIF") found.push("EXIF");
    if (type === "XMP ") found.push("XMP");
    offset += 8 + size + (size % 2);
  }
  return found;
}

/** Walks ISO-BMFF boxes (`meta` > `iinf` > `infe`) and reports Exif or XMP items. */
function avifMetadata(bytes: Uint8Array): string[] {
  const found: string[] = [];
  const data = view(bytes);

  const boxes = (
    start: number,
    end: number,
  ): { type: string; body: number; end: number }[] => {
    const result = [];
    let offset = start;
    while (offset + 8 <= end) {
      const size = data.getUint32(offset);
      const boxEnd = size === 0 ? end : offset + size;
      if (size !== 0 && size < 8) break;
      result.push({
        type: ascii(bytes, offset + 4, 4),
        body: offset + 8,
        end: Math.min(boxEnd, end),
      });
      offset = boxEnd;
    }
    return result;
  };

  for (const meta of boxes(0, bytes.length).filter(
    (box) => box.type === "meta",
  )) {
    // `meta` is a full box: skip version and flags.
    for (const iinf of boxes(meta.body + 4, meta.end).filter(
      (box) => box.type === "iinf",
    )) {
      const iinfVersion = data.getUint8(iinf.body);
      const entries = iinf.body + 4 + (iinfVersion === 0 ? 2 : 4);
      for (const infe of boxes(entries, iinf.end).filter(
        (box) => box.type === "infe",
      )) {
        const version = data.getUint8(infe.body);
        if (version < 2) continue;
        // version, flags, item_ID (2 or 4 bytes), item_protection_index (2 bytes)
        const itemType = infe.body + 4 + (version === 2 ? 2 : 4) + 2;
        const type = ascii(bytes, itemType, 4);
        if (type === "Exif") found.push("EXIF");
        if (type === "mime") {
          const itemName = bytes.indexOf(0, itemType + 4);
          const contentTypeEnd = bytes.indexOf(0, itemName + 1);
          const contentType = ascii(
            bytes,
            itemName + 1,
            contentTypeEnd - itemName - 1,
          );
          if (contentType.includes("xml")) found.push("XMP");
        }
      }
    }
  }
  return found;
}

/** Returns the kinds of embedded metadata found in an image, or an empty list. */
export function findMetadata(bytes: Uint8Array, extension: string): string[] {
  switch (extension.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return jpegMetadata(bytes);
    case ".png":
      return pngMetadata(bytes);
    case ".webp":
      return webpMetadata(bytes);
    case ".avif":
      return avifMetadata(bytes);
    default:
      return [];
  }
}

async function listImages(directory: string): Promise<string[]> {
  const entries = await readdir(directory, {
    withFileTypes: true,
    recursive: true,
  }).catch(() => []);
  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()),
    )
    .map((entry) => join(entry.parentPath, entry.name));
}

async function main(): Promise<void> {
  const images = (await Promise.all(ROOTS.map(listImages))).flat().sort();
  let failures = 0;
  for (const image of images) {
    const found = findMetadata(await readFile(image), extname(image));
    if (found.length > 0) {
      failures += 1;
      console.error(`${image}: ${found.join(", ")}`);
    }
  }
  if (failures > 0) {
    console.error(
      `\n${String(failures)} image(s) carry metadata. Strip it with: exiftool -all= <file>`,
    );
    process.exitCode = 1;
    return;
  }
  console.log(`No embedded metadata in ${String(images.length)} image(s).`);
}

if (import.meta.main) {
  await main();
}
