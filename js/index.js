const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const initial = () => {
  Reveal.initialize({
    controls: true,
    progress: true,
    center:
      localStorage.getItem('align') === 'center' ||
      !localStorage.getItem('align'),
    hash: true,

    transition: localStorage.getItem('transition') || 'slide', // none/fade/slide/convex/concave/zoom

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
    .split(/\n(?=\s*#{1,3}[^#])/)
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
    [...arguments].forEach((Module) => Module.init());
  }
};

const Menu = {
  init() {
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
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.tabs.forEach((node) => {
          node.classList.remove('active');
          tab.classList.add('active');
          let index = [...this.tabs].indexOf(tab);
          this.contents.forEach((node) => {
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
    const tpl =
      '# 「写」\n#### 一个 PPT\n请按空格进入下一页\n' +
      '## 当Markdown遇上PPT\n可点击右下角方向键切换幻灯片\n' +
      '## #表示标题\n+ 一个#为一级标题\n+ 两个#为二级标题\n+ 以此类推\n\n**请点击"下"按钮**\n' +
      '### 一二三级标题都会成为独立页面\n' +
      '### 三级标题会被二级标题包裹\n三级成为二级的子页面\n子页面上下切换，同等级页面左右切换\n' +
      '### 四级标题后都不会独立成为页面\n' +
      '## 控制面板\n鼠标移至页面左上角会出现一个齿轮\n' +
      '### 点击齿轮进入控制面板\n可修改PPT内容，主题与切换特效\n' +
      '### 网页会自动保存您的数据直至被清空\n请及时在控制面板点击"下载PDF"';
    this.markdown = localStorage.getItem('markdown') || tpl;
    this.editInput = $('.editor textarea');
    this.saveBtn = $('.editor button');
    this.bindEvent();
    this.start();
  },
  bindEvent() {
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

const Theme = {
  init() {
    this.figures = $$('.theme figure');
    this.transition = $('.theme .transition');
    this.align = $('.theme .align');
    this.reveal = $('.reveal');
    this.bindEvent();
    this.loadTheme();
  },
  bindEvent() {
    this.figures.forEach((figure) => {
      figure.addEventListener('click', () => {
        this.figures.forEach((item) => {
          item.classList.remove('select');
        });
        figure.classList.add('select');
        this.setTheme(figure.dataset.theme);
        console.log(figure.dataset.theme);
      });
    });
    this.transition.addEventListener('change', () => {
      localStorage.setItem('transition', this.transition.value);
      location.reload();
    });
    this.align.addEventListener('change', () => {
      localStorage.setItem('align', this.align.value);
      location.reload();
    });
  },
  setTheme(theme) {
    localStorage.setItem('theme', theme);
    location.reload();
  },
  loadTheme() {
    const theme = localStorage.getItem('theme') || 'black';
    const link = document.createElement('link');
    link.id = 'theme';
    link.rel = 'stylesheet';
    link.href = `css/theme/${ theme }.css`;
    document.head.appendChild(link);
    this.figures.forEach((figure) => {
      if (figure.dataset.theme === theme) {
        this.figures.forEach((item) => {
          item.classList.remove('select');
        });
        figure.classList.add('select');
      }
    });
    this.transition.value = localStorage.getItem('transition') || 'slide';
    this.align.value = localStorage.getItem('align') || 'center';
    this.reveal.classList.add(this.align.value);
  }
};

const Print = {
  init() {
    this.download = $('.download');
    this.bindEvent();
    this.start();

  },
  bindEvent() {
    this.download.addEventListener('click', () => {
      const link = document.createElement('a');
      link.setAttribute('target', '_blank');
      link.setAttribute(
        'href',
        location.href.replace(/#\//, '?print-pdf')
      );
      link.click();
    });
  },
  start() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    if (window.location.search.match(/print-pdf/gi)) {
      link.href = 'css/print/pdf.css';
      setTimeout(() => window.print(), 1000);
    } else {
      link.href = 'css/print/paper.css';
    }
    document.head.appendChild(link);
  }
};

window.addEventListener('load', () => {
  App.init(Menu, Editor, Theme, Print);
});