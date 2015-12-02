/**
 * Duploader - Smart File Uploader
 *
 * Version - 1.0.0
 *
 * Copyright 2015,Dengjialong
 * 
 */

/**
 * 构造函数
 * @param  config 配置项
 */
function Duploader(config) {
    //初始化配置
    this.build_config(config);
    //检查配置项是否正确
    if(!this.check_config()){
        return;
    }
    //检查浏览器环境是否支持控件
    if(!this.check_environment()){
        return;
    }
    //初始化运行时数据
    this.build_runtime();
    //初始化控件
    this.build_uploader();
}

/**
 * 设置配置项
 * @param config   配置项
 * @param property 属性名
 * @param value    属性值
 */
Duploader.prototype.set_config = function(config, property, value) {
    Object.defineProperty(config, property, {
        value: value,
        writable: false, //不可写
        configurable: false, //不可删除
        enumerable: false //不可枚举
    });
}

/**
 * 初始化配置文件
 * @param  config 配置项
 */
Duploader.prototype.build_config = function(config) {
    //默认配置项
    var _config = {
        //是否多文件上传模式
        multiple: false,
        //调试开关
        debug: false,
        //是否分片上传
        chunk: false,
        //分片大小
        chunk_size: 2 * 1024 * 1024,
        //是否启动断点续传
        resume_broken: false,
        //文件选择器类别过滤
        accept_mime: null,
        //文件后缀名限制
        extend_limited: null,
        //文件大小限制
        size_limited: null,
        //控件打开按钮
        btn_open: null,
        //上传地址
        upload_url: null,
        //上传类型
        upload_type: "websocket"
    }
    if (config) {
        for (var p in config) {
            _config[p] = config[p];
        }
    }
    this.config = Object.create({});
    for (var p in _config) {
        this.set_config(this.config, p, _config[p]);
    }
}

/**
 * 初始化运行时数据
 */
Duploader.prototype.build_runtime = function() {
    this.runtime = {
        //标识
        _id: 0,
        //上传控件实例
        instance:null,
        //websocket链接
        socket: null,
        //上传锁
        uploading: false,
        //文件id
        file_id: null,
        //文件列表
        file_list: [],
        //上传计数
        upload_count: 0,
        //上传结果
        upload_result: []
    };
}

/**
 * 校验配置文件
 */
Duploader.prototype.check_config = function() {
    this.debug(this.config);
    return true;
}

/**
 * 校验浏览器环境
 */
Duploader.prototype.check_environment = function() {
    return true;
}


/**
 * 对外提供的事件
 */
Duploader.prototype._event = [
    'ready',
    'file_select',
    'file_add',
    'file_change',
    'file_remove',
    'upload_begin',
    'upload_finish',
    'result',
];

/**
 * 事件注册器
 * @param  event_name 事件名
 * @param  fun        回调函数
 */
Duploader.prototype.on = function(event_name, fun) {
    if (this.index_of(this._event, event_name)) {
        if (fun && fun instanceof Function) {
            this.debug("register on_uploader_" + event_name);
            this['on_uploader_' + event_name] = fun;
        } else {
            this.error("注册函数参数错误");
        }
    } else {
        this.warn("该事件不支持");
    }
}

/**
 * 事件触发器
 * @param  event_name 事件名
 */
Duploader.prototype.trigger = function(event_name,arguments) {
    if(!this['on_uploader_' + event_name]){
        return false;
    }

    if(!this['on_uploader_' + event_name] instanceof Function){
        return false;
    }
    this.debug("trigger on_uploader_" + event_name);
    return this['on_uploader_' + event_name].apply(this,arguments);
}
/**
 * 调试函数
 * @param  info 调试信息
 */
Duploader.prototype.debug = function(info) {
    if (this.config.debug) {
        if (info instanceof Object) {
            console.log("Duploader【%s】:%o", this.format_date(new Date(), "yyyy-M-dd hh:mm:ss S"), info);
        } else {
            console.log("Duploader【%s】:%s", this.format_date(new Date(), "yyyy-M-dd hh:mm:ss S"), info);
        }
    }
}

/**
 * 输出错误信息
 * @param info 错误信息
 */
Duploader.prototype.error = function(info) {
    if (info instanceof Object) {
        console.error("Duploader【%s】:%o", this.format_date(new Date(), "yyyy-M-dd hh:mm:ss S"), info);
    } else {
        console.error("Duploader【%s】:%s", this.format_date(new Date(), "yyyy-M-dd hh:mm:ss S"), info);
    }
}

/**
 * 输出警告信息
 * @param info 警告信息
 */
Duploader.prototype.warn = function(info) {
    if (info instanceof Object) {
        console.warn("Duploader【%s】:%o", this.format_date(new Date(), "yyyy-M-dd hh:mm:ss S"), info);
    } else {
        console.warn("Duploader【%s】:%s", this.format_date(new Date(), "yyyy-M-dd hh:mm:ss S"), info);
    }
}

/**
 * 输出警告信息
 * @param  info [警告信息]
 */
Duploader.prototype.alert = function(info) {
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

/**
 * 类名样式表
 */
Duploader.prototype._class = {
    BASE: 'Duploader',
    HIDDEN: 'Duploader-Hidden',
    CLEAR: 'Duploader-Clear',
    MASK: 'Mask',
    OPERATION: 'operation',
    TITLE: 'title',
    FILE_LIST: 'file-list',
    FILE: 'file',
    FILE_SECTION: 'file-section',
    FILE_INFO: 'file-info',
    FILE_CHANGE: 'file-change',
    FILE_REMOVE: 'file-remove',
    PROGRESS_SECTION: 'progress-section',
    PROGRESS_BAR: 'progress-bar',
    PROGRESS_INFO: 'progress-info',
    PROGRESS_TEXT: 'progress-text',
    BUTTON: 'button',
    BUTTON_BASE: 'button-base',
    BUTTON_ADD: 'button-add',
    BUTTON_UPLOAD: 'button-upload',
    BUTTON_CANCEL: 'button-cancel'
}

/**
 * 生成DIV统一方法
 * @param  class_name 类名
 * @param  inner_text 内容
 */
Duploader.prototype.create_element = function(class_name, inner_text) {
    var element = document.createElement('div');
    if (class_name instanceof Array) {
        element.className = class_name.join(' ');
    } else {
        element.className = class_name;
    }
    if (inner_text) {
        element.innerText = inner_text;
    }
    return element;
}

/**
 * 根据类名定位元素
 * @param  class_name 类名
 */
Duploader.prototype.query_element = function(class_name) {
    if (class_name) {
        var selector = "." + class_name;
        var result = this.runtime.instance.querySelector(selector);
        result.has_class = function(class_name) {
            if (class_name.replace(/\s/g, '').length == 0) {
                return false;
            }
            return new RegExp(' ' + class_name + ' ').test(' ' + this.className + ' ');
        };
        result.add_class = function(class_name) {
            if (!this.has_class(class_name)) {
                this.className = this.className == '' ? class_name : this.className + ' ' + class_name;
            }
        };
        result.remove_class = function(class_name) {
            if (this.has_class(class_name)) {
                var newClass = ' ' + this.className.replace(/[\t\r\n]/g, '') + ' ';
                while (newClass.indexOf(' ' + class_name + ' ') >= 0) {
                    newClass = newClass.replace(' ' + class_name + ' ', ' ');
                }
                this.className = newClass.replace(/^\s+|\s+$/g, '');
            }
        };
        return result;
    } else {
        return null;
    }
}

/**
 * 构造控件
 */
Duploader.prototype.build_uploader = function() {
    this.runtime.instance = this.create_element(this._class.BASE);
    this.runtime.instance.appendChild(this.create_element([this._class.MASK, this._class.HIDDEN]));
    this.runtime.instance.appendChild(this.build_operation());
    document.body.appendChild(this.runtime.instance);
    setTimeout(this.on_uploader_build.bind(this), 100);
}

/**
 * 构造操作区
 */
Duploader.prototype.build_operation = function() {
    var operation = this.create_element([this._class.OPERATION, this._class.HIDDEN]);
    var title = this.create_element(this._class.TITLE, '请选择需要上传的文件:');
    var file_list = this.create_element([this._class.FILE_LIST, this._class.HIDDEN]);
    var button = this.build_button();
    operation.appendChild(title);
    operation.appendChild(file_list);
    operation.appendChild(button);
    return operation;
}

/**
 * 构造按钮区
 */
Duploader.prototype.build_button = function() {
    var button = this.create_element(this._class.BUTTON);
    button.appendChild(this.create_element([this._class.BUTTON_BASE, this._class.BUTTON_ADD], '添加文件'));
    button.appendChild(this.create_element([this._class.BUTTON_BASE, this._class.BUTTON_UPLOAD], '上  传'));
    button.appendChild(this.create_element([this._class.BUTTON_BASE, this._class.BUTTON_CANCEL], '取  消'));
    this.runtime._id = new Date().getTime() + Math.floor(Math.random() * 100);
    this.runtime.selector = document.createElement("input");
    this.runtime.selector.id = "file_" + this.runtime._id;
    this.runtime.selector.type = "file";
    this.runtime.selector.style.display = "none";
    if (this.config.accept_mime) {
        this.runtime.selector.setAttribute("accept", this.config.accept_mime);
    }
    button.appendChild(this.runtime.selector);
    return button;
}

/**
 * 新增文件信息
 * @param  file_info 文件信息
 */
Duploader.prototype.build_file_info = function(file_info) {
    var file_container = this.create_element(this._class.FILE);
    file_container.id = "file_section_" + file_info.id;
    file_container.appendChild(this.build_file_section(file_info));
    file_container.appendChild(this.build_progress_section(file_info));
    this.query_element(this._class.FILE_LIST).appendChild(file_container);
    this.query_element(this._class.FILE_LIST).remove_class(this._class.HIDDEN);
}

Duploader.prototype.build_file_section = function(file_info) {
    var file_section = this.create_element(this._class.FILE_SECTION);
    var file_name = this.create_element(this._class.FILE_INFO, file_info.name + "(" + this.format_size(file_info.size) + ")");
    file_name.id = "file_info_" + file_info.id;
    file_section.appendChild(file_name);
    if (this.config.multiple) {
        var btn_remove = this.create_element(this._class.FILE_REMOVE, '删  除');
        btn_remove.setAttribute("file_id", file_info.id);
        file_section.appendChild(btn_remove);
        var btn_change = this.create_element(this._class.FILE_CHANGE, '修  改');
        btn_change.setAttribute("file_id", file_info.id);
        file_section.appendChild(btn_change);
    }
    file_section.appendChild(this.create_element(this._class.CLEAR));
    return file_section;
}

Duploader.prototype.build_progress_section = function(file_info) {
    var progress_section = this.create_element([this._class.PROGRESS_SECTION, this._class.HIDDEN]);
    progress_section.id = 'progress_section_' + file_info.id;

    var progress_bar = this.create_element(this._class.PROGRESS_BAR);
    var progress_info = this.create_element(this._class.PROGRESS_INFO);
    progress_info.id = 'progress_info_' + file_info.id;
    progress_bar.appendChild(progress_info);
    var progress_text = this.create_element(this._class.PROGRESS_TEXT, '0%');
    progress_text.id = 'progress_text_' + file_info.id;
    progress_section.appendChild(progress_bar);
    progress_section.appendChild(progress_text);
    progress_section.appendChild(this.create_element(this._class.CLEAR));
    return progress_section;
}

/**
 * 修改文件信息
 * @param  file_info 文件信息
 */
Duploader.prototype.change_file_info = function(file_info) {
    var file_info_div = document.getElementById("file_info_" + file_info.id);
    if (file_info_div) {
        file_info_div.innerText = file_info.name;
    }
    this.runtime.selector.setAttribute("file_id", 0);
}

Duploader.prototype.remove_file_info = function(file_info) {
    var file_section = document.getElementById('file_section_' + file_info.id);
    file_section.parentNode.removeChild(file_section);
    if (this.runtime.file_list.length == 0) {
        this.query_element(this._class.FILE_LIST).add_class(this._class.HIDDEN);
    }
}

/**
 * 显示上传进度
 * @param  percent 进度百分比
 */
Duploader.prototype.change_progress_info = function(file_id, percent) {
    this.remove_class(document.getElementById('progress_section_' + file_id), this._class.HIDDEN);
    document.getElementById('progress_info_' + file_id).style.width = percent + "%";
    document.getElementById('progress_text_' + file_id).innerText = percent + "%";
}

/**
 * 播放器DOM创建完毕回调
 */
Duploader.prototype.on_uploader_build = function() {
    //执行ready回调
    this.trigger('ready');
    //注册全局事件
    this.delegate_document_event();
    //注册video事件
    this.delegate_uploader_event();
}

/**
 * 代理注册器
 * @param  class_name 类名
 * @param  event_name 事件名
 * @param  fun        回调函数
 */
Duploader.prototype.delegate = function(class_name, event_name, fun) {
    var root = this.runtime.instance;
    root.addEventListener(event_name, function(event) {
        var target = event.target || event.srcElement;
        var path = [target.className];
        while (target.parentElement && target != root) {
            path.push(target.parentElement.className);
            target = target.parentElement;
        }
        if (class_name) {
            var target = event.target || event.srcElement;
            if (this.index_of(path, class_name)) {
                fun(event);
            };
        } else {
            fun(event);
        }
        return false;
    }.bind(this));
}

/**
 * 注册全局事件
 */
Duploader.prototype.delegate_document_event = function() {

}

/**
 * 注册控件事件
 */
Duploader.prototype.delegate_uploader_event = function() {
    var btn_open = document.getElementById(this.config.btn_open);
    btn_open.addEventListener('click', this.open_uploader.bind(this));
    this.runtime.selector.addEventListener("change", this.file_selected.bind(this));
    this.delegate(this._class.BUTTON_ADD, 'click', this.open_select.bind(this));
    this.delegate(this._class.BUTTON_UPLOAD, 'click', this.upload.bind(this));
    this.delegate(this._class.BUTTON_CANCEL, 'click', this.close_uploader.bind(this));
    this.delegate(this._class.FILE_CHANGE, 'click', this.file_change.bind(this));
    this.delegate(this._class.FILE_REMOVE, 'click', this.file_remove.bind(this));
}

/**
 * 打开上传控件
 * event 事件对象
 */
Duploader.prototype.open_uploader = function(event) {
    this.query_element(this._class.MASK).style.width = document.body.scrollWidth + "px";
    this.query_element(this._class.MASK).style.height = document.body.scrollHeight + "px";
    this.query_element(this._class.OPERATION).style.left = (document.body.scrollWidth - 600) / 2 + "px";
    this.query_element(this._class.OPERATION).style.top = 200 + "px";
    this.query_element(this._class.MASK).remove_class(this._class.HIDDEN);
    this.query_element(this._class.OPERATION).remove_class(this._class.HIDDEN);
}

/**
 * 关闭上传控件
 * event 事件对象
 */
Duploader.prototype.close_uploader = function(event) {
    this.query_element(this._class.FILE_LIST).innerHTML = '';
    this.runtime.uploading = false;
    this.runtime.file_id = null;
    this.runtime.file_list = [];
    this.runtime.upload_count = 0;
    this.runtime.upload_result = [];
    this.query_element(this._class.MASK).add_class(this._class.HIDDEN);
    this.query_element(this._class.OPERATION).add_class(this._class.HIDDEN);
    this.query_element(this._class.FILE_LIST).add_class(this._class.HIDDEN);
}

/**
 * 打开文件选择框
 * @param  event   事件对象
 * @param  file_id 操作的文件标识，如果有此标识则为重新选择文件，如果没有则为新增文件
 */
Duploader.prototype.open_select = function(event, file_id) {
    this.debug("event open_select");
    if (this.runtime.uploading) {
        this.alert('文件已经在上传了');
        return false;
    }
    if (file_id) {
        this.runtime.selector.setAttribute("file_id", file_id);
    }
    this.runtime.selector.value = '';
    this.runtime.selector.dispatchEvent(new Event("click"));
}

/**
 * 切换文件按钮事件
 * @param  event 事件对象
 */
Duploader.prototype.file_change = function(event) {
    var btn_file_change = event.target || event.srcElement;
    var file_id = btn_file_change.getAttribute("file_id");
    if (!file_id) {
        this.error('file_id异常');
    } else {
        this.open_select(event, file_id);
    }
}

/**
 * 删除文件按钮事件
 * @param  event 事件对象
 */
Duploader.prototype.file_remove = function(event) {
    var btn_file_remove = event.target || event.srcElement;
    var file_id = btn_file_remove.getAttribute("file_id");
    if (!file_id) {
        this.error('file_id异常');
    } else {
        this.file_removed(file_id);
    }
}

/**
 * 开始上传
 * event 事件对象
 */
Duploader.prototype.upload = function(event) {
    if (this.runtime.uploading) {
        this.alert('文件已经在上传了');
        return false;
    }
    if (this.runtime.file_list.length > 0) {
        //文件上传锁
        this.runtime.uploading = true;
        if (this.config.upload_type == "websocket" && !this.runtime.socket) {
            this.websocket_init(function() {
                this.file_upload(0);
            }.bind(this));
        } else {
            this.file_upload(0);
        }
    } else {
        this.alert("请先选择需要上传文件 ！");
    }
}

/**
 * 文件整体上传
 * @param  file_index  文件列表索引
 */
Duploader.prototype.file_whole_upload = function(file_index) {
    var file_info = this.runtime.file_list[file_index]; //文件信息
    var reader = new window.FileReader();
    reader.readAsDataURL(file_info);
    reader.onloadend = function() {
        var base64data_begin_index = reader.result.lastIndexOf(',') + 1;
        this.file_send({
            file_index: file_index,
            name: file_info.name,
            size: file_info.size,
            start: 0,
            end: file_info.size,
            index: 0,
            total: 1,
            data: reader.result.substr(base64data_begin_index)
        });
    }.bind(this);
};

/**
 * 文件切片上传
 * @param  file_index  文件列表索引
 * @param  slice_count 切片总数
 * @param  index       切片索引
 */
Duploader.prototype.file_slice_upload = function(file_index, slice_count, index) {
    if ((index + 1) > slice_count) {
        console.error('文件分片分片错误!');
        return;
    }
    var file_info = this.runtime.file_list[file_index]; //文件信息
    var index = index ? index : 0; //分片索引
    var start = index * this.config.chunk_size; //开始位置
    var end = Math.min(file_info.size, start + this.config.chunk_size); //结束位置
    var reader = new window.FileReader();
    reader.readAsDataURL(file_info.slice(start, end));
    reader.onloadend = function() {
        var base64data_begin_index = reader.result.lastIndexOf(',') + 1;
        this.file_send({
            file_index: file_index,
            name: file_info.name,
            size: file_info.size,
            start: start,
            end: end,
            index: index,
            total: slice_count,
            data: reader.result.substr(base64data_begin_index)
        });
    }.bind(this);
}

/**
 * 发送文件数据
 * @param  data 上传数据
 */
Duploader.prototype.file_send = function(data) {
    if(this.config.chunk){
        var file_info = this.runtime.file_list[data.file_index];
        var num = parseFloat(data.index + 1);
        var total = parseFloat(data.total);
    }
    //显示上传进度
    this.change_progress_info(file_info.id, this.format_percent(num, total));
    if (this.config.upload_type == "websocket" && this.runtime.socket) {
        this.websocket_send(data);
    } else {
        this.post_send(data);
    }
}

/**
 * 检测文件后缀名是否符合规范
 * @param  file_info 文件信息
 */
Duploader.prototype.check_file_extend = function(file_info) {
    if (this.config.extend_limited && this.config.extend_limited.length > 0) {
        var file_name = file_info.name;
        var extend = file_name.substring(file_name.lastIndexOf(".") + 1);
        var is_ok = false;
        var extend_limited_info = '';
        for (var i = 0; i < this.config.extend_limited.length; i++) {
            extend_limited_info += extend_limited_info ? "," + this.config.extend_limited[i] : this.config.extend_limited[i];
            if (extend == this.config.extend_limited[i]) {
                is_ok = true;
            }
        }
        if (!is_ok) {
            this.alert('文件类型不符合要求,后缀名只能为：' + extend_limited_info);
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

/**
 * 检测文件大小是否符合规范
 * @param  file_info 文件信息
 */
Duploader.prototype.check_file_size = function(file_info) {
    if (this.config.size_limited && this.config.size_limited > 0) {
        var file_size = file_info.size;
        if (file_size > this.config.size_limited) {
            this.alert('文件大小不符合要求,最大只能为：' + this.format_size(this.config.size_limited));
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

/**
 * 获取文件上传断点
 * @param  file_info 文件信息
 */
Duploader.prototype.get_file_broken_point = function(file_info) {
    if (this.config.chunk && this.config.resume_broken) {
        if (window.localStorage) {
            //尝试从localStorage中读取进度
            var key = window.btoa(escape(file_info.name) + "|" + file_info.size);
            var uploaded_data = localStorage.getItem(key);
            if (uploaded_data) {
                this.debug(uploaded_data);
                var data = JSON.parse(uploaded_data);
                return data.index + 1;
            } else {
                return 0;
            }
        }
    } else {
        return 0;
    }
}

/**
 * 记录已经上传完成信息
 * @param  data 上传完成数据
 */
Duploader.prototype.record_file_broken_point = function(data) {
    if (this.config.chunk && this.config.resume_broken) {
        if (window.localStorage) {
            if (window.localStorage) {
                var key = window.btoa(escape(data.name) + "|" + data.size);
                localStorage.setItem(key, JSON.stringify(data));
            }
        }
    }
}

/**
 * 删除断点记录 
 * @param  data 上传完成数据
 */
Duploader.prototype.remove_file_broken_point = function(data) {
    if (this.config.chunk && this.config.resume_broken) {
        if (window.localStorage) {
            if (window.localStorage) {
                var key = window.btoa(escape(data.name) + "|" + data.size);
                localStorage.removeItem(key);
            }
        }
    }
}

/**
 * 创建websocket链接
 */
Duploader.prototype.websocket_init = function(callback) {
    if (this.runtime.socket) {
        return;
    }

    this.runtime.socket = new WebSocket(this.config.upload_url);

    this.runtime.socket.onopen = function(event) {
        this.debug('websocket open');
        callback();
    }.bind(this);

    this.runtime.socket.onmessage = function(event) {
        this.debug('websocket recive data');
        this.websocket_message(event.data);
    }.bind(this);

    this.runtime.socket.onclose = function(event) {
        this.debug("websocket close");
    }.bind(this);

    this.runtime.socket.onerror = function(event) {
        this.error("websocket error");
    }.bind(this);
}

/**
 * 关闭websocket链接
 */
Duploader.prototype.websocket_close = function() {
    if (this.runtime.socket) {
        this.runtime.socket.close();
    } else {
        this.debug("websocket no init");
    }
}

/**
 * 发送websocket数据
 * @param  data 向服务器端提交的数据
 */
Duploader.prototype.websocket_send = function(data) {
    this.debug(data);
    if (this.runtime.socket && this.runtime.socket.readyState != this.runtime.socket.CLOSING && this.runtime.socket.readyState != this.runtime.socket.CLOSED) {
        this.runtime.socket.send(JSON.stringify(data));
    } else {
        this.debug("websocket no init or is close");
    }
}

/**
 * 接收websocket返回数据
 * @param  data 服务器端返回的数据
 */
Duploader.prototype.websocket_message = function(data) {
    this.debug(data);
    this.file_slice_uploaded(JSON.parse(data));
}

/**
 * post方式发送数据
 * @param  data 向服务器端提交的数据
 */
Duploader.prototype.post_send = function(data) {
    this.debug(data);
    var AjaxRequest = new XMLHttpRequest();
    if (!AjaxRequest) {
        this.error("Ajax init faild ");
        return false;
    }　
    AjaxRequest.onreadystatechange = function() {
        switch (AjaxRequest.readyState) {
            case 1:
                this.debug('ajax open ready');
                break;
            case 4:
                if (AjaxRequest.status == 200) {
                    this.debug('ajax recive data');
                    this.post_message(JSON.parse(AjaxRequest.response));
                } else {
                    this.error("ajax error,status:" + AjaxRequest.status);
                }
                break;
        }
    }.bind(this);
    AjaxRequest.error = function() {
        this.error("ajax error");
    }.bind(this);
    var UploadForm = new FormData();
    if (UploadForm) {
        for (var p in data) {
            UploadForm.append(p, data[p]);
        }
        AjaxRequest.open('POST', this.config.upload_url, true);　
        AjaxRequest.send(UploadForm);
    } else {
        this.error("ajax error");
    }
}

/**
 * 接收post方式返回数据
 * @param  data 服务器端返回的数据
 */
Duploader.prototype.post_message = function(data) {
    this.debug(data);
    data.file_index = parseInt(data.file_index);
    data.size = parseInt(data.size);
    data.start = parseInt(data.start);
    data.end = parseInt(data.end);
    data.index = parseInt(data.index);
    data.total = parseInt(data.total);
    this.file_slice_uploaded(data);
}
/**
 * 文件选择回调函数
 * @param  event 事件对象
 */
Duploader.prototype.file_selected = function(event) {
    var file_info = this.runtime.selector.files[0];
    if (!file_info) {
        this.error('获取文件信息失败');
        return false;
    }
    //文件后缀名校验
    if (!this.check_file_extend(file_info)) {
        return false;
    }
    //文件大小校验
    if (!this.check_file_size(file_info)) {
        return false;
    }
    //自定义校验
    if (this.on_uploader_select && this.on_uploader_select instanceof Function) {
        if (!this.on_uploader_select(file_info)) {
            return false;
        }
    }
    //尝试获取断点
    file_info.begin_index = this.get_file_broken_point(file_info);
    //根据不同状态调用不同的处理函数
    if (this.config.multiple) {
        if (this.runtime.selector.getAttribute("file_id") && this.runtime.selector.getAttribute("file_id") != 0) {
            file_info.id = this.runtime.selector.getAttribute("file_id");
            this.file_changed(event, file_info);
        } else {
            file_info.id = new Date().getTime();
            this.file_added(event, file_info);
        }
    } else {
        if (this.runtime.file_id) {
            file_info.id = this.runtime.file_id;
            this.file_changed(event, file_info);
        } else {
            file_info.id = new Date().getTime();
            this.file_added(event, file_info);
        }
    }
}

/**
 * 文件添加完成回调函数
 * @param  file_info 文件信息
 */
Duploader.prototype.file_added = function(event, file_info) {
    this.debug("event file_added");
    //添加文件信息到上传队列中
    this.runtime.file_list.push(file_info);
    if (!this.config.multiple) {
        this.runtime.file_id = file_info.id;
    }
    this.build_file_info(file_info);
    this.trigger('file_add', [file_info]);
}

/**
 * 切换文件完成回调函数
 * @param  file_info 文件信息
 */
Duploader.prototype.file_changed = function(event, file_info) {
    this.debug("event file_changed");
    //修改上传队列中文件信息
    if (!this.config.multiple) {
        this.runtime.file_list[0] = file_info;
    } else {
        var file_list_index = null;
        for (var i = 0; i < this.runtime.file_list.length; i++) {
            if (this.runtime.file_list[i].id == file_info.id) {
                this.runtime.file_list[i] = file_info;
                file_list_index = i;
                break;
            }
        }
    }
    this.change_file_info(file_info);
    this.trigger('file_change', [file_info]);
}

/**
 * 删除文件回调函数
 * @param  file_id 文件ID
 */
Duploader.prototype.file_removed = function(file_id) {
    this.debug("event file_removed");
    var file_info = null;
    var file_list_index = null;
    var new_file_list = [];
    for (var i = 0; i < this.runtime.file_list.length; i++) {
        if (this.runtime.file_list[i].id == file_id) {
            file_info = this.runtime.file_list[i];
            file_list_index = i;
        } else {
            new_file_list.push(this.runtime.file_list[i]);
        }
    }
    this.runtime.file_list = new_file_list;
    this.remove_file_info(file_info);
    this.trigger('file_remove', [file_info]);
}

/**
 * 上传文件
 * @param  file_index 文件列表索引
 */
Duploader.prototype.file_upload = function(file_index) {
    this.debug("event file_upload");
    if (this.config.chunk) {
        //即将上传的文件信息
        var file_info = this.runtime.file_list[file_index];
        //切片总数
        var slice_count = Math.ceil(file_info.size / this.config.chunk_size);
        //切片索引
        var begin_index = file_info.begin_index ? file_info.begin_index : 0;
        this.file_slice_upload(file_index, slice_count, file_info.begin_index);
    } else {
        this.file_whole_upload(file_index);
    }
    this.trigger('upload_begin', [file_info]);
}

/**
 * 文件切片上传完成回调
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
Duploader.prototype.file_slice_uploaded = function(data) {
    this.debug("event file_slice_uploaded");
    if (data.result != 1) {
        this.alert('上传过程出现错误！');
        return;
    }
    if ((data.index + 1) == data.total) {
        //单个文件上传完毕回调
        this.file_uploaded(data);
    } else {

        //记录已经上传完成信息
        this.record_file_broken_point(data);

        //开始下一个分片上传
        this.file_slice_upload(data.file_index, data.total, data.index + 1);
    }
    if (this.config.on_file_slice_finish && this.config.on_file_slice_finish instanceof Function) {
        this.config.on_file_slice_finish(this, data);
    }
}

/**
 * 单个文件上传完毕回调
 * @param  data  服务器端返回数据
 */
Duploader.prototype.file_uploaded = function(data) {
    this.debug("event file_uploaded");
    //上传计数
    this.runtime.upload_count += 1;

    //上传结果
    var upload_result = {
        'file_index': data.file_index,
        'file_name': data.name,
        'file_path': data.real_url
    }

    //记录上传内容
    this.runtime.upload_result.push(upload_result);

    //清空断点记录
    this.remove_file_broken_point(data);

    //执行单个文件上传完毕通知回调
    this.trigger('upload_finish', [upload_result]);

    if (this.runtime.upload_count < this.runtime.file_list.length) {
        //开始上传下一个文件
        this.file_upload(this.runtime.upload_count);
    } else {
        //全部上传完毕回调
        this.file_list_uploaded();
    }
}

/**
 * 全部文件上传完毕回调
 */
Duploader.prototype.file_list_uploaded = function() {
    this.debug("event file_list_uploaded");
    if (this.config.multiple) {
        this.trigger('result', [this.runtime.upload_result]);
    } else {
        this.trigger('result', [this.runtime.upload_result[0]]);
    }
    //关闭弹层
    this.close_uploader();
}
