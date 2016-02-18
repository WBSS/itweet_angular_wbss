/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var navigation;
    (function (navigation) {
        var State = (function () {
            function State(name, params) {
                if (params === void 0) { params = {}; }
                this.name = name;
                this.params = params;
            }
            return State;
        })();
        navigation.State = State;
        var NavigationService = (function () {
            function NavigationService($rootScope, $state, $previousState, gettextCatalog, $mdDialog, $log, ItweetStorage, network) {
                var _this = this;
                this.$rootScope = $rootScope;
                this.$state = $state;
                this.$previousState = $previousState;
                this.gettextCatalog = gettextCatalog;
                this.$mdDialog = $mdDialog;
                this.$log = $log;
                this.ItweetStorage = ItweetStorage;
                this.network = network;
                this.defaultStateOrder = {
                    'default': function (n, params) { return new State('app.category'); },
                    'login': function (n, params) { return new State('app.login'); },
                    'context': function (n, params) { return new State('app.context'); },
                    'overview': function (n, params) { return new State('app.overview'); },
                    'category': function (n, params) { return new State('app.category'); },
                    //'map': (n: NavigationService,params) => new State('app.photo'),
                    'app.rhb_location': function (n, params) { return new State('app.photo'); },
                    'alltweets': function (n, params) { return new State('app.alltweets'); },
                    'app.context': function (n, params) { return new State('app.category'); },
                    'app.category': function (n, params) {
                        if (n.ItweetStorage.currentTweet.refItemCategoryId == 86) {
                            var elems = _this._stateStack.filter(function (elem) { return angular.equals(elem, _this.defaultStateOrder['overview'](_this, {})); });
                            if (elems.length > 0) {
                                return new State('app.overview');
                            }
                            return new State('app.photo');
                        }
                        return new State('app.multicategory', { parentId: undefined });
                    },
                    'app.multicategory': function (n, params) {
                        var parentId = n.ItweetStorage.currentTweet.itemQs.refItemCategoryQsId;
                        var items = n.network.metadataService.getResponseData().categoriesQs.filter(function (c) { return c.parentId == parentId; });
                        var resp = new State('app.rhb_attribute_time');
                        var elems = _this._stateStack.filter(function (elem) { return angular.equals(elem, _this.defaultStateOrder['overview'](_this, {})); });
                        if (elems.length > 0) {
                            resp = new State('app.overview');
                        }
                        if (items.length > 0 && (!params.skip)) {
                            resp = new State('app.multicategory', { parentId: parentId });
                        }
                        return resp;
                    },
                    //'app.rhb_attribute_time': (n: NavigationService,params) => new State('map'),
                    'app.rhb_attribute_time': function (n, params) {
                        var parentId = n.ItweetStorage.currentTweet.itemQs.refItemCategoryQsId;
                        //let resp = new State('map');
                        var resp = new State('app.rhb_location');
                        console.log(n.ItweetStorage.currentTweet, n.ItweetStorage.currentTweet.itemQs);
                        if (true) {
                            resp = new State('app.rhb_attribute_train', { parentId: parentId });
                        }
                        return resp;
                    },
                    //'app.rhb_attribute_train': (n: NavigationService,params) => new State('map'),
                    'app.rhb_attribute_train': function (n, params) { return new State('app.rhb_location'); },
                    'app.photo': function (n, params) { return new State('app.text'); },
                    'app.text': function (n, params) { return new State('app.audio'); },
                    'app.audio': function (n, params) { return new State('app.rhb_attribute_involvedPersons'); },
                    'app.rhb_attribute_involvedPersons': function (n) { return new State('app.overview'); }
                };
                this._stateStack = [this.defaultStateOrder['default'](this, {})];
                document.addEventListener("backbutton", function (evt) {
                    $rootScope.$apply(function () {
                        _this.$log.debug(" Event.Backbutton");
                        evt.preventDefault();
                        evt.stopPropagation();
                        _this.previous();
                    });
                }, false);
            }
            NavigationService.prototype.checkAuthorisation = function (nextState) {
                console.log('AUTH');
                if (nextState.name == this.defaultStateOrder['context'](this, {}).name) {
                    if (!this.ItweetStorage.user.createMessageAllowed) {
                        this.$log.debug("  CreateMessage Not Allowed --> Popup");
                        var alertPromise = this.$mdDialog.alert({
                            title: this.gettextCatalog.getString('login_title_create_not_allowed'),
                            content: this.gettextCatalog.getString('login_message_create_not_allowed'),
                            ok: this.gettextCatalog.getString('general_button_okay')
                        });
                        this.$mdDialog.show(alertPromise).finally(function () { alertPromise = undefined; });
                        return undefined;
                    }
                    else if (!this.ItweetStorage.user.showContext) {
                        this.$log.debug("  ShowContext == false --> Category");
                        return this.defaultStateOrder['category'](this, {});
                    }
                }
                return nextState;
            };
            NavigationService.prototype.currentState = function () {
                return this._stateStack[this._stateStack.length - 1] || this.defaultStateOrder['default'](this, {});
            };
            NavigationService.prototype.previousState = function () {
                return this._stateStack[this._stateStack.length - 2] || this.defaultStateOrder['default'](this, {});
            };
            NavigationService.prototype.next = function (replace, params) {
                var _this = this;
                if (replace === void 0) { replace = false; }
                if (params === void 0) { params = {}; }
                this.$log.debug("Next", this.defaultStateOrder, this.$state.current.name);
                var nextState = this.defaultStateOrder[this.$state.current.name](this, params);
                if (nextState != undefined) {
                    // "dafault" Cases (aka tweet view controlers)
                    var elems = this._stateStack.filter(function (elem) { return angular.equals(elem, _this.defaultStateOrder['overview'](_this, {})); });
                    if (this.$state.current.name === 'app.category' || this.$state.current.name === 'app.multicategory') {
                        elems = [];
                    }
                    if (elems.length > 0) {
                        this.$log.debug("  Pop to Overview");
                        this._stateStack.pop(); //TODO: maybe pop to _overviewState
                        this.go(this._stateStack.pop(), replace);
                    }
                    else {
                        this.go(nextState, replace);
                    }
                }
                else {
                    // "special" Cases (eg. settings)
                    this.$log.debug(" No NextState in Default Navigation Array");
                }
            };
            NavigationService.prototype.previous = function () {
                this.$log.debug("Previous");
                var len = this._stateStack.length;
                if (len > 0) {
                    if (this.isCurrentStateOverview()) {
                        this.$log.debug("  No Back on app.Overview");
                        this.startNewTweet();
                    }
                    else {
                        this._stateStack.pop();
                        this.go(this._stateStack.pop());
                    }
                }
                else {
                    this.$log.debug("  No Back. Previous is Unset");
                    this.go(this.defaultStateOrder['default'](this, {}));
                }
            };
            NavigationService.prototype.goType = function (type) {
                this.go(this.defaultStateOrder[type](this, {}));
            };
            NavigationService.prototype.go = function (nextState, replace) {
                if (nextState === void 0) { nextState = this.defaultStateOrder['default'](this, {}); }
                if (replace === void 0) { replace = false; }
                this.$log.debug(" navigationService.go(" + JSON.stringify(nextState) + ")");
                if (!nextState) {
                    nextState = this.defaultStateOrder['default'](this, {});
                }
                nextState = this.checkAuthorisation(nextState);
                if (!nextState) {
                    return;
                }
                if (!replace) {
                    this._stateStack.push(nextState);
                }
                this.$state.go(nextState.name, nextState.params);
            };
            NavigationService.prototype.startNewTweetSilent = function () {
                this.ItweetStorage.newTweet();
                this._stateStack = [];
                this.go();
            };
            NavigationService.prototype.startNewTweet = function () {
                var _this = this;
                if (this.ItweetStorage.currentTweet.sent) {
                    this.startNewTweetSilent();
                }
                else {
                    var alertPromise = this.$mdDialog.confirm({
                        title: this.gettextCatalog.getString('overview_cancel_option_title'),
                        content: this.gettextCatalog.getString('overview_cancel_option_message'),
                        ok: this.gettextCatalog.getString('general_button_okay'),
                        cancel: this.gettextCatalog.getString('personel_button_cancel')
                    });
                    this.$mdDialog.show(alertPromise)
                        .then(function () {
                        _this.startNewTweetSilent();
                    })
                        .finally(function () {
                        this.$mdDialog.hide(alertPromise);
                        alertPromise = undefined;
                    });
                }
            };
            NavigationService.prototype.logout = function () {
                this._stateStack = [];
                this.go(this.defaultStateOrder['login'](this, {}));
            };
            NavigationService.prototype.shouldDisplayBackbutton = function () {
                return (((this._stateStack.length > 1) && !this.isCurrentStateOverview() && !this.isPreviousStateOverview()) || this.$state.current.name === 'app.mytweets' || this.$state.current.name === 'app.settings');
            };
            NavigationService.prototype.shouldDisplayAllMessages = function () {
                return !this.shouldDisplayBackbutton();
            };
            NavigationService.prototype.shouldShowNoNavigationButtons = function () {
                return false;
            };
            NavigationService.prototype.isCurrentStateOverview = function () {
                return angular.equals(this.currentState(), this.defaultStateOrder['overview'](this, {}));
            };
            NavigationService.prototype.isPreviousStateOverview = function () {
                return angular.equals(this.previousState(), this.defaultStateOrder['overview'](this, {}));
            };
            NavigationService.$inject = [
                '$rootScope', '$state', '$previousState', 'gettextCatalog', '$mdDialog', '$log', 'ItweetStorage', 'itweetNetwork'
            ];
            return NavigationService;
        })();
        navigation.NavigationService = NavigationService;
        angular.module("itweet.navigation", ['ngMaterial', 'gettext', 'ui.router', 'ct.ui.router.extras.previous']).service("ItweetNavigation", NavigationService);
    })(navigation = itweet.navigation || (itweet.navigation = {}));
})(itweet || (itweet = {}));
