"use strict";

// 代码采用 DocEasy 风格. 注释写到函数内部, 便于生成 API 文档.
//  

(function($, global) {
	// GoHub Ajax 获取 repo 内容

	var _array = [],
		apiRepos = 'https://api.github.com/repos',
		rawgit = 'http://cdn.rawgit.com',
		fn = Repo.prototype;

	var gh = global.GoHub = function(repo) {
		// 创建 Github 仓库访问对象 repo. 返回 jQuery deferred 对象.
		// 调用者可在 .done 方法中接收到该 repo 对象.
		// 参数 repo 是相对路径, 可附加资源基础路径. 
		// 示例:
		// 	GoHub('gohub/go').done(function (repo, textStatus, jqXHR) {
		// 		// your code
		// 	})
		//
		// 	// 后续获取的资源都位于基础路径 src 下.
		// 	GoHub('gohub/go/src').done(function (repo, textStatus, jqXHR) {
		// 		// your code
		// 	})
		//
		// 	// 用于本地访问的方法
		// 	var repo = GoHub()
		//  
		var info = gh.bare();
		repo = (repo || "").split('/')
		info.repo = repo.slice(0, 2).join('/')
		info.root = ''
		info.base = repo.slice(2).join('/')

		repo = new Repo(info)
		repo.base(info.base)
		if (!arguments.length || info.repo.indexOf('/') == -1) {
			return repo
		}

		return $.when($.get(apiRepos + '/' + info.repo + '/releases/latest'))
			.then(
				function(data) {
					info.tag_name = data.tag_name
					info.root = [rawgit, info.repo, info.tag_name].join("/")
					return repo
				},
				repo.fail)
	};

	// 辅助函数

	gh.pick = function(src, keys, target) {
		// 从源对象 src 提取字符串数组 keys 中包含的属性扩展到目标对象 target.
		// 如果 !target 用 bare() 建立一个. 返回 target.
		target = target || gh.bare()
		keys.forEach(function(k) {
			target[k] = src[k]
		})
		return target
	}

	gh.slice = function(args, begin, end) {
		// 快捷方法, 用于对类数组对象 args 进行切片.
		// 省略 begin, end 等同转换 args 到数组对象.
		return _array.slice.call(args, begin, end)
	}

	gh.bare = function() {
		// 新建并返回一个没有任何属性的裸对象.
		return Object.create(null)
	}

	gh.echo = function(v) {
		// 返回 v
		return v
	}

	function noop() {}

	// Repo

	function Repo(info) {
		// 重新绑定 .info, .readme, .cdn 到 info 对象
		this.info = this.info.bind(info)
		this.cdn = this.cdn.bind(info)
		this.readme = this.readme.bind(info);
		this.base = this.base.bind(info);
		info.self = self.bind(this)
	}

	function self() {
		return this
	}

	gh.prototype = fn;

	fn.info = function() {
		// 返回该 repo 的信息对象副本, 该信息对象使用闭包保存, 禁止改写.
		// 该对象具有成员
		// 	repo     仓库 full_name.
		// 	tag_name 仓库最新 tag_name.
		// 	readme   仓库 readme.
		// 	root     获取文档相对根路径对应的 Rawgit CDN 地址.
		// 	base     获取文档基础路径, 以 '/' 开头和结尾.
		// 	self()   返回 Repo 对象.
		return Object.create(this)
	};

	fn.base = function(basedir) {
		// 返回文档基础路径. 如果指定 basedir, 设置 basedir 为基础路径.
		if (typeof basedir == 'string') {
			if (basedir[0] != '/') {
				basedir = '/' + basedir
			}
			if (basedir[basedir.length - 1] != '/') {
				basedir += '/'
			}
			this.base = basedir;
		}
		return this.base
	}

	fn.cdn = function(path) {
		// 拼接出 repo 相对路径 path 在 http://cdn.rawgit.com 的地址.
		// 本地模式或者 path 的第一个字符为 "/", 直接返回 path.
		if (!path) return this.root ? this.root + this.base : ''
		if (!this.root || path[0] == "/" || path.indexOf(this.root) == 0)
			return path

		return this.root + this.base + path
	}

	fn.readme = function() {
		// 通过 GitHub API 获取 repo 的 readme 文件内容. 返回 jQuery deferred 对象
		// 
		// See: https://developer.github.com/v3/repos/contents/
		var info = this
		if (!info.cdn || info.readme) {
			return $.when(info.readme)
		}

		return $.get([apiRepos, info.repo, 'readme'].join('/'))
			.then(function(data) {
				if (data.content) {
					info.readme = Base64.decode(data.content)
				}
				return info.readme
			}, info.self().fail)
	};

	fn.fail = function(jqXHR, textStatus, errorThrown) {
		// 此方法在 Ajax 请求失败时触发全局对象(window) "GoHub:fail" 事件.
		// 传递的参数为:
		// 	ajaxSettings, jqXHR, textStatus, errorThrown
		//  
		$(window).triggerHandler('GoHub:fail', [this, jqXHR, textStatus, errorThrown])
	}

	fn.get = function(path) {
		// 从 http://cdn.rawgit.com 或者本地获取 path 对应的文件.
		// 实际的 URL 由 info.repo, info.tag_name 和 path 拼接完成.
		// 示例:
		// 	repo.get('net/http/doc_zh_CN.go')
		//
		// 如果 path 的第一个字符为 "/", 表示绝对 URL, 不进行 rawgit 地址拼接.
		// 该方法返回原始的 jQuery deferred 对象, 未加入任何回调处理.
		// 除此之外 GoHub 提供的 ajax 请求加入了 .fail 等处理.

		return $.get(this.cdn(path))
	}

	fn.got = function(path) {
		// 调用 .get 并加入默认的 .fail 处理. 命名为 got 表示 .get 成功. 
		return this.get(path).fail(this.fail)
	};

	fn.show = function(path) {
		// 便捷方法. 从获取 path 对应的文件, 渲染到页面.
		// 等同调用:
		// 	gh.ready(repo.got(path)).done(gh.render)
		// 
		return gh.ready(this.got(path)).done(gh.render)
	}

})(jQuery, this);

(function($, global) {
	// HTML5 history
	var last, gh = global.GoHub,
		cache = gh.bare(),
		history = global.history,
		support = history && history.pushState && history.replaceState &&
		!global.navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]\D|WebApps\/.+CFNetwork)/);

	gh.prototype.history = function(path) {
		// 调用 gh.show(path), 如果浏览器支持 HTML5 history, 应用 HTML5 history.
		// 如果 path 已经被 cache, 直接渲染.
		// 此 history 暂不改变地址栏. 缺陷, 直接更改地址栏,会产生历史混乱.
		// 简单示例:
		//		$(window).on('popstate', function() {
		// 		if (repo.cdn()) repo.history(history.state)
		// 	})
		var url;
		if (!path) return;

		if (!support)
			return this.show(path)

		url = this.cdn(path)

		// onpopstate 有可能再次触发上次的请求
		if (last == url) return

		if (cache[url]) {
			last = url
			if (path != history.state) { // 非 history.go
				history.pushState(url)
			}
			return $.when(gh.ready.call({
				url: url
			}, cache[url])).done(gh.render)
		}

		return this.show(path).done(function(data) {
			cache[data.url] = data.raw
			if (last && data.url != history.state) {
				history.pushState(last)
			}
			last = data.url
			history.replaceState(last)
		})
	}
})(jQuery, this);

(function($, global) {
	// GoHub 页面渲染相关

	var gh = global.GoHub,
		trans = gh.transformer = gh.transformer || gh.bare();


	var _source = "\t !\"#$%&'()*+,./:;<=>?@[\\]^`{|}~",
		_target = "﹏░¡″♯＄％＆′﹙﹚×＋，·╱∶；＜＝＞¿＠［╲］∧ˋ﹛¦﹜∽";

	gh.safeId = function(raw) {
		// 转换文字可用作 id, 如果以数字开头, 附加前缀 "•"
		if (raw[0] >= "0" && raw[0] <= "9") {
			raw = "•" + raw
		}
		return raw.split('').map(function(c) {
			var i = _source.indexOf(c)
			return i == -1 ? c : _target[i]
		}).join('')
	};

	gh.unSafeId = function(raw) {
		// 反向 safeId
		if (raw[0] == "•") {
			raw = raw.slice(1)
		}
		return raw.split('').map(function(c) {
			var i = _target.indexOf(c)
			return i == -1 ? c : _source[i]
		}).join('')
	};

	gh.ready = function(d) {
		// ready 对 Ajax 成功接收到的数据转化为易于页面渲染的对象.
		// 列举两种等效的调用方法.
		// 示例:
		// 	gh.ready(repo.got("your file")).done(callback) // 或者
		// 	repo.got("your file").then(gh.ready).done(callback) // 必须使用 .then
		// 
		// ready 在 deferred.then 中转化原数据并向后传递. 转化后的对象属性为:
		// 
		// 	url       数据来源 URL
		// 	filename  URL 中以 "/" 分割的最后一部分
		// 	raw       ready 接收到的数据
		// 	content   转换数据, 初始值等于 raw. 由 gh.transformer 中的方法进行转换
		//    type      content 的类型, 由 gh.transformer 中注册的方法进行设置
		// 	brand     供应者 html. 由 gh.transformer 中的方法生成.
		// 	index     content 对应的索引树对象. 由 gh.transformer 中的方法生成.
		// 		[{
		// 			href: "#id",
		// 			text: "Getting started",
		//    		level: 0,
		//    	}]
		//
		// ready 循环调用 gh.transformer 中注册的方法. 初次匹配顺序为:
		// 
		// 1. 匹配 ajaxSettings.url 中的文件名.
		// 2. 匹配 ajaxSettings.url 中的文件扩展名.
		//
		// 后续通过 type 循环匹配, 直到匹配失败或者 type 为 "html" 或者循环次数超出 10.
		// gh.transformer 中注册的方法声明为:
		// 	function (data)
		// 
		// 任何错误发生时会:
		// 	$(window).triggerHandler("GoHub:Error:ready", [data])
		// 	return $.Deferred().reject([data])
		//  
		if (typeof d.then == 'function') {
			return d.then(gh.ready)
		};

		var data = {
				url: this.url,
				raw: d,
				content: d
			},
			file = data.filename = this.url.slice(this.url.lastIndexOf('/') + 1),
			ext = file.slice(file.lastIndexOf('.') + 1);

		data.type = trans[file] ? file : trans[ext] ? ext : false;
		if (!data.type) return;

		var safe = 0;
		do {
			var typ = data.type
			safe++
			trans[data.type](data)
		} while (typ != data.type && !data.error && safe < 10 && data.type != "html" && trans[data.type])

		if (safe >= 10) {
			data.error = "gh.ready: max recursion limit"
		}

		if (data.error) {
			$(window).triggerHandler("GoHub:Error:ready", [data])
			return $.Deferred().reject([data])
		}

		return data
	}

	gh.render = function(data) {
		// GoHub 默认渲染, 需要显示调用.
		// 示例:
		// 	repo.ready(deferred).done(gh.render)
		// 
		// render 把 data 渲染到 gh.settings 中 brand,index,content 属性对应的页面位置.
		// 默认值分别为 css 选择器:
		// 	".gh-brand",".gh-index",".gh-content"
		// 调用者可自行配置.
		// 
		var cfg = gh.settings

		if (data.brand && cfg.brand) {
			$(cfg.brand).empty().append(data.brand)
		}
		if (data.index && cfg.index) {
			$(cfg.index).empty().append(data.index)
		}
		if (data.content && cfg.content) {
			$(cfg.content).empty().append(data.content)
		}

		$(window).triggerHandler("GoHub:render", [data])
	}

	gh.hljs = function(code, lang) {
		// Gohub 默认代码着色调用 hljs.highlightAuto.
		return hljs.highlightAuto(code, lang && [lang] || []).value
	}

	$(function() {
		gh.settings = gh.settings || gh.bare()
		gh.settings.index = gh.settings.index || '.gh-index';
		gh.settings.brand = gh.settings.index || '.gh-brand';
		gh.settings.content = gh.settings.content || '.gh-content';
	})

})(jQuery, this);

(function($, global) {
	// GoHub 数据转换
	// 所有的转换器的参数都是一个最终对象, 直接把结果附加上去.
	var gh = global.GoHub,
		trans = gh.transformer = gh.transformer || gh.bare();

	trans.md = trans.readme = function(data) {
		data.content = global.marked(data.content)
		data.type = "html"
	}


	trans.go = function(data) {
		// Golang 文件渲染, 调用 gh.GoParse 进行解析, 解析的结果保存于 data.gopkg.
		// 对照翻译判定
		// 	文件名为 'doc_*.go' 格式的进行对照翻译判定.
		// 	如果存在包文档翻译则判定是对照翻译.
		// 	如果声明文档只有一份, 表示缺少翻译, 为保证兼容以原文替代翻译.

		var root = $(),
			pkg = data.gopkg = gh.GoParse(data.content),
			trans = data.filename.slice(0, 4) == 'doc_' &&
			pkg.comments.length ? 'translation' : null;

		data.content = root
		data.type = "html"

		root.push(
			$('<h2>').text('package ' + pkg.name)[0]
		)

		p(pkg)

		pkg.consts && pkg.consts.length && root.push(
			$('<h3>').text('Constants')[0]
		) && pkg.consts.forEach(function(decl) {
			code(decl)
			p(decl)
		})

		pkg.vars && pkg.vars.length && root.push(
			$('<h3>').text('Variables')[0]
		) && pkg.vars.forEach(function(decl) {
			code(decl)
			p(decl)
		})

		pkg.funcs && pkg.funcs.forEach(function(decl) {
			root.push(
				$('<h3>').text('func ').append(
					$('<a>').text(decl.name)
				)[0]
			)
			code(decl)
			p(decl)
		})

		$.each(pkg.types, function(_, decl) {
			root.push(
				$('<h3>').text('type ').append(
					$('<a>').text(decl.name)
				)[0]
			)
			code(decl)
			p(decl)

			decl.funcs && decl.funcs.forEach(function(decl) {
				root.push(
					$('<h4>').text('func ').append(
						$('<a>').text(decl.name)
					)[0]
				)
				code(decl)
				p(decl)
			})
		})

		function p(decl) {
			// 使用 P 标签包裹注释, PRE 标签包裹缩进和 ':' 后的段落.
			var tag;
			if (!decl.doc) return;
			if (trans) {
				gh.Godoc(decl.comments[decl.comments.length - 1] || decl.doc).forEach(function(txt) {
					if (txt[0] == '\t' || txt[0] == ' ') {
						txt = txt.replace(RegExp('^' + txt.match(/^\s+/)[0], 'gm'), '')
						tag = '<pre>'
					} else if (txt && txt[0] == txt[0].toUpperCase() && !txt.match(/[,:\.，：。]/)) {
						tag = '<h3>'
					} else {
						tag = '<p>'
					}

					root.push($(tag).text(txt).addClass('origin')[0])
				})
			}

			gh.Godoc(decl.doc).forEach(function(txt) {
				if (txt[0] == '\t' || txt[0] == ' ') {
					txt = txt.replace(RegExp('^' + txt.match(/^\s+/)[0], 'gm'), '')
					tag = '<pre>'
				} else if (txt && txt[0] == txt[0].toUpperCase() && !txt.match(/[,:\.，：。]/)) {
					tag = '<h3>'
				} else {
					tag = '<p>'
				}

				root.push($(tag).text(txt).addClass(trans)[0])
			})
		}

		function code(decl) {
			// 使用 pre 标签包裹代码
			var txt = decl.code;
			if (!txt) return;
			root.push($('<pre class="lang-go">').html(gh.hljs(txt, ['go']))[0])
		}
	}

	trans["gorepos.json"] = trans.gorepos_json = function(data) {
		// Go reops JSON 格式列表渲染到 HTML
		var root = $(),
			list = data.content;

		if (!$.isArray(list)) {
			data.error = "gorepos.json: invalid data"
			return
		}

		data.content = root
		data.type = "html"
		list.forEach(function(pkg) {
			root.push(
				$('<h4>').text(pkg.description)[0],
				$('<a>').text(pkg.repo).attr({
					href: pkg.repo,
					role: "repo"
				})[0]
			)
		})
	}

	trans["golist.json"] = trans.golist_json = function(data) {
		// Go package JSON 格式列表渲染到 HTML

		if ($.isArray(data.content)) {
			data.type = "gorepos.json"
			return
		}

		if (typeof data.content != 'object') {
			data.error = "golist.json: invalid data"
			return
		}

		var repo, items = [],
			list, keys,
			root = $(),
			repos = data.content;

		for (var name in repos) {
			repo = repos[name]
			list = repo.list
			keys = Object.keys(list).sort();
			root.push(
				$('<h3>').text(name)
				.data({
					'type': repo.type,
					'repo': repo.repo,
					description: repo.description
				})[0]
			)
			if (repo.description) {
				root.push(
					$('<p>').text(repo.description)
				)
			}

			keys.forEach(function(path, i) {
				var id = gh.safeId(path);

				root.push(
					$('<h4>').prop('id', id)
					.append(
						$('<a>').text(path).attr('href', path)
						.attr('role', 'gopackage')
					)[0],

					$('<p>').text(list[path])[0]
				)

				// 计算 index
				var last = path.lastIndexOf('/')
				var item = {
					href: '#' + id,
					text: path.slice(last + 1)
				}

				path = path.slice(0, last)

				while (path.length) {
					id = keys.lastIndexOf(path, i--)
					if (id != -1) break

					path = path.slice(0, path.lastIndexOf('/'))
				}

				items.push(item)

				item.level = id == -1 ? 0 : items[id].level + 1;

			})
		}

		data.content = root
		data.type = "html"

		if (!data.index && items.length) {
			data.index = items
		}
	};

})(jQuery, this);

(function($, global) {
	// 解析相关
	var block = {
			'p': 'name',
			'i': 'imports',
			'c': 'consts',
			'v': 'vars',
			't': 'types',
			'f': 'funcs'
		},
		ingore = /[\/\*]+\s*(\+|copyright|all rights|author|go:)/i,
		regBlock = /\n(\n\/|[ftvcip])/,
		regTypeName = / (\w+)/,
		regFunc = /func (?:\((?:[\w]+ )?\*?(\w+)(?:\) ))?(\w+)\([^\)]*\)(?: \(?(?:\w+,)*(?:\w )*\*?(\w+))?/;

	var gh = global.GoHub;

	function isSynopsis(s) {
		if (s.match(ingore)) {
			return true
		}
	}

	gh.GoParse = function Parser(src) {
		/**
		 * Go 源码解析器精简版, 非词法解析. 仅适用于格式化后的 Go 代码.
		 * 返回类似 go/doc.Package 结构对象. 该对象可以逆向生成 src
		 */
		var pkg = {
				name: [], // 临时使用数组类型, 后面整理 
				importPath: "",
				doc: "", // 文档
				comments: [], // 其他注释
				ingores: [], // 非文档部分的注释
				imports: [],
				consts: [],
				vars: [],
				funcs: [],
				types: gh.bare()
			},
			scope = pkg,
			comments = [],
			pos, txt, decl;

		src = src.trim();

		while (src.length) {
			pos = src.search(regBlock)

			if (pos == -1) {
				txt = src
				src = ""
			} else {
				txt = src.slice(0, pos)
				src = src.slice(pos).trimLeft()
			}

			if (txt[0] == '/') {
				comments.push(txt)
				continue
			}

			decl = gh.bare()
			decl.code = txt

			// 文档
			decl.doc = comments.pop()
			decl.comments = comments

			comments = [];

			txt = block[txt[0]]

			// 缺陷, 尚未分离声明块内的注释

			if (txt == 'types') {
				decl.name = decl.code.match(regTypeName)[1]
				pkg.types[decl.name] = decl
				continue
			}
			scope = pkg
			if (txt == 'funcs') {
				decl.name = decl.code.match(regFunc)

				if (decl.name[1]) {
					// receiver
					scope = pkg.types[decl.name[1]] = pkg.types[decl.name[1]] || gh.bare()
				} else if (decl.name[3] && pkg.types[decl.name[3]]) {
					// results, 缺陷, 返回类型必须先定义
					scope = pkg.types[decl.name[3]]
				}
				decl.name = decl.name[2]
			}

			scope[txt] = scope[txt] || []
			scope[txt].push(decl)
		}

		// package comments
		decl = pkg.name[0]
		if (decl.doc)
			pkg.doc = decl.doc;

		pkg.name = decl.code.slice(8).trim()

		if (decl.comments) {
			pkg.comments = []
			pkg.ingores = []
			decl.comments.forEach(function(txt) {
				if (isSynopsis(txt)) {
					pkg.ingores.push(txt)
				} else {
					pkg.comments.push(txt)
				}
			})
		}

		// import paths
		pos = pkg.name.indexOf('/')
		if (pos != -1) {
			pkg.importPath = pkg.name.match(/"(.*)"/)[1] // 不含两边的引号
			pkg.name = pkg.name.slice(0, pos).trim()
		}

		// 整理 import. 总是合并到一个数组.
		txt = pkg.imports
		pkg.imports = []
		txt.forEach(function(decl) {
			decl.code.match(/"(.*)"/g).forEach(function(path) {
				pkg.imports.push(path.slice(1, -1))
			})
		})

		return pkg
	};

	gh.Godoc = function(comments) {
		// Golang 注释风格文档解析提取.
		// 参数 comments 为一段格式化的注释原文.
		// 返回注释文本数组 [comment, ...],  该数组适用于渲染, 不能逆向到注释源码.
		// 该注释文本去除注释前导符号和排版空格, 以独立的空行进行分割.
		// 注释间非空行的换行符号被保留.
		var indent, style, pos,
			trimLeft = 0,
			ret = [],
			doc = [];

		comments = comments.split('\n')

		// 分析注释风格, 过滤前部空白注释
		comments.some(function(v, i) {
			pos = v.search(/\S/)
			if (!i) {
				style = v[pos + 1] // '/' || '*'
				trimLeft = style == '/' && pos + 2 || 0
			}

			if (!trimLeft) {
				trimLeft = v.slice(pos + 1).search(/[^\/\*]/)
				if (trimLeft == -1) {
					trimLeft = 0
					return
				}
				trimLeft += pos + 1
			}
			pos = i
			return true
		})

		if (style == '*') comments.pop()

		comments.slice(pos).forEach(function(v) {
			v = v.slice(trimLeft).trimRight()
			if (v) {
				v = v[0] == ' ' ? v.slice(1) : v
				doc.push(v)
			} else {
				ret.push(doc.join('\n'))
				doc = []
			}
		})
		if (doc.length) {
			ret.push(doc.join('\n'))
		}

		return ret;
	}

})(jQuery, this);