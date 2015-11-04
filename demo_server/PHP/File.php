<?php

class file {


    function createDir($aimUrl) {
        $aimUrl = str_replace('', '/', $aimUrl);
        $aimDir = '';
        $arr = explode('/', $aimUrl);
        $result = true;
        foreach ($arr as $str) {
            $aimDir .= $str . '/';
            if (!file_exists($aimDir)) {
                $result = mkdir($aimDir);
            }
        }
        return $result;
    }

    function moveFile($fileUrl, $aimUrl) {
        if (!file_exists($fileUrl)) {
            return false;
        }   
        if (file_exists($aimUrl)) {
            return false;
        }
        $this->createDir(dirname($aimUrl));
        rename($fileUrl, $aimUrl);
        return true;
    }

    function unlinkFile($aimUrl) {
        if (file_exists($aimUrl)) {
            unlink($aimUrl);
            return true;
        } else {
            return false;
        }
    }

    function writeFile($fileUrl,$content){

        if(!file_exists(dirname($fileUrl))){
            $this->createDir(dirname($fileUrl));
        }

        $temp_handle = fopen($fileUrl, "wb");

        fwrite($temp_handle, $content);

        fclose ($temp_handle); 
    }

    function mergeFile($fileName,$total){

        try {
            $file_handle = fopen($fileName, 'wb');

            for($i=0;$i<$total;$i++){

                $cache_path = $fileName.".part".$i;

                $cache_handle = fopen($cache_path, 'rb');

                $content = fread($cache_handle, filesize($cache_path));

                fclose($cache_handle);

                fwrite($file_handle, $content);

                $this->unlinkFile($cache_path);
            }

            fclose($file_handle);

        } catch(Exception $e){

            return false;
            
        }

        return true;
    }
}

?>