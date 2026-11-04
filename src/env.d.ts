declare const __VERSION__: string;

interface Window {
  customCards?: Array<{ type: string; name: string; description?: string; preview?: boolean }>;
}
