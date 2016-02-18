/// <reference path='../../_all.ts' />
var itweet;
(function (itweet) {
    var category;
    (function (category) {
        var RhBMydataController = (function () {
            // dependencies are injected via AngularJS $injector
            // controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
            function RhBMydataController($scope, $previousState, $state, gettextCatalog, network, ItweetStorage, $stateParams, itweetNavigation, $window) {
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
                this.loaded = false;
                this.validPerson = true;
                $scope.networkServiceHolder['primary'] = network.metadataService;
                $scope.vm = this;
                $scope.menu_parameters.title = this.$scope.menu_parameters.title = this.gettextCatalog.getString("mydata_title");
                if (this.ItweetStorage.shouldDismissRegister()) {
                    this.itweetNavigation.go(void 0, true);
                }
                if (this.$previousState.get() == undefined) {
                    this.$scope.menu_parameters.icon = undefined;
                }
                else {
                    this.$scope.menu_parameters.icon = 'arrow_back';
                }
                $scope.$watch(function () { return network.metadataService.getResponseData(); }, function (newValue, oldValue) {
                    _this.updateByMeta(newValue);
                });
                /* RHB FIX: FIXME REFACTOR */
                $scope.$watch(function () { return network.contextService.getResponseData(); }, function (data) {
                    if (data && data.length == 1) {
                        var context = data[0];
                        _this.$scope.storageService.currentTweet.contextToken = context.contextToken;
                    }
                });
                $scope.vm.searchText = "";
                $scope.vm.searchPlaceholder = this.gettextCatalog.getString('search');
            }
            RhBMydataController.prototype.updateByMeta = function (meta) {
                if (meta === void 0) { meta = this.network.metadataService.getResponseData(); }
                if (meta.persons) {
                    this.loaded = true;
                    this.persons = new Array();
                    for (var i = 0; i < meta.persons.length; i++) {
                        var newPerson = {
                            id: meta.persons[i].id,
                            firstName: meta.persons[i].firstName,
                            lastName: meta.persons[i].lastName,
                            department: meta.persons[i].department,
                            query: meta.persons[i].firstName.toLowerCase() + ' ' + meta.persons[i].lastName.toLowerCase(),
                            queryReverse: meta.persons[i].lastName.toLowerCase() + ' ' + meta.persons[i].firstName.toLowerCase()
                        };
                        this.persons.push(newPerson);
                    }
                    console.log(this.persons);
                    if (this.ItweetStorage.user.userID) {
                        var p = this.persons[this.persons.map(function (e) { return e.id; }).indexOf(this.ItweetStorage.user.userID)];
                        this.searchText = this.getFullPerson(p);
                        this.selectedPerson = p;
                    }
                }
            };
            RhBMydataController.prototype.save = function () {
                if (this.selectedPerson != null) {
                    this.$scope.vm.validPerson = true;
                    var newUser = angular.copy(this.ItweetStorage.user);
                    newUser.userID = this.selectedPerson.id;
                    newUser.name = this.selectedPerson.lastName;
                    newUser.firstName = this.selectedPerson.firstName;
                    newUser.department = this.selectedPerson.department;
                    angular.extend(this.ItweetStorage.user, newUser);
                    if (this.ItweetStorage.initial) {
                        this.itweetNavigation.go(void 0, true);
                    }
                    else {
                        this.$scope.navigationService.previous();
                    }
                }
                else {
                    this.selectedPerson = null;
                    this.$scope.vm.validPerson = false;
                }
            };
            RhBMydataController.prototype.querySearch = function (query) {
                var results = this.persons.filter(this.createFilterFor(query));
                var t = results.slice(0, 25);
                return t;
            };
            RhBMydataController.prototype.createFilterFor = function (q) {
                var query = q.toLowerCase();
                return function filterFn(person) {
                    var i = (person.id.indexOf(query) == 0);
                    if (i)
                        return i;
                    else
                        i = (person.query.indexOf(query) == 0);
                    if (i)
                        return i;
                    else
                        i = (person.queryReverse.indexOf(query) == 0);
                    return i;
                };
            };
            RhBMydataController.prototype.searchTextChange = function (textChange) {
                console.log('text change');
            };
            RhBMydataController.prototype.selectedPersonChange = function (item) {
                console.log('person change');
                if (typeof item != 'undefined') {
                    this.selectedPerson = item;
                    this.$window.document.activeElement.blur();
                }
            };
            RhBMydataController.prototype.getFullPerson = function (person) {
                if (person.id)
                    return person.id + ', ' + person.firstName + ' ' + person.lastName + ', ' + person.department;
                else
                    return "";
            };
            RhBMydataController.$inject = [
                '$scope', '$previousState', '$state', 'gettextCatalog', 'itweetNetwork', 'ItweetStorage', '$stateParams', 'ItweetNavigation', '$window'
            ];
            return RhBMydataController;
        })();
        category.RhBMydataController = RhBMydataController;
        angular.module('itweet.rhb.mydata', ['gettext', 'ui.router', 'ngMaterial'])
            .controller('RhBMydataController', RhBMydataController)
            .config(["$stateProvider",
            function ($stateProvider) {
                $stateProvider
                    .state('app.mydata', {
                    url: "/mydatarhbdata",
                    templateUrl: "ext_rhb/mydata/mydata.html",
                    controller: 'RhBMydataController'
                });
            }
        ]);
        ;
    })(category = itweet.category || (itweet.category = {}));
})(itweet || (itweet = {}));
