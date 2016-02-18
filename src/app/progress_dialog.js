/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var ProgressDialogData = (function () {
        function ProgressDialogData(title, text, progressing, defered, success) {
            if (success === void 0) { success = false; }
            this.title = title;
            this.text = text;
            this.progressing = progressing;
            this.defered = defered;
            this.success = success;
        }
        return ProgressDialogData;
    })();
    itweet.ProgressDialogData = ProgressDialogData;
    var ProgressDialogController = (function () {
        function ProgressDialogController($scope, gettextCatalog, $mdDialog, $log, data) {
            this.$scope = $scope;
            this.gettextCatalog = gettextCatalog;
            this.$mdDialog = $mdDialog;
            this.$log = $log;
            this.data = data;
            $scope.dmv = this;
            $scope.data = data;
        }
        ProgressDialogController.prototype.cancel = function () {
            this.$scope.data.defered.resolve("cancel by user");
        };
        ProgressDialogController.prototype.closeDialog = function () {
            this.$mdDialog.hide();
        };
        ProgressDialogController.$inject = [
            '$scope', 'gettextCatalog', '$mdDialog', '$log', 'data'
        ];
        return ProgressDialogController;
    })();
    itweet.ProgressDialogController = ProgressDialogController;
})(itweet || (itweet = {}));
