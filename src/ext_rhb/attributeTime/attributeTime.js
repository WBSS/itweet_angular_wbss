/// <reference path='../../_all.ts' />
var itweet;
(function (itweet) {
    var attributeTime;
    (function (attributeTime) {
        var RhBAttributeTimeController = (function () {
            function RhBAttributeTimeController($scope, gettextCatalog, network, ItweetStorage, $mdToast, $mdDialog, $log, $q) {
                this.$scope = $scope;
                this.gettextCatalog = gettextCatalog;
                this.network = network;
                this.ItweetStorage = ItweetStorage;
                this.$mdToast = $mdToast;
                this.$mdDialog = $mdDialog;
                this.$log = $log;
                this.$q = $q;
                this.invalidDate = false;
                this.timeDays = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
                this.timeMonths = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
                this.timeYear = ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020"];
                this.timeHours = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"];
                this.timeMinutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
                this.newSelectDay = "";
                this.newSelectMonth = null;
                this.newSelectYear = "";
                this.newSelectHours = null;
                this.newSelectMinutes = null;
                $scope.vm = this;
                $scope.menu_parameters.title = gettextCatalog.getString('attribute_title_time');
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = 'back';
                if (this.$scope.storageService.currentTweet.itemQs.dateEvent) {
                    this.setDate(new Date(parseInt(this.$scope.storageService.currentTweet.itemQs.dateEvent)));
                }
                else {
                    this.setDate(new Date());
                }
                this.invalidDate = false;
            }
            RhBAttributeTimeController.prototype.setDate = function (newDate) {
                console.log("setDate", newDate);
                this.newSelectDay = newDate.getUTCDate().toString();
                this.newSelectMonth = newDate.getMonth();
                this.newSelectYear = newDate.getFullYear().toString();
                this.newSelectHours = newDate.getHours();
                this.newSelectMinutes = parseInt((newDate.getMinutes() / 5).toString(), 10);
            };
            RhBAttributeTimeController.prototype.nextClicked = function () {
                var newDate = new Date();
                newDate.setUTCDate(+this.newSelectDay);
                newDate.setUTCMonth(+this.newSelectMonth);
                newDate.setUTCFullYear(+this.newSelectYear);
                newDate.setHours(+this.newSelectHours);
                newDate.setMinutes(+this.timeMinutes[this.newSelectMinutes]);
                this.invalidDate = false;
                if (+this.newSelectDay != newDate.getUTCDate()) {
                    this.invalidDate = true;
                }
                else {
                    this.$scope.storageService.currentTweet.itemQs.dateEvent = newDate.getTime().toString();
                    this.$scope.navigationService.next();
                }
            };
            RhBAttributeTimeController.$inject = [
                '$scope', 'gettextCatalog', 'itweetNetwork', 'ItweetStorage', '$mdToast', '$mdDialog', '$log', '$q'
            ];
            return RhBAttributeTimeController;
        })();
        attributeTime.RhBAttributeTimeController = RhBAttributeTimeController;
        angular.module('itweet.rhb.attributeTime', ['gettext', 'ui.router', 'ngMaterial'])
            .controller('RhBAttributeTimeController', RhBAttributeTimeController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.rhb_attribute_time', {
                    url: "/attributeTime",
                    templateUrl: "ext_rhb/attributeTime/attributeTime.html",
                    controller: 'RhBAttributeTimeController'
                });
            }
        ]);
        ;
    })(attributeTime = itweet.attributeTime || (itweet.attributeTime = {}));
})(itweet || (itweet = {}));
