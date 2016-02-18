/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var model;
    (function (model) {
        var Platform = (function () {
            function Platform() {
            }
            Platform.android = "Android";
            Platform.ios = "ios";
            return Platform;
        })();
        model.Platform = Platform;
        var BaseConfig = (function () {
            function BaseConfig() {
                this.default_referer = "http://ch.wbss.itweet";
                this.app_help_version = "1.0";
                this.ping_threshold = 3000;
                this.web_container_timeout = 30000;
                this.min_upload_time = 2000;
                this.image_width = 640;
                this.image_height = 640;
                this.audio_max_length = 45;
                this.assets_storage_folder = "itweetAssets";
                this.langISO = document.lang;
                this.countryISO = "CH";
                this.appId = document.appID;
                this.platform = (typeof device != 'undefined') ? (device.platform == "iOS" ? Platform.ios : Platform.android) : Platform.android;
                this.base_url = document.itweetURL;
                this.domain = this.extractDomain(this.base_url);
                this.setup();
            }
            BaseConfig.prototype.extractDomain = function (url) {
                var domain;
                //find & remove protocol (http, ftp, etc.) and get domain
                if (url.indexOf("://") > -1) {
                    domain = url.split('/')[2];
                }
                else {
                    domain = url.split('/')[0];
                }
                //find & remove port number
                domain = domain.split(':')[0];
                return domain;
            };
            BaseConfig.prototype.setup = function () {
                this.endpoint_itweet = this.base_url + "item/";
                this.endpoint_myitems = this.base_url + "items/";
                this.endpoint_categories = this.base_url + "categories/";
                this.endpoint_login = this.base_url + "login/";
                this.endpoint_media = this.base_url + "media/";
                this.endpoint_ping = this.base_url + "ping/";
                this.endpoint_contexts = this.base_url + "contexts/";
                this.endpoint_brand = this.base_url + "brand/";
                this.endpoint_metadata = this.base_url + "meta/";
            };
            BaseConfig.prototype.HelpUrl = function () {
                var rs = "https://" + this.domain + "/help/app/" + this.platform + "/" + this.app_help_version + "/" + this.langISO + "/help.html";
                return rs.toLowerCase();
            };
            return BaseConfig;
        })();
        model.BaseConfig = BaseConfig;
        angular.module("itweet.config", []).service("ItweetConfig", BaseConfig);
    })(model = itweet.model || (itweet.model = {}));
})(itweet || (itweet = {}));
