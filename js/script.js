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
      if (data) return Promise.resolve(data);

      return fetch(`${api}/${path}`).then(
        (resp)=>this.normalize(resp)
      ).catch(data=>{
        console.log(data);
        sel('header > code')
        .textContent = data.statusText + ' ' + data.url;
        return data;
      });
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

  global.gohub = function (owner, repo) {
    if (!owner) return gohub.prototype;
    return new gohub(owner, repo);
  };

  global.all = function (s, node) {
    return (node || document).querySelectorAll(s);
  };

  global.sel = function (s, node) {
    return (node || document).querySelector(s);
  };

  global.on = function (type, listener, useCapture) {
    let node = this instanceof Node && this || document.body;
    node.addEventListener(type, listener, useCapture);
  };

  global.emit = function (type, detail) {
    let node = this instanceof Node && this || document.body;
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
    let target = event.target;
    if (target.matches('summary')) {
      if (target.nextElementSibling) return;
      let repo = target.closest('details').getAttribute('repo');
      gohub(repo).list().then(data=>tmpl.render(data).removeChilds());
    }
  });
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
      theme: "twilight",
      tabSize: 2
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
  CodeMirror.autoLoadMode(editor,'go');

  if (location.hostname !== 'localhost')
    global.addEventListener('beforeunload', function (e) {
      e.returnValue = '\o/';
    });

  let gh = gohub('gohub/gohub.github.io');

  fetch('/README.md?'+Date.now()).then((resp)=>{
    return resp.text().then((content)=>(
      {content,ext: 'md',url:'README.md'}
    )).then(data =>render(data));
  });

  gh.list().then(data =>render(data));

  function render(data) {
    let content = data && data.content;
    if(!content) return;

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
      editor.setValue(content);
      editor.focus();
      main.setAttribute('class','');
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
