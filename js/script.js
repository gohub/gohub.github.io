/* jshint esversion: 6 */
(function (global) {

  'use strict';

  const api = 'https://api.github.com/repos';
  let cache = {};
  function getCache(key) {
    return cache[key];
  }

  function storeCache(key, val) {
    cache[key] = val;
    return val;
  }

  class gohub {
    constructor(owner, repo) {
      if (!repo) {
        owner = owner.split('/');
        this.owner = owner[0];
        this.repo = owner[1];
      } else {
        this.owner = owner;
        this.repo = repo;
      }
    }

    list() {
      return this.get('contents/golist.json');
    }

    readme() {
      return this.get('readme');
    }

    get(path) {
      path = `${this.owner}/${this.repo}/${path}`;
      let data = getCache(path);
      if (data) return Promise.resolve(data).then(dispatch);

      return fetch(`${api}/${path}`).then(
        (resp)=>this.normalize(resp)
      ).catch(data=>{
        document.dispatchEvent(
          new CustomEvent('gohub-catch', {detail: data })
        );
        return data;
      }).then(dispatch);
    }

    normalize(resp) {
      let
        owner = this.owner,
        repo = this.repo,
        url = resp.url.substring(api.length + 1);
      if (!resp.ok) return Promise.reject({
          owner, repo,
          url,
          statusText: resp.statusText,
        });

      return resp.json().then(json=> {
        let
          path = json.path,
          ext = (path.match(/\.[a-z0-9]+$/i) || [''])[0].
            slice(1).toLowerCase(),
          text = Base64.decode(json.content),
          content = ext === 'json' &&
            JSON.parse(text) || text;

        return storeCache(
          url, {
            owner, repo,
            name: json.name,
            url: json.html_url,
            sha: json.sha,
            path,
            ext,
            content,
          }
        );
      });
    }
  }

  function dispatch(data) {
    document.dispatchEvent(
      new CustomEvent('gohub-got', {detail: data })
    );
    return data;
  }

  global.gohub = function (owner, repo) {
    if (!owner) return gohub.prototype;
    return new gohub(owner, repo);
  };
}(this));

(function (global) {
  global.all = function (s, node) {
    return (node || document).querySelectorAll(s);
  };

  global.sel = function (s, node) {
    return (node || document).querySelector(s);
  };

  global.on = function (type, listener, useCapture) {
    let node = this instanceof Node && this || document;
    node.addEventListener(type, listener, useCapture);
  };

  global.emit = function (type, detail) {
    let node = this instanceof Node && this || document;
    node.dispatchEvent(
      new CustomEvent(type, {detail: detail })
    );
  };
  global.is = {
    array:(v)=>Array.isArray(v),
    object:(v)=>Object.prototype.toString.call(v) === '[object Object]',
    string:(v)=>typeof v === 'string',
  };
}(this));

(function (global) {
  let tmpl = PowJS(sel('template'));

  on.call(sel('#panel'), 'update', (event)=> {
    tmpl.render(event.detail).removeChilds();
  });

  on.call(sel('#panel'), 'click',(event)=> {
    let
      repo, path, target = event.target;
    if (target.matches('summary')){
      repo = !target.nextElementSibling && getRepo(target);
      path = 'contents/golist.json';
    }else if (target.matches('p')) {
      repo = getRepo(target);
      path = getContentPath(target);
    }
    if(repo) gohub(repo).get(path||'');
  });

  function getRepo(n) {
    return n.closest('details').getAttribute('repo');
  }

  function getContentPath(n) {
    let p = n.closest('details');
    return `contents/${p.getAttribute('subdir')}/${n.textContent}/${p.getAttribute('filename')}`;
  }
}(this));

(function (global) {

  let
    main = sel('main'),
    container = sel('#editor-container'),
    preview = sel('#preview'),
    editor = CodeMirror(container, {
      value: 'package "loading readme"',
      lineNumbers: true,
      mode: "go",
      keyMap: "sublime",
      autoCloseBrackets: true,
      matchBrackets: true,
      showCursorWhenSelecting: true,
      theme: "chrome-devtools",
      tabSize: 2,
      readOnly: true
    }),
    split = {};

  ['json','js','go','golang'].forEach(lang=>{
    let x = hljs.getLanguage(lang);
    lang= 'lang-'+lang;
    if (!x.aliases) x.aliases=[];
    if(x.aliases.indexOf(lang)===-1)
    x.aliases.push(lang);
  });

  CodeMirror.modeURL = '//unpkg.com/codemirror@5.37.0/mode/%N/%N.js';
  CodeMirror.autoLoadMode(editor, 'go');

  // if (location.hostname !== 'localhost')
  //   global.addEventListener('beforeunload', function (e) {
  //     e.returnValue = '\o/';
  //   });

  on('gohub-got', event=>render(event.detail));

  on('gohub-catch', (event)=>{
    sel('header code').textContent =
      event.detail.statusText + ': ' + event.detail.url;
  }, true);

  let gh = gohub('gohub/gohub.github.io');

  gh.readme();
  gh.list();

  function render(data) {
    let content = data && data.content;
    if(!content)
      return console.log('Oop!');

    if (typeof content !== 'string')
      return emit.call(sel('#panel'), 'update', data);

    sel('header > code')
    .textContent = data.url.substring(19)
    .replace('/blob/master/', '/');

    if(data.ext === 'md') {
      preview.innerHTML = marked(data.content);
      main.setAttribute('class','preview');
      preview.querySelectorAll('pre code[class*=lang-]')
        .forEach((e)=>hljs.highlightBlock(e));
    } else {
      main.setAttribute('class','');
      editor.focus();
      editor.setValue(content);
    }
  }

  function resizable(selector) {
    return interact(selector)
      .rectChecker(function (elm) {
        return {
          left: elm.offsetLeft,
          top: elm.offsetTop,
          right: elm.offsetLeft + elm.offsetWidth,
          bottom: elm.offsetLeft + elm.offsetHeight,
        };
      })
      .resizable({
        edges: { bottom: true },
        invert: 'reposition',
        onmove: function (event) {
          console.log(event);
        },
      }).options.resize.edges;
  }

}(this));
