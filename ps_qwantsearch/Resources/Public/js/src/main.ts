
/**
 *
 */
interface IPSQwantSearchOptions {
    q           :string
    lang        :string
    country     ?:string
    count       ?:number
    offset      ?:number
    order_by    ?:string
    sort_by     ?:string
    start_date  ?:number
    end_date    ?:number
    fields      ?:string
    f           ?:string
    facets      ?:string
}


interface IPSQwantSearchConstructorOptions{
    url             :string,
    lang            :lang,
    count           :number,
    defaultSearch   ?:string
}

/**
 *
 */
class PsQwantSearch{

    public _options: IPSQwantSearchConstructorOptions;

    /**
     *
     */
    constructor(options: IPSQwantSearchConstructorOptions){
        this._options = options;
        this.checkInitializationErrors();
    }

    /**
     *
     * @param searchOptions
     */
    search(searchOptions:IPSQwantSearchOptions){

        console.debug('search :)');

        return new Promise(( resolve, reject ) =>
        {
            this.talkWithApi('/partner/search', searchOptions)
                .then( (response) => {
                    resolve(response);
                })
                .catch( (response) =>{
                    reject(response);
                })
        });
    }


    /**
     *
     * @param endPoint
     * @param params
     */
    private talkWithApi(endPoint:string, params:IPSQwantSearchOptions){

        console.debug('talkWithApi :)');

        return new Promise(( resolve, reject ) =>
        {
            $.ajax({

                url: this._options.url,
                type: 'post',
                data: {
                    'tx_psqwantsearch_pi1[endPoint]': endPoint,
                    'tx_psqwantsearch_pi1[params]': params
                },

                // Réussite du transfert
                success: (answer: any, status: string, xhr: XMLHttpRequest) =>
                {
                    resolve(answer);
                },

                // erreur du transfert
                error: (xhr: XMLHttpRequest, errorType: string, error: Error) =>
                {
                    reject({
                        xhr,
                        errorType,
                        error
                    });
                }
            });
        });




    }



    /**
     * Check all Js Dependencies
     */
    private checkInitializationErrors(){
        // check if jquery is loaded
        if(typeof jQuery != 'function'){
            console.error('Error : Plugin PsQwantSearch need jQuery');
        }
        // check if vue is loaded
        if(typeof Vue != 'function'){
            console.error('Error : Plugin PsQwantSearch need Vuejs');
        }
    }


}


jQuery('document').ready(function(){


    //let searchConnector = new PsQwantSearch(JSON.parse(PsQwantOptions));

    let appQwantSearch = new Vue({

        el: '#psQwantSearch',

        data() {
            return{
                isLoaded: false,
                error: false,
                q: '',
                pages: []
            }
        },

        mounted() {
            $('.psQwantSearch__results').show();

            this.searchConnector =  new PsQwantSearch(JSON.parse(PsQwantOptions))
            this.offset = 0;
            this.pageNum = 1;
            this.haveSearch = false;

            // launch default search
            if('defaultSearch' in this.searchConnector._options){
                this.q = this.searchConnector._options.defaultSearch;
                this.search();
            }

            // infinite scroll
            this.scrollEvent = window.addEventListener('scroll', this.checkInfiniteScroll)

        },

        beforeDestroy(){
            window.removeEventListener('scroll', this.checkInfiniteScroll);
        },

        methods:{

            checkInfiniteScroll(){

                if(this.showLoadMoreBtn() && this.inViewport($('.psQwantSearch__more').get(0), {})){
                    setTimeout(this.more(), 300);
                }
            },

            showLoadMoreBtn(){
                return (this.pageNum > 1 && !this.showNoMore());
            },

            showNoMore(){
                return (this.pageNum > 3);
            },

            showNoResults(){
                return (this.haveSearch && this.pages.length === 0 && this.q !== '')
            },


            search(){
                this.resetResults();
                this.launchSearch();
            },

            more(){
                console.debug('more');
                this.launchSearch();
            },


            /**
             * Launch Qwant Search using connectior
             */
            launchSearch(){

                // prevent multiple calls
                if(this.isLoaded) return;


                this.isLoaded = true;
                this.searchConnector.search({
                    q: this.q,
                    lang: this.searchConnector._options.lang,
                    count: this.searchConnector._options.count,
                    offset: (this.pageNum-1) * this.searchConnector._options.count
                }).then( (response) => {

                    this.isLoaded = false;
                    console.debug(response);

                    if(response.error !== 0){
                        this.error = response.errorInfos;
                    } else {
                        this.error = false;
                        this.haveSearch = true;
                        if(response.datas.items.length){
                            this.pages = [...this.pages, ...response.datas.items];
                            if(response.datas.total > this.searchConnector._options.count){
                                this.pageNum ++;
                            }
                        }
                    }


                }).catch( (response) => {
                    this.isLoaded = false;
                    this.error = response;
                });
            },

            /**
             * Reset and clean displayed results
             */
            resetResults(){
                this.haveSearch = false;
                this.pageNum = 1;
                this.pages = [];
            },

            /**
             * Appear transition for page results
             * @param el
             */
            enter(el) {
                let delay = el.dataset.index * 70;
                setTimeout(function () {
                    $(el).addClass('visible');
                }, delay)
            },
            /**
             * Leave transition for page results
             * @param el
             */
            leave(el) {
                $(el).removeClass('visible');
                setTimeout(() =>{
                    $(el).remove();
                }, 400)
            },

            /**
             * https://github.com/camwiegert/in-view/blob/master/src/viewport.js
             * @param element
             * @param options
             */
            inViewport (element, options) {

                const { top, right, bottom, left, width, height } = element.getBoundingClientRect();

                const intersection = {
                    t: bottom,
                    r: window.innerWidth - left,
                    b: window.innerHeight - top,
                    l: right
                };

                // default conf
                if(!('offset' in options)){
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
    })


});


