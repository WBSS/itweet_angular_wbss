/// <reference path='../../_all.ts' />
var itweet;
(function (itweet) {
    var category;
    (function (category) {
        var RhbLocationController = (function () {
            // dependencies are injected via AngularJS $injector
            // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
            function RhbLocationController($scope, $previousState, $state, gettextCatalog, network, ItweetStorage, $stateParams, itweetNavigation, $window) {
                var _this = this;
                this.$scope = $scope;
                this.$previousState = $previousState;
                this.$state = $state;
                this.gettextCatalog = gettextCatalog;
                this.network = network;
                this.ItweetStorage = ItweetStorage;
                this.$stateParams = $stateParams;
                this.itweetNavigation = itweetNavigation;
                this.$window = $window;
                this.locationDisabled = false;
                this.loaded = false;
                $scope.networkServiceHolder['primary'] = network.metadataService;
                $scope.vm = this;
                $scope.menu_parameters.title = gettextCatalog.getString("location_title");
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = 'back';
                $scope.networkServiceHolder['primary'] = network.metadataService;
                $scope.$watch(function () { return network.metadataService.getResponseData(); }, function (newValue, oldValue) {
                    _this.updateByMeta(newValue);
                });
                $scope.vm.searchLocationText = "";
                $scope.vm.locationDisabled = false;
                $scope.vm.searchTrackText = "";
                $scope.vm.currentTrackPosition = new Array("", "");
                if (this.$scope.storageService.currentTweet.itemQs.refLocationId) {
                    console.log('set storaged location', this.$scope.storageService.currentTweet.itemQs.refLocationName);
                    $scope.vm.searchLocationText = this.$scope.storageService.currentTweet.itemQs.refLocationName;
                    this.selectedLoaction = {
                        id: this.$scope.storageService.currentTweet.itemQs.refLocationId,
                        name: this.$scope.storageService.currentTweet.itemQs.refLocationName
                    };
                }
                if (this.$scope.storageService.currentTweet.itemQs.refTrackId) {
                    $scope.vm.searchTrackText = this.$scope.storageService.currentTweet.itemQs.refTrackName;
                    this.selectedTrack = {
                        id: this.$scope.storageService.currentTweet.itemQs.refTrackId,
                        name: this.$scope.storageService.currentTweet.itemQs.refTrackName
                    };
                }
                if (this.$scope.storageService.currentTweet.itemQs.trackPosition) {
                    var _pos = this.$scope.storageService.currentTweet.itemQs.trackPosition.toString();
                    $scope.vm.currentTrackPosition = _pos.split(".");
                }
                /* RHB FIX: FIXME REFACTOR */
                $scope.$watch(function () { return network.contextService.getResponseData(); }, function (data) {
                    if (data && data.length == 1) {
                        var context = data[0];
                        _this.$scope.storageService.currentTweet.contextToken = context.contextToken;
                    }
                });
            }
            RhbLocationController.prototype.updateByMeta = function (meta) {
                if (meta === void 0) { meta = this.network.metadataService.getResponseData(); }
                if (meta.locations) {
                    this.locations = new Array();
                    for (var i = 0; i < meta.locations.length; i++) {
                        var newLocation = {
                            id: meta.locations[i].id,
                            name: meta.locations[i].name,
                            query: meta.locations[i].name.toLocaleLowerCase()
                        };
                        this.locations.push(newLocation);
                    }
                }
                if (meta.locations) {
                    this.loaded = true;
                    this.tracks = new Array();
                    for (var i = 0; i < meta.tracks.length; i++) {
                        var newTrack = {
                            id: meta.tracks[i].id,
                            name: meta.tracks[i].name,
                            query: meta.tracks[i].name.toLocaleLowerCase()
                        };
                        this.tracks.push(newTrack);
                    }
                }
            };
            RhbLocationController.prototype.selectedLoactionChange = function (location) {
                console.log('change location');
                if (typeof location != 'undefined') {
                    this.$window.document.activeElement.blur();
                    this.selectedLoaction = location;
                }
                else
                    this.selectedLoaction = null;
            };
            RhbLocationController.prototype.selectedTrackChange = function (track) {
                console.log('change track', track);
                if (typeof track != 'undefined') {
                    this.selectedTrack = track;
                    this.$window.document.activeElement.blur();
                }
                else
                    this.selectedTrack = null;
            };
            RhbLocationController.prototype.querySearch = function (query, list) {
                var results = list.filter(this.createFilterFor(query));
                var t = results.slice(0, 12);
                return t;
            };
            RhbLocationController.prototype.createFilterFor = function (q) {
                var query = q.toLowerCase();
                return function filterFn(item) {
                    var i = (item.query.indexOf(query) === 0);
                    return i;
                };
            };
            RhbLocationController.prototype.getFullText = function (item) {
                return item.name.toString();
            };
            RhbLocationController.prototype.save = function () {
                if (this.selectedLoaction) {
                    console.log('save location', this.selectedLoaction);
                    this.$scope.storageService.currentTweet.itemQs.refLocationId = this.selectedLoaction.id;
                    this.$scope.storageService.currentTweet.itemQs.refLocationName = this.selectedLoaction.name;
                }
                else {
                    this.$scope.storageService.currentTweet.itemQs.refLocationId = null;
                    this.$scope.storageService.currentTweet.itemQs.refLocationName = null;
                }
                if (this.selectedTrack) {
                    this.$scope.storageService.currentTweet.itemQs.refTrackId = this.selectedTrack.id;
                    this.$scope.storageService.currentTweet.itemQs.refTrackName = this.selectedTrack.name;
                }
                else {
                    this.$scope.storageService.currentTweet.itemQs.refTrackId = null;
                    this.$scope.storageService.currentTweet.itemQs.refTrackName = null;
                }
                if (this.currentTrackPosition[0] != "" || this.currentTrackPosition[1] != "") {
                    if (this.currentTrackPosition[1] == "")
                        this.currentTrackPosition[1] = "0";
                    if (this.currentTrackPosition[0] == "")
                        this.currentTrackPosition[0] = "0";
                    this.$scope.storageService.currentTweet.itemQs.trackPosition = +(this.currentTrackPosition[0] + "." + this.currentTrackPosition[1]);
                }
                else
                    this.$scope.storageService.currentTweet.itemQs.trackPosition = null;
                this.$scope.navigationService.next();
            };
            RhbLocationController.$inject = [
                '$scope', '$previousState', '$state', 'gettextCatalog', 'itweetNetwork', 'ItweetStorage', '$stateParams', 'ItweetNavigation', '$window'
            ];
            return RhbLocationController;
        })();
        category.RhbLocationController = RhbLocationController;
        angular.module('itweet.rhb.location', ['gettext', 'ui.router', 'ngMaterial'])
            .controller('RhbLocationController', RhbLocationController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.rhb_location', {
                    url: "/locationrhb",
                    templateUrl: "ext_rhb/location/location.html",
                    controller: 'RhbLocationController'
                });
            }
        ]);
        ;
    })(category = itweet.category || (itweet.category = {}));
})(itweet || (itweet = {}));
