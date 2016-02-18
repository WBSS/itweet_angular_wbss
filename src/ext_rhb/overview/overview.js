var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var itweet;
(function (itweet) {
    var overview;
    (function (overview) {
        var RHBOverviewController = (function (_super) {
            __extends(RHBOverviewController, _super);
            function RHBOverviewController() {
                _super.apply(this, arguments);
            }
            RHBOverviewController.prototype.validateTweet = function (currentTweet) {
                if (!_super.prototype.validateTweet.call(this, currentTweet))
                    return false;
                if (!currentTweet.itemQs.refLocationId && !currentTweet.itemQs.refTrackId && !currentTweet.itemQs.trackPosition && currentTweet.refItemCategoryId != 86)
                    return false;
                return true;
            };
            RHBOverviewController.prototype.gotoDetail = function (destination) {
                if (destination === 'app.category') {
                    this.$scope.storageService.currentTweet.itemQs.refItemCategoryQsId = null;
                }
                _super.prototype.gotoDetail.call(this, destination);
            };
            return RHBOverviewController;
        })(overview.OverviewController);
        overview.RHBOverviewController = RHBOverviewController;
    })(overview = itweet.overview || (itweet.overview = {}));
})(itweet || (itweet = {}));
