/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var category;
    (function (category_1) {
        var CategoryController = (function () {
            // dependencies are injected via AngularJS $injector
            // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
            function CategoryController($scope, $state, gettextCatalog, network) {
                var _this = this;
                this.$scope = $scope;
                this.$state = $state;
                this.gettextCatalog = gettextCatalog;
                this.network = network;
                $scope.networkServiceHolder['primary'] = network.categoryService;
                $scope.vm = this;
                $scope.menu_parameters.title = gettextCatalog.getString('category_title');
                /*$scope.menu_parameters.icon = undefined
                $scope.menu_parameters.navigate = undefined;*/
                /* RHB FIX: FIXME REFACTOR */
                $scope.$watch(function () { return network.contextService.getResponseData(); }, function (data) {
                    if (data && data.length == 1) {
                        var context = data[0];
                        _this.$scope.storageService.currentTweet.contextToken = context.contextToken;
                    }
                });
            }
            CategoryController.prototype.selectCategory = function (category) {
                this.$scope.storageService.currentTweet.refItemCategoryId = category.id;
                this.$scope.navigationService.next();
            };
            CategoryController.prototype.isCategorySelected = function (category) {
                return false;
            };
            CategoryController.$inject = [
                '$scope', '$state', 'gettextCatalog', 'itweetNetwork'
            ];
            return CategoryController;
        })();
        category_1.CategoryController = CategoryController;
        angular.module('itweet.category', ['gettext', 'ui.router', 'ngMaterial'])
            .controller('CategoryController', CategoryController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.category', {
                    url: "/category",
                    templateUrl: "category/category.html",
                    controller: 'CategoryController'
                });
            }
        ]);
        ;
    })(category = itweet.category || (itweet.category = {}));
})(itweet || (itweet = {}));
