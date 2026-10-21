import { describe, it, expect } from "vitest";
import { isOwnStoredFile, signedFileUrl, storagePathFrom } from "@/lib/storage";

const BASE = "https://test.supabase.co"; 
const USER = "user_2abc";
const PATH = `${USER}/1727000000000-contract v2.pdf`;
const PUBLIC_URL = encodeURI(`${BASE}/storage/v1/object/public/pdf/${PATH}`);

describe("storagePathFrom", () => {
  it("reads the object path out of the stored public URL, spaces and all", () => {
    expect(storagePathFrom(PUBLIC_URL)).toBe(PATH);
  });

  it("reads signed and authenticated URLs the same way", () => {
    expect(storagePathFrom(`${BASE}/storage/v1/object/sign/pdf/${encodeURI(PATH)}?token=abc`)).toBe(
      PATH
    );
    expect(storagePathFrom(`${BASE}/storage/v1/object/authenticated/pdf/${encodeURI(PATH)}`)).toBe(
      PATH
    );
  });

  it("takes a bare path, as the upload returns it", () => {
    expect(storagePathFrom(PATH)).toBe(PATH);
  });

  it("names nothing for another host, another bucket, or a non-storage URL", () => {
    expect(storagePathFrom(PUBLIC_URL.replace("test.supabase.co", "evil.example"))).toBeNull();
    expect(storagePathFrom(`${BASE}/storage/v1/object/public/avatars/${USER}/x.png`)).toBeNull();
    expect(storagePathFrom("https://utfs.io/f/abc123")).toBeNull();
    expect(storagePathFrom("http://169.254.169.254/latest/meta-data/")).toBeNull();
  });

  it("names nothing for an empty value", () => {
    expect(storagePathFrom("")).toBeNull();
    expect(storagePathFrom(null)).toBeNull();
    expect(storagePathFrom(undefined)).toBeNull();
  });
});

describe("isOwnStoredFile", () => {
  it("accepts a file in the caller's own folder", () => {
    expect(isOwnStoredFile(PUBLIC_URL, USER)).toBe(true);
    expect(isOwnStoredFile(PATH, USER)).toBe(true);
  });

  it("refuses someone else's file, even one whose id starts the same way", () => {
    expect(isOwnStoredFile(PUBLIC_URL, "user_other")).toBe(false);
    expect(isOwnStoredFile(PUBLIC_URL, "user_2ab")).toBe(false);
  });

  it("refuses a path that climbs out of the folder", () => {
    expect(isOwnStoredFile(`${USER}/../user_other/secret.pdf`, USER)).toBe(false);
  });

  it("refuses a URL that is not one of our stored files", () => {
    expect(isOwnStoredFile(`http://169.254.169.254/${USER}/x`, USER)).toBe(false);
    expect(isOwnStoredFile("", USER)).toBe(false);
    expect(isOwnStoredFile(PUBLIC_URL, "")).toBe(false);
  });
});

describe("signedFileUrl", () => {
  it("will not sign a file outside the owner's folder", async () => {
    await expect(signedFileUrl(PUBLIC_URL, { ownerId: "user_other" })).rejects.toThrow(
      "not in this account's uploads"
    );
    await expect(
      signedFileUrl("http://169.254.169.254/latest/meta-data/", { ownerId: USER })
    ).rejects.toThrow();
  });
});
