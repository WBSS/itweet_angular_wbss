/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var model;
    (function (model) {
        var Category = (function () {
            function Category() {
            }
            return Category;
        })();
        model.Category = Category;
        var Context = (function () {
            function Context() {
                this.categories = {};
            }
            return Context;
        })();
        model.Context = Context;
    })(model = itweet.model || (itweet.model = {}));
})(itweet || (itweet = {}));
