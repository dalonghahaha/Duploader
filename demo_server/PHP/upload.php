<?php
    ini_set('display_errors',0);

    if( ! ini_get('date.timezone') )
    {
        date_default_timezone_set('PRC');
    }

    require_once __DIR__ . '/Config.php';
    require_once __DIR__ . '/Log.php';
    require_once __DIR__ . '/File.php';

	//解析上传数据
    $info = $_POST;
	
	try {

        $file = new file();
        $logger = new Logger(LOG_ROOT);

        //base64解码
        $content = base64_decode($info['data']);

        $logger->info("接受到文件【".$info['name']."】分片【".$info['index']."】");

        //临时分片文件名
        $temp_name = $info['name'].".part".$info['index'];

        //写入临时文件
        $file->writeFile(UPLOAD_TEMP_ROOT.$temp_name,$content);

        //合并文件
        if($info['index'] + 1 == $total = $info['total']){

            $logger->info("合并文件【".$info['name']."】开始");

            //合并文件
            if($file->mergeFile(UPLOAD_TEMP_ROOT.$info['name'],$info['total'])){

                $logger->info("合并文件【".$info['name']."】结束");

                $file_extension = pathinfo(UPLOAD_TEMP_ROOT.$info['name'], PATHINFO_EXTENSION);
                $file_real_path = UPLOAD_ROOT.date('Ymd')."/";
                $file_real_name = md5($info->name.time());
                $real_url = $file_real_path.$file_real_name.".".$file_extension;

                //移动文件
                if($file->moveFile(UPLOAD_TEMP_ROOT.$info['name'],$real_url)){
                    $logger->info("移动文件【".$info['name']."】结束");
                    $info['result'] = 1;
                    $info['real_url'] = REAL_ROOT.date('Ymd')."/".$file_real_name.".".$file_extension;

                } else {
                    $info['result'] = -2;
                    $logger->info("移动文件【".$info['name']."】失败");
                }

            } else {
                $info['result'] = -2;

                $logger->info("合并文件【".$info['name']."】失败");
            }

        } else {
            $info['result'] = 1;
        }
    } catch(Exception $e){
        $info['result'] = -1;
    }

    unset($info['data']);

    echo json_encode($info);
?>