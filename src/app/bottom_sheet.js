/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var BottomSheetData = (function () {
        function BottomSheetData(title, entries) {
            this.title = title;
            this.entries = entries;
        }
        return BottomSheetData;
    })();
    itweet.BottomSheetData = BottomSheetData;
    var BottomSheetController = (function () {
        function BottomSheetController($scope, gettextCatalog, $mdBottomSheet, $log, data) {
            this.$scope = $scope;
            this.gettextCatalog = gettextCatalog;
            this.$mdBottomSheet = $mdBottomSheet;
            this.$log = $log;
            this.data = data;
            $scope.dmv = this;
            $scope.data = data;
        }
        BottomSheetController.prototype.listItemClick = function (index) {
            this.$log.debug("Clicked( " + index + " )");
            this.$mdBottomSheet.hide(index);
        };
        BottomSheetController.$inject = [
            '$scope', 'gettextCatalog', '$mdBottomSheet', '$log', 'data'
        ];
        return BottomSheetController;
    })();
    itweet.BottomSheetController = BottomSheetController;
})(itweet || (itweet = {}));
