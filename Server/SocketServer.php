<?php

use \Workerman\Worker;
use \Workerman\WebServer;
use \Workerman\Autoloader;

// 自动加载类
require_once __DIR__ . '/Workerman/Autoloader.php';

$worker = new Worker('Websocket://0.0.0.0:2345');

$worker->count = 4;

$worker->onWorkerStart = function($worker)
{
    echo "Worker starting...\n";
};


$worker->onWorkerStop = function($worker)
{
    echo "Worker stopping...\n";
};

$worker->onConnect = function($connection)
{
    echo "new connection from ip " . $connection->getRemoteIp() . "\n";
};

$worker->onClose = function($connection)
{
    echo "connection closed\n";
};

$worker->onError = function($connection, $code, $msg)
{
    echo "error $code $msg\n";
};

$worker->onMessage = function($connection, $data)
{
    try {
        //上传文件保存路径
        $upload_path='../upload/';
        //解析上传数据
    	$info =json_decode($data);
        //base64解码
        $content = base64_decode($info->data);

        echo "recive part ".$info->name." ".$info->index."\n";

        //分片文件名
        $temp_name = $info->name.".part".$info->index;
        //总片数
        $total = $info->total;

        //写入文件
        $temp_handle = fopen($upload_path.$temp_name, "wb");
        fwrite($temp_handle, $content);
        fclose ($temp_handle); 

        echo "merge ......\n";

        //合并文件
        if($info->index + 1 == $total){
        	echo "merge ......\n";

        	$file_handle = fopen($upload_path.$info->name, 'wb');
        	for($i=0;$i<$total;$i++){
        		$cache_path = $upload_path.$info->name.".part".$i;
        		$cache_handle = fopen($cache_path, 'rb');
                $content = fread($cache_handle, filesize($cache_path));
                fclose($cache_handle);
                fwrite($file_handle, $content);
                unlink($cache_path);
        	}
        	fclose($file_handle);
        }

        echo "merge finished!\n";
        $info->result = 1;
    } catch(Exception $e){
        $info->result = -1;
    }

    unset($info->data);
    $connection->send(json_encode($info));
};

Worker::runAll();