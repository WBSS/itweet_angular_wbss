/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var photo;
    (function (photo) {
        var PhotoController = (function () {
            function PhotoController($scope, gettextCatalog, itweetMedia, $mdToast, $mdBottomSheet, $log, $q, config, $timeout) {
                var _this = this;
                this.$scope = $scope;
                this.gettextCatalog = gettextCatalog;
                this.itweetMedia = itweetMedia;
                this.$mdToast = $mdToast;
                this.$mdBottomSheet = $mdBottomSheet;
                this.$log = $log;
                this.$q = $q;
                this.config = config;
                this.$timeout = $timeout;
                this.entries_with_image = [];
                this.entries_without_image = [];
                $scope.vm = this;
                this.$scope.networkServiceHolder['primary'] = { loading: false };
                $scope.mediaService = itweetMedia.mediaService;
                $scope.menu_parameters.title = gettextCatalog.getString('photo_title');
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = 'back';
                $scope.$watch(function ($scope) { $log.info("watch called"); return $scope.mediaService.dataImages(); }, function (newValue, oldValue) {
                    _this.updatePhotos(newValue);
                }, true);
                this.entries_with_image = [
                    { name: gettextCatalog.getString('photo_action_sheet_button_1'), icon: 'share-arrow' },
                    { name: gettextCatalog.getString('photo_action_sheet_button_2'), icon: 'upload' },
                    { name: gettextCatalog.getString('photo_action_sheet_button_delete'), icon: 'copy' },
                    { name: gettextCatalog.getString('photo_action_sheet_button_cancel'), icon: 'print' }
                ];
                this.entries_without_image = [
                    { name: gettextCatalog.getString('photo_action_sheet_button_1'), icon: 'share-arrow' },
                    { name: gettextCatalog.getString('photo_action_sheet_button_2'), icon: 'upload' },
                    { name: gettextCatalog.getString('photo_action_sheet_button_cancel'), icon: 'print' }
                ];
            }
            PhotoController.prototype.updatePhotos = function (newValue) {
                var _this = this;
                if (newValue === void 0) { newValue = this.$scope.mediaService.dataImages(); }
                this.$scope.images = newValue.map(function (value, index, array) { return { index: index, value: value || 'img/camera/camera_cleargrey.png' }; });
                this.$timeout(function () { _this.$scope.$digest(); }, 0, true);
            };
            PhotoController.prototype.addPhoto = function (index) {
                var _this = this;
                this.index = index;
                this.$log.debug("addPhoto()");
                var entry = this.itweetMedia.mediaService.dataImages()[index];
                var entries = entry ? this.entries_with_image : this.entries_without_image;
                var ourData = {
                    title: this.gettextCatalog.getString("photo_action_sheet_title"),
                    entries: entries
                };
                var bottomSheetPromise = this.$mdBottomSheet.show({
                    templateUrl: 'app/bottom_sheet.tpl.html',
                    controller: itweet.BottomSheetController,
                    locals: { data: ourData },
                    bindToController: false
                });
                bottomSheetPromise.then(function (index) {
                    _this.$log.debug("index(" + index + ")");
                    switch (index) {
                        case true: {
                            console.log('show library');
                            _this.showLibrary();
                            break;
                        }
                        case 1: {
                            _this.showCamera();
                            break;
                        }
                        case 2: {
                            if (entry) {
                                _this.itweetMedia.mediaService.deleteImage(_this.index);
                                _this.$timeout(function () { _this.updatePhotos(); }, 0, true);
                            }
                            break;
                        }
                        default: {
                            console.log("default case");
                        }
                    }
                })
                    .finally(function () {
                    _this.$log.debug("finally ");
                    _this.$mdBottomSheet.hide();
                });
            };
            PhotoController.prototype.showCamera = function () {
                var _this = this;
                navigator.camera.getPicture(function (val) { _this.onSuccess(val); }, function (val) { _this.onFail(val); }, { quality: 50,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.CAMERA,
                    targetWith: this.config.image_width,
                    targetHeight: this.config.image_height,
                    encodingType: Camera.EncodingType.JPEG,
                    correctOrientation: true
                });
            };
            PhotoController.prototype.showLibrary = function () {
                var _this = this;
                console.log('get library', navigator.camera);
                navigator.camera.getPicture(function (val) { _this.onSuccess(val); }, function (val) { _this.onFail(val); }, { quality: 50,
                    destinationType: Camera.DestinationType.FILE_URI,
                    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                    encodingType: Camera.EncodingType.JPEG,
                    targetWith: this.config.image_width,
                    targetHeight: this.config.image_height,
                    correctOrientation: true
                });
            };
            PhotoController.prototype.onSuccess = function (imageURI) {
                var _this = this;
                this.$scope.$apply(function () {
                    _this.$log.debug("onSuccess.uri = " + imageURI);
                    if (imageURI.length > 500) {
                        imageURI = "data:image/jpeg;base64," + imageURI;
                    }
                    _this.$timeout(function () {
                        _this.$scope.networkServiceHolder['primary'].loading = true;
                        _this.$scope.$digest();
                    }, 0, true);
                    _this.itweetMedia.mediaService.saveImage(imageURI, _this.index).then(function () {
                        _this.$scope.networkServiceHolder['primary'].loading = false;
                        _this.$timeout(function () { _this.updatePhotos(); }, 0, true);
                    });
                });
            };
            PhotoController.prototype.onFail = function (message) {
                //alert('Image Selection failed because: ' + message);
                this.$mdBottomSheet.hide();
            };
            PhotoController.$inject = [
                '$scope', 'gettextCatalog', 'itweetMedia', '$mdToast', '$mdBottomSheet', '$log', '$q', 'ItweetConfig', '$timeout'
            ];
            return PhotoController;
        })();
        photo.PhotoController = PhotoController;
        angular.module('itweet.photo', ['gettext', 'ui.router', 'ngMaterial', 'ngMessages'])
            .controller('PhotoController', PhotoController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.photo', {
                    url: "/photo",
                    templateUrl: "photo/photo.html",
                    controller: 'PhotoController'
                });
            }
        ]);
        ;
    })(photo = itweet.photo || (itweet.photo = {}));
})(itweet || (itweet = {}));
