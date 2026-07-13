/**
 * Embeds a responsive YouTube video player from a standard watch URL.
 *
 * When `data-url` is set to a non-empty YouTube watch URL, the element
 * replaces its contents with an iframe pointed at the corresponding embed URL.
 *
 * Use it like this:
 * ```html
 * <youtube-embed data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></youtube-embed>
 * ```
 *
 * The URL may also be set programmatically via the `dataset` API:
 * ```js
 * element.dataset.url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
 * ```
 *
 * @summary Embeds a YouTube video from a watch URL
 * @tag youtube-embed
 * @tagname youtube-embed
 *
 * @attr {string} data-url - Full YouTube watch URL containing a `v=` video ID query parameter
 */
export class YouTubeEmbed extends HTMLElement {
  static get observedAttributes() {
    return ['data-url'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-url' && newValue.trim().length > 0) {
      const url = this.dataset.url;
      const videoId = url.split('v=')[1];

      this.innerHTML = `
        <iframe width="100%" height="300"
                src="https://www.youtube.com/embed/${videoId}"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
        </iframe>
      `;
    }
  }
}

customElements.define('youtube-embed', YouTubeEmbed);
