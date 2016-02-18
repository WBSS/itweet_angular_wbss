/// <reference path='../_all.ts' />
var itweet;
(function (itweet) {
    var model;
    (function (model) {
        //export enum MediaStates {start, recording, recorded, playback, paused, stopped }
        var MediaFactory = (function () {
            function MediaFactory($rootScope, $log, $interval, ItweetStorage, $q, config, $timeout) {
                this.$rootScope = $rootScope;
                this.$log = $log;
                this.$interval = $interval;
                this.ItweetStorage = ItweetStorage;
                this.$q = $q;
                this.config = config;
                this.$timeout = $timeout;
                this.mediaService = new MediaService(this);
                this.recorderService = new RecorderService(this);
            }
            MediaFactory.prototype.isIos = function () {
                return this.config.platform == itweet.model.Platform.ios;
            };
            MediaFactory.prototype.saveFile = function (fileSystemURI) {
                var _this = this;
                return new this.$q(function (resolve, reject) {
                    window.resolveLocalFileSystemURL(fileSystemURI, function (entry) {
                        entry.file(function (file) {
                            var reader = new FileReader();
                            reader.onload = function (readresult) {
                                var r = new Rusha();
                                var digest = r.digestFromArrayBuffer(readresult.target.result);
                                var ext = model.StorageService.extFromUrl(fileSystemURI) || "jpg";
                                var newFileName = digest + "." + ext;
                                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
                                    //The folder is created if doesn't exist
                                    fileSys.root.getDirectory(_this.config.assets_storage_folder, { create: true, exclusive: false }, function (directory) {
                                        directory.getFile(newFileName, { create: true }, function (newFileEntry) {
                                            newFileEntry.createWriter(function (fileWriter) {
                                                fileWriter.onwriteend = function () { resolve(newFileEntry.toURL()); };
                                                fileWriter.onerror = reject;
                                                var blob = new Blob([new Uint8Array(readresult.target.result)], {});
                                                fileWriter.write(blob);
                                            }, reject);
                                        }, reject);
                                        //--> SHA it
                                        /*  entry.copyTo(directory, newFileName, (entry) => {
                                                  resolve(entry.toInternalURL());
                                              },
                                              reject);*/
                                    }, reject);
                                }, reject);
                            };
                            reader.onerror = function (error) {
                                reject(error.target.error.code);
                            };
                            reader.readAsArrayBuffer(file);
                        }, reject);
                    }, reject);
                });
            };
            MediaFactory.$inject = [
                '$rootScope', '$log', '$interval', 'ItweetStorage', '$q', 'ItweetConfig', '$timeout'
            ];
            return MediaFactory;
        })();
        model.MediaFactory = MediaFactory;
        /** Dave: move to own Factory? */
        var MediaService = (function () {
            //service.dataAudio = store.get("audio") || [];
            function MediaService(runner) {
                this.runner = runner;
            }
            MediaService.prototype.dataImages = function () {
                return this.runner.ItweetStorage.images();
            };
            MediaService.prototype.deleteImage = function (index) {
                return this.runner.ItweetStorage.setImage(index, 0);
            };
            MediaService.prototype.containsImage = function () {
                var resp = false;
                this.runner.ItweetStorage.images().forEach(function (elem) {
                    if (elem) {
                        resp = true;
                    }
                });
                return resp;
            };
            MediaService.prototype.saveImage = function (fileSystemUri, index) {
                var _this = this;
                return this.runner.saveFile(fileSystemUri).then(function (internalUri) {
                    _this.runner.$timeout(function () {
                        _this.runner.ItweetStorage.setImage(index, internalUri);
                        _this.runner.$log.debug("did save file to " + internalUri);
                    }, 0);
                }, function (error) { _this.runner.$log.error("Failed to write File:" + JSON.stringify(error)); });
            };
            return MediaService;
        })();
        model.MediaService = MediaService;
        /**
         * https://github.com/gomobile/sample-phonegap-audio/blob/master/www/js/mediaHandlers.js
         */
        var RecorderService = (function () {
            function RecorderService(runner) {
                this.runner = runner;
                this.playerStatus = 0;
                this.mediaTime = 0;
                this.MediaStates = { start: 1, recording: 2, recorded: 3, playback: 4, paused: 5, stopped: 6 };
                this.recorder = undefined;
                /* FIXME: AAC for android */
                this.mediaRecFilename = "temp_recording.aac"; //ios will only support WAV it seems
                this.initState();
            }
            RecorderService.prototype.initState = function () {
                this.mediaFileFullName = this.runner.ItweetStorage.getAudio();
                this.runner.$log.debug("initState audio file: " + this.mediaFileFullName);
                this.mediaState = this.mediaFileFullName ? this.MediaStates.recorded : this.MediaStates.start;
                this.mediaTimeMax = this.runner.config.audio_max_length;
                this.mediaTime = 0;
                if (this.mediaFileFullName) {
                    this.preparePlayer();
                }
            };
            RecorderService.prototype.deleteAudio = function () {
                this.runner.ItweetStorage.setAudio(0);
            };
            RecorderService.prototype.getAudio = function () {
                this.runner.ItweetStorage.getAudio();
            };
            RecorderService.prototype.saveAudio = function (fileSystemUri) {
                var _this = this;
                return this.runner.saveFile(fileSystemUri).then(function (internalUri) {
                    _this.runner.$log.debug(" Saved to internal storage: " + internalUri);
                    _this.runner.ItweetStorage.setAudio(internalUri);
                    _this.mediaFileFullName = internalUri;
                }, function (error) {
                    _this.runner.$log.debug("Failed to write to internal:" + error);
                });
            };
            RecorderService.prototype.toggleRecording = function () {
                if (this.mediaState == this.MediaStates.recording) {
                    this.stopRecording();
                }
                else if (this.mediaState == this.MediaStates.start) {
                    this.startRecording();
                }
                else {
                    this.runner.$log.debug(" unsupported state in toggleRecord: " + this.mediaState);
                }
            };
            RecorderService.prototype.toggleReplay = function () {
                if (this.mediaState == this.MediaStates.recorded) {
                    this.playback();
                }
                else if (this.mediaState == this.MediaStates.playback) {
                    this.stopPlayback();
                }
                else {
                    this.runner.$log.debug(" unsupported state in toggleReplay: " + this.mediaState);
                }
            };
            RecorderService.prototype.deleteRecording = function () {
                //mit dem knüppel
                this.stopPlayback();
                this.mediaState = this.MediaStates.start;
                this.mediaTimeMax = this.runner.config.audio_max_length;
                this.mediaTime = 0;
                this.deleteAudio();
            };
            /** used to start Recording from UI **/
            RecorderService.prototype.startRecording = function () {
                var _this = this;
                if (this.mediaState == this.MediaStates.recording || angular.isDefined(this.progressTimer)) {
                    this.stopRecording();
                    return;
                }
                this.mediaState = this.MediaStates.recording;
                // create media object - overwrite existing recording
                if (angular.isDefined(this.recorder)) {
                    this.recorder.release();
                }
                // chrome check
                if (typeof LocalFileSystem === 'undefined') {
                    return;
                }
                // create file
                window.requestFileSystem(this.runner.isIos() ? LocalFileSystem.TEMPORARY : LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                    _this.runner.$log.debug(" onsuccess fileSystem");
                    //mit der Brechstange
                    fileSystem.root.getFile(_this.mediaRecFilename, { create: true, exclusive: false }, function (fileEntry) {
                        _this.runner.$log.debug("Media: File created " + _this.mediaRecFilename + " at " + fileEntry.toURL());
                        _this.mediaFileFullName = _this.runner.isIos() ? fileEntry.nativeURL : fileEntry.toURL();
                    }, function (error) {
                        _this.runner.$log.error("Media: Could not create file");
                    });
                }, function (error) {
                    _this.runner.$log.error("Media: Error on requestFileSystem() " + error);
                });
                this.recorder = new Media(this.mediaRecFilename, function () { return _this.onMediaCallSuccess(); }, function (error) { return _this.onMediaCallError(error); });
                this.runner.$log.debug("***test: new Media() for all platform ***");
                this.recordNow();
                // else if (phoneCheck.windowsphone) {
                //     my_recorder = new Media(this.mediaRecFilename, onMediaCallSuccess, onMediaCallError);
                //     this.runner.$log.debug("***test: new Media() for Windows Phone ***");
                //     recordNow();
                // }
                // else if (phoneCheck.ios) {
                // //first create the file
                //     checkFileOnly = false;
                //     window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, onSuccessFileSystem, function() {
                //     this.runner.$log.debug("***test: failed in creating media file in requestFileSystem");
                //     });
                //     this.runner.$log.debug("***test: new Media() for ios***");
                // }
            };
            RecorderService.prototype.recordNow = function () {
                var _this = this;
                this.runner.$log.debug("recording Now()");
                if (angular.isDefined(this.recorder)) {
                    this.recorder.startRecord();
                    this.runner.$log.debug("***test:  recording started: in startRecording()***");
                }
                else
                    this.runner.$log.debug("***test:  recorder==null: in startRecording()***");
                // reset the recTime every time when recording
                this.mediaTime = 0;
                this.progressTimer = this.runner.$interval(function () {
                    _this.mediaTime = _this.mediaTime + 1;
                    if (_this.mediaTime >= 45) {
                        _this.stopRecording();
                    }
                    _this.runner.$log.debug("***test: interval-func()***");
                }, 1000);
            };
            RecorderService.prototype.stopRecording = function () {
                this.runner.$log.debug("stop Recording()");
                this.mediaState = this.MediaStates.recorded;
                if (this.recorder) {
                    this.recorder.stopRecord(); // the file should be moved to "/sdcard/"+this.mediaRecFilename
                    this.saveAudio(this.mediaFileFullName);
                    this.mediaTimeMax = this.mediaTime;
                }
                this.clearProgressTimmer();
                this.runner.$log.debug("***test: recording stopped***");
            };
            RecorderService.prototype.preparePlayer = function () {
                var _this = this;
                this.runner.$log.debug("  Play Recording has to look on sdcard");
                // the existing medail should be on /sdcard/ for android.
                if (true) {
                    this.player = new Media(
                    //"/sdcard/" + this.mediaRecFilename,
                    this.mediaFileFullName, function () { return _this.onMediaCallSuccess(); }, function (error) { return _this.onMediaCallError(error); }, function (status) { _this.playerStatus = status; });
                    this.player.play();
                    this.player.stop();
                    this.playerTimer = this.runner.$interval(function () {
                        var duration = _this.player.getDuration();
                        _this.runner.$log.debug("Media time read from file: " + duration);
                        if (duration >= 0) {
                            _this.mediaTimeMax = duration;
                            _this.clearTimer(_this.playerTimer);
                        }
                    }, 100, 300);
                    this.runner.$log.debug("***test:  Open file:" + this.mediaFileFullName);
                }
                // } else if (phoneCheck.windowsphone) // windows phone
                //     this.player = new Media(this.mediaRecFilename, onMediaCallSuccess, onMediaCallError);
                // else if (phoneCheck.ios) {
                //     this.player = new Media(mediaFileFullName, onMediaCallSuccess, onMediaCallError);
                // }
                /*} else {
                    this.runner.$log.debug("  Play Recording: Player Still exists");
                }*/
            };
            RecorderService.prototype.playback = function () {
                var _this = this;
                if (!angular.isDefined(this.player)) {
                    this.preparePlayer();
                }
                // Play audio
                if (this.player) {
                    this.player.play();
                    this.mediaState = this.MediaStates.playback;
                    this.mediaTime = 0;
                    // Update media position every second
                    this.clearProgressTimmer();
                    this.progressTimer = this.runner.$interval(function () {
                        _this.mediaTime += 1;
                        if (_this.playerStatus != 2 && _this.playerStatus != 1) {
                            _this.clearProgressTimmer();
                            _this.mediaTime = 0;
                            _this.mediaState = _this.MediaStates.recorded;
                        }
                        // wer braucht das schon
                        // this.player.getCurrentPosition(
                        //         if (position < 0){
                    }, 1000);
                }
            };
            RecorderService.prototype.stopPlayback = function () {
                if (this.player) {
                    this.clearProgressTimmer();
                    if (this.playerStatus != 4) {
                        this.runner.$log.debug(" *** Stoping player");
                        this.player.stop();
                    }
                    this.runner.$log.debug(" *** Clearing player");
                    // should not be necessary, but it is needed in order to play again.
                    this.player.release();
                    this.player = undefined;
                    this.mediaTime = 0;
                    this.mediaState = this.MediaStates.recorded;
                }
            };
            // Media() success callback
            RecorderService.prototype.onMediaCallSuccess = function () {
                this.runner.$log.debug("***test: new Media() succeeded ***");
                if (this.player) {
                    var duration = this.player.getDuration();
                    this.runner.$log.debug("Media time read from file: " + duration);
                    this.mediaTimeMax = duration;
                }
            };
            // Media() error callback
            RecorderService.prototype.onMediaCallError = function (error) {
                this.runner.$log.debug("***test: new Media() failed ***");
                this.runner.$log.debug(error);
            };
            RecorderService.prototype.clearTimer = function (timer) {
                if (angular.isDefined(timer)) {
                    this.runner.$interval.cancel(timer);
                }
            };
            RecorderService.prototype.clearProgressTimmer = function () {
                this.clearTimer(this.progressTimer);
                this.progressTimer = undefined;
            };
            return RecorderService;
        })();
        model.RecorderService = RecorderService;
        angular.module("itweet.media", []).service("itweetMedia", MediaFactory)
            .config(['$compileProvider', function ($compileProvider) {
                $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|content|file|data|cdvfile):/);
            }]);
    })(model = itweet.model || (itweet.model = {}));
})(itweet || (itweet = {}));
