'use strict';

(function($, global) {
	var gh = global.GoHub,
		repo = global.repo = gh(), // 当前 repo
		info, // 当前 repo.info()
		repos = gh.bare(), // cache
		$brand,
		$index,
		$content;

	$(window).on("GoHub:Error:ready", function() {
		console.error(arguments)
	})

	$(document).ajaxStart(function() {
		$("#gh-loading").show();
	});

	$(window).on('GoHub:render', function() {
		$("#gh-loading").hide();
	});

	$(function() {
		marked.setOptions({
			highlight: gh.hljs
		})

		$brand = $('.gh-brand')
		$index = $('.gh-index')
		$content = $('.gh-content')

		repo.history('/golist.json').done(
			$(window).on('click', dispatch)
		)

		$(window).on('popstate', function() {
			if (repo.cdn()) repo.history(history.state)
		})
	})

	function getRepo(rep) {
		info = rep.info();
		repos[info.repo] = info
		global.repo = repo = rep
	}


	function dispatch(e) {
		// 派发获取文档请求
		if (!e.target || e.target.nodeName != 'A') {
			return
		};
		var el = $(e.target),
			href = el.attr('href');

		if (href[0] == '#' || href.indexOf(':') > 0 || href.slice(0, 2) == '//') {
			return
		}

		// 本地文件以 "/" 开头
		if (href[0] == '/') {
			setTimeout(function() {
				repo.history(href)
			}, 0)
			return false
		}

		var role = el.attr('role');
		if (role == "repo") {
			setTimeout(function() {
				gh(href).done(getRepo).done(function() {
					repo.history('golist.json')
				})
			}, 0)
			return false
		}

		if (role == "gopackage") {
			var data, name, base;
			el = el.parent()
			while (el.size() && !el.is('h3')) {
				el = el.prev()
			}

			data = el.data()
			name = data.repo.split('/')
			base = name.slice(2).join('/')
			name = name.slice(0, 2).join('/')

			if (!repos[name]) {
				setTimeout(function() {
					gh(data.repo).done(getRepofunction).done(function() {
						repo.history(href + '/' + data.type || 'doc_zh_CN.go')
					})
				}, 0)
				return false
			}

			info = repos[name]
			repo = info.self()

			if (base != info.base.slice(1, -1)) {
				repo.base(base)
			}
			setTimeout(function() {
				repo.history(href + '/' + data.type || 'doc_zh_CN.go')
			}, 0)
			return false
		}
		return false
	}

})(jQuery, this)