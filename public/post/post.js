// Define the post web component class
class BlogPost extends HTMLElement {
  constructor() {
    super();

    // Create a shadow root for the web component
    const shadowRoot = this.attachShadow({ mode: "open" });
    // Define the HTML markup and styling for the component
    shadowRoot.innerHTML = `
      <style>
        /* Define the styling for the post component */
        .post {
          padding: 10px;
        }
        .post-title {
          font-size: 18px;
          font-weight: bold;
        }
        .post-date {
          font-size: 14px;
          margin-top: 5px;
          margin-bottom: 10px;
          color: #777;
        }
        .post-text {
          font-size: 16px;
          margin-top: 10px;
        }
      </style>
      <div class="post">
        <div class="post-title"></div>
        <div class="post-date"></div>
        <div class="post-description"></div>
        <hr style = "border: 1px solid rgba(0,0,0,0.03)">
      </div>
    `;

    // Set the initial values for the post title, date, and text
  }

  get id() {
    return this.getAttribute("id");
  }

  get title() {
    return this.shadowRoot.querySelector(".post-title");
  }

  get date() {
    return this.shadowRoot.querySelector(".post-date");
  }

  get description() {
    return this.shadowRoot.querySelector(".post-description");
  }

  truncate(str, n) {
    return str?.length > n ? str.substr(0, n - 1) + "..." : str;
  }

  connectedCallback() {
    this.title.textContent = this.getAttribute("title");
    this.date.textContent = this.getAttribute("date");
    this.description.textContent = this.truncate(
      this.getAttribute("description"),
      300
    );
  }
}

// Define the custom element "post" and associate it with the Post class
customElements.define("blog-post", BlogPost);
