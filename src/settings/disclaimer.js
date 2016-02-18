var itweet;
(function (itweet) {
    var disclaimer;
    (function (disclaimer) {
        var DislaimerController = (function () {
            function DislaimerController($scope, gettextCatalog) {
                this.$scope = $scope;
                this.gettextCatalog = gettextCatalog;
                $scope.menu_parameters.title = gettextCatalog.getString('disclaimer_title');
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = 'back';
            }
            DislaimerController.$inject = ['$scope', 'gettextCatalog'];
            return DislaimerController;
        })();
        disclaimer.DislaimerController = DislaimerController;
        angular.module('itweet.disclaimer', ['gettext', 'ui.router', 'ngMaterial'])
            .controller('DislaimerController', DislaimerController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.disclaimer', {
                    url: "/disclaimer",
                    templateUrl: "settings/disclaimer.html",
                    controller: 'DislaimerController'
                });
            }
        ]);
    })(disclaimer = itweet.disclaimer || (itweet.disclaimer = {}));
})(itweet || (itweet = {}));
