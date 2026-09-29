import { describe, expect, it } from "vitest";

import { findMetadata } from "./check-image-metadata.ts";

const text = (value: string): number[] =>
  Array.from(new TextEncoder().encode(value));
const u16 = (value: number): number[] => [value >> 8, value & 0xff];
const u32 = (value: number): number[] => [
  (value >>> 24) & 0xff,
  (value >> 16) & 0xff,
  (value >> 8) & 0xff,
  value & 0xff,
];
const u32le = (value: number): number[] => u32(value).reverse();

const jpeg = (...segments: [marker: number, payload: number[]][]): Uint8Array =>
  Uint8Array.from([
    0xff,
    0xd8,
    ...segments.flatMap(([marker, payload]) => [
      0xff,
      marker,
      ...u16(payload.length + 2),
      ...payload,
    ]),
    0xff,
    0xda,
    0,
    2,
  ]);

const png = (...chunks: [type: string, data: number[]][]): Uint8Array =>
  Uint8Array.from([
    0x89,
    ...text("PNG\r\n\x1a\n"),
    ...chunks.flatMap(([type, data]) => [
      ...u32(data.length),
      ...text(type),
      ...data,
      0,
      0,
      0,
      0,
    ]),
    ...u32(0),
    ...text("IEND"),
    0,
    0,
    0,
    0,
  ]);

const webp = (...chunks: [type: string, data: number[]][]): Uint8Array => {
  const body = chunks.flatMap(([type, data]) => [
    ...text(type),
    ...u32le(data.length),
    ...data,
    ...(data.length % 2 ? [0] : []),
  ]);
  return Uint8Array.from([
    ...text("RIFF"),
    ...u32le(body.length + 4),
    ...text("WEBP"),
    ...body,
  ]);
};

const box = (type: string, ...body: number[][]): number[] => {
  const content = body.flat();
  return [...u32(content.length + 8), ...text(type), ...content];
};

const avif = (...items: number[][]): Uint8Array =>
  Uint8Array.from([
    ...box("ftyp", text("avif"), u32(0), text("avif")),
    ...box("meta", u32(0), box("iinf", u32(0), u16(items.length), ...items)),
  ]);

const infe = (id: number, type: string, extra: number[] = []): number[] =>
  box("infe", [2, 0, 0, 0], u16(id), u16(0), text(type), text("\0"), extra);

describe("findMetadata", () => {
  it("reports EXIF, XMP and IPTC segments in a JPEG", () => {
    const image = jpeg(
      [0xe0, text("JFIF\0")],
      [0xe1, text("Exif\0\0MM")],
      [0xe1, text("http://ns.adobe.com/xap/1.0/\0<x/>")],
      [0xed, text("Photoshop 3.0\0")],
    );
    expect(findMetadata(image, ".jpg")).toEqual(["EXIF", "XMP", "IPTC"]);
  });

  it("accepts a JPEG that only has a JFIF header", () => {
    expect(findMetadata(jpeg([0xe0, text("JFIF\0")]), ".JPEG")).toEqual([]);
  });

  it("reports eXIf, XMP and text chunks in a PNG", () => {
    const image = png(
      ["IHDR", Array<number>(13).fill(0)],
      ["eXIf", text("MM")],
      ["iTXt", text("XML:com.adobe.xmp\0")],
      ["tEXt", text("Author\0Someone")],
    );
    expect(findMetadata(image, ".png")).toEqual([
      "EXIF",
      "XMP",
      "text (Author)",
    ]);
  });

  it("accepts a PNG with only image chunks", () => {
    expect(
      findMetadata(png(["IHDR", Array<number>(13).fill(0)]), ".png"),
    ).toEqual([]);
  });

  it("reports EXIF and XMP chunks in a WebP, including odd-sized chunks", () => {
    const image = webp(
      ["VP8 ", [1, 2, 3]],
      ["EXIF", text("MM")],
      ["XMP ", text("<x/>")],
    );
    expect(findMetadata(image, ".webp")).toEqual(["EXIF", "XMP"]);
  });

  it("accepts a WebP with only image data", () => {
    expect(findMetadata(webp(["VP8 ", [1, 2, 3, 4]]), ".webp")).toEqual([]);
  });

  it("reports Exif and XMP items in an AVIF", () => {
    const image = avif(
      infe(1, "av01"),
      infe(2, "Exif"),
      infe(3, "mime", text("application/rdf+xml\0")),
    );
    expect(findMetadata(image, ".avif")).toEqual(["EXIF", "XMP"]);
  });

  it("accepts an AVIF with only image items", () => {
    expect(findMetadata(avif(infe(1, "av01")), ".avif")).toEqual([]);
  });

  it("ignores formats it does not inspect", () => {
    expect(findMetadata(Uint8Array.from(text("<svg/>")), ".svg")).toEqual([]);
  });
});
