/ types/calendly.d.ts
// Place this file under a `types/` folder and ensure it’s included in tsconfig.json
export {};

declare global {
  interface Window {
    // Calendly widget method
    Calendly?: {
      initPopupWidget(options: { url: string }): void;
    };
  }
}
