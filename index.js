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

const startUp = () => {
  const template = `
    # 写一个PPT

    让PPT制作不再花费你所有的时间
    ## Markdown support
    Write content using inline or external Markdown.
    ## 我是二级标题
    请点击右下角👉的按钮
    或是按下键盘下的右键
    ## 我是三级标题
    可以点击右下角的按钮或者按下键盘上的下键
    ### 我是三级标题
  `;
  convert(localStorage.getItem('markdown') || template);
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
  document.querySelector('.slides').innerHTML = arrayToHtml(arr);
};

const reloadMarkdown = (markdown) => {
  localStorage.setItem('markdown', markdown);
  location.reload();
};

window.addEventListener('load', () => {
  startUp();
  initial();
});