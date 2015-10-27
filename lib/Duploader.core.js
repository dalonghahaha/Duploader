/**
 * Duploadr - Smart File Uploader
 * v1.0.0
 *
 * Date: 2015-10-15
 */

//构造函数
function Duploader(config) {
    this.config = $.extend(this.config, config);
    if (!this.config.upload_url || !this.config.btn_add || !this.config.btn_upload) {
        this.error('参数配置错误：upload_url、btn_add、btn_upload不能为空');
        return;
    }
    if (!$("#" + this.config.btn_add).length) {
        this.error('参数配置错误：btn_add参数配置ID有误，未能找到相应的DOM节点');
        return;
    }
    if (!$("#" + this.config.btn_upload).length) {
        this.error('参数配置错误：btn_upload参数配置ID有误，未能找到相应的DOM节点');
        return;
    }
    //调用构造函数
    this.init();
}

/**
 * 配置文件
 * multiple：是否同时上传多个文件
 * onlyimage：是否只支持上传图片
 * preview：是否支持预览功能
 * debug：是否开启调试
 * chunk：是否采用分片
 * chunk_size：分片大小
 * btn_add：添加文件按钮ID
 * btn_upload：上传文件按钮ID
 * upload_url：提交路径
 * upload_type: 上传类别——post or websocket
 */
Duploader.prototype.config = {
    multiple: false,
    onlyimage: false,
    preview: false,
    debug: false,
    chunk: false,
    chunk_size: 2 * 1024 * 1024,
    btn_add: null,
    btn_upload: null,
    upload_url: null,
    upload_type: "websocket"
}

/**
 * 运行时变量
 * _id：唯一标识
 * socket：socket长连接
 * btn_add：添加按钮
 * btn_upload：上传按钮
 * selector：input file 载体
 * file_list：需要上传的文件列表
 * upload_count：上传成功计数
 */
Duploader.prototype.runtime = {
    _id: 0,
    socket: null,
    btn_add: null,
    btn_upload: null,
    selector: null,
    file_list: [],
    upload_count: 0
}

/**
 * 调试函数
 * @param  info [调试信息]
 */
Duploader.prototype.debug = function(info){
    if(this.config.debug){
        console.log(info);
    }
}

/**
 * 输出错误信息
 * @param  {[type]} info [description]
 * @return {[type]}      [description]
 */
Duploader.prototype.error = function(info){
    console.error(info);
}

/**
 * 初始化构造函数,给主要按钮绑定click事件
 */
Duploader.prototype.init = function(){
    this.runtime.btn_add = $("#" + this.config.btn_add);
    this.runtime.btn_upload = $("#" + this.config.btn_upload);
    this.runtime._id = new Date().getTime();
    var file_id = "file_" + this.runtime._id;
    var selector = $("<input>").attr("type", "file").attr("id", file_id).attr("file_id", 0).css("display", "none");
    this.runtime.btn_add.after(selector);
    this.runtime.selector = $("#" + file_id);

    this.runtime.btn_add.on("click", this.open_select.bind(this));
    this.runtime.btn_upload.on("click", this.upload.bind(this));
    this.runtime.selector.on("change", this.file_selected.bind(this));   
}

/**
 * 打开文件选择框
 * @param  event   事件对象
 * @param  file_id 操作的文件标识，如果有此标识则为重新选择文件，如果没有则为新增文件
 */
Duploader.prototype.open_select = function(event, file_id){
    this.debug("open_select");
    if (file_id) {
        this.runtime.selector.attr("file_id", file_id);
    }
    this.runtime.selector.trigger("click");
}

/**
 * 文件选择回调函数
 * @param  event 事件对象
 */
Duploader.prototype.file_selected = function(event) {
    if (this.runtime.selector.attr("file_id") != 0) {
        var file_info = this.runtime.selector.get(0).files[0];
        if (file_info) {
            file_info.id = this.runtime.selector.attr("file_id");
            this.file_changed(file_info);
        }
    } else {
        var file_info = this.runtime.selector.get(0).files[0];
        file_info.id = new Date().getTime();
        this.file_added(file_info);
    }
}


var Duploadr = {
    config: {
        multiple: true,
        onlyimage: false,
        imagepreview: true,
        debug: true,
        chunk: true,
        chunk_size: 2 * 1024 * 1024,
        btn_add: "file_select",
        btn_upload: "file_upload",
        upload_url: null,
        upload_type: "websocket"
    },
    runtime: {
        _id: 0,
        socket: null,
        btn_add: null,
        btn_upload: null,
        selector: null,
        file_list: [],
        upload_count: 0
    },
    debug: function(info) {
        if (this.config.debug) {
            console.log(info);
        }
    },
    init: function(_config) {
        this.config = $.extend(this.config, _config);
        if (!this.config.upload_url) {
            console.error('参数配置错误：upload_url参数不能为空');
            return;
        }
        this.runtime.btn_add = $("#" + this.config.btn_add);
        this.runtime.btn_upload = $("#" + this.config.btn_upload);
        this.runtime._id = new Date().getTime();
        var file_id = "file_" + this.runtime._id;
        var selector = $("<input>").attr("type", "file").attr("id", file_id).attr("file_id", 0).css("display", "none");
        this.runtime.btn_add.after(selector);
        this.runtime.selector = $("#" + file_id);
        if (this.runtime.btn_add.length > 0) {
            this.runtime.btn_add.on("click", this.open_select.bind(this));
        } else {
            console.error('参数配置错误：btn_add参数配置ID有误');
            return;
        }
        if (this.runtime.btn_upload.length > 0) {
            this.runtime.btn_upload.on("click", this.upload.bind(this));
        } else {
            console.error('参数配置错误：btn_upload参数配置ID有误');
            return;
        }
        this.runtime.selector.on("change", this.file_selected.bind(this));

        return this;
    },
    upload: function() {
        if (Duploadr.config.upload_type == "websocket" && !Duploadr.runtime.socket) {
            Duploadr.websocket_open();
        }
        if (Duploadr.runtime.file_list.length > 0) {
            //逐个开始上传文件
            Duploadr.file_upload(0);
        } else {
            alert("请先选择需要上传文件 ！");
        }
    },
    open_select: function(event, file_id) {
        this.debug("open_select");
        if (file_id) {
            this.runtime.selector.attr("file_id", file_id);
        }
        this.runtime.selector.trigger("click");
    },
    file_selected: function(event) {
        if (this.runtime.selector.attr("file_id") != 0) {
            var file_info = this.runtime.selector.get(0).files[0];
            if (file_info) {
                file_info.id = this.runtime.selector.attr("file_id");
                this.file_changed(file_info);
            }
        } else {
            var file_info = this.runtime.selector.get(0).files[0];
            file_info.id = new Date().getTime();
            this.file_add(file_info);
        }
    },
    file_add: function(file_info) {
        this.debug("file_added");

        if (localStorage) {

            //尝试从localStorage中读取进度
            var key = window.btoa(file_info.name + "|" + file_info.size);
            var uploaded_data = localStorage.getItem(key);
            if (uploaded_data) {
                this.debug(uploaded_data);
                var data = JSON.parse(uploaded_data);
                file_info.begin_index = data.index + 1;
            }

        }
        this.runtime.file_list.push(file_info);
        if (this.config.on_file_add && this.config.on_file_add instanceof Function) {
            this.config.on_file_add(this, file_info);
        } else {
            this.file_add_show(file_info);
        }
    },
    file_add_show: function(file_info) {
        var span_file_info = $("<span>").attr("id", "file_info_" + file_info.id).text(file_info.name);
        var btn_change = $("<input>").attr("type", "button").attr("value", "修改").attr("file_id", file_info.id).attr("id", "file_change_" + file_info.id).css("margin-left", "10px");
        var btn_delete = $("<input>").attr("type", "button").attr("value", "删除").attr("file_id", file_info.id).attr("id", "file_delete_" + file_info.id).css("margin-left", "10px");
        var section_file_operation = $("<p>").attr("id", "file_section_" + file_info.id).append(span_file_info).append(btn_change).append(btn_delete);
        $("#file_list").append(section_file_operation);
        $("#file_change_" + file_info.id).on("click", this.file_change.bind(this));
        $("#file_delete_" + file_info.id).on("click", this.file_remove.bind(this));
    },
    file_change: function(event) {
        var file_id = $(event.currentTarget).attr("file_id");
        this.open_select(event, file_id);
    },
    file_changed: function(file_info) {
        this.debug("file_changed");
        $("#file_info_" + file_info.id).text(file_info.name);
        var file_list_index = null;
        for (var i = 0; i < this.runtime.file_list.length; i++) {
            if (this.runtime.file_list[i].id == file_info.id) {
                this.runtime.file_list[i] = file_info;
                file_list_index = i;
                break;
            }
        }
        this.runtime.selector.attr("file_id", 0);
        if (this.config.on_file_change && this.config.on_file_change instanceof Function) {
            this.config.on_file_change(file_info, file_list_index);
        }
    },
    file_remove: function(event) {
        var file_id = $(event.currentTarget).attr("file_id");
        this.debug("file_deleted");
        $("#file_section_" + file_id).remove();
        var file_info = null;
        var file_list_index = null;
        for (var i = 0; i < this.runtime.file_list.length; i++) {
            if (this.runtime.file_list[i].id == file_id) {
                file_info = this.runtime.file_list[i];
                file_list_index = i;
                break;
            }
        }
        console.log(this.runtime.file_list);
        console.log(file_list_index);
        var new_file_list = this.runtime.file_list.slice(0, file_list_index - 1).concat(this.runtime.file_list.slice(file_list_index));
        this.runtime.file_list = new_file_list;
        console.log(this.runtime.file_list);
        if (this.config.on_file_remove && this.config.on_file_remove instanceof Function) {
            this.config.on_file_remove(file_info, file_list_index);
        }
    },
    file_upload: function(index) {
        if (this.config.chunk) {
            var file_info = this.runtime.file_list[index];
            var slice_count = Math.ceil(file_info.size / this.config.chunk_size); //总片数
            if (file_info.begin_index) {
                this.file_slice_upload(index, slice_count, file_info.begin_index);
            } else {
                this.file_slice_upload(index, slice_count);
            }
            if (this.config.on_file_uploading && this.config.on_file_uploading instanceof Function) {
                this.config.on_file_uploading(this, file_info);
            }
        }
    },
    file_uploaded: function(data) {
        //上传计数
        this.runtime.upload_count += 1;

        //清空localStorage
        if (localStorage) {
            var key = window.btoa(data.name + "|" + data.size);
            localStorage.removeItem(key);
        }

        if (this.runtime.upload_count < this.runtime.file_list.length) {

            //开始上传下一个文件
            this.file_upload(this.runtime.upload_count);
        } else {
            //全部上传完毕回调
            this.file_list_finish();
        }
        if (this.config.on_file_upload_finish && this.config.on_file_upload_finish instanceof Function) {
            this.config.on_file_upload_finish(this.runtime.upload_count);
        }
    },
    file_list_finish: function() {
        this.debug("file upload finish");
        if (this.config.on_file_list_upload_finish && this.config.on_file_list_upload_finish instanceof Function) {
            this.config.on_file_list_upload_finish();
        } else {
            alert('上传完毕');
        }
    },
    file_slice_upload: function(file_index, slice_count, index) {
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
    },
    file_slice_uploaded: function(data) {
        if (data.result != 1) {
            alert('上传过程出现错误！');
            return;
        }
        if (this.config.on_file_slice_finish && this.config.on_file_slice_finish instanceof Function) {
            this.config.on_file_slice_finish(this, data);
        }
        if ((data.index + 1) == data.total) {
            //单个文件上传完毕回调
            this.file_uploaded(data);
        } else {

            //localStorage,辅助断点续传
            if (localStorage) {
                var key = window.btoa(data.name + "|" + data.size);
                localStorage.setItem(key, JSON.stringify(data));
            }

            //开始下一个分片上传
            this.file_slice_upload(data.file_index, data.total, data.index + 1);
        }
    },
    file_send: function(data) {
        if (Duploadr.config.upload_type == "websocket" && !Duploadr.runtime.socket) {
            this.websocket_send(data);
        } else {
            this.post_send(data);
        }
    },
    websocket_open: function() {
        if (this.runtime.socket) {
            return;
        }

        this.runtime.socket = new WebSocket(this.config.upload_url);

        this.runtime.socket.onopen = function(event) {
            this.debug('websocket 打开成功');
        }.bind(this);

        this.runtime.socket.onmessage = function(event) {
            this.debug('websocket 收到服务器端数据');
            this.websocket_message(event.data);
        }.bind(this);

        this.runtime.socket.onclose = function(event) {
            this.debug("websocket 连接关闭");
        }.bind(this);

        this.runtime.socket.onerror = function(event) {
            this.debug("websocket 出现错误");
        }.bind(this);
    },
    websocket_close: function() {
        if (this.runtime.socket) {
            this.runtime.socket.close();
        } else {
            this.debug("websocket 未创建");
        }
    },
    websocket_send: function(data) {
        this.debug(data);
        if (this.runtime.socket && this.runtime.socket.readyState != this.runtime.socket.CLOSING && this.runtime.socket.readyState != this.runtime.socket.CLOSED) {
            this.runtime.socket.send(JSON.stringify(data));
        } else {
            this.debug("websocket 未创建或者已经关闭");
        }
    },
    websocket_message: function(data) {
        this.debug(data);
        this.file_slice_uploaded(JSON.parse(data));
    },
    post_send: function(data) {
        $.ajax({
            type: "post",
            dataType: "json",
            data: data,
            url: this.config.upload_url,
            success: function(data) {
                this.post_message(data);
            }.bind(this),
            error: function() {
                this.debug('')
            }.bind(this)
        });
    },
    post_message: function(data) {
        data.file_index = parseInt(data.file_index);
        data.size = parseInt(data.size);
        data.start = parseInt(data.start);
        data.end = parseInt(data.end);
        data.index = parseInt(data.index);
        data.total = parseInt(data.total);
        this.file_slice_uploaded(data);
    }
}
