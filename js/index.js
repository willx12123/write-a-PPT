const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const initial = () => {
  Reveal.initialize({
    controls: true,
    progress: true,
    center: true,
    hash: true,

    transition: 'slide', // none/fade/slide/convex/concave/zoom

    dependencies: [
      {
        src: 'plugin/markdown/marked.js',
        condition: function () {
          return !!document.querySelector('[data-markdown]');
        }
      },
      {
        src: 'plugin/markdown/markdown.js',
        condition: function () {
          return !!document.querySelector('[data-markdown]');
        }
      },
      { src: 'plugin/highlight/highlight.js' },
      { src: 'plugin/search/search.js', async: true },
      { src: 'plugin/zoom-js/zoom.js', async: true },
      { src: 'plugin/notes/notes.js', async: true }
    ]
  });
};

const isParent = (markdown) => (/^#{1,2}(?!#)/).test(markdown);

const isChild = (markdown) => (/^#{3}(?!#)/).test(markdown);

const markdownToArray = (markdown) => {
  return markdown
    .split(/\n(?=\s*#)/)
    .filter(item => item !== '')
    .map(item => item.trim());
};

const arrayToHtml = (arr) => {
  let html = '';
  for (let i = 0; i < arr.length - 1; i += 1) {
    if (
      (isParent(arr[i]) && isParent(arr[i + 1])) ||
      (isChild(arr[i]) && isChild(arr[i + 1]))
    ) {
      html += `
        <section data-markdown>
          <script type="text/template">
            ${ arr[i] }
          </script>
        </section>
      `;
    } else if (isParent(arr[i]) && isChild(arr[i + 1])) {
      html += `
        <section>
          <section data-markdown>
            <script type="text/template">
              ${ arr[i] }
            </script>
          </section>
      `;
    } else if (isChild(arr[i]) && isParent(arr[i + 1])) {
      html += `
          <section data-markdown>
            <script type="text/template">
              ${ arr[i] }
            </script>
          </section>
        </section>
      `;
    }
  }
  if (isChild(arr[arr.length - 1])) {
    html += `
          <section data-markdown>
            <script type="text/template">
              ${ arr[arr.length - 1] }
            </script>
          </section>
        </section>
      `;
  } else {
    html += `
        <section data-markdown>
          <script type="text/template">
            ${ arr[arr.length - 1] }
          </script>
        </section>
      `;
  }
  return html;
};

const convert = (markdown) => {
  const arr = markdownToArray(markdown);
  $('.slides').innerHTML = arrayToHtml(arr);
};

const reloadMarkdown = (markdown) => {
  localStorage.setItem('markdown', markdown);
  location.reload();
};

const App = {
  init() {
    [...arguments].forEach(Module => Module.init());
  }
};

const Menu = {
  init() {
    console.log('Menu init...');
    this.settingIcon = $('.control .icon-setting');
    this.menu = $('.menu');
    this.closeIcon = $('.menu .icon-close');
    this.tabs = $$('.menu .tab');
    this.contents = $$('.menu .content');
    this.bindEvent();
  },
  bindEvent() {
    this.settingIcon.addEventListener('click', () => {
      this.menu.classList.add('open');
    });
    this.closeIcon.addEventListener('click', () => {
      this.menu.classList.remove('open');
    });
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.tabs.forEach(node => {
          node.classList.remove('active');
          tab.classList.add('active');
          let index = [...this.tabs].indexOf(tab);
          this.contents.forEach(node => {
            node.classList.remove('active');
            this.contents[index].classList.add('active');
          });
        });
      });
    });
  }
};

const Editor = {
  init() {
    console.log('Editor init...');
    this.markdown = localStorage.getItem('markdown') || '# 「写」一个PPT';
    this.editInput = $('.editor textarea');
    this.saveBtn = $('.editor button');
    this.bind();
    this.start();
  },
  bind() {
    this.saveBtn.addEventListener('click', () => {
      reloadMarkdown(this.editInput.value);
    });
  },
  start() {
    this.editInput.value = this.markdown;
    convert(this.markdown);
    initial();
  }
};

window.addEventListener('load', () => {
  App.init(Menu, Editor);
});