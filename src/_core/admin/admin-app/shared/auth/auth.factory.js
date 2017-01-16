(function () {
    "use strict";

    angular
        .module('auth.authFactory', [])
        .factory('authFactory', AuthFactory);

    AuthFactory.$inject = ['API', 'authService', '$q', '$timeout'];
    function AuthFactory(API, authService, $q, $timeout) {
        var $ctrl = this;

        // load Authorization token if aviable
        $ctrl.loadToken = function (config) {
            return $q(function (resolve, reject) {
                var token = authService.getToken();
                if (config.url.indexOf(API) === 0 && token) {
                    config.headers.authorization = 'Bearer ' + token;
                }
                resolve(config);
            });
        };

        return {
            // automatically attach Authorization header
            request: function (config) {
                // load Authorization token if aviable (asynchronous - not necessary)
                var updatedConfig = $ctrl.loadToken(config);

                // wait for token and return config (with or without token)
                return $q.when(updatedConfig).then(function (result) {
                    return result;
                });
            },

            // If a token was sent back, save it
            response: function (res) {
                if (res.config.url.indexOf(API) === 0 && res.data.token) {
                    authService.saveToken(res.data.token);
                }

                return res;
            }
        };

    }
})();