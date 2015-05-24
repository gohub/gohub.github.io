'use strict';

(function($, global) {
	var gh = global.GoHub,
		repo = global.repo = gh(),
		$brand,
		$index,
		$content;

	$(window).on("GoHub:Error:ready", function() {
		console.error(arguments)
	})

	$(function() {
		marked.setOptions({
			highlight: gh.hljs
		})

		$brand = $('.gh-brand')
		$index = $('.gh-index')
		$content = $('.gh-content')

		repo.show('/golist.json').done(
			$(window).on('click', dispatch)
		)
	})

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
			repo.show(href)
			return false
		}

		var role = el.attr('role');

		if (role == "repo") {
			setTimeout(function() {
				gh(href).done(function(rep, textStatus, jqXHR) {
					global.repo = repo = rep
					repo.show('golist.json')
				})
			}, 0)
		}
		if (role == "gopackage") {
			setTimeout(function() {
				repo.show("src/" + href + "/doc_zh_CN.go")
			}, 0)
		}
		return false
	}

	// 'zh-CN/src/bufio/doc_zh_CN.go'
	// 'README.md'

})(jQuery, this)