// Ambient DOM type augmentations for APIs not yet in this project's bundled
// TypeScript version's lib.dom.d.ts (View Transitions API).

interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
}

interface Document {
  startViewTransition?(callback: () => void): ViewTransition;
}

interface CSSStyleDeclaration {
  viewTransitionName: string;
}
