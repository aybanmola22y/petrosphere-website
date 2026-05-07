import path from "path";

import { SITE_CONTENT_LOCAL_FILENAME } from "@/constants/site-content-file";

export function getLocalContentPath(): string {
  return path.join(process.cwd(), SITE_CONTENT_LOCAL_FILENAME);
}

