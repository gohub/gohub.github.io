'use strict';

(function($, global) {
	var gh = global.GoHub,
		golist, listkey = gh.bare(), // repo golist cache
		repo = global.repo = gh(), // 当前 repo
		info, // 当前 repo.info()
		repos = gh.bare(); // cache

	$(window).on("GoHub:Error:ready", function() {
		$("#gh-loading").hide();
		console.error("error", arguments)
	})

	$(window).on("GoHub:fail", function() {
		$("#gh-loading").hide();
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


		repo.history('/golist.json').done(function(d) {
			golist = d.raw
			golist.forEach(function(item) {
				listkey[item.repo] = 1
			})
			$(window).on('click', dispatch)
		})

		$(window).on('popstate', function() {
			repo.history()
		})
		$('nav button').click(function() {
			$('.origin').toggleClass('none')
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
		if (!href) return false;
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
					repo.history('golist.json').done(function(d) {
						// 合并 repo
						if (!$.isArray(d.raw)) return;
						d.raw.forEach(function(item) {
							if (listkey[item.repo]) return;
							listkey[item.repo] = 1
							golist.push(item)
						})
					})
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