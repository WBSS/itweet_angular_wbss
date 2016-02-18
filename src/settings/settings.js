/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var settings;
    (function (settings) {
        var SettingsController = (function () {
            function SettingsController($scope, gettextCatalog, $mdDialog, $log) {
                var _this = this;
                this.$scope = $scope;
                this.gettextCatalog = gettextCatalog;
                this.$mdDialog = $mdDialog;
                this.$log = $log;
                $scope.vm = this;
                $scope.menu_parameters.title = gettextCatalog.getString('settings_title');
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = 'back';
                if (typeof (cordova) === "undefined") {
                    this.$scope.version = " - ";
                }
                else {
                    cordova.getAppVersion.getVersionNumber(function (v) { _this.$scope.version = v; });
                }
                $scope.items = [
                    { title: gettextCatalog.getString("settings_title_profil"), state: "app.mydata" },
                    { title: gettextCatalog.getString("settings_title_login"), state: "app.login" },
                    { title: gettextCatalog.getString("settings_title_my_items"), state: "app.mytweets" },
                    { title: gettextCatalog.getString("error_html5_container_loading_title"), state: "app.alltweets" },
                    { title: gettextCatalog.getString("settings_title_help"), state: "app.help" },
                    { title: gettextCatalog.getString("settings_title_demands"), state: "app.disclaimer" },
                    { title: gettextCatalog.getString("settings_title_clear_cache"), state: "" }
                ];
            }
            SettingsController.prototype.itemClicked = function (action) {
                if (action && action.length > 0) {
                    this.$scope.navigationService.go(new itweet.navigation.State(action));
                }
                else {
                    this.clearCache();
                }
            };
            SettingsController.prototype.clearCache = function () {
                var _this = this;
                var alertPromise = this.$mdDialog.confirm({
                    title: this.gettextCatalog.getString('settings_message_cache_title'),
                    content: this.gettextCatalog.getString('settings_message_cache_question'),
                    ok: this.gettextCatalog.getString('general_button_okay'),
                    cancel: this.gettextCatalog.getString('personel_button_cancel')
                });
                this.$mdDialog.show(alertPromise)
                    .then(function () {
                    //clear cache
                    _this.$scope.storageService.clearCache();
                    _this.notifyCacheCleared();
                })
                    .finally(function () {
                    this.$mdDialog.hide(alertPromise);
                    alertPromise = undefined;
                });
            };
            SettingsController.prototype.notifyCacheCleared = function () {
                var alertPromise = this.$mdDialog.confirm({
                    title: this.gettextCatalog.getString('settings_message_cache_title'),
                    content: this.gettextCatalog.getString('settings_message_cache_message'),
                    ok: this.gettextCatalog.getString('general_button_okay')
                });
                this.$mdDialog.show(alertPromise)
                    .finally(function () {
                    this.$mdDialog.hide(alertPromise);
                    alertPromise = undefined;
                });
            };
            SettingsController.$inject = [
                '$scope', 'gettextCatalog', '$mdDialog', '$log',
            ];
            return SettingsController;
        })();
        settings.SettingsController = SettingsController;
        angular.module('itweet.settings', ['gettext', 'ui.router', 'ngMaterial'])
            .controller('SettingsController', SettingsController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.settings', {
                    url: "/settings",
                    templateUrl: "settings/settings.html",
                    controller: 'SettingsController'
                });
            }
        ]);
    })(settings = itweet.settings || (itweet.settings = {}));
})(itweet || (itweet = {}));
