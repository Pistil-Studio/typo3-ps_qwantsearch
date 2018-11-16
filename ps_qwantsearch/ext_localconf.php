<?php
if (!defined('TYPO3_MODE')) {
	die('Access denied.');
}

\TYPO3\CMS\Extbase\Utility\ExtensionUtility::configurePlugin(
    'Pistil.'.$_EXTKEY,
	'Pi1',
	array(
		'App' => 'index,form',
		
	),
	// non-cacheable actions
	array(
		'App' => 'talkToQwant'
	)
);

$ps_qwantsearchConf = unserialize($GLOBALS['TYPO3_CONF_VARS']['EXT']['extConf']['ps_qwantsearch']);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTypoScriptConstants(
    "plugin.ps_qwantsearch.conf.importCss=".$ps_qwantsearchConf['importCss']
);