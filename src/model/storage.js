/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var model;
    (function (model) {
        var StorageService = (function () {
            function StorageService($localStorage, ItweetConfig, $q, $log) {
                this.$localStorage = $localStorage;
                this.ItweetConfig = ItweetConfig;
                this.$q = $q;
                this.$log = $log;
                this.initial = true;
                this.resetable = [];
                this.user = $localStorage.user || new model.User();
                this.currentTweet = new model.Tweet();
                this.contextStore = $localStorage.contextStore || {};
                this.brandStore = $localStorage.brandStore || {};
                this.allTweets = $localStorage.allTweets || {};
                this.metdataStore = $localStorage.metadata || {};
                if (!this.user.deviceid) {
                    this.user.deviceid = StorageService.guid();
                }
                $localStorage.user = this.user;
                $localStorage.allTweets = this.allTweets;
                $localStorage.metadata = this.metdataStore;
                $localStorage.currentTweet = this.currentTweet;
                $localStorage.contextStore = this.contextStore;
                $localStorage.brandStore = this.brandStore;
                model.Tweet.updateWithConfig(this.currentTweet, ItweetConfig, this.user);
                this.cleanupFiles();
            }
            StorageService.prototype.shouldDismissRegister = function () {
                var resp = false;
                if (this.initial && this.hasRegistered()) {
                    resp = true;
                    this.initial = false; //initial muss immer zurück gesetzt werden
                }
                return resp;
            };
            StorageService.prototype.hasRegistered = function () {
                return (this.user.email != undefined || this.user["userID"] != undefined);
            };
            /* MEDIA MANAGEMENT */
            StorageService.prototype.setImage = function (index, url) {
                this.setItweetMediaElement(index + 1, url);
            };
            StorageService.prototype.images = function () {
                var _this = this;
                return [1, 2, 3].map(function (elem) {
                    return _this.currentTweet.mediaStore[elem] ? _this.currentTweet.mediaStore[elem].url : undefined;
                });
            };
            StorageService.prototype.getAudio = function () {
                var elem = this.currentTweet.mediaStore[0];
                return elem ? elem.url : undefined;
            };
            StorageService.prototype.deleteHash = function (realindex) {
                var _this = this;
                return new this.$q(function (resolve, reject) {
                    if (_this.currentTweet.mediaStore[realindex]) {
                        var media = _this.currentTweet.mediaStore[realindex];
                        window.resolveLocalFileSystemURL(media.url, function (fileEntry) {
                            fileEntry.remove();
                            resolve();
                        }, reject);
                        delete _this.currentTweet.mediaStore[realindex];
                    }
                    else {
                        resolve();
                    }
                });
            };
            StorageService.prototype.setItweetMediaElement = function (realindex, url) {
                this.deleteHash(realindex);
                if (url) {
                    var hash = StorageService.hashFromUrl(url);
                    var ext = StorageService.extFromUrl(url);
                    var mime = StorageService.mimeTypeFromExt[ext];
                    this.currentTweet.mediaStore[realindex] = { url: url, sha1: hash, mime: mime };
                }
            };
            StorageService.prototype.setAudio = function (url) {
                this.setItweetMediaElement(0, url);
            };
            StorageService.extFromUrl = function (url) {
                return (url = url.substr(1 + url.lastIndexOf("/")).split('?')[0]).split(".")[1];
            };
            StorageService.hashFromUrl = function (url) {
                return (url = url.substr(1 + url.lastIndexOf("/")).split('?')[0]).split(".")[0];
            };
            // TWEET MANAGEMENT //
            StorageService.prototype.newTweet = function () {
                this.currentTweet = new model.Tweet();
                model.Tweet.updateWithConfig(this.currentTweet, this.ItweetConfig, this.user);
            };
            StorageService.prototype.deleteTweet = function (tweet) {
                delete this.allTweets[tweet.guid];
            };
            StorageService.prototype.saveTweet = function (tweet) {
                tweet.save = true;
                tweet.dateAdded = new Date().getTime();
                this.allTweets[tweet.guid] = angular.copy(tweet);
            };
            StorageService.prototype.hasTweetsSaved = function () {
                var resp = Object.keys(this.allTweets).length > 0;
                //            this.$log.debug("items in store: " + resp);
                return resp;
            };
            StorageService.prototype.clearCache = function () {
                angular.copy({}, this.brandStore);
                angular.copy({}, this.contextStore);
                this.resetable.forEach(function (elem) { elem.reset(); });
            };
            StorageService.prototype.cleanupFiles = function () {
                var _this = this;
                /* NO SUPPORT IN BROWSER */
                if (typeof (LocalFileSystem) === 'undefined') {
                    return;
                }
                var allHash = {};
                Object.keys(this.allTweets).forEach(function (key) {
                    var tweet = _this.allTweets[key];
                    Object.keys(tweet.mediaStore).forEach(function (mediakey) {
                        var element = tweet.mediaStore[mediakey];
                        allHash[element.sha1] = true;
                    });
                });
                new this.$q(function (resolve, reject) {
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                        fileSystem.root.getDirectory(_this.ItweetConfig.assets_storage_folder, {
                            create: true
                        }, function (directory) {
                            var directoryReader = directory.createReader();
                            directoryReader.readEntries(function (entries) {
                                entries.forEach(function (entry) {
                                    var hash = StorageService.hashFromUrl(entry.nativeURL);
                                    if (allHash[hash]) {
                                        _this.$log.debug("keep" + entry);
                                    }
                                    else {
                                        _this.$log.debug("remove" + entry);
                                        entry.remove(function () { _this.$log.debug("remove done)" + entry); }, function (error) {
                                            _this.$log.error("remove failed)" + entry + " " + error);
                                        });
                                    }
                                });
                                resolve();
                            }, function (error) {
                                reject(error);
                            });
                        });
                    }, function (error) {
                        reject(error);
                    });
                });
            };
            StorageService.guid = function () {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            };
            StorageService.mimeTypeFromExt = {
                jpg: "image/jpeg",
                wav: "audio/wav",
                aac: "audio/aac"
            };
            StorageService.$inject = [
                '$localStorage', 'ItweetConfig', '$q', '$log'
            ];
            return StorageService;
        })();
        model.StorageService = StorageService;
        angular.module("itweet.storage", ['ngStorage']).service("ItweetStorage", StorageService);
    })(model = itweet.model || (itweet.model = {}));
})(itweet || (itweet = {}));
