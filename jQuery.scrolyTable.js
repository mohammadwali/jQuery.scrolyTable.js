/*!
    jQuery.scrolyTable.js v1.0
    Copyright (c) 2014 Mohammad wali and Yousaf Syed, JustCode.io

    Licensed under the MIT license
    http://en.wikipedia.org/wiki/MIT_License

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/
(function($, win, doc) {
    var _win = $(win),
        _doc = $(doc),
        body = doc.body,
        _body = $(body),
        scrollbarWidth = 0,
        defaults = {
            rowsToDisplay: 10,
            containerClass: "",
            escapeCols: [],
            onInit: function() {},
            sort: {
                enable: true,
                onSort: function() {},
                sortBy: [],
                skipIndex: [1]
            },
            search: {
                enable: true,
                skipIndex: [1],
                onToggle: function() {},
                onResult: function() {},
                searchRegex: "",
                searchBy: [],
            }
        };

    function getScrollbarWidth() {
        if (scrollbarWidth) return scrollbarWidth;
        var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div></div>');
        $('body').append(div);
        var w1 = $('div', div).innerWidth();
        div.css('overflow-y', 'auto');
        var w2 = $('div', div).innerWidth();
        $(div).remove();
        scrollbarWidth = (w1 - w2);
        return scrollbarWidth;
    }
    var methods = {
        init: function(options) {
            if (!$("style#scroly-style").length) appendStyle();
            options = mergeObj(defaults, options);
            var table = this,
                count = 0,
                scrollbarWidth = getScrollbarWidth();
            table.each(function(i, elm) {
                if (table.isScrolyTable()) {
                    count++;
                    return;
                }
                var _table = $(this),
                    _id = _table.attr("id") || "table_" + new Date().getMilliseconds().toString();
                existingClasses = _table.attr('class'),
                rowHeight = table.find('tbody tr:first').outerHeight(),
                wrapper_height = rowHeight * options.rowsToDisplay;
                var tbody_wrapper = $("<div>").css({
                    position: "relative",
                    overflow: "hidden",
                    overflowY: "scroll",
                    height: wrapper_height
                }).insertBefore(_table).append(_table);
                tbody_wrapper.addClass(options.containerClass);
                tbody_wrapper.attr("id", _id + "_wrapper");
                var table_header = $("<div>").css({
                    position: "relative",
                }).insertBefore(tbody_wrapper);
                table_header_tb = $("<table>").css({
                    position: "relative",
                    "margin-bottom": 0
                }).appendTo(table_header);
                table_header_tb.attr("class", _table.attr("class"));
                table_header_tb.html(_table.find("thead").clone())
                //binding the thead 
                var fn = 1;
                table_header_tb.find('thead th').each(function(i) {
                    if ($.inArray(i, options.escapeCols) == -1) $(this).css({
                        "cursor": "pointer",
                        "-moz-user-select": "-moz-none",
                        "-moz-user-select": "none",
                        "-o-user-select": "none",
                        "-khtml-user-select": "none",
                        "-webkit-user-select": "none",
                        "-ms-user-select": "none",
                        "user-select": "none"
                    });
                }).click(function(e) {
                    fn *= -1;
                    var currentHeaderIndex = table_header_tb.find('thead th').index(this);
                    var th = this;
                    if ($.inArray(currentHeaderIndex, options.escapeCols) == -1) {
                        if (event.ctrlKey && options.search.enable == true && $.inArray(currentHeaderIndex, options.search.skipIndex) == -1) {
                            switchToSearch.apply(table, [th, currentHeaderIndex, options.search]);
                        } else {
                            if (options.sort.enable == true && $.inArray(currentHeaderIndex, options.sort.skipIndex) == -1) {
                                if ($(th).find('.scrolySearch-wrap').length > 0) return false;
                                sortScroly.apply(table, [fn, currentHeaderIndex, options.sort.onSort, options.sort.sortBy]);
                            }
                        }
                    }
                });
                table_header.attr("id", _id + "_header");
                methods.fixColumns.apply(table, arguments);
                //fix header colomns 
                _win.resize(function() {
                    setTimeout(function() {
                        methods.fixColumns.apply(table, arguments)
                    }, 60)
                });
                if (typeof options.onInit == "function") options.onInit.apply(table, []);
            });
            return (count > 0) ? undefined : this;
        },
        fixColumns: function() {
            var table = this,
                count = 0;
            table.each(function() {
                if (!$(this).isScrolyTable()) {
                    count++;
                    return
                };
                var _table = $(this),
                    table_header = _table.parents("div[id*=_wrapper]").prev("div[id*=_header]:has(table)");
                _table.css({
                    "width": "",
                    "min-width": ""
                });
                _table.css("min-width", _table.find("tr:first").width());
                _table.find("thead th").each(function(i, elm) {
                    table_header.find("thead th:eq(" + i + ")").css('width', $(elm).outerWidth() + 'px');
                    table_header.find("thead th:eq(" + i + ")").css({
                        'padding-left': $(elm).css("padding-left"),
                        'padding-right': $(elm).css("padding-left")
                    });
                    $(elm).attr("style", "padding-top:0px !important;padding-bottom:0px !important;height:0px !important;border-top-width:0px !important;border-bottom-width:0px !important");
                    if ($(elm).find("> .size_fixer").length == 0) {
                        var wrapper = $("<div>").css({
                            "height": 0,
                            "overflow": "hidden"
                        })
                        wrapper.addClass("size_fixer")
                        wrapper.html($(elm).html())
                        $(elm).html(wrapper);
                    }
                })
            });
            return (count > 0) ? undefined : this;
        },
        destroy: function() {
            return $(this).each(function(i, c) {
                c = $(c);
                var header = $("div[id=" + c.attr("id") + "_header]"),
                    wrapper = c.parents("div[id=" + c.attr("id") + "_wrapper]");
                header.find("thead th").removeAttr("style");
                c.find("thead").remove();
                c.prepend(header.find("thead")[0]);
                c.insertBefore(header);
                header.remove();
                wrapper.remove();
            })
        }
    }

        function sortScroly(f, index, callback, sortBy) {
            //console.log('index', index);
            var table = $(this);
            var rows = table.find('tbody tr').get();
            rows.sort(function(a, b) {
                //console.log($(a).children('td').eq(index));
                var A = ($(a).children('td').eq(index).has('input:text').length) ? $(a).children('td').eq(index).find('input:text').val().toUpperCase() : $(a).children('td').eq(index).text().toUpperCase(),
                    B = ($(b).children('td').eq(index).has('input:text').length) ? $(b).children('td').eq(index).find('input:text').val().toUpperCase() : $(b).children('td').eq(index).text().toUpperCase();
                if (sortBy.length > 0) {
                    var sortObject = $.grep(sortBy, function(i) {
                        return i.columnIndex == index;
                    });
                    //console.log(sortObject);
                    if (sortObject.length > 0) {
                        if (typeof sortObject[0].getValue == "function") {
                            A = sortObject[0].getValue.apply($(a).children('td').get(index), []);
                            B = sortObject[0].getValue.apply($(b).children('td').get(index), []);
                        }
                    }
                }
                if (A < B) {
                    return -1 * f;
                }
                if (A > B) {
                    return 1 * f;
                }
                return 0;
            });
            $.each(rows, function(index, row) {
                table.children('tbody').append(row);
            });
            if (typeof callback == "function") callback.apply(this, []);
        }

        function mergeObj(obj1, obj2) {
            for (var p in obj2) {
                try {
                    // Property in destination object set; update its value.
                    if (obj2[p].constructor == Object) {
                        obj1[p] = mergeObj(obj1[p], obj2[p]);
                    } else {
                        obj1[p] = obj2[p];
                    }
                } catch (e) {
                    // Property in destination object not set; create it and set its value.
                    obj1[p] = obj2[p];
                }
            }
            return obj1;
        }

        function switchToSearch(th, index, search) {
            // console.log('index', index);
            // console.log('callback', callback);
            var that = this;
            if ($(th).find('.scrolySearch-wrap').length == 0) {
                removeSearchScroly.apply(that, [index, $(th).parents('thead').find('th')]);
                var thText = $(th).text(),
                    html = '<div class="scrolySearch-wrap"><span class="th-text">' + thText + '</span> <div class="scrolySearch"> <div class="scrolySearch-content"> <input type="text"> </div></div></div>';
                $(th).html(html);
                $(th).find('input:text').on('keyup', function(event) {
                    //console.log('somthing pressed',event);
                    if (event.keyCode == 13) {
                        // enter pressed fire in the hole
                        searchScroly.apply(that, [$(this).val(), index, th, search.onResult])
                    } else if (event.keyCode == 27) {
                        // escape pressed abort mission
                        removeSearchScroly.apply(that, [index, $(th)]);
                        if (typeof search.onToggle == "function") search.onToggle.apply(that, [index, false]);
                    }
                });
                $(th).find('.scrolySearch').addClass('active');
                $(th).find('input:text').focus();
            }
            if (typeof search.onToggle == "function") search.onToggle.apply(that, [index, true]);
        }

        function removeSearchScroly(index, th) {
            th.each(function(i, elm) {
                if ($(elm).find('.th-text').length) $(elm).html($(elm).find('.th-text'));
            }).find('.scrolySearch').removeClass('active');
        }

        function searchScroly(value, index, th, callback) {
            // body...
            var that = this,
                thText = $(th).find('.th-text').text().trim(),
                str = "",
                valueUpper = value.toUpperCase();
            if (valueUpper == "") {
                return false;
            }
            $(that).find('tbody tr:not(.seprator)').each(function() {
                var currentTr = $(this);
                var currentTd = currentTr.find('td').eq(index),
                    str = currentTd.text();
                if (str != "") {
                    str = str.toUpperCase();
                }
                if (str.search(valueUpper) == -1) {
                    if (!currentTr.hasClass('hidden')) {
                        currentTr.addClass('hidden');
                    }
                    if (typeof currentTr.data('filteredHidden') == "undefined") {
                        currentTr.data('filteredHidden', [{
                            index: index,
                            value: value,
                            thText: thText
                        }]);
                    } else {
                        currentTr.data('filteredHidden').push({
                            index: index,
                            value: value,
                            thText: thText
                        });
                    }
                }
            });
            if (value != "") {
                addFilers.apply(that, [index, value, th]);
            }
            if (typeof callback == "function") callback.apply(this, []);
        }

        function addFilers(index, value, th) {
            var that = this;
            var header = $("div[id=" + $(that).attr("id") + "_header]");
            if (header.find('.filtersList').length == 0) {
                header.prepend("<div class='filtersList' />");
            }
            header.find('.filtersList').append('<div class="filter"><span data-i="' + index + '" class="name">' + $(th).find('.th-text').text().trim() + '</span>: <span class="value">' + value + '</span><span class="filterClose">&times;</span></div>');
            header.find('.filterClose').each(function() {
                $(this).unbind('click').click(function(e) {
                    e.preventDefault();
                    var index = $(this).parents('.filter').find('span.name').attr('data-i'),
                        value = $(this).parents('.filter').find('span.value').text().trim();
                       
                    removeFilers.apply(that, [index,value,$(this).parents('.filter')]);
                });
            });
        }

        function removeFilers(index,value,filter) {
            var table = $(this);
            table.find('tbody tr.hidden').each(function(i,elm){
                var tr = $(elm),
                filterData =tr.data('filteredHidden');
                $.each(filterData,function(j,k){
                   
                    if(k.value == value && k.index == index){
                        
                        filterData.splice(j,1);
                    }
                });

               if(filterData.length == 0){
                    tr.removeClass('hidden');
               }

            });
            filter.remove();
        }

        function appendStyle() {
            return $("head").append('<style id="scroly-style">.scrolySearch .popup{position:absolute}.scrolySearch-wrap{display:inline-block;position:relative}.scrolySearch-wrap .scrolySearch{position:absolute;padding:3px 4px 5px;background:#fff;border-radius:2px;border:1px solid #D4DADB;-webkit-transition:all ease .25s;transition:all ease .25s;top:-40px;opacity:0;filter:alpha(opacity=0);visibility:hidden;z-index:999;left:50%;margin-left:-41px;width:80px}.scrolySearch-buttons{padding:5px 5px 0}.scrolySearch:before{content:"";display:inline-block;border-top:8px solid #DEDEDE;border-right:8px solid transparent;border-left:8px solid transparent;position:absolute;left:50%;bottom:-7px;z-index:1;margin-left:-8px}.scrolySearch:after{content:"";display:inline-block;border-top:8px solid #FFF;border-right:8px solid transparent;border-left:8px solid transparent;position:absolute;left:50%;bottom:-5px;margin-left:-8px;z-index:9}.scrolySearch.active{-webkit-transition:top ease .25s;transition:top ease .25s;opacity:1;filter:alpha(opacity=100);visibility:visible;top:-35px}.scrolySearch-wrap input{width:100%;border:1px solid #E2DADA;border-radius:3px;color:#7e7e7e}</style>');
        }
    $.fn.scrolyTable = function(options) {
        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof options === 'object' || !options) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + options + ' does not exist on scrolyTable.js');
        }
    };
    $.fn.isScrolyTable = function() {
        return $(this).parents("div[id=" + $(this).attr("id") + "_wrapper]").length ? true : false;
    };
})(window.jQuery, window, document);
