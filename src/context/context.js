/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var context;
    (function (context_1) {
        var ContextController = (function () {
            // dependencies are injected via AngularJS $injector
            // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
            function ContextController($scope, $state, gettextCatalog, network, $log) {
                var _this = this;
                this.$scope = $scope;
                this.$state = $state;
                this.gettextCatalog = gettextCatalog;
                this.network = network;
                this.$log = $log;
                this.loaded = {};
                $scope.networkServiceHolder['primary'] = network.contextService;
                $scope.vm = this;
                $scope.menu_parameters.title = gettextCatalog.getString('context_title');
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = undefined;
                if (!this.updateFromData()) {
                    network.contextService.run().then(function () {
                        _this.updateFromData();
                    });
                }
            }
            ContextController.prototype.updateFromData = function () {
                var data = this.network.contextService.getResponseData();
                if (data && data.length == 1) {
                    var context = data[0];
                    this.$scope.storageService.currentTweet.contextToken = context.contextToken;
                    this.$scope.navigationService.next(true);
                    return true;
                }
                return false;
            };
            ContextController.prototype.setLoad = function (context) {
                this.loaded[context.contextToken] = true;
            };
            ContextController.prototype.isLoaded = function (context) {
                return this.loaded[context.contextToken];
            };
            ContextController.prototype.contextSelected = function (context) {
                this.$log.debug("Selecting Context: " + context.contextToken);
                this.$scope.storageService.currentTweet.contextToken = context.contextToken;
                this.$scope.navigationService.next();
            };
            ContextController.prototype.isContextSelected = function (context) {
                return false;
            };
            ContextController.$inject = [
                '$scope', '$state', 'gettextCatalog', 'itweetNetwork', '$log'
            ];
            return ContextController;
        })();
        context_1.ContextController = ContextController;
        angular.module('itweet.context', ['gettext', 'ui.router', 'ngMaterial', 'ngOnload'])
            .controller('ContextController', ContextController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.context', {
                    url: "/context",
                    templateUrl: "context/context.html",
                    controller: 'ContextController'
                });
            }
        ]);
        ;
    })(context = itweet.context || (itweet.context = {}));
})(itweet || (itweet = {}));
