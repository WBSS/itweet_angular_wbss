var itweet;
(function (itweet) {
    var overview;
    (function (overview) {
        /**
         *
         */
        var OverviewController = (function () {
            function OverviewController($scope, $log, $state, gettextCatalog, network, itweetMedia, $q, $mdDialog, $timeout) {
                this.$scope = $scope;
                this.$log = $log;
                this.$state = $state;
                this.gettextCatalog = gettextCatalog;
                this.network = network;
                this.itweetMedia = itweetMedia;
                this.$q = $q;
                this.$mdDialog = $mdDialog;
                this.$timeout = $timeout;
                $scope.vm = this;
                $scope.categoryService = network.categoryService;
                $scope.mediaService = itweetMedia.mediaService;
                this.onEnter();
                //$scope.$on('$stateChangeStart', this.onEnter());
            }
            OverviewController.prototype.onEnter = function () {
                this.$log.debug("onEnter");
                this.$scope.menu_parameters.title = this.gettextCatalog.getString('overview_title');
            };
            OverviewController.prototype.gotoDetail = function (destination) {
                this.$scope.navigationService.go(new itweet.navigation.State(destination));
            };
            OverviewController.prototype.undoSend = function () {
                var _this = this;
                var alertPromise = this.$mdDialog.confirm({
                    title: this.gettextCatalog.getString('overview_delete_option_title'),
                    content: this.gettextCatalog.getString('overview_delete_option_message'),
                    ok: this.gettextCatalog.getString('general_button_okay'),
                    cancel: this.gettextCatalog.getString('personel_button_cancel')
                });
                this.$mdDialog.show(alertPromise)
                    .then(function () {
                    _this.network.iTweetService.tweet = _this.$scope.storageService.currentTweet;
                    _this.network.iTweetService.undo = true;
                    _this.network.iTweetService.run();
                    _this.$scope.navigationService.startNewTweetSilent();
                })
                    .finally(function () {
                    this.$mdDialog.hide(alertPromise);
                    alertPromise = undefined;
                });
            };
            OverviewController.prototype.saveTweet = function () {
                this.$scope.storageService.saveTweet(this.$scope.storageService.currentTweet);
                var alertPromise = this.$mdDialog.confirm({
                    title: this.gettextCatalog.getString('item_save_title'),
                    content: this.gettextCatalog.getString('item_save_text'),
                    ok: this.gettextCatalog.getString('general_button_okay')
                });
                this.$mdDialog.show(alertPromise)
                    .finally(function () {
                    this.$mdDialog.hide(alertPromise);
                    alertPromise = undefined;
                });
                // save to store
            };
            OverviewController.prototype.validateTweet = function (currentTweet) {
                if (!currentTweet.txt)
                    return false;
                return true;
            };
            OverviewController.prototype.confirmSendTweet = function () {
                var _this = this;
                console.log(this.validateTweet(this.$scope.storageService.currentTweet));
                if (this.validateTweet(this.$scope.storageService.currentTweet)) {
                    var alertPromise = this.$mdDialog.confirm({
                        title: this.gettextCatalog.getString('general_info_send_title'),
                        content: this.gettextCatalog.getString('general_info_send_message'),
                        ok: this.gettextCatalog.getString('general_button_okay'),
                        cancel: this.gettextCatalog.getString('option_button_no')
                    });
                    this.$mdDialog.show(alertPromise)
                        .then(function () {
                        _this.$timeout(function () { _this.sendTweet(); });
                    })
                        .finally(function () {
                        _this.$mdDialog.hide(alertPromise);
                        alertPromise = undefined;
                    });
                }
                else {
                    var invalidPromise = this.$mdDialog.alert({
                        title: this.gettextCatalog.getString('overview_alert_mandatory_title'),
                        content: this.gettextCatalog.getString('overview_alert_mandatory'),
                        ok: this.gettextCatalog.getString('general_button_okay')
                    });
                    this.$mdDialog.show(invalidPromise);
                }
            };
            OverviewController.prototype.sendTweet = function () {
                var _this = this;
                var defered = this.$q.defer();
                var ourData = new itweet.ProgressDialogData(this.gettextCatalog.getString("upload_status_title"), this.gettextCatalog.getString("upload_status_tweet"), true, defered, false);
                var dialogPromise = this.$mdDialog.show({
                    // targetEvent: $event,
                    templateUrl: 'app/progress_dialog.tpl.html',
                    controller: itweet.ProgressDialogController,
                    onComplete: null,
                    locals: { data: ourData },
                    bindToController: false
                }).finally(function () {
                    if (ourData.success) {
                        _this.$scope.navigationService.startNewTweet();
                    }
                });
                this.network.iTweetUploader.upload([this.$scope.storageService.currentTweet], defered, ourData).then(function () {
                    ourData.progressing = undefined;
                    ourData.text = _this.gettextCatalog.getString("general_info_created_message");
                    ourData.success = true;
                    //this.$mdDialog.hide(dialogPromise);
                }, function () {
                    ourData.progressing = undefined;
                    if (defered.promise.$$state.status > 0) {
                        ourData.text = _this.gettextCatalog.getString("general_info_send_canceled");
                    }
                    else {
                        ourData.text = _this.gettextCatalog.getString("general_info_created_failed_message");
                    }
                }, function () {
                });
            };
            OverviewController.$inject = [
                '$scope', '$log', '$state', 'gettextCatalog', 'itweetNetwork', 'itweetMedia', '$q', '$mdDialog', '$timeout'
            ];
            return OverviewController;
        })();
        overview.OverviewController = OverviewController;
    })(overview = itweet.overview || (itweet.overview = {}));
})(itweet || (itweet = {}));
