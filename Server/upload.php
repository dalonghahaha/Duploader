<?php

	//解析上传数据
    $info = $_POST;
	
	try {
		//上传文件保存路径
        $upload_path='../upload/';
        //base64解码
        $content = base64_decode($info['data']);
        //分片文件名
        $temp_name = $info['name'].".part".$info['index'];
        //总片数
        $total = $info['total'];

        //写入文件
        $temp_handle = fopen($upload_path.$temp_name, "wb");
        fwrite($temp_handle, $content);
        fclose ($temp_handle); 

        //合并文件
        if($info['index'] + 1 == $total){

        	$file_handle = fopen($upload_path.$info['name'], 'wb');
        	for($i=0;$i<$total;$i++){
        		$cache_path = $upload_path.$info['name'].".part".$i;
        		$cache_handle = fopen($cache_path, 'rb');
                $content = fread($cache_handle, filesize($cache_path));
                fclose($cache_handle);
                fwrite($file_handle, $content);
                unlink($cache_path);
        	}
        	fclose($file_handle);
        }
        $info['result'] = 1;
    } catch(Exception $e){
        $info['result'] = -1;
    }

    unset($info['data']);
    
    echo json_encode($info);
?>