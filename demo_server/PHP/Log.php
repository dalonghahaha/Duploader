<?php

class Logger{
	
	private $rootDir;
	
	public function __construct($rootDir){
		$this->rootDir = $rootDir;
	}

	public function debug($message) {
		$this->_log('debug', $message);
	}
	
	public  function info($message) {
		$this->_log('info', $message);
	}
	
	public  function warn($message) {
		$this->_log('warn', $message);
	}
	
	public  function error($message) {
		$this->_log('error', $message);
	}
	
	private function _log($level, $message) {
		$log_file_path = $this->rootDir.date('Ymd')."/".$level.'.log';
		$content = date('Y-m-d H:i:s').'--'.$message . "\n";
		if ($this->makeDir(dirname($log_file_path))) {
			file_put_contents($log_file_path, $content, FILE_APPEND);
		}
	}

	private function makeDir($dir, $mode = 0755) {
	if (!file_exists ( $dir )) {
		return mkdir ( $dir, $mode, true );
	} else {
		return true;
	}
}
}
