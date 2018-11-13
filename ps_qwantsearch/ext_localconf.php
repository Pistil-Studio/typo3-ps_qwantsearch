<?php
if (!defined('TYPO3_MODE')) {
	die('Access denied.');
}

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
	'PS.' . $_EXTKEY,
	'Pi1',
	array(
		'App' => 'index,form,talkToQwant',
		
	),
	// non-cacheable actions
	array(
		
	)
);

$ps_qwantsearchConf = unserialize($GLOBALS['TYPO3_CONF_VARS']['EXT']['extConf']['ps_qwantsearch']);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTypoScriptConstants(
    "plugin.ps_qwantsearch.conf.importCss=".$ps_qwantsearchConf['importCss']
);