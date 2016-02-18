var itweet;
(function (itweet) {
    var help;
    (function (help) {
        var HelpController = (function () {
            function HelpController($scope, gettextCatalog, ItweetConfig, $sce) {
                this.$scope = $scope;
                this.gettextCatalog = gettextCatalog;
                this.ItweetConfig = ItweetConfig;
                this.$sce = $sce;
                $scope.HelpUrl = $sce.trustAsResourceUrl(ItweetConfig.HelpUrl());
                $scope.menu_parameters.title = gettextCatalog.getString('help_title');
                $scope.menu_parameters.icon = 'arrow_back';
                $scope.menu_parameters.navigate = 'back';
            }
            HelpController.$inject = ['$scope', 'gettextCatalog', 'ItweetConfig', '$sce'
            ];
            return HelpController;
        })();
        help.HelpController = HelpController;
        angular.module('itweet.help', ['gettext', 'ui.router', 'ngMaterial'])
            .controller('HelpController', HelpController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.help', {
                    url: "/help",
                    templateUrl: "settings/help.html",
                    controller: 'HelpController'
                });
            }
        ]);
    })(help = itweet.help || (itweet.help = {}));
})(itweet || (itweet = {}));
