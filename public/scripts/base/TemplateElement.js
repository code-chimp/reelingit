/**
 * Base class for web components that load HTML templates from external files.
 *
 * Subclasses should define a static `TEMPLATE_PATH` property pointing to their
 * HTML template file, and implement the `render()` method with component-specific logic.
 * The base class handles template loading, caching, and DOM injection via the
 * connectedCallback lifecycle.
 *
 * Use it like this:
 * ```js
 * export class MyElement extends TemplateElement {
 *   static TEMPLATE_PATH = '/scripts/my-element.html';
 *
 *   async render() {
 *     // Update DOM with data
 *   }
 * }
 *
 * customElements.define('my-element', MyElement);
 * ```
 *
 * @summary Base class for template-loading custom elements
 */
export class TemplateElement extends HTMLElement {
  /**
   * Cached template promise, stored per subclass.
   * Prevents redundant fetches of the same template file.
   * @type {Promise<HTMLTemplateElement>}
   * @static
   * @private
   */
  static _templatePromise;

  /**
   * Fetches and caches the HTML template file specified in TEMPLATE_PATH.
   *
   * The template is fetched once per subclass and cached to improve performance
   * when multiple instances of the same component are created. Subclasses must
   * define a static `TEMPLATE_PATH` property.
   *
   * @returns {Promise<HTMLTemplateElement>} The parsed template element
   * @throws {Error} If the template file fails to load or parse
   * @static
   * @private
   */
  static _loadTemplate() {
    // `this` is the subclass (called via `this.constructor._loadTemplate()`),
    // so this assignment creates a separate own property on each subclass
    // rather than sharing the base class's field.
    if (!this._templatePromise) {
      this._templatePromise = fetch(this.TEMPLATE_PATH)
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          return parser.parseFromString(html, 'text/html').querySelector('template');
        })
        .catch(error => {
          console.error('Failed to load template:', error);
          throw error;
        });
    }
    return this._templatePromise;
  }

  /**
   * Initializes the element by loading its template and calling render().
   *
   * Called internally by connectedCallback. Handles template loading,
   * cloning, and DOM insertion. If any error occurs, it logs the error
   * but does not throw, allowing the component to remain in the DOM.
   *
   * @returns {Promise<void>}
   * @private
   */
  async #initialize() {
    try {
      const template = await this.constructor._loadTemplate();
      const content = template.content.cloneNode(true);
      this.appendChild(content);
      await this.render();
    } catch (e) {
      console.error('Failed to initialize template:', e);
      await this.handleError(e);
    }
  }

  /**
   * Invoked when the element is inserted into the DOM.
   *
   * Automatically triggers template loading and initialization. If a subclass
   * needs to run setup before that (e.g. reading attributes or props into
   * private state), it may override this method as long as it calls
   * `super.connectedCallback()` to trigger initialization. Otherwise,
   * implement `render()` instead.
   *
   * @returns {void}
   * @example
   * connectedCallback() {
   *   this.#id = this.getAttribute('id');
   *   super.connectedCallback();
   * }
   */
  connectedCallback() {
    this.#initialize();
  }

  /**
   * Hook for subclasses to render content after the template is loaded.
   *
   * Called automatically after the template is appended to the DOM.
   * Subclasses should override this method to fetch data, update DOM elements,
   * and populate the template with content.
   *
   * @returns {Promise<void>}
   * @example
   * async render() {
   *   const data = await API.fetch('/data');
   *   this.querySelector('#title').textContent = data.title;
   * }
   */
  async render() {
    // override in subclass
  }

  /**
   * Optional hook for handling initialization errors.
   *
   * Override in subclasses to implement custom error handling, such as
   * displaying user-friendly error messages or fallback UI.
   *
   * @param {Error} e The error that occurred during initialization
   * @returns {Promise<void>}
   * @example
   * async handleError(e) {
   *   this.innerHTML = '<p>Failed to load component</p>';
   * }
   */
  async handleError(e) {
    // override if needed
  }
}
