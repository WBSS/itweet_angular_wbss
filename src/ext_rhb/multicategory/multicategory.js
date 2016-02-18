/// <reference path='../../_all.ts' />
var itweet;
(function (itweet) {
    var category;
    (function (category_1) {
        var MultiCategoryController = (function () {
            // dependencies are injected via AngularJS $injector
            // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
            function MultiCategoryController($scope, $state, gettextCatalog, network, $stateParams) {
                var _this = this;
                this.$scope = $scope;
                this.$state = $state;
                this.gettextCatalog = gettextCatalog;
                this.network = network;
                this.$stateParams = $stateParams;
                this.displayName = "";
                $scope.networkServiceHolder['primary'] = network.metadataService;
                $scope.vm = this;
                $scope.menu_parameters.title = gettextCatalog.getString('category_title');
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = undefined;
                $scope.$watch(function () { return network.metadataService.getResponseData(); }, function (newValue, oldValue) {
                    _this.updateByMeta(newValue);
                });
                $scope.$watch(function () { return $stateParams['parentId']; }, function () {
                    _this.updateByMeta();
                });
            }
            MultiCategoryController.prototype.updateByMeta = function (meta) {
                if (meta === void 0) { meta = this.network.metadataService.getResponseData(); }
                var parentId = this.$stateParams['parentId'];
                parentId = parentId == "" ? undefined : parentId;
                var mParentId = parentId;
                var append = undefined;
                while (mParentId) {
                    var item = meta.categoriesQs.filter(function (category) { return category.id == mParentId; })[0];
                    mParentId = item.parentId;
                    append = item.name + (append ? " / " + append : "");
                }
                this.displayName = this.network.categoryService.getCategoryName() + (append ? "/" + append : "");
                if (meta && meta.categoriesQs) {
                    this.categories = meta.categoriesQs.filter(function (category) { return category.parentId == parentId; });
                }
            };
            MultiCategoryController.prototype.selectCategory = function (category) {
                this.$scope.storageService.currentTweet.itemQs.refItemCategoryQsId = category.id;
                this.$scope.navigationService.next();
            };
            MultiCategoryController.prototype.isCategorySelected = function (category) {
                return false;
            };
            MultiCategoryController.$inject = [
                '$scope', '$state', 'gettextCatalog', 'itweetNetwork', '$stateParams'
            ];
            return MultiCategoryController;
        })();
        category_1.MultiCategoryController = MultiCategoryController;
        angular.module('itweet.multicategory', ['gettext', 'ui.router', 'ngMaterial'])
            .controller('MultiCategoryController', MultiCategoryController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.multicategory', {
                    url: "/multicategory/:parentId",
                    templateUrl: "ext_rhb/multicategory/multicategory.html",
                    controller: 'MultiCategoryController'
                });
            }
        ]);
        ;
    })(category = itweet.category || (itweet.category = {}));
})(itweet || (itweet = {}));
