/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var AppController = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function AppController($scope, $state, ItweetStorage, ItweetNavigation, $log, iTweetNetwork) {
            this.$scope = $scope;
            this.$state = $state;
            this.ItweetStorage = ItweetStorage;
            this.ItweetNavigation = ItweetNavigation;
            this.$log = $log;
            this.iTweetNetwork = iTweetNetwork;
            $scope.mvm = this;
            $scope.menu_parameters = { 'icon': 'arrow-back', 'title': 'Teststuff', 'navigate': 'app.context' };
            $scope.storageService = ItweetStorage;
            $scope.navigationService = ItweetNavigation;
            $scope.brand = iTweetNetwork.brandService;
            $scope.networkServiceHolder = {};
            $scope.$watch(function () { return iTweetNetwork.brandService.getSubheaderStyle(); }, function (data) {
                $scope.subheaderStyle = data;
            });
            $scope.$watch(function () { return iTweetNetwork.brandService.getFooterStyle(); }, function (data) {
                $scope.footerStyle = data;
            });
        }
        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        AppController.$inject = [
            '$scope', '$state', 'ItweetStorage', 'ItweetNavigation', '$log', 'itweetNetwork'
        ];
        return AppController;
    })();
    itweet.AppController = AppController;
    angular.module('itweet.app', ['gettext', 'ui.router', 'ngMaterial', 'ngMdIcons'])
        .controller('AppController', AppController)
        .config(["$stateProvider", "$urlRouterProvider",
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('app', {
                url: "/app",
                templateUrl: "app/app.html",
                controller: 'AppController'
            });
        }
    ]);
    ;
})(itweet || (itweet = {}));
