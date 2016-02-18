/// <reference path='../../_all.ts' />
var itweet;
(function (itweet) {
    var model;
    (function (model) {
        var Tweet = (function () {
            function Tweet() {
                this.itemQs = new itemQ(); // only RHB
                this.lat = 0;
                this.lng = 0;
                this.latDevice = 2;
                this.lngDevice = 2;
                this.uploadHashs = [];
                /*RHB vars
                date: number;
                involvedPersons:number[];
                involvedPersonsNames:string[];*/
                this.mediaStore = {};
            }
            Tweet.prepareForTransmission = function (tweet, config, user) {
                Tweet.updateWithConfig(tweet, config, user);
                var copy = angular.copy(tweet);
                delete copy.mediaStore;
                delete copy.sent;
                delete copy.save;
                delete copy.dateAdded;
                return copy;
            };
            Tweet.getCurrentContextToken = function (tweet, user) {
                if (user.showContext || !user.token) {
                    return tweet.contextToken;
                }
                else {
                    return user.token;
                }
            };
            Tweet.updateWithConfig = function (tweet, config, user) {
                tweet.deviceId = user.deviceid;
                tweet.langISO = config.langISO;
                tweet.countryISO = config.countryISO;
                tweet.loginToken = user.token;
                tweet.guid = tweet.guid || model.StorageService.guid();
                tweet.itemQs.refPersonId = user.userID; // only rhb ...
                /* TODO: EMPTY NAME; WHY THE PROBLEM ?? */
                tweet.name = user.name || user.email;
                tweet.mail = user.email || "";
                tweet.fon = user.tel || "";
                if (!tweet.mediaStore) {
                    tweet.mediaStore = {};
                }
                tweet.uploadHashs = Object.keys(tweet.mediaStore).map(function (key) { return tweet.mediaStore[key].sha1; });
                //Object.defineProperty(tweet, 'guid', { value: tweet.guid, enumerable: false });
            };
            return Tweet;
        })();
        model.Tweet = Tweet;
        var User = (function () {
            function User() {
                this.createMessageAllowed = true;
                this.showContext = true;
            }
            return User;
        })();
        model.User = User;
        var itemQ = (function () {
            function itemQ() {
                this.refPersonId = "9999"; /* TEST PERSON ID */
                this.refItemCategoryQsId = null;
                this.refTrainId = null;
                this.refTrainName = null;
                this.refWagonId = null;
                this.refWagonName = null;
                this.refLocationId = null;
                this.refTrackId = null;
                this.refLocationName = null;
                this.refTrackName = null;
                this.trackPosition = null;
                this.personsInvolvedIds = null;
                this.personsInvolvedNames = null;
                this.dateEvent = null;
            }
            return itemQ;
        })();
        model.itemQ = itemQ;
    })(model = itweet.model || (itweet.model = {}));
})(itweet || (itweet = {}));
