<?php

class ApiSchemaLoad {

    public function __construct(Api $api) {
        $this->api = $api;
    }

    public function apiSchemaLoad() {
        // decode incoming token
        $decodedJWT = $this->api->decodeToken(getallheaders());

        // verify token
        $this->api->verifyToken($decodedJWT);

        if (file_exists('_source/web-schema.json')) {
            // load schema
            $schema = file_get_contents('_source/web-schema.json');

            // create JWT
            $token = $this->api->createToken($decodedJWT->{'id'}, $decodedJWT->{'user'});

            // response data object
            $data = array('token' => $token, 'schema' => $schema);

            // successful response
            echo json_encode($data);
        }
    }
}