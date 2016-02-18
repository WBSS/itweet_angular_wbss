var itweet;
(function (itweet) {
    var alltweets;
    (function (alltweets) {
        var AlltweetsController = (function () {
            function AlltweetsController($scope, gettextCatalog, $interval, $mdDialog, ItweetConfig, $log, $sce) {
                this.$scope = $scope;
                this.gettextCatalog = gettextCatalog;
                this.$interval = $interval;
                this.$mdDialog = $mdDialog;
                this.ItweetConfig = ItweetConfig;
                this.$log = $log;
                this.$sce = $sce;
                this.$scope.networkServiceHolder['primary'] = { loading: false };
                $scope.vm = this;
                $scope.menu_parameters.title = "";
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = 'back';
                this.startInAppBrowser();
            }
            AlltweetsController.prototype.startInAppBrowser = function () {
                var _this = this;
                this.$scope.networkServiceHolder['primary'].loading = true;
                var url = this.AllTweetsUrl();
                this.inappBrowser = window.open(url, '_blank', 'hidden=yes,location=no,toolbar=no');
                this.timeoutRunner = this.$interval(function () {
                    _this.inappBrowser.close();
                    _this.alertUser(_this.gettextCatalog.getString('error_html5_container_timeout'));
                }, this.ItweetConfig.web_container_timeout, 1);
                this.inappBrowser.addEventListener('loadstop', function () {
                    _this.$scope.$apply(function () {
                        _this.$log.debug('background window loaded');
                        _this.$scope.networkServiceHolder['primary'].loading = false;
                        _this.$interval.cancel(_this.timeoutRunner);
                        _this.inappBrowser.show();
                    });
                });
                this.inappBrowser.addEventListener('loadstart', function (event) {
                    var url = event.url + "";
                    _this.$log.debug("Start loading url: " + url);
                    if (url.indexOf("close") >= 0) {
                        _this.inappBrowser.close();
                    }
                });
                this.inappBrowser.addEventListener('exit', function () {
                    _this.$log.debug("inappBrowser Closed");
                    _this.closePage();
                });
                // close InAppBrowser after 5 seconds
                //setTimeout(function() {
                //    ref.close();
                //}, 5000);
            };
            AlltweetsController.prototype.closePage = function () {
                this.$interval.cancel(this.timeoutRunner);
                this.$scope.navigationService.previous();
            };
            AlltweetsController.prototype.alertUser = function (message) {
                var alertPromise = this.$mdDialog.confirm({
                    title: this.gettextCatalog.getString('error_html5_container_loading_title'),
                    content: this.gettextCatalog.getString(message),
                    ok: this.gettextCatalog.getString('general_button_okay')
                });
                this.$mdDialog.show(alertPromise)
                    .finally(function () {
                    this.$mdDialog.hide(alertPromise);
                    alertPromise = undefined;
                    this.closePage();
                });
            };
            //Missplaced
            AlltweetsController.prototype.AllTweetsUrl = function () {
                var lat = this.$scope.storageService.currentTweet.latDevice;
                var lng = this.$scope.storageService.currentTweet.lngDevice;
                var token = this.$scope.storageService.user.token || this.$scope.storageService.currentTweet.contextToken;
                var url = this.ItweetConfig.endpoint_myitems + "/" + this.ItweetConfig.appId + "/" + lat + "/" + lng + "/" +
                    this.ItweetConfig.langISO + "/" + this.ItweetConfig.countryISO + "/" + this.ItweetConfig.platform + "/" + token;
                this.$log.debug("Tweet URL: " + url);
                return this.$sce.trustAsResourceUrl(url);
            };
            AlltweetsController.$inject = ['$scope', 'gettextCatalog', '$interval', '$mdDialog', 'ItweetConfig', '$log', '$sce'
            ];
            return AlltweetsController;
        })();
        alltweets.AlltweetsController = AlltweetsController;
        angular.module('itweet.alltweets', ['gettext', 'ui.router', 'ngMaterial'])
            .controller('AlltweetsController', AlltweetsController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.alltweets', {
                    url: "/alltweets",
                    templateUrl: "alltweets/alltweets.html",
                    controller: 'AlltweetsController'
                });
            }
        ]);
    })(alltweets = itweet.alltweets || (itweet.alltweets = {}));
})(itweet || (itweet = {}));
