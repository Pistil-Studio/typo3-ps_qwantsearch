<?php
namespace Pistil\PsQwantsearch\Controller;


class AppController extends \TYPO3\CMS\Extbase\Mvc\Controller\ActionController {

    protected $_apiUrl;
    protected $_apiToken;
    protected $_apiClientId;

    /**
     *
     */
    public function formAction(){

    }


    /**
     * @return string The rendered view
     */
    public function indexAction() {

        $extConf = $this->getQwantConfiguration();

        $this->cObj = $this->configurationManager->getContentObject();
        $link = $this->cObj->typoLink('', array(
            'parameter' => $GLOBALS['TSFE']->id,
            'additionalParams' => '&type=1238&&no_cache=1', // Set additional parameters if any
            'returnLast' => 'url', // If you wish to get url as your output
        ));

        // TODO : make default language configurable
        $PsQwantOptions = array(
            'url' => $link,
            'count' => $extConf['count'],
            'lang' => (!empty($GLOBALS['TSFE']->config['config']['language'])) ? $GLOBALS['TSFE']->config['config']['language'] : 'en'
        );

        $args = $this->request->getArguments();
        if(!empty($args['q'])){
            $PsQwantOptions['defaultSearch'] = $args['q'];
        }



        $this->view->assign('PsQwantOptions', json_encode($PsQwantOptions));
	}


    /**
     * @return mixed
     */
    protected function getQwantConfiguration(){

        // get Extension manager conf
        $conf = unserialize($GLOBALS['TYPO3_CONF_VARS']['EXT']['extConf']['ps_qwantsearch']);

        // merge default conf
        foreach($this->settings as $k => $v){
            if(!empty($v)){
                $conf[$k] = $v;
            }
        }

        $this->_apiUrl  = $conf['apiUrl'];
        $this->_apiToken  = $conf['apiToken'];
        $this->_apiClientId  = $conf['apiClientId'];

        return $conf;

    }


    /**
     *
     */
	public function talkToQwantAction(){


        $this->view = \TYPO3\CMS\Extbase\Mvc\View\JsonView::class;

        $args = $this->request->getArguments();

        // ------------------------------------------------------------------------------------------------------------ default conf
        $extConf = $this->getQwantConfiguration();



        // ------------------------------------------------------------------------------------------------------------ errors check

        if(empty($this->_apiUrl) || empty($this->_apiToken) || empty($this->_apiClientId)){
            return $this->talkToQwantReturn(array(
                'error' => 1,
                'errorInfos' => 'missing qwant params conf (apiUrl / apiToken / apiClientId)'
            ));
        }

        if(empty($args['endPoint'])){
            return $this->talkToQwantReturn(array(
                'error' => 1,
                'errorInfos' => 'missing endPoint'
            ));
        }

        if(empty($args['params']['q'])){
            return $this->talkToQwantReturn(array(
                'error' => 1,
                'errorInfos' => 'missing search params "q"'
            ));
        }

        if(empty($args['params']['lang'])){
            return $this->talkToQwantReturn(array(
                'error' => 1,
                'errorInfos' => 'missing search params "lang"'
            ));
        }

        // ------------------------------------------------------------------------------------------------------------ QWANT API Call

        // get qwant results
        $qwantReponse = $this->talkToQwant($args['endPoint'], $args['params']);
        if($qwantReponse['error'] !== 0){
            return $this->talkToQwantReturn(array(
                'error' => $qwantReponse['error'],
                'errorInfos' => $qwantReponse['errorInfos']
            ));
        }

        return $this->talkToQwantReturn($qwantReponse);

    }

    /**
     * @param $endPoint
     * @param $params
     * @return array
     */
    protected function talkToQwant($endPoint, $params){

        $curl = curl_init();


        curl_setopt_array($curl, array(
            CURLOPT_URL => $this->_apiUrl.$endPoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_POSTFIELDS => json_encode($params),
            CURLOPT_HTTPHEADER => array(
                "cache-control: no-cache",
                "content-type: application/json",
                "Client-ID:".$this->_apiClientId,
                "token:".$this->_apiToken
            )
        ));

        $response = curl_exec($curl);
        $httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        // service errors
        if($httpcode !== 200){
            return array(
                'error' => 1,
                'errorInfos' => $response
            );
        }


        // check if json response
        $jsonReponse = json_decode($response);
        if(!$jsonReponse){
            return array(
                'error' => 1,
                'errorInfos' => 'not a json response'
            );
        }



        // no errors
        return array(
                'error' => 0,
                'datas' => $jsonReponse->data->results
            );
    }


    /**
     * Simple return wrapper
     * @param $datas
     * @return false|string
     */
    protected function talkToQwantReturn($datas){
        return json_encode($datas);
    }


}