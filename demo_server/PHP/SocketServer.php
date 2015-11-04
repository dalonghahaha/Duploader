<?php

use \Workerman\Worker;
use \Workerman\WebServer;
use \Workerman\Autoloader;

// 自动加载类
require_once __DIR__ . '/Workerman/Autoloader.php';
require_once __DIR__ . '/Config.php';
require_once __DIR__ . '/Log.php';
require_once __DIR__ . '/File.php';

$worker = new Worker('Websocket://0.0.0.0:'.PORT);

$worker->count = 4;

$worker->onWorkerStart = function($worker)
{
    echo "Worker starting...\n";
    $logger = new Logger(LOG_ROOT);
    $logger->debug("Worker starting...");
};


$worker->onWorkerStop = function($worker)
{
    echo "Worker stopping...\n";
    $logger = new Logger(LOG_ROOT);
    $logger->debug("Worker stopping...");
};


$worker->onClose = function($connection)
{
    echo "connection closed\n";
    $logger = new Logger(LOG_ROOT);
    $logger->debug("Worker closed");
};

$worker->onError = function($connection, $code, $msg)
{
    echo "error $code $msg\n";
    $logger = new Logger(LOG_ROOT);
    $logger->error("【$code】$msg");
};

$worker->onMessage = function($connection, $data)
{
    try {

        $file = new file();
        $logger = new Logger(LOG_ROOT);

        //解析上传数据
        $info =json_decode($data);

        //base64解码
        $content = base64_decode($info->data);

        $logger->info("接受到文件【".$info->name."】分片【".$info->index."】");

        //临时分片文件名
        $temp_name = $info->name.".part".$info->index;

        //写入临时文件
        $file->writeFile(UPLOAD_TEMP_ROOT.$temp_name,$content);

        if($info->index + 1 == $info->total){

            $logger->info("合并文件【".$info->name."】开始");

            //合并文件
            if($file->mergeFile(UPLOAD_TEMP_ROOT.$info->name,$info->total)){

                $logger->info("合并文件【".$info->name."】结束");

                $file_extension = pathinfo(UPLOAD_TEMP_ROOT.$info->name, PATHINFO_EXTENSION);
                $file_real_path = UPLOAD_ROOT.date('Ymd')."/";
                $file_real_name = md5($info->name.time());
                $real_url = $file_real_path.$file_real_name.".".$file_extension;

                //移动文件
                if($file->moveFile(UPLOAD_TEMP_ROOT.$info->name,$real_url)){
                    $logger->info("移动文件【".$info->name."】结束");
                    $info->result = 1;
                    $info->real_url = $real_url;

                } else {
                    $info->result = -2;
                    $logger->info("移动文件【".$info->name."】失败");
                }
            } else {
                $info->result = -2;
                $logger->info("合并文件【".$info->name."】失败");
            }
        } else {
            $info->result = 1;
        }
    } catch(Exception $e){
        $info->result = -1;
    }

    //去除data，减小数据传输
    unset($info->data);

    //返回数据
    $connection->send(json_encode($info));
};

Worker::runAll();