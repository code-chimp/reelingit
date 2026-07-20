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

      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '300';
      iframe.src = `https://www.youtube.com/embed/${videoId}`;
      iframe.title = 'YouTube video player';
      iframe.frameBorder = '0';
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      this.appendChild(iframe);
    }
  }
}

customElements.define('youtube-embed', YouTubeEmbed);
