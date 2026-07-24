/**
 * Renders one or more animated skeleton placeholder bars while content loads.
 *
 * On connect, the element appends child `div` elements styled with the global
 * `.loading-wave` CSS animation. Configuration is read from `data-*` attributes
 * when the element is inserted into the DOM.
 *
 * Use it like this:
 * ```html
 * <animated-loading data-elements="5" data-width="150px" data-height="220px">
 * </animated-loading>
 * ```
 *
 * @summary Animated skeleton loading placeholders
 * @tag animated-loading
 * @tagname animated-loading
 *
 * @attr {number} data-elements - Number of placeholder bars to render (default: 1)
 * @attr {string} data-width - CSS width for each placeholder bar (default: 100px)
 * @attr {string} data-height - CSS height for each placeholder bar (default: 10px)
 */
export class AnimatedLoading extends HTMLElement {
  /** Creates an empty loading-placeholder element. */
  constructor() {
    super();
  }

  /**
   * Appends the configured number of animated placeholder bars.
   *
   * @returns {void}
   */
  connectedCallback() {
    const qty = this.dataset.elements ?? 1;
    const width = this.dataset.width ?? '100px';
    const height = this.dataset.height ?? '10px';
    for (let i = 0; i < qty; i++) {
      const wrapper = document.createElement('div');
      wrapper.setAttribute('class', 'loading-wave');
      wrapper.style.width = width;
      wrapper.style.height = height;
      wrapper.style.margin = '10px';
      wrapper.style.display = 'inline-block';
      this.appendChild(wrapper);
    }
  }
}

customElements.define('animated-loading', AnimatedLoading);
