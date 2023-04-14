// Define the post web component class
class BlogPostPage extends HTMLElement {
  constructor() {
    super();

    // Create a shadow root for the web component
    const shadowRoot = this.attachShadow({ mode: "open" });
    // Define the HTML markup and styling for the component
    shadowRoot.innerHTML = `
      <style>
        .post-page {
          padding: 15px;
        }
        .title {
          font-size: 24px;
        }
        .date {
          font-size: 14px;
          margin-top: 5px;
          margin-bottom: 10px;
          color: #777;
        }
        .description {
          text-align: justify;
          line-height: 1.5;
          white-space: pre-wrap;
        }
      </style>
      <div class = "post-page">
        <div class="title"></div>
        <div class="date"></div>
        <div class="description"></div>
      </div>
    `;

    // Set the initial values for the post title, date, and text
  }

  get title() {
    return this.shadowRoot.querySelector(".title");
  }

  get date() {
    return this.shadowRoot.querySelector(".date");
  }

  get description() {
    return this.shadowRoot.querySelector(".description");
  }

  connectedCallback() {
    this.title.textContent = this.getAttribute("title");
    this.date.textContent = this.getAttribute("date");
    this.description.innerHTML = this.getAttribute("description");
  }
}

// Define the custom element "post" and associate it with the Post class
customElements.define("blog-post-page", BlogPostPage);
