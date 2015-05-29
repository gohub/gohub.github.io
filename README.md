# GoHub

[GoHub][] 基于 [Github Pages][] 提供在线 Golang 文档阅读. 特征:

  - 便捷的文档项目组织
  - Go Doc API 翻译双语对照阅读
  - 渲染 Markdown 或更多编程语言文档

对 GoHub 有任何建议或问题, 请至 GoHub [Wiki][] 和 [Issues][]

## 实现基础

得益于 [GitHub API][] 和 [RawGit][], GoHub 项目代码和 Golang 翻译文档项目代码是分离的.
GoHub 通过 GitHub API 获取项目的 Latest release Tag, 从 RawGit CDN 获取该 Tag 下的文档.
RawGit CDN 中的数据是静态的, 不提供更新服务. 更新 Latest release Tag 可使 GoHub 展现新的文档.
对于没有建立 Latest release Tag 的项目, 您可以 fork 后, 在 fork 项目中建立 Latest release Tag.

## 组织方式

GoHub 使用文件 golist.json 来组织文档项目. 为简化逻辑使用两种结构.

Object方式 表示包文档索引:
全部以 Object 组织, list 为子包列表.

```json
{
	"std": {
		"type": "doc_zh_CN.go",
		"repo": "golang-china/golangdoc.translations/src",
		"list": {
			"archive/tar": "tar包实现了tar格式压缩文件的存取.",
			"archive/zip": "zip包提供了zip档案文件的读写服务."
		}
	}
}
```

数组方式 表示项目索引:
每个条目都是 GitHub 上得一个项目, repo 下必须含有 golist.json 文件.
该文件内容可以为包文档索引或者包文档索引.

```json
[
	{
		"repo": "golang-china/golangdoc.translations",
		"description": "Go std 文档"
	},
	{
		"repo": "gohub/google",
		"description":"Google Go 文档"
	}
]
```

GoHub 的 golist.json 为文档源头, repo 所有者通过定义 golist.json 自由拓扑文档关系.

## Go 标准库

GoLang 标准库的翻译文档来自 [Golang-China][] 的 [golangdoc.translations][] 项目.
期待您参与该项目并改善翻译文档.

## 致谢

GoHub 的设计灵感来自 [FlatDoc][]. Powered by:

- [jQuery][]  New Wave JavaScript
- [marked][]  a markdown parser
- [base64.js][] Base64 implementation for JavaScript
- [highlight.js][] Syntax highlighting for the Web
- [JingYes][] CSS3 Framework


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
[base64.js]: https://github.com/dankogai/js-base64
[JingYes]: https://github.com/achun/JingYes