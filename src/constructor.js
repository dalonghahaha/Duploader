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
    this.init_config(config);
    //检查配置项是否正确
    if(!this.check_config()){
        return;
    }
    //检查浏览器环境是否支持控件
    if(!this.check_environment()){
        return;
    }
    //初始化运行时数据
    this.init_runtime();
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
Duploader.prototype.init_config = function(config) {
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
Duploader.prototype.init_runtime = function() {
    this.debug("browser:" + this.get_user_agent());
    this.runtime = {
        //浏览器内核
        browser:this.get_user_agent(),
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
    if(!this.config.btn_open){
        this.error('btn_open不能为空','config error');
        return false;
    }
    if(!document.getElementById(this.config.btn_open)){
        this.error('btn_open不存在','config error');
        return false;
    }
    if(!this.config.upload_url){
        this.error('btn_open不能为空','config error');
        return false;
    }
    return true;
}

/**
 * 校验浏览器环境
 */
Duploader.prototype.check_environment = function() {
    if(this.config.upload_type === "websocket" && !window.WebSocket){
        this.error('该浏览器不支持WebSocket','environment error');
        return false;
    }
    if(this.config.upload_type === "post" && !window.XMLHttpRequest){
        this.error('该浏览器不支持XMLHttpRequest','environment error');
        return false;
    }
    if(this.config.upload_type === "post" && !window.FormData){
        this.error('该浏览器不支持FormData','environment error');
        return false;
    }
    if(!window.FileReader){
        this.error('该浏览器不支持FileReader','environment error');
        return false;
    }
    return true;
}

