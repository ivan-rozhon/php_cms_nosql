<?php

class ApiDataSave {

    public function __construct(Api $api) {
        $this->api = $api;
    }

    public function apiDataSave($post) {
        // decode incoming token
        $decodedJWT = $this->api->decodeToken(getallheaders());

        // verify token
        $this->api->verifyToken($decodedJWT);

        // data key & data
        $dataKey = $post['dataId'];
        $dataModel = json_encode($post['contentData']);

        if (file_exists('_source/data/'.$dataKey.'.json')) {
            // backup if put fail
            $dataBackup = file_get_contents('_source/data/'.$dataKey.'.json');

            // get result of update/put
            $success = file_put_contents('_source/data/'.$dataKey.'.json', $dataModel) === FALSE ? FALSE : TRUE;

            // apply backup if file_put_contents() failed
            if (!$success) { file_put_contents('_source/data/'.$dataKey.'.json', $dataBackup); }

            // create JWT
            $token = $this->api->createToken($decodedJWT->{'id'}, $decodedJWT->{'user'});

            // successful response
            echo $this->api->dataResponse($success ? $dataModel : $dataBackup, $token, true);
        }
    }
}