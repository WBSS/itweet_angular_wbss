var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path='../../_all.ts' />
var itweet;
(function (itweet) {
    var model;
    (function (model) {
        var RHBServiceFactory = (function (_super) {
            __extends(RHBServiceFactory, _super);
            function RHBServiceFactory($http, config, $q, $window, $rootScope, ItweetStorage, $timeout, $log, gettextCatalog) {
                _super.call(this, $http, config, $q, $window, $rootScope, ItweetStorage, $timeout, $log, gettextCatalog);
                this.$http = $http;
                this.config = config;
                this.$q = $q;
                this.$window = $window;
                this.$rootScope = $rootScope;
                this.ItweetStorage = ItweetStorage;
                this.$timeout = $timeout;
                this.$log = $log;
                this.gettextCatalog = gettextCatalog;
                this.metadataService = new MetadataService(this);
                this.categoryService = new RHBCategoryService(this);
            }
            return RHBServiceFactory;
        })(model.ServiceFactory);
        model.RHBServiceFactory = RHBServiceFactory;
        var RHBCategoryService = (function (_super) {
            __extends(RHBCategoryService, _super);
            function RHBCategoryService(runner, retry) {
                if (retry === void 0) { retry = true; }
                _super.call(this, runner, retry);
                this.runner = runner;
            }
            RHBCategoryService.prototype.getCategoryName = function (tweet) {
                if (tweet === void 0) { tweet = this.runner.ItweetStorage.currentTweet; }
                var token = itweet.model.Tweet.getCurrentContextToken(tweet, this.runner.ItweetStorage.user);
                if (token && this.runner.ItweetStorage.contextStore[token] && this.runner.ItweetStorage.contextStore[token].categories[tweet.refItemCategoryId]) {
                    return this.runner.ItweetStorage.contextStore[token].categories[tweet.refItemCategoryId].name;
                }
                else {
                    return "undefined";
                }
            };
            RHBCategoryService.prototype.getSubcategoryName = function (tweet) {
                if (tweet === void 0) { tweet = this.runner.ItweetStorage.currentTweet; }
                var token = itweet.model.Tweet.getCurrentContextToken(tweet, this.runner.ItweetStorage.user);
                if (token && this.runner.ItweetStorage.metdataStore[token] && this.runner.ItweetStorage.metdataStore[token].categoriesQs) {
                    var _tItem = this.runner.ItweetStorage.metdataStore[token].categoriesQs.filter(function (v) {
                        return v.id === tweet.itemQs.refItemCategoryQsId; // filter out appropriate one
                    })[0];
                    if (_tItem) {
                        var parentId = _tItem.id;
                        var append = "";
                        var i = 0;
                        while (parentId) {
                            if (i > 20)
                                break;
                            i += 1;
                            var item = this.runner.ItweetStorage.metdataStore[token].categoriesQs.filter(function (v) {
                                return v.id === parentId; // filter out appropriate one
                            })[0];
                            append = item.name + (append ? " / " + append : "");
                            parentId = item.parentId;
                        }
                        return append;
                    }
                    else
                        return null;
                }
                else
                    return null;
            };
            return RHBCategoryService;
        })(model.CategoryService);
        model.RHBCategoryService = RHBCategoryService;
        var MetadataService = (function (_super) {
            __extends(MetadataService, _super);
            function MetadataService(runner, retry) {
                if (retry === void 0) { retry = true; }
                _super.call(this, runner, retry);
                this.runner = runner;
            }
            MetadataService.prototype.initData = function () {
                _super.prototype.initData.call(this);
                if (angular.equals({}, this.responseData)) {
                    // empty, load all
                    var storage = this.runner.ItweetStorage.metdataStore;
                    this.responseData = this.runner.ItweetStorage.metdataStore[this.contextToken()] || {};
                }
            };
            MetadataService.prototype.run = function (currentLoading) {
                var _this = this;
                if (currentLoading === void 0) { currentLoading = this.runner.$q.defer(); }
                var token = this.contextToken();
                return _super.prototype.run.call(this, currentLoading).then(function () {
                    _this.runner.ItweetStorage.metdataStore[token] = _this.responseData;
                });
            };
            MetadataService.prototype.setupRequest = function () {
                return {
                    method: "GET",
                    url: this.runner.config.endpoint_metadata +
                        this.runner.config.langISO + "/" +
                        this.contextToken()
                };
            };
            return MetadataService;
        })(model.BasicService);
        model.MetadataService = MetadataService;
    })(model = itweet.model || (itweet.model = {}));
})(itweet || (itweet = {}));
