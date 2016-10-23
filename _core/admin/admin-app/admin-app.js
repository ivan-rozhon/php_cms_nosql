(function (angular) {
    'use strict';
    function AdminAppController($http) {
        var ctrl = this;

        ctrl.status = null;
        ctrl.data = {};

        ctrl.file = 'web-schema';
        ctrl.folder = 'data';

        ctrl.getSchema = function () {

        };

        ctrl.camelCase = function (kebabCase) {
            // http://stackoverflow.com/questions/6660977/convert-hyphens-to-camel-case-camelcase
            return kebabCase.replace(
                /-([a-z])/g, 
                function (g) { 
                    return g[1].toUpperCase(); 
                }).replace('-', '');
        };

        ctrl.getJson = function () {
            $http({
                method: "GET",
                url: "?api/",
                params: { file: ctrl.file, folder: ctrl.folder }
            }).then(function (response) {
                ctrl.status = response.status;
                ctrl.data = response.data;
            });
        };

        ctrl.postJson = function () {
            var json = JSON.stringify(ctrl.data);
            // console.log(json);
            $http({
                method: "POST",
                url: "?api/",
                data: { 'json': json }
            }).then(function (response) {
                console.log(response.status);
                console.log(response.data);
            });
        };
    }

    angular.module('adminApp').component('adminApp', {
        templateUrl: '_core/admin/admin-app/admin-app.html',
        controller: AdminAppController
    });
})(window.angular);