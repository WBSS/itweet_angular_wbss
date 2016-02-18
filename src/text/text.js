/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var text;
    (function (text_1) {
        var TextController = (function () {
            function TextController($scope, gettextCatalog, network, $mdToast, $mdDialog, $log, $q) {
                this.$scope = $scope;
                this.gettextCatalog = gettextCatalog;
                this.network = network;
                this.$mdToast = $mdToast;
                this.$mdDialog = $mdDialog;
                this.$log = $log;
                this.$q = $q;
                $scope.vm = this;
                $scope.menu_parameters.title = gettextCatalog.getString('message_title');
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = 'back';
                if (this.$scope.storageService.currentTweet.txt) {
                    this.inputText = this.$scope.storageService.currentTweet.txt;
                }
                else {
                    this.inputText = "";
                }
            }
            TextController.prototype.nextClicked = function (text) {
                //On Device Validation is not run
                if (this.$scope.inputForm.$invalid) {
                    this.$log.debug("Form is invalid");
                    this.$scope.inputForm.text.$setTouched();
                    return;
                }
                this.$scope.storageService.currentTweet.txt = text;
                this.$scope.navigationService.next();
            };
            TextController.$inject = [
                '$scope', 'gettextCatalog', 'itweetNetwork', '$mdToast', '$mdDialog', '$log', '$q'
            ];
            return TextController;
        })();
        text_1.TextController = TextController;
        angular.module('itweet.text', ['gettext', 'ui.router', 'ngMaterial', 'ngMessages'])
            .controller('TextController', TextController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.text', {
                    url: "/text",
                    templateUrl: "text/text.html",
                    controller: 'TextController'
                });
            }
        ]);
        ;
    })(text = itweet.text || (itweet.text = {}));
})(itweet || (itweet = {}));
