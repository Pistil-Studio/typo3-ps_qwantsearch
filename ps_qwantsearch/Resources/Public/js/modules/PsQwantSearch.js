"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 */
var PsQwantSearch = /** @class */ (function () {
    /**
     *
     */
    function PsQwantSearch() {
        this._apiUrl = 'https://api.qwant.com/partners/v2/';
        this.checkInitializationErrors();
    }
    /**
     *
     * @param searchOptions
     */
    PsQwantSearch.prototype.search = function (searchOptions) {
        this.talkWithApi('/partner/search', searchOptions);
    };
    /**
     *
     */
    PsQwantSearch.prototype.talkWithApi = function (endPoint, params) {
        var _this = this;
        $.ajax({
            url: this._apiUrl,
            type: 'get',
            data: params,
            // Réussite du transfert
            success: function (answer, status, xhr) {
                _this.buildResults(answer);
            },
            // erreur du transfert
            error: function (xhr, errorType, error) {
                _this.buildError(errorType);
            }
        });
    };
    /**
     *
     */
    PsQwantSearch.prototype.buildError = function (errorType) {
        console.debug('buildError', errorType);
    };
    /**
     *
     */
    PsQwantSearch.prototype.buildResults = function (response) {
        console.debug('buildResults', response);
    };
    /**
     *
     */
    PsQwantSearch.prototype.checkInitializationErrors = function () {
        // check if jquery is loaded
    };
    return PsQwantSearch;
}());
exports.PsQwantSearch = PsQwantSearch;
exports.psQwantSearch = new PsQwantSearch();
