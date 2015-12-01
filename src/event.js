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
    this.trigger('file_add',[file_info]);
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
    this.trigger('file_change',[file_info]);
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
    this.trigger('file_remove',[file_info]);
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
    this.trigger('upload_begin',[file_info]);
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
    this.trigger('upload_finish',[upload_result]);

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
        this.trigger('result',[this.runtime.upload_result]);
    } else {
        this.trigger('result',[this.runtime.upload_result[0]]);
    }
    //关闭弹层
    this.close_uploader();
}
