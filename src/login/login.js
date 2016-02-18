/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var login;
    (function (login) {
        var LoginController = (function () {
            // dependencies are injected via AngularJS $injector
            // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
            function LoginController($scope, gettextCatalog, network, $mdToast, $mdDialog, $log, $q) {
                this.$scope = $scope;
                this.gettextCatalog = gettextCatalog;
                this.network = network;
                this.$mdToast = $mdToast;
                this.$mdDialog = $mdDialog;
                this.$log = $log;
                this.$q = $q;
                $scope.networkServiceHolder['primary'] = network.loginService;
                $scope.categoryService = network.categoryService;
                $scope.vm = this;
                $scope.menu_parameters.title = gettextCatalog.getString('login_title_logedin');
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = 'back';
            }
            //         var mydialog = this.$mdDialog.confirm()
            //     .title('This is an alert title')
            //     .content('You can specify some description text in here.')
            //     .ariaLabel('Alert Dialog Demo')
            //     .clickOutsideToClose(false);
            // this.$mdDialog.show(mydialog)
            //     .finally(
            //         ()=>{
            //         this.$log.debug("finally dialog");
            //         mydialog = undefined;
            //     }
            //     );
            LoginController.prototype.loginClicked = function () {
                var _this = this;
                //On Device Validation is not run
                if (this.$scope.inputForm.$invalid) {
                    this.$log.debug("Form is invalid");
                    this.$scope.inputForm.iusername.$setTouched();
                    this.$scope.inputForm.ipassword.$setTouched();
                    this.$scope.$apply();
                    return;
                }
                var defered = this.$q.defer();
                var ourData = new itweet.ProgressDialogData("login_title_login", "login_button_login", true, defered);
                /* to cancel: */
                // defered.resolve("cancel");
                var dialogPromise = this.$mdDialog.show({
                    // targetEvent: $event,
                    templateUrl: 'app/progress_dialog.tpl.html',
                    controller: itweet.ProgressDialogController,
                    onComplete: null,
                    locals: { data: ourData },
                    bindToController: false
                });
                this.network.loginService.run(defered).then(function () {
                    _this.$mdDialog.hide(dialogPromise);
                    //ourData.title = "Hello World";
                }, function () {
                    ourData.title = 'login_status_fail';
                    ourData.text = _this.network.loginService.responseError;
                    ourData.progressing = undefined;
                }, function () {
                    _this.$log.debug("Progress");
                })
                    .finally(function () {
                    _this.$log.debug("finally network");
                    //this.$mdDialog.cancel();
                });
            };
            LoginController.prototype.logoutClicked = function () {
                this.network.loginService.logout();
            };
            // $inject annotation.
            // It provides $injector with information about dependencies to be injected into constructor
            // it is better to have it close to the constructor, because the parameters must match in count and type.
            // See http://docs.angularjs.org/guide/di
            LoginController.$inject = [
                '$scope', 'gettextCatalog', 'itweetNetwork', '$mdToast', '$mdDialog', '$log', '$q'
            ];
            return LoginController;
        })();
        login.LoginController = LoginController;
        angular.module('itweet.login', ['gettext', 'ui.router', 'ngMaterial', 'ngMessages'])
            .controller('LoginController', LoginController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.login', {
                    url: "/login",
                    templateUrl: "login/login.html",
                    controller: 'LoginController'
                });
            }
        ]);
        ;
    })(login = itweet.login || (itweet.login = {}));
})(itweet || (itweet = {}));
