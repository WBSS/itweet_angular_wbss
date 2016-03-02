/// <reference path='../../_all.ts' />
module itweet.map {
	/**
	 * The main controller for the app. The controller:
	 * - retrieves and persists the model via the todoStorage service
	 * - exposes the model to the template and provides event handlers
	 */
	declare  var google;
	declare var rhb;

	interface MapScope extends itweet.AppControllerScope{
		position: any;
		manual: boolean;
		gmap: any;
		searchbox: any;
		markeroptions: any;
		crosshairoptions: any;
		circleoptions:any;
		currentTweetPos: any;
		vm: MapController;
	}
	export class MapController {

		private watch: any;
		public showTracks:boolean = false;
		public showMarkers:boolean = false;
		public trackData:any;
		public markersData:any;
		public streckenMarkers:any;
		public markerCluster:any;
		public loadOverlay:any
		// $inject annotation.
		// It provides $injector with information about dependencies to be injected into constructor
		// it is better to have it close to the constructor, because the parameters must match in count and type.
		// See http://docs.angularjs.org/guide/di
		public static $inject = [
			'$scope', '$state', 'gettextCatalog', 'uiGmapGoogleMapApi','uiGmapIsReady','$geolocation','ItweetStorage',
            '$timeout','ItweetNavigation','$rootScope','itweetNetwork','$mdDialog'
		];
		private center: any;

		// dependencies are injected via AngularJS $injector
		// controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
		constructor(
			private $scope: MapScope,
			private $state : angular.ui.IStateService,
			private gettextCatalog,
			private uiGmapGoogleMapApi,
			private uiGmapIsReady,
			private $geolocation,
			private ItweetStorage : itweet.model.StorageService,
			private $timeout: angular.ITimeoutService,
			private ItweetNavigation: itweet.navigation.NavigationService,
			private $rootScope: angular.IRootScopeService,
            public iTweetNetwork: itweet.model.ServiceFactory,
			private $mdDialog
        ) {
			$scope.vm = this;
			
			/* app ctrl */
			$scope.menu_parameters = {'fullscreen':false};
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
				zoom: 16 ,
				events:{
					bounds_changed: (map) => {
						var bounds =  map.getBounds();
						$scope.$apply(() => {$scope.searchbox.options.bounds = bounds;});
						if(this.center){
							map.panTo(this.center);
							this.center = undefined;
						}
					},
					zoom_changed:(map) => {
						console.log('get zoom---------------------->',map.zoom);
						this.getMarkers(map.zoom);
						//this.repaintClusters();
					},
					maptypeid_changed:(map)=>{
						this.$mdDialog.hide(this.loadOverlay);
					},
					center_changed: (map) => {
						$scope.manual = true;
						
					},
					click: (map) =>{
						$scope.$apply(() => {this.toggleFullscreen();});
					}
				},
				options: {disableDefaultUI: true,
					mapTypeId: ItweetStorage.user.mapType || "satellite",
					tilt: 0,
				},
				control: undefined,
				map: undefined
			};
			if(ItweetStorage.currentTweet.lat != 0){
				$scope.currentTweetPos = {latitude: ItweetStorage.currentTweet.lat,longitude:ItweetStorage.currentTweet.lng};
				if($scope.currentTweetPos.latitude){
					$scope.gmap.center.latitude = angular.copy($scope.currentTweetPos.latitude);
					$scope.gmap.center.longitude = angular.copy($scope.currentTweetPos.longitude);
					$scope.manual = true;
				}
			} else {
				this.updatePos();
			}
			
			$scope.markeroptions = {};
			$scope.crosshairoptions = {};
			this.streckenMarkers = new Array();
			
			
			uiGmapGoogleMapApi.then((maps) => {
				$scope.markeroptions.icon = {
					anchor: new google.maps.Point(18, 18),
					origin: new google.maps.Point(0, 0),
					scaledSize: new google.maps.Size(36, 36),
					url: 'img/circle.png'
				};
			});
			uiGmapIsReady.promise(1).then((instances) => {
				instances.forEach((inst) => {
					$scope.gmap.map = inst.map;
					console.log('map loaded');
					if(ItweetStorage.currentTweet.lat != 0){
						$scope.currentTweetPos = {latitude: ItweetStorage.currentTweet.lat,longitude:ItweetStorage.currentTweet.lng};
						
						if($scope.currentTweetPos.latitude){
							$scope.gmap.map.setCenter({lat: $scope.currentTweetPos.latitude, lng: $scope.currentTweetPos.longitude});
							$scope.manual = true;
						}
						console.log('MAP LOADED', $scope.gmap.map);
					}
				});
			});
			$scope.circleoptions = {
				stroke:{
					opacity:0
				},
				fill:{
					opacity:0.5,
					color:"#4284f4"
				}
			}
			$scope.searchbox = { template:'map/map.search.html',options:{}, events:{
				places_changed: (searchBox) => {
					var places = searchBox.getPlaces();
					angular.forEach(places, (place) => {
						ItweetStorage.currentTweet.address = place.formatted_address;
						var pos = place.geometry.location;
						this.$scope.gmap.map.panTo(pos);
						
					});

				}
			}};
			this.startGeo();
            $scope.$on("pause", () => {this.stopGeo()});
            $scope.$on("resume", () => {this.startGeo()});
			
			$scope.$watch('position',  (newValue: any, oldValue)  => {
				if(newValue){
					let coords = newValue.coords;
					
					this.updatePos();
					var currentTweet = this.ItweetStorage.currentTweet;
					currentTweet.latDevice = coords.latitude;
					currentTweet.lngDevice = coords.longitude;
					currentTweet.eleDevice = coords.altitude;
				}
			}, true);
			
			$scope.$watch("gmap.control",(newValue,oldValue) =>{
				if(newValue) {
					this.resizeMap();
				}
			});
			$scope.$on("$destroy", () =>{
				this.ItweetStorage.currentTweet.manual = this.$scope.manual?1:0;
				this.geocode();
                this.stopGeo();
			});
		}

		updatePos(){
			
			if(!this.$scope.manual && this.$scope.position && this.$scope.position.coords && this.$scope.gmap.map){
				let coords = this.$scope.position.coords;
				this.$scope.gmap.map.setCenter({
					lat: coords.latitude,
					lng: coords.longitude
				});
				
				
			}
		}

        stopGeo(){
            if(this.watch){
                this.watch.clearWatch();
            }
        }

        startGeo(){
            this.stopGeo();
            /*this.watch = this.$geolocation.watchPosition({
                timeout: 60000,
                enableHighAccuracy: true
            });*/
        }

		zoomPlus() {
			this.$scope.gmap.zoom = Math.min(this.$scope.gmap.zoom + 1,20);
		}

		zoomMinus() {
			this.$scope.gmap.zoom = Math.max(this.$scope.gmap.zoom - 1,4);
		}

		myPosition() {
			this.$scope.position = this.$geolocation.position;
			this.$scope.manual = false;
			this.updatePos();
		}

		toggleMap() {
			this.loadOverlay = this.$mdDialog.show({
                template: "<md-progress-circular md-mode=\"indeterminate\"></md-progress-circular>"
            })
			switch(this.$scope.gmap.options.mapTypeId){
				case google.maps.MapTypeId.SATELLITE:
					this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.HYBRID;
					break;
				case google.maps.MapTypeId.HYBRID:
					this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.TERRAIN;
					break;
				case google.maps.MapTypeId.TERRAIN:
					this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.ROADMAP;
					break;
				default :
					this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.SATELLITE;
			}
			this.ItweetStorage.user.mapType = this.$scope.gmap.options.mapTypeId;

		}

		toggleTracks(){
			if(this.showTracks == false){
				
				
			 	this.trackData= new google.maps.Data();
				 this.trackData.setStyle({
					strokeColor: '#ff001a',
					strokeWeight: 4
				});
				this.trackData.addGeoJson(rhb.streckennetz);
				
				this.trackData.setMap(this.$scope.gmap.map);
				
			}else {
				console.log('hide');
				this.trackData.setMap(null);
			}
			this.showTracks = !this.showTracks;
		}

		getMarkers(zoomLevel){
			if(!this.showMarkers) return;
			
			let mod = null;
			
			if(this.markersData) this.markersData.setMap(null);
			if(zoomLevel<13) return;
			if(zoomLevel>14) mod = 5;
			if(zoomLevel>16) mod = 4;
			if(zoomLevel>17) mod = 2;
			if(zoomLevel>18) mod = 1;
			
			console.log('MOD',mod);

			this.markersData = new google.maps.Data();
			let myMarkers = {
				type: rhb.markers.type,
				features: rhb.markers.features.filter((elem,index,array) => index % mod == 0)				
			}
			
			this.streckenMarkers = this.markersData.addGeoJson(myMarkers)
			
			this.markersData.addListener('click', (event) => {
				var infowindow = new google.maps.InfoWindow({
					content: event.feature.getProperty('name')
				});
				infowindow.setPosition(event.feature.getGeometry().get());
				infowindow.setOptions({pixelOffset: new google.maps.Size(0,-30)});
				infowindow.open(this.$scope.gmap.map);
  			});
			this.markersData.setMap(this.$scope.gmap.map);
			
		}

		toggleMarkers(){
			if(this.showMarkers == false){
				this.showMarkers = true;
				this.getMarkers(this.$scope.gmap.map.zoom);
			}else {
				console.log('hide');
				this.showMarkers = false;
				this.markersData.setMap(null);
			}
		}

		hideDialog(){
			console.log('finished2222');
			this.$mdDialog.hide();
		}

		geocode(){
            var tweet = this.ItweetStorage.currentTweet;
            tweet.location = "";
			tweet.lat = this.$scope.gmap.map.getCenter().lat();
			tweet.lng = this.$scope.gmap.map.getCenter().lng();
            this.uiGmapGoogleMapApi.then((maps) => {
				var geocoder = new google.maps.Geocoder();
				var latlng = new google.maps.LatLng(tweet.lat,tweet.lng);
				geocoder.geocode({'latLng': latlng}, (results, status) => {
					if (status == google.maps.GeocoderStatus.OK) {
						if (results[0]) {
							this.$rootScope.$apply(() => {
								//tweet.location = results[0].formatted_address
								var parts = {};
								results[0].address_components.forEach( (value) => {
									value.types.forEach((type) => {
										parts[type] = value.long_name;
									})
								});
								tweet.location = (parts["locality"] || "") + ", " +(parts["route"]||"") + " " + (parts["street_number"]||"");
							});

						}
					}

				});
			});
		}

		resizeMap(){
			
			if (this.$scope.gmap.map.control.getGMap ){
				var map = this.$scope.gmap.map.ctrl.getGMap();
				 this.center = map.getCenter();
				google.maps.event.trigger(map, 'resize');
			}
		}

		toggleFullscreen(){
				this.$scope.searchbox.options.visible = this.$scope.menu_parameters.fullscreen;
				this.$scope.menu_parameters.fullscreen = !this.$scope.menu_parameters.fullscreen;
		}
	}

	angular.module('itweet.map', ['gettext','ui.router', 'ngMaterial', 'uiGmapgoogle-maps','ngGeolocation','clustered.map'])
		.controller('MapController', MapController)
		.config(
		["$stateProvider", "$urlRouterProvider", // more dependencies
			($stateProvider, $urlRouterProvider) =>
			{
				$stateProvider
					.state('map', {
						url: "/map",
						templateUrl: "ext_rhb/map/map.html",
						controller: 'MapController'
					});

			}
		]).config(function(uiGmapGoogleMapApiProvider) {
			uiGmapGoogleMapApiProvider.configure({

				v: '3.21',
				libraries: 'places',
				language:document.lang
			});
		});


}
