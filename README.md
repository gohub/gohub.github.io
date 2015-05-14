# GoHub

*GoHub 还在开发中, 一些细节尚未实现*

[GoHub][] 基于 [Github Pages][] 提供在线 Golang 文档阅读. 支持:

  - Go Doc API 翻译双语对照
  - 展示项目 readme
  - 展示第三方项目

## 开始

点击顶部 "repos".

## 参与

GoLang 标准库的翻译文档来自 [Golang-China][] 的 [golangdoc.translations][] 项目.
GoHub 使用该项目组制定的翻译文档格式. 期待您参与到该项目并丰富翻译文档.

对 GoHub 有任何建议或问题, 请至 GoHub [Wiki][] 和 [Issues][]

## 实现

得益于 [GitHub API] 和 [RawGit], GoHub 项目代码和 Golang 翻译文档项目代码是分离的.
GoHub 通过 GitHub API 获取项目的 Latest release Tag, 从 RawGit CDN 获取该 Tag 下的文档.
RawGit CDN 中的数据是静态的, 不提供更新服务. 更新 Latest release Tag 可使 GoHub 展现新的文档.
对于没有建立 Latest release Tag 的项目, 您可以 fork 后, 在 fork 项目中建立 Latest release Tag.
GoHub 可以分析 fork 项目中的 Latest release Tag, 并正确获取文档.

## 致谢

GoHub 的设计灵感来自 [FlatDoc][]. Powered by:

- [jQuery][]  New Wave JavaScript
- [marked][]  a markdown parser
- [base64.js][] Base64 implementation for JavaScript
- [highlight.js][] Syntax highlighting for the Web


## LICENSE

Copyright (c) 2015 The GoHub Authors. All rights reserved.
Use of this source code is governed by a BSD-style license 
that can be found in the LICENSE file.

[GoHub]: https://github.com/gohub/gohub.github.io
[Wiki]: https://github.com/gohub/gohub.github.io/wiki
[Issues]: https://github.com/gohub/gohub.github.io/issues
[language-subtag]: http://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
[Github Pages]: https://pages.github.com
[GitHub API]: https://developer.github.com
[RawGit]: http://rawgit.com
[Golang-China]: https://github.com/golang-china
[golangdoc.translations]: https://github.com/golang-china/golangdoc.translations
[FlatDoc]: https://github.com/rstacruz/flatdoc
[jQuery]: https://github.com/jquery/jquery
[marked]: https://github.com/chjj/marked
[highlight.js]: https://highlightjs.org
[base64.js]: http://github.com/dankogai/js-base64
