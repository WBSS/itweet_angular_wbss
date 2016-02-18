/* Using Default Service Factory (awesomeFactory) */
angular.module("itweet.network", ['angular-cache', 'itweet.storage']).service("itweetNetwork", itweet.model.ServiceFactory)
        .config(["$httpProvider", function($httpProvider) { $httpProvider.useApplyAsync(true); }]);

/* Custom Overview HTML */
angular.module('itweet.overview', ['gettext','ui.router', 'ngMaterial'])
            .controller('OverviewController', itweet.overview.OverviewController)
             .config(
    ["$stateProvider", "$urlRouterProvider", // more dependencies
        ($stateProvider, $urlRouterProvider) =>
        {
        	$stateProvider
        	    .state('app.overview', {
                url: "/overview",
                templateUrl: "ext_itweet/overview/overview.html",
                controller: 'OverviewController'//,
                //onEnter: 'OverviewController.onEnter()'
            });

        }
    ]);