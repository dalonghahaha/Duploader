/**
 * 对外提供的事件
 */
Duploader.prototype._event = {
    READY: 'ready',
    FILE_SELECT: 'file_select',
    FILE_ADD: 'file_add',
    FILE_CHANGE: 'file_change',
    FILE_REMOVE: 'file_remove',
    UPLOAD_BEGIN: 'upload_begin',
    UPLOAD_SLICE: 'upload_slice',
    UPLOAD_FINISH: 'upload_finish',
    RESULT: 'result',
};

/**
 * 事件注册器
 * @param  event_name 事件名
 * @param  fun        回调函数
 */
Duploader.prototype.on = function(event_name, fun) {
    if (this.value_of(this._event, event_name)) {
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
Duploader.prototype.trigger = function(event_name, arguments) {
    if (!this['on_uploader_' + event_name]) {
        return false;
    }

    if (!this['on_uploader_' + event_name] instanceof Function) {
        return false;
    }
    this.debug("trigger on_uploader_" + event_name);
    return this['on_uploader_' + event_name].apply(this, arguments);
}
