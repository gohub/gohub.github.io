# GoHub

WIP (尚在开发中...)

[GoHub][] 使用 [Github REST API v3][] 提供在线 Golang 文档阅读.

- 便捷的文档项目组织
- Go Doc API 翻译双语对照阅读
- 渲染 Markdown 或更多编程语言文档

对 GoHub 有任何建议或问题, 请至 [GoHub Wiki][] 和 [Issues][]

## golist.json

golist.json 用于组织文档. 支持两种结构:

- Object 单个文档项目, 多个 Package 组成
- Array  文档项目列表, 每个项目的地址和说明, 每个项目下必须有 golist.json

例: 单个文档项目, 使用 [GoDocu][] 生成.

```json
{
  "Repo": "github.com/golang/go",
  "Filename": "doc_zh_CN.go",
  "Package": [
    {
      "Import": "archive/tar",
      "Synopsis": "tar包实现了tar格式压缩文件的存取.",
      "Progress": 100,
    },
    {
      "Import": "archive/zip",
      "Synopsis": "zip包提供了zip档案文件的读写服务.",
      "Progress": 95,
    }
  ],
}
```

例: 文档项目列表, 手工书写

```json
[
	{
		"repo": "golang-china/golangdoc.translations",
		"synopsis": "Go 标准库中文版"
	}
]
```

也就是说 [GoHub][] 的 golist.json 是文档组织的源头, 期望您的文档项目加入.

## 贡献

GoLang 标准库翻译文档来自 [golangdoc.translations][].

[Golang-China][] 需要贡献者, 贡献辅助工具代码或翻译文档, 不限于 GoLang 标准库.

## 依赖

Powered by:

- [marked][] a markdown parser
- [base64.js][] Base64 implementation for JavaScript
- [CodeMirror][] In-browser code editor
- [polyfill.io][] Upgrade the web. Automatically
- [highlight.js][] Javascript syntax highlighter
- [normalize.css][] A modern alternative to CSS resets
- [code-mirror-themes][] A large collection of Code Mirror themes for your coding pleasure
- [github-markdown-css][] The minimal amount of CSS to replicate the GitHub Markdown style
- [PowJS][] Power ECMAScript 6 Template Engine DOM tree based

## LICENSE

Copyright (c) 2018 The GoHub Authors. All rights reserved.
Use of this source code is governed by a BSD-style license
that can be found in the LICENSE file.

[GoHub]: https://github.com/gohub/gohub.github.io
[GoHub Wiki]: https://github.com/gohub/gohub.github.io/wiki
[Issues]: https://github.com/gohub/gohub.github.io/issues
[Golang-China]: https://github.com/golang-china
[golangdoc.translations]: https://github.com/golang-china/golangdoc.translations
[CodeMirror]: https://github.com/codemirror/CodeMirror
[marked]: https://github.com/chjj/marked
[base64.js]: https://github.com/dankogai/js-base64
[polyfill.io]: https://polyfill.io
[GoDocu]: https://github.com/golang-china/godocu
[normalize.css]: https://github.com/necolas/normalize.css
[code-mirror-themes]: https://github.com/FarhadG/code-mirror-themes
[Github REST API v3]: https://developer.github.com/v3/
[PowJS]: https://github.com/powjs/powjs
[highlight.js]: https://github.com/isagalaev/highlight.js
[github-markdown-css]: https://github.com/sindresorhus/github-markdown-css