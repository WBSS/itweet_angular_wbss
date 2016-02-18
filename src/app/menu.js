/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var MenuController = (function () {
        // dependencies are injected via AngularJS $injector
        // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
        function MenuController($scope, $state, ItweetStorage, ItweetNavigation, $log, iTweetNetwork) {
            var _this = this;
            this.$scope = $scope;
            this.$state = $state;
            this.ItweetStorage = ItweetStorage;
            this.ItweetNavigation = ItweetNavigation;
            this.$log = $log;
            this.iTweetNetwork = iTweetNetwork;
            $scope.menuController = this;
            $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                _this.updateMenu();
            });
            this.updateMenu();
        }
        MenuController.prototype.updateMenu = function () {
            if (this.$scope.navigationService.shouldShowNoNavigationButtons()) {
                this.$scope.menu_parameters.icon = undefined;
                this.$scope.menu_parameters.navigate = undefined;
            }
            else {
                if (this.$scope.navigationService.shouldDisplayBackbutton()) {
                    this.$scope.menu_parameters.icon = 'arrow_back';
                    this.$scope.menu_parameters.navigate = undefined;
                }
                else {
                    this.$scope.menu_parameters.icon = 'person_outline';
                    this.$scope.menu_parameters.navigate = 'app.settings';
                }
            }
            this.$log.info("update menu to " + this.$scope.menu_parameters.icon);
        };
        MenuController.prototype.storeVisible = function () {
            //return this.ItweetNavigation.isCurrentStateOverview() && this.ItweetStorage.hasTweetsSaved();
            return this.ItweetStorage.hasTweetsSaved() && !this.$scope.navigationService.shouldShowNoNavigationButtons();
        };
        MenuController.prototype.storeClicked = function () {
            this.$scope.navigationService.go(new itweet.navigation.State('app.mytweets'));
        };
        MenuController.prototype.menuClicked = function () {
            this.$log.debug("MenuButton: " + this.$scope.menu_parameters.navigate);
            if (this.$scope.menu_parameters.navigate == undefined || this.$scope.menu_parameters.navigate == 'back') {
                this.$log.debug("NavigationService.back");
                this.$scope.navigationService.previous();
            }
            else if (this.$scope.menu_parameters.navigate == 'none') {
            }
            else {
                //this.$state.go(this.$scope.menu_parameters.navigate);
                this.$scope.navigationService.go(new itweet.navigation.State(this.$scope.menu_parameters.navigate));
            }
        };
        // $inject annotation.
        // It provides $injector with information about dependencies to be injected into constructor
        // it is better to have it close to the constructor, because the parameters must match in count and type.
        // See http://docs.angularjs.org/guide/di
        MenuController.$inject = [
            '$scope', '$state', 'ItweetStorage', 'ItweetNavigation', '$log', 'itweetNetwork'
        ];
        return MenuController;
    })();
    itweet.MenuController = MenuController;
    angular.module('itweet.menu', ['gettext', 'ui.router', 'ngMaterial', 'ngMdIcons'])
        .controller('MenuController', MenuController);
})(itweet || (itweet = {}));
