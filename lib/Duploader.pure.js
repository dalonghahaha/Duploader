/**
 * Duploader - Smart File Uploader
 *
 * Version - 1.0.0
 *
 * Copyright 2015,Dengjialong
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

/**
 * 构造函数
 * @param  config 配置项
 */
function Duploader(config) {

    //初始化配置
    this.config = this.build_config(config);

    //检查配置项是否正确
    if (this.check_config()) {

        //运行时数据
        this.runtime = this.build_runtime();

        //初始化控件
        this.init();
    }
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
        //选择文件按钮ID
        btn_add: null,
        //上传按钮ID
        btn_upload: null,
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
    return _config;
}

/**
 * 初始化运行时数据
 * @return {[type]} [description]
 */
Duploader.prototype.build_runtime = function() {
    var runtime = {
        //uoloader标识
        _id: 0,
        //websocket链接
        socket: null,
        //选择文件按钮
        btn_add: null,
        //上传按钮
        btn_upload: null,
        //选择文件控件
        selector: null,
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

    return runtime;
}

/**
 * 配置文件校验函数
 */
Duploader.prototype.check_config = function() {
    if (!this.config.upload_url || !this.config.btn_add || !this.config.btn_upload) {
        this.error('参数配置错误：upload_url、btn_add、btn_upload不能为空');
        return false;
    }

    if (!document.getElementById(this.config.btn_add)) {
        this.error('参数配置错误：btn_add参数配置ID有误，未能找到相应的DOM节点');
        return false;
    }

    if (!document.getElementById(this.config.btn_upload)) {
        this.error('参数配置错误：btn_upload参数配置ID有误，未能找到相应的DOM节点');
        return false;
    }

    if (this.config.multiple) {
        if (!this.config.on_file_add || !this.config.on_file_add instanceof Function) {
            this.error('参数配置错误：multiple上传模式时必须实现on_file_add函数');
            return false;
        }
        if (!this.config.on_file_change || !this.config.on_file_change instanceof Function) {
            this.error('参数配置错误：multiple上传模式时必须实现on_file_change函数');
            return false;
        }
        if (!this.config.on_file_remove || !this.config.on_file_remove instanceof Function) {
            this.error('参数配置错误：multiple上传模式时必须实现on_file_remove函数');
            return false;
        }
    }
    return true;
}

/**
 * 调试函数
 * @param  info [调试信息]
 */
Duploader.prototype.debug = function(info) {
    if (this.config.debug) {
        if (info instanceof Object) {
            console.log("Duploader【%s】:%o", this.runtime._id, info);
        } else {
            console.log("Duploader【%s】:%s", this.runtime._id, info);
        }
    }
}

/**
 * 输出错误信息
 * @param info [错误信息]
 */
Duploader.prototype.error = function(info) {
    if(this.runtime){
        if (info instanceof Object) {
            console.error("Duploader【%s】:%o", this.runtime._id, info);
        } else {
            console.error("Duploader【%s】:%s", this.runtime._id, info);
        }
    } else {
        console.error(info);
    }
    if (this.config.on_error && this.config.on_error instanceof Function) {
        this.config.on_error(info);
    }
}

/**
 * 输出警告信息
 * @param  info [警告信息]
 */
Duploader.prototype.alert = function(info) {
    if (info instanceof Object) {
        console.warn("Duploader【%s】:%o", this.runtime._id, info);
    } else {
        console.warn("Duploader【%s】:%s", this.runtime._id, info);
    }
    if (this.config.on_error && this.config.on_error instanceof Function) {
        this.config.on_error(info);
    } else {
        alert(info);
    }
}

/**
 * 初始化构造函数,给主要按钮绑定click事件
 */
Duploader.prototype.init = function() {
    this.runtime.btn_add = document.getElementById(this.config.btn_add);
    this.runtime.btn_upload = document.getElementById(this.config.btn_upload);
    this.runtime._id = new Date().getTime() + Math.floor(Math.random() * 100);
    var selector = document.createElement("input");
    selector.id = "file_" + this.runtime._id;
    selector.type = "file";
    selector.style.display = "none";
    if (this.config.accept_mime) {
        selector.setAttribute("accept", this.config.accept_mime);
    }
    this.runtime.btn_add.parentNode.insertBefore(selector, this.runtime.btn_add);
    this.runtime.selector = document.getElementById("file_" + this.runtime._id);
    this.runtime.btn_add.addEventListener("click", this.open_select.bind(this));
    this.runtime.btn_upload.addEventListener("click", this.upload.bind(this));
    this.runtime.selector.addEventListener("change", this.file_selected.bind(this));
}

/**
 * 打开文件选择框
 * @param  event   事件对象
 * @param  file_id 操作的文件标识，如果有此标识则为重新选择文件，如果没有则为新增文件
 */
Duploader.prototype.open_select = function(event, file_id) {
    this.debug("open_select");
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
    if (this.config.on_file_selected && this.config.on_file_selected instanceof Function) {
        if (!this.config.on_file_selected(file_info)) {
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
    this.debug("file_added");
    //添加文件信息到上传队列中
    this.runtime.file_list.push(file_info);
    if (!this.config.multiple) {
        this.runtime.file_id = file_info.id;
    }
    if (this.config.on_file_add && this.config.on_file_add instanceof Function) {
        this.config.on_file_add(this, file_info);
    } else {
        this.file_added_show(file_info);
    }
}

/**
 * 显示新增的文件信息(考虑保留)
 * @param  file_info 文件信息
 */
Duploader.prototype.file_added_show = function(file_info) {
    var file_info_span = document.createElement("span");
    file_info_span.id = "file_info_" + file_info.id;
    file_info_span.innerText = file_info.name;
    this.runtime.btn_add.parentNode.insertBefore(file_info_span, this.runtime.btn_add);
}

/**
 * 切换文件按钮事件
 * @param  event 事件对象
 */
Duploader.prototype.file_change = function(event) {
    var btn_file_change = event.currentTarget;
    var file_id = btn_file_change.getAttribute("file_id");
    if (!file_id) {
        this.error('file_id异常');
    } else {
        this.open_select(event, file_id);
    }
}

/**
 * 切换文件完成回调函数
 * @param  file_info 文件信息
 */
Duploader.prototype.file_changed = function(event, file_info) {
    this.debug("file_changed");
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
    this.runtime.selector.setAttribute("file_id", 0);
    if (this.config.on_file_change && this.config.on_file_change instanceof Function) {
        this.config.on_file_change(this, file_info, file_list_index);
    } else {
        this.file_changed_show(file_info);
    }
}

/**
 * 显示替换的文件信息(考虑保留)
 * @param  file_info 文件信息
 */
Duploader.prototype.file_changed_show = function(file_info) {
    var file_info_span = document.getElementById("file_info_" + file_info.id);
    if (file_info_span) {
        file_info_span.innerText = file_info.name;
    }
}

/**
 * 删除文件按钮事件
 * @param  event 事件对象
 */
Duploader.prototype.file_remove = function(event) {
    var btn_file_remove = event.currentTarget;
    var file_id = btn_file_remove.getAttribute("file_id");
    if (!file_id) {
        this.error('file_id异常');
    } else {
        this.file_removed(file_id);
    }
}

/**
 * 删除文件回调函数
 * @param  file_id 文件ID
 */
Duploader.prototype.file_removed = function(file_id) {
    this.debug("file_removed");
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
    if (this.config.on_file_remove && this.config.on_file_remove instanceof Function) {
        this.config.on_file_remove(this, file_info, file_list_index);
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
        this.debug('upload begin');
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
 * 上传文件
 * @param  file_index 文件列表索引
 */
Duploader.prototype.file_upload = function(file_index) {
    if (this.config.chunk) {
        var file_info = this.runtime.file_list[file_index];
        var slice_count = Math.ceil(file_info.size / this.config.chunk_size); //总片数
        if (file_info.begin_index) {
            this.file_slice_upload(file_index, slice_count, file_info.begin_index);
        } else {
            this.file_slice_upload(file_index, slice_count);
        }
    } else {
        this.file_whole_upload(file_index);
    }
    if (this.config.on_upload_begin && this.config.on_upload_begin instanceof Function) {
        this.config.on_upload_begin(this, file_info);
    }
}

/**
 * 单个文件上传完毕回调
 * @param  data  服务器端返回数据
 */
Duploader.prototype.file_uploaded = function(data) {

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
    if (this.config.on_file_upload_finish && this.config.on_file_upload_finish instanceof Function) {
        this.config.on_file_upload_finish(this.runtime.upload_count, upload_result);
    }

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
    this.debug("file upload finish");
    this.runtime.uploading = false;
    if (this.config.on_upload_finish && this.config.on_upload_finish instanceof Function) {
        if (this.config.multiple) {
            this.config.on_upload_finish(this.runtime.upload_result);
        } else {
            this.config.on_upload_finish(this.runtime.upload_result[0]);
        }
    } else {
        this.alert('上传完毕');
    }
    this.runtime.file_list = [];
    this.runtime.upload_count = 0;
    this.runtime.upload_result = [];
    if (!this.config.multiple) {
        var file_info_span = document.getElementById("file_info_" + this.runtime.file_id);
        if (file_info_span) {
            file_info_span.parentNode.removeChild(file_info_span);
        }
        this.runtime.file_id = null;
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
 * 文件切片上传完成回调
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
Duploader.prototype.file_slice_uploaded = function(data) {
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
 * 发送文件数据
 * @param  data 上传数据
 */
Duploader.prototype.file_send = function(data) {
    if (this.config.upload_type == "websocket" && this.runtime.socket) {
        this.websocket_send(data);
    } else {
        this.post_send(data);
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
        this.debug('websocket 打开成功');
        callback();
    }.bind(this);

    this.runtime.socket.onmessage = function(event) {
        this.debug('websocket 收到服务器端数据');
        this.websocket_message(event.data);
    }.bind(this);

    this.runtime.socket.onclose = function(event) {
        this.debug("websocket 连接关闭");
    }.bind(this);

    this.runtime.socket.onerror = function(event) {
        this.error("websocket 出现错误");
    }.bind(this);
}

/**
 * 关闭websocket链接
 */
Duploader.prototype.websocket_close = function() {
    if (this.runtime.socket) {
        this.runtime.socket.close();
    } else {
        this.debug("websocket 未创建");
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
        this.debug("websocket 未创建或者已经关闭");
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
        this.error("Ajax请求初始化失败!");
        return false;
    }　
    AjaxRequest.onreadystatechange = function() {
        switch (AjaxRequest.readyState) {
            case 1:
                this.debug('ajax打开，准备上传');
                break;
            case 4:
                if (AjaxRequest.status == 200) {
                    this.debug('ajax 收到服务器端数据');
                    this.post_message(JSON.parse(AjaxRequest.response));
                } else {
                    this.error("上传过程出现错误,状态:" + AjaxRequest.status);
                }
                break;
        }
    }.bind(this);
    AjaxRequest.error = function() {
        this.error("上传过程出现错误");
    }.bind(this);
    var UploadForm = new FormData();
    if (UploadForm) {
        for (var p in data) {
            UploadForm.append(p, data[p]);
        }
        AjaxRequest.open('POST', this.config.upload_url, true);　
        AjaxRequest.send(UploadForm);
    } else {
        this.error("上传过程出现错误");
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
            this.alert('文件大小不符合要求,最大只能为：' + this.get_friendly_size(this.config.size_limited));
            return false;
        } else {
            return true;
        }
    } else {
        return true;
    }
}

/**
 * 字节数友好显示
 * @param  size 字节数
 */
Duploader.prototype.get_friendly_size = function(size) {
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(this.config.size_limited) / Math.log(k));
    return result = (size / Math.pow(k, i)) + ' ' + sizes[i];
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
