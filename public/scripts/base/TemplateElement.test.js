import { CUSTOM_EVENTS } from '../constants.js';
import { TemplateElement } from './TemplateElement.js';

// --- Response helpers ---

function makeOkResponse(html) {
  return { ok: true, text: () => Promise.resolve(html) };
}

function withTemplate(content = '<p>test</p>') {
  return makeOkResponse(`<template>${content}</template>`);
}

function notFoundResponse() {
  return { ok: false, statusText: 'Not Found' };
}

// --- Module-level stub subclasses ---
// All custom element names must be unique within this jsdom context.

class StubElement extends TemplateElement {
  static TEMPLATE_PATH = '/stub.html';
}
customElements.define('stub-el', StubElement);

class StubElementA extends TemplateElement {
  static TEMPLATE_PATH = '/stub-a.html';
}
customElements.define('stub-el-a', StubElementA);

class StubElementB extends TemplateElement {
  static TEMPLATE_PATH = '/stub-b.html';
}
customElements.define('stub-el-b', StubElementB);

// Spies on render() invocations and what was in the DOM at that moment.
class RenderSpy extends TemplateElement {
  static TEMPLATE_PATH = '/render-spy.html';
  renderCallCount = 0;
  contentAtRender = null;
  async render() {
    this.renderCallCount++;
    this.contentAtRender = this.querySelector('p');
  }
}
customElements.define('render-spy', RenderSpy);

// Captures the error passed to handleError() rather than logging it.
class HandleErrorSpy extends TemplateElement {
  static TEMPLATE_PATH = '/handle-error-spy.html';
  caughtError = null;
  async handleError(e) {
    this.caughtError = e;
  }
}
customElements.define('handle-error-spy', HandleErrorSpy);

// Throws from render() and captures the resulting handleError() call.
class RenderThrowElement extends TemplateElement {
  static TEMPLATE_PATH = '/render-throw.html';
  caughtError = null;
  async render() {
    throw new Error('render failed');
  }
  async handleError(e) {
    this.caughtError = e;
  }
}
customElements.define('render-throw-el', RenderThrowElement);

// --- Helpers ---

const ALL_CLASSES = [
  StubElement,
  StubElementA,
  StubElementB,
  RenderSpy,
  HandleErrorSpy,
  RenderThrowElement,
];

async function mount(el) {
  document.body.appendChild(el);
  await new Promise(resolve => setTimeout(resolve));
  return el;
}

// --- Tests ---

describe('TemplateElement', () => {
  let fetchSpy;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchSpy = vi.spyOn(globalThis, 'fetch');
    ALL_CLASSES.forEach(Cls => {
      Cls._templatePromise = null;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  describe('_loadTemplate', () => {
    it('fetches from TEMPLATE_PATH', async () => {
      fetchSpy.mockResolvedValue(withTemplate());
      await StubElement._loadTemplate();
      expect(fetchSpy).toHaveBeenCalledWith('/stub.html');
    });

    it('returns the parsed HTMLTemplateElement', async () => {
      fetchSpy.mockResolvedValue(withTemplate('<p>hello</p>'));
      const template = await StubElement._loadTemplate();
      expect(template).toBeInstanceOf(HTMLTemplateElement);
      expect(template.content.querySelector('p').textContent).toBe('hello');
    });

    it('throws when the response is not ok', async () => {
      fetchSpy.mockResolvedValue(notFoundResponse());
      await expect(StubElement._loadTemplate()).rejects.toThrow(
        'Failed to load template: Not Found',
      );
    });

    it('throws when the HTML contains no <template> element', async () => {
      fetchSpy.mockResolvedValue(
        makeOkResponse('<html><body><p>no template</p></body></html>'),
      );
      await expect(StubElement._loadTemplate()).rejects.toThrow(
        'Template not found at: /stub.html',
      );
    });

    it('caches the result — fetch is called only once per subclass', async () => {
      fetchSpy.mockResolvedValue(withTemplate());
      await StubElementA._loadTemplate();
      await StubElementA._loadTemplate();
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    it('different subclasses maintain independent caches', async () => {
      fetchSpy.mockResolvedValue(withTemplate());
      await StubElementA._loadTemplate();
      await StubElementB._loadTemplate();
      expect(StubElementA._templatePromise).not.toBe(StubElementB._templatePromise);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('render hook', () => {
    it('appends template content to the element after connecting', async () => {
      fetchSpy.mockResolvedValue(withTemplate('<p id="test">content</p>'));
      const el = await mount(new StubElement());
      expect(el.querySelector('#test').textContent).toBe('content');
    });

    it('calls render() once after the template is appended', async () => {
      fetchSpy.mockResolvedValue(withTemplate('<p>hi</p>'));
      const el = await mount(new RenderSpy());
      expect(el.renderCallCount).toBe(1);
    });

    it('render() is called with template content already in the DOM', async () => {
      fetchSpy.mockResolvedValue(withTemplate('<p>hi</p>'));
      const el = await mount(new RenderSpy());
      expect(el.contentAtRender).not.toBeNull();
    });
  });

  describe('handleError', () => {
    it('is called when template loading fails', async () => {
      fetchSpy.mockResolvedValue(notFoundResponse());
      const el = await mount(new HandleErrorSpy());
      expect(el.caughtError).toBeInstanceOf(Error);
      expect(el.caughtError.message).toContain('Failed to load template');
    });

    it('is called when render() throws', async () => {
      fetchSpy.mockResolvedValue(withTemplate());
      const el = await mount(new RenderThrowElement());
      expect(el.caughtError.message).toBe('render failed');
    });

    it('default implementation logs to console.error', async () => {
      fetchSpy.mockResolvedValue(notFoundResponse());
      await mount(new StubElement());
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('navigate', () => {
    it('dispatches an app:navigate event with the given route', () => {
      const el = new StubElement();
      const listener = vi.fn();
      document.addEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      el.navigate('/movies');
      document.removeEventListener(CUSTOM_EVENTS.NAVIGATE, listener);
      expect(listener).toHaveBeenCalledOnce();
      expect(listener.mock.calls[0][0].detail.route).toBe('/movies');
    });
  });
});
