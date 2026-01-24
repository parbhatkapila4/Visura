
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }


  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");


  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");


  sanitized = sanitized.replace(/javascript:/gi, "");


  sanitized = sanitized.replace(/data:text\/html/gi, "");

  return sanitized;
}


export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}


export function sanitizeForDatabase(input: string): string {
  if (!input || typeof input !== "string") {
    return "";
  }


  let sanitized = input.replace(/\0/g, "");


  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");


  sanitized = sanitized.trim();

  return sanitized;
}


export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== "string") {
    return "unnamed";
  }


  let sanitized = fileName.replace(/\.\./g, "");
  sanitized = sanitized.replace(/[\/\\]/g, "_");


  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, "");


  sanitized = sanitized.replace(/[<>:"|?*]/g, "_");


  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf("."));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }

  return sanitized || "unnamed";
}


export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== "string") {
    return null;
  }

  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) {
    return null;
  }


  if (trimmed.length > 254) {
    return null;
  }

  return trimmed;
}


export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    const parsed = new URL(url);


    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}


export function sanitizeJson<T>(jsonString: string): T | null {
  if (!jsonString || typeof jsonString !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonString);

    JSON.stringify(parsed);
    return parsed as T;
  } catch {
    return null;
  }
}
