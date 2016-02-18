/// <reference path='../_all.ts' />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var itweet;
(function (itweet) {
    var model;
    (function (model) {
        var HttpMethods;
        (function (HttpMethods) {
            HttpMethods[HttpMethods["GET"] = 0] = "GET";
            HttpMethods[HttpMethods["POST"] = 1] = "POST";
            HttpMethods[HttpMethods["PUT"] = 2] = "PUT";
        })(HttpMethods || (HttpMethods = {}));
        var ServiceFactory = (function () {
            function ServiceFactory($http, config, $q, $window, $rootScope, ItweetStorage, $timeout, $log, gettextCatalog) {
                var _this = this;
                this.$http = $http;
                this.config = config;
                this.$q = $q;
                this.$window = $window;
                this.$rootScope = $rootScope;
                this.ItweetStorage = ItweetStorage;
                this.$timeout = $timeout;
                this.$log = $log;
                this.gettextCatalog = gettextCatalog;
                this.retryableRequest = [];
                this.foreground = true;
                this.CACHE_NAME = "request_cache";
                this.CACHE_CAPACITY = 20;
                this.ItweetStorage.resetable.push(this);
                this.online = $window.navigator.onLine;
                this.online = true;
                $window.addEventListener("offline", function () {
                    $rootScope.$apply(function () {
                        _this.online = false;
                    });
                }, false);
                $window.addEventListener("online", function () {
                    $rootScope.$apply(function () {
                        _this.online = true;
                        _this.runAll();
                    });
                }, false);
                document.addEventListener("pause", function () {
                    $rootScope.$apply(function () {
                        _this.foreground = false;
                        $rootScope.$broadcast("pause");
                    });
                }, false);
                document.addEventListener("resume", function () {
                    $rootScope.$apply(function () {
                        _this.foreground = true;
                        _this.online = $window.navigator.onLine;
                        if (_this.online) {
                            _this.runAll();
                            _this.contextService.runAll();
                        }
                        $rootScope.$broadcast("resume");
                    });
                }, false);
                this.loginService = new LoginService(this);
                this.contextService = new ContextService(this);
                this.categoryService = new CategoryService(this);
                this.brandService = new BrandService(this);
                this.pingService = new PingService(this);
                this.iTweetService = new iTweetService(this);
                this.iTweetUploader = new iTweetUploader(this, gettextCatalog);
                this.fileUploader = new FileUploader(this);
                this.contextService.runAll();
            }
            ServiceFactory.prototype.runAll = function () {
                angular.forEach(this.retryableRequest, function (request) {
                    request.getResponseData();
                });
            };
            ServiceFactory.prototype.reset = function () {
                this.resetRetry();
                this.runAll();
                this.contextService.runAll();
            };
            ServiceFactory.prototype.resetRetry = function () {
                this.retryableRequest.forEach(function (req) {
                    req.reset();
                });
            };
            ServiceFactory.$inject = [
                '$http', 'ItweetConfig', '$q', '$window',
                '$rootScope', 'ItweetStorage', '$timeout', '$log', 'gettextCatalog'
            ];
            return ServiceFactory;
        })();
        model.ServiceFactory = ServiceFactory;
        var BasicService = (function () {
            function BasicService(runner, reload) {
                this.runner = runner;
                this.reload = reload;
                if (reload) {
                    runner.retryableRequest.push(this);
                }
            }
            BasicService.prototype.reset = function () {
                this.lastToken = undefined;
            };
            BasicService.prototype.getToken = function () {
                return JSON.stringify(this.setupRequest());
            };
            BasicService.prototype.contextToken = function () {
                return itweet.model.Tweet.getCurrentContextToken(this.runner.ItweetStorage.currentTweet, this.runner.ItweetStorage.user);
            };
            BasicService.prototype.initData = function () {
                this.responseData = {};
            };
            BasicService.prototype.saveData = function () {
            };
            BasicService.prototype.getResponseData = function () {
                if (this.getToken() != this.lastToken) {
                    this.cancel();
                    this.initData();
                    this.lastToken = this.getToken();
                    this.lastFetched = 0;
                }
                if (Date.now() - this.lastFetched > 60 * 5 * 1000 && this.loading == undefined) {
                    this.run();
                }
                return this.responseData;
            };
            BasicService.prototype.cancel = function () {
                if (this.loading) {
                    this.loading.resolve("new Parameters");
                    this.loading = undefined;
                }
            };
            BasicService.prototype.run = function (currentLoading) {
                var _this = this;
                if (currentLoading === void 0) { currentLoading = this.runner.$q.defer(); }
                if (!this.runner.online) {
                    this.runner.$timeout(function () {
                        currentLoading.reject("offline");
                        if (_this.loading == currentLoading) {
                            _this.loading = undefined;
                        }
                    }, 1000);
                    this.loading = currentLoading;
                    return currentLoading.promise;
                }
                var config = this.setupRequest();
                this.loading = currentLoading;
                config.timeout = this.loading.promise;
                this.responseError = null;
                var done = function () {
                    if (_this.loading && _this.loading == currentLoading) {
                        //  this.loading.resolve();
                        _this.loading = undefined;
                    }
                };
                var resp = this.runner.$http(config);
                resp
                    .then(function (response) {
                    _this.responseData = response.data;
                    _this.lastFetched = Date.now();
                    _this.saveData();
                    done();
                }, function (response) {
                    if (response.status == 401) {
                        _this.runner.loginService.logout();
                    }
                    _this.responseError = response.statusText;
                    _this.runner.$timeout(done, 1000);
                });
                return resp;
            };
            BasicService.prototype.setupRequest = function () { return null; }; /* setup the request, MUST OVERRIDE */
            return BasicService;
        })();
        model.BasicService = BasicService;
        var LoginData = (function () {
            function LoginData() {
            }
            return LoginData;
        })();
        model.LoginData = LoginData;
        var LoginService = (function (_super) {
            __extends(LoginService, _super);
            function LoginService(runner) {
                _super.call(this, runner, false);
                this.runner = runner;
            }
            LoginService.prototype.logout = function () {
                this.runner.ItweetStorage.user.showContext = true;
                this.runner.ItweetStorage.user.token = undefined;
                this.runner.ItweetStorage.user.createMessageAllowed = true;
                if (this.data) {
                    this.data.username = undefined;
                    this.data.password = undefined;
                }
                // this.runner.ItweetNavigation.logout();
            };
            LoginService.prototype.run = function (currentLoading) {
                var _this = this;
                if (currentLoading === void 0) { currentLoading = this.runner.$q.defer(); }
                return _super.prototype.run.call(this, currentLoading).then(function () {
                    _this.runner.ItweetStorage.clearCache();
                    _this.runner.ItweetStorage.user.showContext = _this.responseData.showContext;
                    _this.runner.ItweetStorage.user.token = _this.responseData.loginToken;
                    _this.runner.ItweetStorage.user.createMessageAllowed = _this.responseData.createMessageAllowed;
                });
            };
            LoginService.prototype.setupRequest = function () {
                this.data.langISO = this.runner.config.langISO;
                this.data.countryISO = this.runner.config.countryISO;
                this.data.appId = this.runner.config.appId;
                return {
                    method: "PUT",
                    url: this.runner.config.endpoint_login,
                    data: this.data
                };
            };
            return LoginService;
        })(BasicService);
        model.LoginService = LoginService;
        var BrandService = (function (_super) {
            __extends(BrandService, _super);
            function BrandService(runner, retry) {
                if (retry === void 0) { retry = true; }
                _super.call(this, runner, retry);
                this.runner = runner;
            }
            BrandService.prototype.initData = function () {
                _super.prototype.initData.call(this);
                if (angular.equals({}, this.responseData)) {
                    // empty, load all
                    var storage = this.runner.ItweetStorage.brandStore;
                    this.responseData = this.runner.ItweetStorage.brandStore[this.contextToken()] || {};
                }
            };
            BrandService.prototype.getColor = function (key) {
                var hex = this.getResponseData()[key];
                if (!hex) {
                    return "";
                }
                var a, r, g, b;
                a = 255;
                if (hex.length == 6) {
                    r = parseInt(hex.substring(0, 2), 16);
                    g = parseInt(hex.substring(2, 4), 16);
                    b = parseInt(hex.substring(4, 6), 16);
                }
                else {
                    a = parseInt(hex.substring(0, 2), 16);
                    r = parseInt(hex.substring(2, 4), 16);
                    g = parseInt(hex.substring(4, 6), 16);
                    b = parseInt(hex.substring(6, 8), 16);
                }
                return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
            };
            BrandService.prototype.getSubheaderStyle = function () {
                return "color:" + this.getColor('subheaderColorText') + ";background-color:rgba(226,0,26,216);margin-right:0px;;overflow: hidden;";
            };
            BrandService.prototype.getFooterStyle = function () {
                return "color:" + this.getColor('footerButtonColorText') + ";background-color:" + this.getColor('footerButtonColor') + ";";
            };
            BrandService.prototype.run = function (currentLoading) {
                var _this = this;
                if (currentLoading === void 0) { currentLoading = this.runner.$q.defer(); }
                var token = this.contextToken();
                return _super.prototype.run.call(this, currentLoading).then(function () {
                    _this.runner.ItweetStorage.brandStore[token] = _this.responseData;
                });
            };
            BrandService.prototype.setupRequest = function () {
                return {
                    method: "GET",
                    url: this.runner.config.endpoint_brand +
                        this.runner.config.langISO + "/" +
                        this.runner.config.countryISO + "/" +
                        this.runner.config.platform + "/" +
                        this.contextToken()
                };
            };
            return BrandService;
        })(BasicService);
        model.BrandService = BrandService;
        var PingService = (function (_super) {
            __extends(PingService, _super);
            function PingService(runner) {
                _super.call(this, runner, false);
                this.runner = runner;
                this.responseTime = NaN;
            }
            PingService.prototype.setupRequest = function () {
                return {
                    method: "GET",
                    url: this.runner.config.endpoint_ping
                };
            };
            PingService.prototype.run = function (currentLoading) {
                var _this = this;
                if (currentLoading === void 0) { currentLoading = this.runner.$q.defer(); }
                var start = Date.now();
                return _super.prototype.run.call(this, currentLoading).then(function () {
                    _this.responseTime = Date.now() - start;
                });
            };
            return PingService;
        })(BasicService);
        model.PingService = PingService;
        var FileUploader = (function (_super) {
            __extends(FileUploader, _super);
            function FileUploader(runner) {
                _super.call(this, runner, false);
                this.runner = runner;
            }
            FileUploader.prototype.readData = function (fileSystemURI) {
                return new this.runner.$q(function (resolve, reject) {
                    window.resolveLocalFileSystemURL(fileSystemURI, function (entry) {
                        entry.file(function (file) {
                            var reader = new FileReader();
                            reader.onload = function (readresult) {
                                resolve(readresult.target.result);
                            };
                            reader.onerror = function (error) {
                                reject(error.target.error.code);
                            };
                            reader.readAsArrayBuffer(file);
                        }, reject);
                    });
                });
            };
            FileUploader.prototype.setupAndRun = function (media) {
                var _this = this;
                return this.readData(media.url).then(function (data) {
                    _this.data = data;
                    _this.sha1 = media.sha1;
                    _this.mime = media.mime;
                    return _this.run();
                });
            };
            FileUploader.prototype.setupRequest = function () {
                return {
                    method: "PUT",
                    url: this.runner.config.endpoint_media + this.sha1,
                    data: new Uint8Array(this.data),
                    transformRequest: [],
                    headers: {
                        "Content-Type": this.mime
                    }
                };
            };
            return FileUploader;
        })(BasicService);
        model.FileUploader = FileUploader;
        var iTweetUploader = (function () {
            function iTweetUploader(runner, gettextCatalog) {
                this.runner = runner;
                this.gettextCatalog = gettextCatalog;
            }
            iTweetUploader.prototype.upload = function (tweets, currentLoading, ourData) {
                var _this = this;
                if (currentLoading === void 0) { currentLoading = this.runner.$q.defer(); }
                if (ourData === void 0) { ourData = new itweet.ProgressDialogData(undefined, undefined, undefined, undefined); }
                ourData.text = this.gettextCatalog.getString("upload_status_connect");
                var promise = this.runner.pingService.run(currentLoading).then(function () {
                    if (_this.runner.pingService.responseTime > _this.runner.config.ping_threshold || !_this.runner.pingService.responseTime) {
                        ourData.title = _this.gettextCatalog.getString("general_info_high_ping_title");
                        ourData.text = _this.gettextCatalog.getString("general_info_high_ping_message");
                        return _this.runner.$q.reject("timeout in ping");
                    }
                }, function (data) { return _this.runner.$q.reject("timeout in ping"); });
                tweets.forEach(function (tweet) {
                    Object.keys(tweet.mediaStore).forEach(function (key, index) {
                        promise = promise.then(function () {
                            ourData.title = _this.gettextCatalog.getString("upload_status_title");
                            ourData.text = (key == 0 ? _this.gettextCatalog.getString("upload_status_speech") : _this.gettextCatalog.getString("upload_status_image"));
                            if (key > 0) {
                                ourData.extension = key;
                            }
                            else {
                                ourData.extension = "";
                            }
                            return _this.runner.fileUploader.setupAndRun(tweet.mediaStore[key]);
                        }, function (data) { return _this.runner.$q.reject(data); });
                    });
                    promise = promise.then(function () {
                        ourData.title = _this.gettextCatalog.getString("upload_status_title");
                        ourData.text = _this.gettextCatalog.getString("upload_status_tweet");
                        ourData.extension = "";
                        _this.runner.iTweetService.tweet = tweet;
                        _this.runner.iTweetService.undo = false;
                        return _this.runner.iTweetService.run(currentLoading);
                    }, function (data) { return _this.runner.$q.reject(data); });
                });
                var timepromise = this.runner.$timeout(function () {
                }, this.runner.config.min_upload_time);
                currentLoading.promise.then(function () {
                    _this.runner.$timeout.cancel(timepromise);
                });
                return this.runner.$q.all([promise, timepromise]);
            };
            return iTweetUploader;
        })();
        model.iTweetUploader = iTweetUploader;
        var iTweetService = (function (_super) {
            __extends(iTweetService, _super);
            function iTweetService(runner) {
                _super.call(this, runner, false);
                this.runner = runner;
            }
            iTweetService.prototype.setupRequest = function () {
                if (this.undo) {
                    return {
                        method: "DELETE",
                        url: this.runner.config.endpoint_itweet + this.tweet.guid
                    };
                }
                else {
                    var copy = model.Tweet.prepareForTransmission(this.tweet, this.runner.config, this.runner.ItweetStorage.user);
                    return {
                        method: "PUT",
                        url: this.runner.config.endpoint_itweet + this.tweet.guid,
                        data: copy
                    };
                }
            };
            iTweetService.prototype.run = function (currentLoading) {
                var _this = this;
                if (currentLoading === void 0) { currentLoading = this.runner.$q.defer(); }
                return _super.prototype.run.call(this, currentLoading).then(function () {
                    _this.tweet.sent = true;
                    _this.runner.ItweetStorage.deleteTweet(_this.tweet);
                });
            };
            return iTweetService;
        })(BasicService);
        model.iTweetService = iTweetService;
        var ContextService = (function (_super) {
            __extends(ContextService, _super);
            function ContextService(runner) {
                _super.call(this, runner, true);
                this.runner = runner;
            }
            ContextService.prototype.initData = function () {
                _super.prototype.initData.call(this);
                if (angular.equals({}, this.responseData)) {
                    // empty, load all
                    var storage = this.runner.ItweetStorage.contextStore;
                    this.responseData = Object.keys(storage).map(function (key) {
                        return storage[key];
                    });
                }
            };
            ContextService.prototype.runAll = function () {
                var _this = this;
                return this.run().
                    then(function () {
                    return _this.runner.$q.all(Object.keys(_this.runner.ItweetStorage.contextStore).map(function (token) {
                        var req = new CategoryServiceRefresher(_this.runner, token);
                        return req.run();
                    }).concat(Object.keys(_this.runner.ItweetStorage.contextStore).map(function (token) {
                        var req = new BrandServiceRefresher(_this.runner, token);
                        return req.run();
                    })));
                }).then(function () {
                    _this.runner.resetRetry();
                });
            };
            ContextService.prototype.setupRequest = function () {
                return {
                    method: "GET",
                    url: this.runner.config.endpoint_contexts +
                        this.runner.config.appId + "/" +
                        this.runner.ItweetStorage.currentTweet.lat + "/" +
                        this.runner.ItweetStorage.currentTweet.lng + "/" +
                        this.runner.config.langISO + "/" +
                        this.runner.config.countryISO + "/" +
                        this.runner.config.platform + "/" +
                        this.runner.ItweetStorage.user.token
                };
            };
            ContextService.prototype.run = function (currentLoading) {
                var _this = this;
                if (currentLoading === void 0) { currentLoading = this.runner.$q.defer(); }
                return _super.prototype.run.call(this, currentLoading).then(function () {
                    angular.forEach(_this.responseData, function (elem) {
                        if (!_this.runner.ItweetStorage.contextStore[elem.contextToken]) {
                            _this.runner.ItweetStorage.contextStore[elem.contextToken] = new model.Context();
                        }
                        angular.extend(_this.runner.ItweetStorage.contextStore[elem.contextToken], elem);
                    });
                }, function (reason) { return _this.runner.$q.reject(reason); });
            };
            return ContextService;
        })(BasicService);
        model.ContextService = ContextService;
        var CategoryService = (function (_super) {
            __extends(CategoryService, _super);
            function CategoryService(runner, retry) {
                if (retry === void 0) { retry = true; }
                _super.call(this, runner, retry);
                this.runner = runner;
            }
            CategoryService.prototype.initData = function () {
                _super.prototype.initData.call(this);
                if (angular.equals({}, this.responseData)) {
                    // empty, load all
                    var storage = this.runner.ItweetStorage.contextStore[this.contextToken()];
                    if (storage) {
                        //                    this.responseData.displayName = storage.displayname;
                        storage = storage.categories;
                        this.responseData.categories = Object.keys(storage).map(function (key) {
                            return storage[key];
                        });
                    }
                }
            };
            CategoryService.prototype.setupRequest = function () {
                return {
                    method: "GET",
                    url: this.runner.config.endpoint_categories +
                        this.runner.config.langISO + "/" +
                        this.contextToken()
                };
            };
            CategoryService.prototype.run = function (currentLoading) {
                var _this = this;
                if (currentLoading === void 0) { currentLoading = this.runner.$q.defer(); }
                var contextToken = this.contextToken();
                if (!contextToken) {
                    return this.runner.$q.reject("no token");
                }
                return _super.prototype.run.call(this, currentLoading).then(function () {
                    if (contextToken) {
                        if (!_this.runner.ItweetStorage.contextStore[contextToken]) {
                            _this.runner.ItweetStorage.contextStore[contextToken] = new model.Context();
                        }
                        _this.runner.ItweetStorage.contextStore[contextToken].categories = {};
                        angular.forEach(_this.responseData.categories, function (elem) {
                            _this.runner.ItweetStorage.contextStore[contextToken].categories[elem.id] = elem;
                        });
                    }
                });
            };
            CategoryService.prototype.getCategoryName = function (tweet) {
                if (tweet === void 0) { tweet = this.runner.ItweetStorage.currentTweet; }
                var token = itweet.model.Tweet.getCurrentContextToken(tweet, this.runner.ItweetStorage.user);
                if (token && this.runner.ItweetStorage.contextStore[token] && this.runner.ItweetStorage.contextStore[token].categories[tweet.refItemCategoryId]) {
                    return this.runner.ItweetStorage.contextStore[token].categories[tweet.refItemCategoryId].name;
                }
                else {
                    return "undefined";
                }
            };
            CategoryService.prototype.getSubcategoryName = function (tweet) {
                if (tweet === void 0) { tweet = this.runner.ItweetStorage.currentTweet; }
                //Base implementation has no subcategories
                return null;
            };
            return CategoryService;
        })(BasicService);
        model.CategoryService = CategoryService;
        var CategoryServiceRefresher = (function (_super) {
            __extends(CategoryServiceRefresher, _super);
            function CategoryServiceRefresher(runner, token) {
                _super.call(this, runner, false);
                this.runner = runner;
                this.token = token;
            }
            CategoryServiceRefresher.prototype.contextToken = function () {
                return this.token;
            };
            return CategoryServiceRefresher;
        })(CategoryService);
        var BrandServiceRefresher = (function (_super) {
            __extends(BrandServiceRefresher, _super);
            function BrandServiceRefresher(runner, token) {
                _super.call(this, runner, false);
                this.runner = runner;
                this.token = token;
            }
            BrandServiceRefresher.prototype.contextToken = function () {
                return this.token;
            };
            return BrandServiceRefresher;
        })(BrandService);
    })(model = itweet.model || (itweet.model = {}));
})(itweet || (itweet = {}));
