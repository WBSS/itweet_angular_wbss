/// <reference path='../../_all.ts' />
var itweet;
(function (itweet) {
    var map;
    (function (map_1) {
        var MapController = (function () {
            // dependencies are injected via AngularJS $injector
            // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
            function MapController($scope, $state, gettextCatalog, uiGmapGoogleMapApi, uiGmapIsReady, $geolocation, ItweetStorage, $timeout, ItweetNavigation, $rootScope, iTweetNetwork, $mdDialog) {
                var _this = this;
                this.$scope = $scope;
                this.$state = $state;
                this.gettextCatalog = gettextCatalog;
                this.uiGmapGoogleMapApi = uiGmapGoogleMapApi;
                this.uiGmapIsReady = uiGmapIsReady;
                this.$geolocation = $geolocation;
                this.ItweetStorage = ItweetStorage;
                this.$timeout = $timeout;
                this.ItweetNavigation = ItweetNavigation;
                this.$rootScope = $rootScope;
                this.iTweetNetwork = iTweetNetwork;
                this.$mdDialog = $mdDialog;
                this.showTracks = false;
                this.showMarkers = false;
                $scope.vm = this;
                /* app ctrl */
                $scope.menu_parameters = { 'fullscreen': false };
                $scope.menu_parameters.title = gettextCatalog.getString('location_title');
                $scope.storageService = ItweetStorage;
                $scope.navigationService = ItweetNavigation;
                $scope.brand = iTweetNetwork.brandService;
                //App Navigation Flow
                ItweetStorage.initial = false;
                $scope.manual = false;
                $scope.position = $geolocation.position;
                this.showTracks = false;
                this.showMarkers = false;
                this.streckenMarkers = new Array();
                $scope.gmap = {
                    //center: { latitude: 47.3738203, longitude: 8.5357981 },
                    center: { latitude: 46.854806418346406, longitude: 9.530209799110247 },
                    zoom: 16,
                    events: {
                        bounds_changed: function (map) {
                            var bounds = map.getBounds();
                            $scope.$apply(function () { $scope.searchbox.options.bounds = bounds; });
                            if (_this.center) {
                                map.panTo(_this.center);
                                _this.center = undefined;
                            }
                        },
                        zoom_changed: function (map) {
                            console.log('get zoom---------------------->', map.zoom);
                            _this.getMarkers(map.zoom);
                            //this.repaintClusters();
                        },
                        maptypeid_changed: function (map) {
                            _this.$mdDialog.hide(_this.loadOverlay);
                        },
                        center_changed: function (map) {
                            $scope.manual = true;
                        },
                        click: function (map) {
                            $scope.$apply(function () { _this.toggleFullscreen(); });
                        }
                    },
                    options: { disableDefaultUI: true,
                        mapTypeId: ItweetStorage.user.mapType || "satellite",
                        tilt: 0
                    },
                    control: undefined,
                    map: undefined
                };
                if (ItweetStorage.currentTweet.lat != 0) {
                    $scope.currentTweetPos = { latitude: ItweetStorage.currentTweet.lat, longitude: ItweetStorage.currentTweet.lng };
                    if ($scope.currentTweetPos.latitude) {
                        $scope.gmap.center.latitude = angular.copy($scope.currentTweetPos.latitude);
                        $scope.gmap.center.longitude = angular.copy($scope.currentTweetPos.longitude);
                        $scope.manual = true;
                    }
                }
                else {
                    this.updatePos();
                }
                $scope.markeroptions = {};
                $scope.crosshairoptions = {};
                this.streckenMarkers = new Array();
                uiGmapGoogleMapApi.then(function (maps) {
                    $scope.markeroptions.icon = {
                        anchor: new google.maps.Point(18, 18),
                        origin: new google.maps.Point(0, 0),
                        scaledSize: new google.maps.Size(36, 36),
                        url: 'img/circle.png'
                    };
                });
                uiGmapIsReady.promise(1).then(function (instances) {
                    instances.forEach(function (inst) {
                        $scope.gmap.map = inst.map;
                        console.log('map loaded');
                        if (ItweetStorage.currentTweet.lat != 0) {
                            $scope.currentTweetPos = { latitude: ItweetStorage.currentTweet.lat, longitude: ItweetStorage.currentTweet.lng };
                            if ($scope.currentTweetPos.latitude) {
                                $scope.gmap.map.setCenter({ lat: $scope.currentTweetPos.latitude, lng: $scope.currentTweetPos.longitude });
                                $scope.manual = true;
                            }
                            console.log('MAP LOADED', $scope.gmap.map);
                        }
                    });
                });
                $scope.circleoptions = {
                    stroke: {
                        opacity: 0
                    },
                    fill: {
                        opacity: 0.5,
                        color: "#4284f4"
                    }
                };
                $scope.searchbox = { template: 'map/map.search.html', options: {}, events: {
                        places_changed: function (searchBox) {
                            var places = searchBox.getPlaces();
                            angular.forEach(places, function (place) {
                                ItweetStorage.currentTweet.address = place.formatted_address;
                                var pos = place.geometry.location;
                                _this.$scope.gmap.map.panTo(pos);
                            });
                        }
                    } };
                this.startGeo();
                $scope.$on("pause", function () { _this.stopGeo(); });
                $scope.$on("resume", function () { _this.startGeo(); });
                $scope.$watch('position', function (newValue, oldValue) {
                    if (newValue) {
                        var coords = newValue.coords;
                        _this.updatePos();
                        var currentTweet = _this.ItweetStorage.currentTweet;
                        currentTweet.latDevice = coords.latitude;
                        currentTweet.lngDevice = coords.longitude;
                        currentTweet.eleDevice = coords.altitude;
                    }
                }, true);
                $scope.$watch("gmap.control", function (newValue, oldValue) {
                    if (newValue) {
                        _this.resizeMap();
                    }
                });
                $scope.$on("$destroy", function () {
                    _this.ItweetStorage.currentTweet.manual = _this.$scope.manual ? 1 : 0;
                    _this.geocode();
                    _this.stopGeo();
                });
            }
            MapController.prototype.updatePos = function () {
                if (!this.$scope.manual && this.$scope.position && this.$scope.position.coords && this.$scope.gmap.map) {
                    var coords = this.$scope.position.coords;
                    this.$scope.gmap.map.setCenter({
                        lat: coords.latitude,
                        lng: coords.longitude
                    });
                }
            };
            MapController.prototype.stopGeo = function () {
                if (this.watch) {
                    this.watch.clearWatch();
                }
            };
            MapController.prototype.startGeo = function () {
                this.stopGeo();
                /*this.watch = this.$geolocation.watchPosition({
                    timeout: 60000,
                    enableHighAccuracy: true
                });*/
            };
            MapController.prototype.zoomPlus = function () {
                this.$scope.gmap.zoom = Math.min(this.$scope.gmap.zoom + 1, 20);
            };
            MapController.prototype.zoomMinus = function () {
                this.$scope.gmap.zoom = Math.max(this.$scope.gmap.zoom - 1, 4);
            };
            MapController.prototype.myPosition = function () {
                this.$scope.position = this.$geolocation.position;
                this.$scope.manual = false;
                this.updatePos();
            };
            MapController.prototype.toggleMap = function () {
                this.loadOverlay = this.$mdDialog.show({
                    template: "<md-progress-circular md-mode=\"indeterminate\"></md-progress-circular>"
                });
                switch (this.$scope.gmap.options.mapTypeId) {
                    case google.maps.MapTypeId.SATELLITE:
                        this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.HYBRID;
                        break;
                    case google.maps.MapTypeId.HYBRID:
                        this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.TERRAIN;
                        break;
                    case google.maps.MapTypeId.TERRAIN:
                        this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.ROADMAP;
                        break;
                    default:
                        this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.SATELLITE;
                }
                this.ItweetStorage.user.mapType = this.$scope.gmap.options.mapTypeId;
            };
            MapController.prototype.toggleTracks = function () {
                if (this.showTracks == false) {
                    this.trackData = new google.maps.Data();
                    this.trackData.setStyle({
                        strokeColor: '#ff001a',
                        strokeWeight: 4
                    });
                    this.trackData.addGeoJson(rhb.streckennetz);
                    this.trackData.setMap(this.$scope.gmap.map);
                }
                else {
                    console.log('hide');
                    this.trackData.setMap(null);
                }
                this.showTracks = !this.showTracks;
            };
            MapController.prototype.getMarkers = function (zoomLevel) {
                var _this = this;
                if (!this.showMarkers)
                    return;
                var mod = null;
                if (this.markersData)
                    this.markersData.setMap(null);
                if (zoomLevel < 13)
                    return;
                if (zoomLevel > 14)
                    mod = 5;
                if (zoomLevel > 16)
                    mod = 4;
                if (zoomLevel > 17)
                    mod = 2;
                if (zoomLevel > 18)
                    mod = 1;
                console.log('MOD', mod);
                this.markersData = new google.maps.Data();
                var myMarkers = {
                    type: rhb.markers.type,
                    features: rhb.markers.features.filter(function (elem, index, array) { return index % mod == 0; })
                };
                this.streckenMarkers = this.markersData.addGeoJson(myMarkers);
                this.markersData.addListener('click', function (event) {
                    var infowindow = new google.maps.InfoWindow({
                        content: event.feature.getProperty('name')
                    });
                    infowindow.setPosition(event.feature.getGeometry().get());
                    infowindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
                    infowindow.open(_this.$scope.gmap.map);
                });
                this.markersData.setMap(this.$scope.gmap.map);
            };
            MapController.prototype.toggleMarkers = function () {
                if (this.showMarkers == false) {
                    this.showMarkers = true;
                    this.getMarkers(this.$scope.gmap.map.zoom);
                }
                else {
                    console.log('hide');
                    this.showMarkers = false;
                    this.markersData.setMap(null);
                }
            };
            MapController.prototype.hideDialog = function () {
                console.log('finished2222');
                this.$mdDialog.hide();
            };
            MapController.prototype.geocode = function () {
                var _this = this;
                var tweet = this.ItweetStorage.currentTweet;
                tweet.location = "";
                tweet.lat = this.$scope.gmap.map.getCenter().lat();
                tweet.lng = this.$scope.gmap.map.getCenter().lng();
                this.uiGmapGoogleMapApi.then(function (maps) {
                    var geocoder = new google.maps.Geocoder();
                    var latlng = new google.maps.LatLng(tweet.lat, tweet.lng);
                    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                _this.$rootScope.$apply(function () {
                                    //tweet.location = results[0].formatted_address
                                    var parts = {};
                                    results[0].address_components.forEach(function (value) {
                                        value.types.forEach(function (type) {
                                            parts[type] = value.long_name;
                                        });
                                    });
                                    tweet.location = (parts["locality"] || "") + ", " + (parts["route"] || "") + " " + (parts["street_number"] || "");
                                });
                            }
                        }
                    });
                });
            };
            MapController.prototype.resizeMap = function () {
                if (this.$scope.gmap.map.control.getGMap) {
                    var map = this.$scope.gmap.map.ctrl.getGMap();
                    this.center = map.getCenter();
                    google.maps.event.trigger(map, 'resize');
                }
            };
            MapController.prototype.toggleFullscreen = function () {
                this.$scope.searchbox.options.visible = this.$scope.menu_parameters.fullscreen;
                this.$scope.menu_parameters.fullscreen = !this.$scope.menu_parameters.fullscreen;
            };
            // $inject annotation.
            // It provides $injector with information about dependencies to be injected into constructor
            // it is better to have it close to the constructor, because the parameters must match in count and type.
            // See http://docs.angularjs.org/guide/di
            MapController.$inject = [
                '$scope', '$state', 'gettextCatalog', 'uiGmapGoogleMapApi', 'uiGmapIsReady', '$geolocation', 'ItweetStorage',
                '$timeout', 'ItweetNavigation', '$rootScope', 'itweetNetwork', '$mdDialog'
            ];
            return MapController;
        })();
        map_1.MapController = MapController;
        angular.module('itweet.map', ['gettext', 'ui.router', 'ngMaterial', 'uiGmapgoogle-maps', 'ngGeolocation', 'clustered.map'])
            .controller('MapController', MapController)
            .config(["$stateProvider", "$urlRouterProvider",
            function ($stateProvider, $urlRouterProvider) {
                $stateProvider
                    .state('map', {
                    url: "/map",
                    templateUrl: "ext_rhb/map/map.html",
                    controller: 'MapController'
                });
            }
        ]).config(function (uiGmapGoogleMapApiProvider) {
            uiGmapGoogleMapApiProvider.configure({
                v: '3.21',
                libraries: 'places',
                language: document.lang
            });
        });
    })(map = itweet.map || (itweet.map = {}));
})(itweet || (itweet = {}));
