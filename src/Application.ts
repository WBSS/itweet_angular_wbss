/// <reference path='_all.ts' />

/**
 * The main TodoMVC app module.
 *
 * @type {angular.Module}
 */




module itweet {
    var todomvc = angular.module('itweet', app.angular_modules)
     .config(["$urlRouterProvider", function($urlRouterProvider) {
        //$urlRouterProvider.otherwise('/app/register'); RHB !* /
        $urlRouterProvider.otherwise(app.default_route);
    }]).config(function( $mdGestureProvider ) {
            $mdGestureProvider.skipClickHijack();
        })

     .run(["gettextCatalog","$locale", function(gettextCatalog,$locale) {
     gettextCatalog.setCurrentLanguage(document.lang);
  //   gettextCatalog.debug = true;
     $locale.NUMBER_FORMATS.GROUP_SEP = "'";
 }]).config(['$provide', function($provide) {

  // Minification-safe hack.
  var $$watchers = '$$watchers',
      $$nextSibling = '$$nextSibling',
      $$childHead = '$$childHead',
      $$childTail = '$$childTail',
      $$listeners = '$$listeners',
      $$listenerCount = '$$listenerCount',
      $id = '$id',
      $$childScopeClass = '$$childScopeClass',
      $parent = '$parent',
      $$prevSibling = '$$prevSibling';

  $provide.decorator('$rootScope', ['$delegate', function($rootScope) {
    var proto = Object.getPrototypeOf($rootScope);

    function nextUid () {
      return ++$rootScope.$id;
    }

    proto.$new = function(isolate) {
      var child;

      if (isolate) {
        child = new proto.constructor();
        child.$root = this.$root;
        // ensure that there is just one async queue per $rootScope and its children
        child.$$asyncQueue = this.$$asyncQueue;
        child.$$postDigestQueue = this.$$postDigestQueue;
      } else {
        // Only create a child scope class if somebody asks for one,
        // but cache it to allow the VM to optimize lookups.
        if (!this.$$childScopeClass) {
          this.$$childScopeClass = function() {
            this[$$watchers] = this[$$nextSibling] =
                this[$$childHead] = this[$$childTail] = null;
            this[$$listeners] = {};
            this[$$listenerCount] = {};
            this[$id] = nextUid();
            this[$$childScopeClass] = null;
          };
          this.$$childScopeClass.prototype = this;
        }
        child = new this.$$childScopeClass();
      }
      child['this'] = child;
      child[$parent] = this;
      child[$$prevSibling] = this.$$childTail;
      if (this.$$childHead) {
        this.$$childTail.$$nextSibling = child;
        this.$$childTail = child;
      } else {
        this.$$childHead = this.$$childTail = child;
      }
      return child;
    };

    $rootScope.$new = proto.$new;
    return $rootScope;
  }]);

}]);

}
