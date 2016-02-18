/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var mytweets;
    (function (mytweets) {
        var MyTweetsController = (function () {
            function MyTweetsController($scope, gettextCatalog, network, $mdDialog, $log, $filter) {
                this.$scope = $scope;
                this.gettextCatalog = gettextCatalog;
                this.network = network;
                this.$mdDialog = $mdDialog;
                this.$log = $log;
                this.$filter = $filter;
                $scope.vm = this;
                $scope.categoryService = network.categoryService;
                $scope.menu_parameters.title = gettextCatalog.getString('item_save_title');
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = 'back';
                var orderby = $filter('orderBy');
                var list = orderby($scope.storageService.allTweets, '-dateAdded', false);
                for (var key in list) {
                    if (list.hasOwnProperty(key)) {
                        var element = list[key];
                        //                    $log.debug(" Element ",element);
                        $log.debug(" Date ", element.dateAdded);
                    }
                }
            }
            MyTweetsController.prototype.itemClicked = function (tweet) {
                this.$log.debug("Tweet clicked: " + tweet.location);
                this.$scope.storageService.currentTweet = tweet;
                this.$scope.navigationService.go(new itweet.navigation.State("app.overview"));
            };
            MyTweetsController.prototype.itemDeleteClicked = function (tweet) {
                var _this = this;
                var alertPromise = this.$mdDialog.confirm({
                    title: this.gettextCatalog.getString('item_delete_title'),
                    content: this.gettextCatalog.getString('item_delete_text'),
                    ok: this.gettextCatalog.getString('option_button_yes'),
                    cancel: this.gettextCatalog.getString('option_button_no')
                });
                this.$mdDialog.show(alertPromise)
                    .then(function () {
                    _this.$log.debug("Nachricht löschen");
                    _this.$scope.storageService.deleteTweet(tweet);
                })
                    .finally(function () {
                    this.$mdDialog.hide(alertPromise);
                    alertPromise = undefined;
                });
            };
            MyTweetsController.$inject = [
                '$scope', 'gettextCatalog', 'itweetNetwork', '$mdDialog', '$log', '$filter'
            ];
            return MyTweetsController;
        })();
        mytweets.MyTweetsController = MyTweetsController;
        angular.module('itweet.mytweets', ['gettext', 'ui.router', 'ngMaterial', 'angular-toArrayFilter'])
            .controller('MyTweetsController', MyTweetsController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.mytweets', {
                    url: "/mytweets",
                    templateUrl: "mytweets/mytweets.html",
                    controller: 'MyTweetsController'
                });
            }
        ]);
    })(mytweets = itweet.mytweets || (itweet.mytweets = {}));
})(itweet || (itweet = {}));
