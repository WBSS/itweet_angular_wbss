/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var audio;
    (function (audio) {
        var AudioController = (function () {
            function AudioController($scope, gettextCatalog, itweetMedia, $mdToast, $mdDialog, $log, $q) {
                this.$scope = $scope;
                this.gettextCatalog = gettextCatalog;
                this.itweetMedia = itweetMedia;
                this.$mdToast = $mdToast;
                this.$mdDialog = $mdDialog;
                this.$log = $log;
                this.$q = $q;
                $scope.vm = this;
                $scope.recorderService = itweetMedia.recorderService;
                $scope.recorderService.initState();
                $scope.menu_parameters.title = gettextCatalog.getString('speech_title');
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = 'back';
            }
            AudioController.prototype.recordToggle = function () {
                this.itweetMedia.recorderService.toggleRecording();
            };
            AudioController.prototype.replayToggle = function () {
                this.itweetMedia.recorderService.toggleReplay();
            };
            AudioController.prototype.deleteRecording = function () {
                this.itweetMedia.recorderService.deleteRecording();
            };
            AudioController.$inject = [
                '$scope', 'gettextCatalog', 'itweetMedia', '$mdToast', '$mdDialog', '$log', '$q'
            ];
            return AudioController;
        })();
        audio.AudioController = AudioController;
        angular.module('itweet.audio', ['gettext', 'ui.router', 'ngMaterial', 'ngMessages'])
            .controller('AudioController', AudioController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.audio', {
                    url: "/audio",
                    templateUrl: "audio/audio.html",
                    controller: 'AudioController'
                });
            }
        ]);
        ;
    })(audio = itweet.audio || (itweet.audio = {}));
})(itweet || (itweet = {}));
