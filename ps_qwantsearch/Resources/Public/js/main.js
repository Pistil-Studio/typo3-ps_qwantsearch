/**
 *
 */
var PsQwantSearch = /** @class */ (function () {
    /**
     *
     */
    function PsQwantSearch(options) {
        this._options = options;
        this.checkInitializationErrors();
    }
    /**
     *
     * @param searchOptions
     */
    PsQwantSearch.prototype.search = function (searchOptions) {
        var _this = this;
        console.debug('search :)');
        return new Promise(function (resolve, reject) {
            _this.talkWithApi('/partner/search', searchOptions)
                .then(function (response) {
                resolve(response);
            })
                .catch(function (response) {
                reject(response);
            });
        });
    };
    /**
     *
     * @param endPoint
     * @param params
     */
    PsQwantSearch.prototype.talkWithApi = function (endPoint, params) {
        var _this = this;
        console.debug('talkWithApi :)');
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: _this._options.url,
                type: 'post',
                data: {
                    'tx_psqwantsearch_pi1[endPoint]': endPoint,
                    'tx_psqwantsearch_pi1[params]': params
                },
                // Réussite du transfert
                success: function (answer, status, xhr) {
                    resolve(answer);
                },
                // erreur du transfert
                error: function (xhr, errorType, error) {
                    reject({
                        xhr: xhr,
                        errorType: errorType,
                        error: error
                    });
                }
            });
        });
    };
    /**
     * Check all Js Dependencies
     */
    PsQwantSearch.prototype.checkInitializationErrors = function () {
        // check if jquery is loaded
        if (typeof jQuery != 'function') {
            console.error('Error : Plugin PsQwantSearch need jQuery');
        }
        // check if vue is loaded
        if (typeof Vue != 'function') {
            console.error('Error : Plugin PsQwantSearch need Vuejs');
        }
    };
    return PsQwantSearch;
}());
jQuery('document').ready(function () {
    //let searchConnector = new PsQwantSearch(JSON.parse(PsQwantOptions));
    var appQwantSearch = new Vue({
        el: '#psQwantSearch',
        data: function () {
            return {
                isLoaded: false,
                error: false,
                q: '',
                pages: []
            };
        },
        mounted: function () {
            $('.psQwantSearch__results').show();
            this.searchConnector = new PsQwantSearch(JSON.parse(PsQwantOptions));
            this.offset = 0;
            this.pageNum = 1;
            this.haveSearch = false;
            // launch default search
            if ('defaultSearch' in this.searchConnector._options) {
                this.q = this.searchConnector._options.defaultSearch;
                this.search();
            }
            // infinite scroll
            this.scrollEvent = window.addEventListener('scroll', this.checkInfiniteScroll);
        },
        beforeDestroy: function () {
            window.removeEventListener('scroll', this.checkInfiniteScroll);
        },
        methods: {
            checkInfiniteScroll: function () {
                if (this.showLoadMoreBtn() && this.inViewport($('.psQwantSearch__more').get(0), {})) {
                    setTimeout(this.more(), 300);
                }
            },
            showLoadMoreBtn: function () {
                return (this.pageNum > 1 && !this.showNoMore());
            },
            showNoMore: function () {
                return (this.pageNum > 3);
            },
            showNoResults: function () {
                return (this.haveSearch && this.pages.length === 0 && this.q !== '');
            },
            search: function () {
                this.resetResults();
                this.launchSearch();
            },
            more: function () {
                console.debug('more');
                this.launchSearch();
            },
            /**
             * Launch Qwant Search using connectior
             */
            launchSearch: function () {
                var _this = this;
                // prevent multiple calls
                if (this.isLoaded)
                    return;
                this.isLoaded = true;
                this.searchConnector.search({
                    q: this.q,
                    lang: this.searchConnector._options.lang,
                    count: this.searchConnector._options.count,
                    offset: (this.pageNum - 1) * this.searchConnector._options.count
                }).then(function (response) {
                    _this.isLoaded = false;
                    console.debug(response);
                    if (response.error !== 0) {
                        _this.error = response.errorInfos;
                    }
                    else {
                        _this.error = false;
                        _this.haveSearch = true;
                        if (response.datas.items.length) {
                            _this.pages = _this.pages.concat(response.datas.items);
                            if (response.datas.total > _this.searchConnector._options.count) {
                                _this.pageNum++;
                            }
                        }
                    }
                }).catch(function (response) {
                    _this.isLoaded = false;
                    _this.error = response;
                });
            },
            /**
             * Reset and clean displayed results
             */
            resetResults: function () {
                this.haveSearch = false;
                this.pageNum = 1;
                this.pages = [];
            },
            /**
             * Appear transition for page results
             * @param el
             */
            enter: function (el) {
                var delay = el.dataset.index * 70;
                setTimeout(function () {
                    $(el).addClass('visible');
                }, delay);
            },
            /**
             * Leave transition for page results
             * @param el
             */
            leave: function (el) {
                $(el).removeClass('visible');
                setTimeout(function () {
                    $(el).remove();
                }, 400);
            },
            /**
             * https://github.com/camwiegert/in-view/blob/master/src/viewport.js
             * @param element
             * @param options
             */
            inViewport: function (element, options) {
                var _a = element.getBoundingClientRect(), top = _a.top, right = _a.right, bottom = _a.bottom, left = _a.left, width = _a.width, height = _a.height;
                var intersection = {
                    t: bottom,
                    r: window.innerWidth - left,
                    b: window.innerHeight - top,
                    l: right
                };
                // default conf
                if (!('offset' in options)) {
                    options.offset = {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    };
                }
                return intersection.t > (options.offset.top)
                    && intersection.r > (options.offset.right)
                    && intersection.b > (options.offset.bottom)
                    && intersection.l > (options.offset.left);
            }
        }
    });
});
