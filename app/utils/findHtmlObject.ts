function findHtmlContent(obj: unknown): string | null {
  if (typeof obj === "string") {
    if (obj.includes("<table") || obj.includes("<tr") || obj.includes("<td")) {
      return obj;
    }
  }
  if (typeof obj === "object" && obj !== null) {
    for (const value of Object.values(obj)) {
      const found = findHtmlContent(value);
      if (found) return found;
    }
  }
  return null;
}