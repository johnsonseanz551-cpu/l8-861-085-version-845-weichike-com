(function() {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("searchInput");
    var title = document.getElementById("searchTitle");
    var hint = document.getElementById("searchHint");
    var results = document.getElementById("searchResults");
    var empty = document.getElementById("searchEmpty");

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function(char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                """: "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function card(item) {
        var tags = (item.tags || []).slice(0, 3).map(function(tag) {
            return "<span class="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded-md">" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<a href="" + escapeHtml(item.url) + "" class="group bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-0.5 movie-card">" +
            "<div class="relative h-40 overflow-hidden">" +
            "<img src="./" + escapeHtml(item.cover) + "" alt="" + escapeHtml(item.title) + "" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy">" +
            "<div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>" +
            "<div class="absolute top-3 left-3 flex items-center space-x-2"><span class="px-2 py-1 bg-slate-900/90 backdrop-blur-sm text-cyan-400 text-xs rounded-md border border-cyan-500/30">" + escapeHtml(item.category) + "</span></div>" +
            "<div class="absolute bottom-3 right-3 flex items-center space-x-2 text-xs text-white"><div class="flex items-center space-x-1 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-md"><span>" + escapeHtml(item.year) + "</span></div><div class="flex items-center space-x-1 bg-slate-900/90 backdrop-blur-sm px-2 py-1 rounded-md"><span class="text-yellow-400">★</span><span>" + escapeHtml(item.rating) + "</span></div></div>" +
            "</div><div class="p-4"><h3 class="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-2 text-base">" + escapeHtml(item.title) + "</h3><p class="mt-2 text-sm text-slate-400 line-clamp-2">" + escapeHtml(item.oneLine) + "</p><div class="mt-3 flex flex-wrap gap-2">" + tags + "</div></div></a>";
    }

    function render() {
        if (input) {
            input.value = query;
        }
        var normalized = query.toLowerCase();
        var list = normalized ? SEARCH_MOVIES.filter(function(item) {
            return (item.search || "").toLowerCase().indexOf(normalized) !== -1;
        }).slice(0, 120) : SEARCH_MOVIES.slice(0, 24);
        if (title) {
            title.textContent = normalized ? "搜索结果" : "推荐内容";
        }
        if (hint) {
            hint.textContent = normalized ? "匹配到相关影片，可进入详情页观看。" : "可通过关键词筛选片库中的影片。";
        }
        if (results) {
            results.innerHTML = list.map(card).join("");
        }
        if (empty) {
            empty.classList.toggle("hidden", list.length !== 0);
        }
    }

    render();
})();
