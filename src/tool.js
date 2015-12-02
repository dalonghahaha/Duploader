/**
 * 调试函数
 * @param  info 调试信息
 */
Duploader.prototype.debug = function(info,prefix) {
    if (this.config.debug) {
        var prefix = prefix ? prefix : this.constructor.toLocaleString().match(/function\s*([^(]*)\(/)[1];
        var format = info instanceof Object ? prefix + "[%s]:%o" : prefix +"[%s]:%s";
        console.log(format, this.format_date(new Date(), "yyyy-M-dd hh:mm:ss S"), info);
    }
}

/**
 * 输出错误信息
 * @param info 错误信息
 */
Duploader.prototype.error = function(info,prefix) {
    var prefix = prefix ? prefix : this.constructor.toLocaleString().match(/function\s*([^(]*)\(/)[1];
    var format = info instanceof Object ? prefix + "[%s]:%o" : prefix +"[%s]:%s";
    console.error(format, this.format_date(new Date(), "yyyy-M-dd hh:mm:ss S"), info);
}

/**
 * 输出警告信息
 * @param info 警告信息
 */
Duploader.prototype.warn = function(info,prefix) {
    var prefix = prefix ? prefix : this.constructor.toLocaleString().match(/function\s*([^(]*)\(/)[1];
    var format = info instanceof Object ? prefix + "[%s]:%o" : prefix +"[%s]:%s";
    console.warn(format, this.format_date(new Date(), "yyyy-M-dd hh:mm:ss S"), info);
}

/**
 * 输出警告信息
 * @param  info [警告信息]
 */
Duploader.prototype.alert = function(info,prefix) {
    alert(info);
}

/**
 * 是否包含类判断
 * @param  element 待检测元素
 * @param  class_name   类名
 */
Duploader.prototype.has_class = function(element, class_name) {
    class_name = class_name || '';
    if (class_name.replace(/\s/g, '').length == 0) return false;
    return new RegExp(' ' + class_name + ' ').test(' ' + element.className + ' ');
}

/**
 * 添加类
 * @param  element 待检测元素
 * @param  class_name   类名
 */
Duploader.prototype.add_class = function(element, class_name) {
    if (!this.has_class(element, class_name)) {
        element.className = element.className == '' ? class_name : element.className + ' ' + class_name;
    }
}

/**
 * 移除类
 * @param  element 待检测元素
 * @param  class_name   类名
 */
Duploader.prototype.remove_class = function(element, class_name) {
    if (this.has_class(element, class_name)) {
        var newClass = ' ' + element.className.replace(/[\t\r\n]/g, '') + ' ';
        while (newClass.indexOf(' ' + class_name + ' ') >= 0) {
            newClass = newClass.replace(' ' + class_name + ' ', ' ');
        }
        element.className = newClass.replace(/^\s+|\s+$/g, '');
    }
}

/**
 * 数组查找函数
 * @param  目标数组
 * @param  待查找元素
 */
Duploader.prototype.index_of = function(array, find) {
    var finder = array.join();
    return finder.indexOf(find) >= 0;
}

/**
 * 数组取随机元素
 * @param  目标数组
 */
Duploader.prototype.random_of = function(array) {
    var length = array.length;
    var index = Math.floor((Math.random() * length));
    return array[index];
}

/**
 * 时间格式化函数
 * @param  second 秒数
 */
Duploader.prototype.format_time = function(second) {
    var time = [parseInt(second / 60 / 60), parseInt(second / 60 % 60), second % 60].join(":");
    return time.replace(/\b(\d)\b/g, "0$1");
}

/**
 * 百分比换算函数
 * @param  numerator 分子
 * @param  denominator 分母
 */
Duploader.prototype.format_percent = function(numerator, denominator) {
    if (!denominator) {
        return 0;
    } else {
        return (Math.round(numerator / denominator * 10000) / 100.00);
    }
}

/**
 * 日期格式化函数
 * @param  date 时间对象
 * @param  fmt  待输出格式
 */
Duploader.prototype.format_date = function(date, fmt) {
    var o = {
        "M+": date.getMonth() + 1, //月份 
        "d+": date.getDate(), //日 
        "h+": date.getHours(), //小时 
        "m+": date.getMinutes(), //分 
        "s+": date.getSeconds(), //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

/**
 * 字节数友好显示
 * @param  size 字节数
 */
Duploader.prototype.format_size = function(size) {
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(size) / Math.log(k));
    var result = size / Math.pow(k, i);
    return Math.round(result * 100) / 100 + ' ' + sizes[i];
}

/**
 * 异步get
 * @param  url      [请求链接]
 * @param  data     [请求数据]
 * @param  callback [回调函数]
 */
Duploader.prototype.async_get = function(url, data, callback) {
    this.debug(data);
    var AjaxRequest = new XMLHttpRequest();
    if (!AjaxRequest) {
        this.error("Ajax请求初始化失败!");
        return false;
    }　
    AjaxRequest.responseType = 'json';
    AjaxRequest.onreadystatechange = function() {
        switch (AjaxRequest.readyState) {
            case 1:
                this.debug('ajax打开，准备上传');
                break;
            case 4:
                if (AjaxRequest.status == 200) {
                    this.debug('ajax 收到服务器端数据');
                    this.debug(AjaxRequest.response);
                    if (!AjaxRequest.response) {
                        this.error('ajax返回格式错误');
                    } else {
                        callback(AjaxRequest.response);
                    }
                } else {
                    this.error("上传过程出现错误,状态:" + AjaxRequest.status);
                }
                break;
        }
    }.bind(this);
    AjaxRequest.error = function() {
        this.error("提交过程出现错误");
    }.bind(this);
    url += "?time=" + new Date().getTime();
    for (var p in data) {
        url += "&" + p + "=" + data[p];
    }
    AjaxRequest.open('GET', url, true);　
    AjaxRequest.send(null);
}

/**
 * 异步post
 * @param  url      [请求链接]
 * @param  data     [请求数据]
 * @param  callback [回调函数]
 */
Duploader.prototype.async_post = function(url, data, callback) {
    this.debug(data);
    var AjaxRequest = new XMLHttpRequest();
    if (!AjaxRequest) {
        this.error("Ajax请求初始化失败!");
        return false;
    }　
    AjaxRequest.responseType = 'json';
    AjaxRequest.onreadystatechange = function() {
        switch (AjaxRequest.readyState) {
            case 1:
                this.debug('ajax打开，准备上传');
                break;
            case 4:
                if (AjaxRequest.status == 200) {
                    this.debug('ajax 收到服务器端数据');
                    callback(AjaxRequest.response);
                } else {
                    this.error("上传过程出现错误,状态:" + AjaxRequest.status);
                }
                break;
        }
    }.bind(this);
    AjaxRequest.error = function() {
        this.error("提交过程出现错误");
    }.bind(this);
    var UploaDuploader = new FormData();
    if (UploaDuploader) {
        for (var p in data) {
            UploaDuploader.append(p, data[p]);
        }
        AjaxRequest.open('POST', url, true);　
        AjaxRequest.send(UploaDuploader);
    } else {
        this.error("提交过程出现错误");
    }
}

/**
 * 添加css头
 * @param  url [css链接地址]
 */
Duploader.prototype.css_link = function(url) {
    var head = document.getElementsByTagName('head')[0];
    var linkTag = document.createElement('link');
    linkTag.setAttribute('rel', 'stylesheet');
    linkTag.setAttribute('type', 'text/css');
    linkTag.href = url;
    head.appendChild(linkTag);
    return linkTag;
}

/**
 * css加载判断
 * @param  link     [css链接]
 * @param  callback [回调函数]
 */
Duploader.prototype.css_ready = function(link, callback) {
    var d = document,
        t = d.createStyleSheet,
        r = t ? 'rules' : 'cssRules',
        s = t ? 'styleSheet' : 'sheet',
        l = d.getElementsByTagName('link');
    // passed link or last link node
    link || (link = l[l.length - 1]);

    function check() {
        try {
            return link && link[s] && link[s][r] && link[s][r][0];
        } catch (e) {
            return false;
        }
    }

    (function poll() {
        check() && setTimeout(callback, 0) || setTimeout(poll, 100);
    })();
}
