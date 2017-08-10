/*
 * jquery.facetview.js
 *
 * displays faceted browse results by querying a specified elasticsearch index
 * can read config locally or can be passed in as variable when executed
 * or a config variable can point to a remote config
 * 
 * created by Mark MacGillivray - mark@cottagelabs.com
 *
 * http://cottagelabs.com
 *
 * There is an explanation of the options below.
 *
 */

ldavis_initial = true;

//Automatically embed Kibana visualizations (using url from "share" option in Kibana interface) in iFrames
kibana_vizzes = [
    {
        "src": "https://search-atlas-es15-rtj4sfbg5avikc2shnvbcj7bva.us-west-1.es.amazonaws.com/_plugin/kibana/#/visualize/edit/Funding-Opportunities-by-Total-Award-Amount?embed&_g=(refreshInterval:(display:Off,section:0,value:0),time:(from:now-37y,mode:relative,to:now))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'*')),vis:(aggs:!((id:'1',params:(field:award_amount),schema:metric,type:sum),(id:'2',params:(exclude:(pattern:n%2Fa),field:FundingOpportunityTitle_unanalyzed,order:desc,orderBy:'1',size:30),schema:segment,type:terms)),listeners:(),params:(addLegend:!t,addTooltip:!t,defaultYExtents:!f,mode:stacked,shareYAxis:!t),type:histogram))",
        "label": "Funding Opportunities by Total Award Amount"
    },
    {
        "src": "https://search-atlas-es15-rtj4sfbg5avikc2shnvbcj7bva.us-west-1.es.amazonaws.com/_plugin/kibana/#/visualize/edit/Highest-Funded-Investigators?embed&_g=(refreshInterval:(display:Off,section:0,value:0),time:(from:now-37y,mode:relative,to:now))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'*')),vis:(aggs:!((id:'1',params:(field:award_amount),schema:metric,type:sum),(id:'2',params:(field:investigator_fullname,order:desc,orderBy:'1',size:25),schema:segment,type:terms)),listeners:(),params:(addLegend:!t,addTooltip:!t,defaultYExtents:!f,mode:stacked,shareYAxis:!t),type:histogram))",
        "label": "Highest Funded Investigators"
    },
    {
        "src": "http://atlas-kibana.dyndns.org/#/visualize/edit/Total-Yearly-Awards-for-NASA-and-NSF?embed&_g=(refreshInterval:(display:Off,pause:!f,section:0,value:0),time:(from:now-40y,mode:relative,to:now))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'*')),vis:(aggs:!((id:'1',params:(field:award_amount),schema:metric,type:sum),(id:'2',params:(customInterval:'2h',extended_bounds:(),field:award_effective_date,interval:y,min_doc_count:1),schema:segment,type:date_histogram),(id:'3',params:(field:org,order:desc,orderBy:'1',size:5),schema:group,type:terms)),listeners:(),params:(addLegend:!t,addTimeMarker:!f,addTooltip:!t,defaultYExtents:!f,drawLinesBetweenPoints:!t,interpolate:linear,radiusRatio:9,scale:linear,setYExtents:!f,shareYAxis:!t,showCircles:!t,smoothLines:!f,times:!(),yAxis:()),type:line))",
        "label": "Total Yearly Awards"
    },
    {
        "src":"https://search-atlas-es15-rtj4sfbg5avikc2shnvbcj7bva.us-west-1.es.amazonaws.com/_plugin/kibana/#/visualize/edit/Award-Amount-by-State?embed&_g=(refreshInterval:(display:Off,section:0,value:0),time:(from:now-40y,mode:relative,to:now))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'*')),vis:(aggs:!((id:'1',params:(field:award_amount),schema:metric,type:sum),(id:'2',params:(field:institution_state_abbr,order:desc,orderBy:'1',size:50),schema:segment,type:terms)),listeners:(),params:(addLegend:!t,addTooltip:!t,defaultYExtents:!f,mode:stacked,shareYAxis:!t),type:histogram))",
        "label": "Award Amount by State"
    },
    {
        "src":"https://search-atlas-es15-rtj4sfbg5avikc2shnvbcj7bva.us-west-1.es.amazonaws.com/_plugin/kibana/#/visualize/edit/Award-Amount-by-State-and-Institution?embed&_g=(refreshInterval:(display:Off,section:0,value:0),time:(from:now-100y,mode:relative,to:now))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'*')),vis:(aggs:!((id:'1',params:(field:award_amount),schema:metric,type:sum),(id:'2',params:(field:institution_state_abbr,order:desc,orderBy:'1',size:50),schema:segment,type:terms),(id:'3',params:(field:institution_name,order:desc,orderBy:'1',size:10),schema:group,type:terms)),listeners:(),params:(addLegend:!t,addTooltip:!t,defaultYExtents:!f,mode:stacked,shareYAxis:!t),type:histogram))",
        "label": "Top 10 Institutions by State (Award Amount)",
        "note": "*Bars do not represent total for each state, they are only the total for the top 10 institutions shown."
    },
    {
        "src": "https://search-atlas-es15-rtj4sfbg5avikc2shnvbcj7bva.us-west-1.es.amazonaws.com/_plugin/kibana/#/visualize/edit/Award-Amount-by-Institution?embed&_g=(refreshInterval:(display:Off,section:0,value:0),time:(from:now-40y,mode:relative,to:now))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'*')),vis:(aggs:!((id:'1',params:(field:award_amount),schema:metric,type:sum),(id:'2',params:(field:institution_name,order:desc,orderBy:'1',size:25),schema:segment,type:terms)),listeners:(),params:(addLegend:!t,addTooltip:!t,defaultYExtents:!f,mode:stacked,shareYAxis:!t),type:histogram))",
        "label": "Award Amount by Institution"
    },
    {
        "src": "https://search-atlas-es15-rtj4sfbg5avikc2shnvbcj7bva.us-west-1.es.amazonaws.com/_plugin/kibana/#/visualize/edit/Award-Amount-by-Institution-and-PI?embed&_g=(refreshInterval:(display:Off,section:0,value:0),time:(from:now-40y,mode:relative,to:now))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'*')),vis:(aggs:!((id:'1',params:(field:award_amount),schema:metric,type:sum),(id:'2',params:(field:institution_name,order:desc,orderBy:'1',size:25),schema:segment,type:terms),(id:'3',params:(field:investigator_fullname,order:desc,orderBy:'1',size:10),schema:group,type:terms)),listeners:(),params:(addLegend:!t,addTooltip:!t,defaultYExtents:!f,mode:stacked,shareYAxis:!t),type:histogram))",
        "label": "Top 10 Investigators by Institution (Award Amount)",
        "note": "*Bars do not represent total for each institution, they are only the total for the top 10 investigators shown."
    },
    {
        "src": "https://search-atlas-es15-rtj4sfbg5avikc2shnvbcj7bva.us-west-1.es.amazonaws.com/_plugin/kibana/#/visualize/edit/Award-Info?embed&_g=(refreshInterval:(display:Off,section:0,value:0),time:(from:now-40y,mode:relative,to:now))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'%22california%20institute%20of%20technology%22')),vis:(aggs:!((id:'2',params:(field:award_title_unanalyzed,order:desc,orderBy:'6',size:5000),schema:bucket,type:terms),(id:'3',params:(field:institution_name,order:desc,orderBy:'6',size:5000),schema:bucket,type:terms),(id:'4',params:(field:award_effective_date,order:desc,orderBy:'6',size:5000),schema:bucket,type:terms),(id:'5',params:(field:FundingOpportunityTitle_unanalyzed,order:desc,orderBy:'6',size:5000),schema:bucket,type:terms),(id:'6',params:(field:award_amount),schema:metric,type:sum),(id:'1',params:(),schema:metric,type:count),(id:'7',params:(field:org,order:desc,orderBy:'6',size:5000),schema:bucket,type:terms)),listeners:(),params:(perPage:10,showMeticsAtAllLevels:!f,showPartialRows:!f),type:table))",
        "label": "Award Detail"
    },
    {
        "src": "https://search-atlas-es15-rtj4sfbg5avikc2shnvbcj7bva.us-west-1.es.amazonaws.com/_plugin/kibana/#/visualize/edit/Awardees-from-both-NASA-and-NSF?embed&_g=(refreshInterval:(display:Off,section:0,value:0),time:(from:now-40y,mode:relative,to:now))&_a=(filters:!(),linked:!f,query:(query_string:(analyze_wildcard:!t,query:'*')),vis:(aggs:!((id:'6',params:(),schema:metric,type:count),(id:'2',params:(field:investigator_fullname,order:desc,orderBy:'1',size:10000),schema:bucket,type:terms),(id:'4',params:(field:award_amount),schema:metric,type:sum),(id:'1',params:(field:org),schema:metric,type:cardinality),(id:'5',params:(field:org,order:desc,orderBy:'1',size:2),schema:bucket,type:terms)),listeners:(),params:(perPage:10,showMeticsAtAllLevels:!f,showPartialRows:!f),type:table))",
        "label": "Winners of both NASA and NSF Awards"
    }
]

var cat1_color = {
                "NSF" : "#BFD8BD",
                "NASA" : "#E9C46A",
                "DOE": "#F4A261",
                "DoD": "#EF959D",
                "NTIS": "#C1E0F7"
                // "Marine and Terrestrial Ecosystems and Natural Resource Management" : "#F4A261",
                // "Weather and Air Quality: Minutes to Subseasonal" : "#EF959D",
                // "Climate Variability and Change: Seasonal to Centennial" : "#C1E0F7",
                // "Earth Surface and Interior: Dynamics and Hazards" : "#EDDEA4",
                // "Unknown - limited keywords" : "#C5C3C6"
            }

var cat2_color = {
                "award" : "#EDDEA4",
                "solicitation" : "#C1E0F7",
                // "Marine and Terrestrial Ecosystems and Natural Resource Management" : "#F4A261",
                // "Weather and Air Quality: Minutes to Subseasonal" : "#EF959D",
                // "Climate Variability and Change: Seasonal to Centennial" : "#C1E0F7",
                // "Earth Surface and Interior: Dynamics and Hazards" : "#EDDEA4",
                // "Unknown - limited keywords" : "#C5C3C6"
            }

// Used to format results differently based on values for a given field with values representing different data sources, for example
result_displays = {
    "field": "type",
    "display1": "award",
    "display2": "solicitation"
}

//Vars for html results
var title_field = "award_title";
var author_field = "investigator_fullname";
var num_similar = 5; //use for titles and authors
// var num_html_topics = 1;
// var single_topic; //if there is only one topic present in result set, automatically show that topic's keywords in the ldavis
// var min_published = 2; //minimum authorships required for force firected graph (keep browser from blowing up)


// var topic_counts; // hold number of results for each topic (using facet) to be used in determining radius of ldavis circles
// var num_topics = 15; // num of topics specified in LDA topic model - tells facet for topics how many items to show

// first define the bind with delay function from (saves loading it separately) 
// https://github.com/bgrins/bindWithDelay/blob/master/bindWithDelay.js

(function($) {
    $.fn.bindWithDelay = function( type, data, fn, timeout, throttle ) {
        var wait = null;
        var that = this;

        if ( $.isFunction( data ) ) {
            throttle = timeout;
            timeout = fn;
            fn = data;
            data = undefined;
        }

        function cb() {
            var e = $.extend(true, { }, arguments[0]);
            var throttler = function() {
                wait = null;
                fn.apply(that, [e]);
            };

            if (!throttle) { clearTimeout(wait); }
            if (!throttle || !wait) { wait = setTimeout(throttler, timeout); }
        }

        return this.bind(type, data, cb);
    };
})(jQuery);

// add extension to jQuery with a function to get URL parameters
jQuery.extend({
    getUrlVars: function() {
        var params = new Object;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for ( var i = 0; i < hashes.length; i++ ) {
            hash = hashes[i].split('=');
            if ( hash.length > 1 ) {
                if ( hash[1].replace(/%22/gi,"")[0] == "[" || hash[1].replace(/%22/gi,"")[0] == "{" ) {
                    hash[1] = hash[1].replace(/^%22/,"").replace(/%22$/,"");
                    var newval = JSON.parse(unescape(hash[1].replace(/%22/gi,'"')));
                } else {
                    var newval = unescape(hash[1].replace(/%22/gi,'"'));
                }
                params[hash[0]] = newval;
            }
        }
        return params;
    },
    getUrlVar: function(name){
        return jQuery.getUrlVars()[name];
    }
});


// Deal with indexOf issue in <IE9
// provided by commentary in repo issue - https://github.com/okfn/facetview/issues/18
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

/* EXPLAINING THE FACETVIEW OPTIONS

Facetview options can be set on instantiation. The list below details which options are available.

Options can also be set and retrieved externally via $.fn.facetview.options.

Query values can also be read from the query parameters of the current page, or provided in
the "source" option for initial search.

Also, whilst facetview is executing a query, it will "show" any element with the "notify-loading" class.
So that class can be applied to any element on a page that can be used to signify loading is taking place.

Once facetview has executed a query, the querystring used is available under "options.querystring".
And the result object as retrieved directly from the index is available under "options.rawdata".

searchbox_class
---------------
This should only be set if embedded_search is set to false, and if an alternative search box on the page should 
be used as the source of search terms. If so, this should be set to 
the class name (including preceding .) of the text input that should be used as the source of the search terms.
It is only a class instead of an ID so that it can be applied to fields that may already have an ID - 
it should really identify a unique box on the page for entering search terms for this instance of facetview.
So an ID could actually also be used - just precede with # instead of .
This makes it possible to embed a search box anywhere on a page and have it be used as the source of simple 
search parameters for the facetview. Only the last text box with this clas will be used.

embedded_search
---------------
Default to true, in which case full search term functionality is created and displayed on the page.
If this is false, the search term text box and options will be hidden, so that new search terms cannot 
be provided by the user.
It is possible to set an alternative search term input box on the page instead, by setting this to false and 
also setting a searchbox_class value to identify the basic source of search terms, in which case such a box 
must be manually created elsewhere on the page.

searchbox_shade
---------------
The background colour to apply to the search box

sharesave_link
--------------
Default to true, in which case the searchbox - if drawn by facetview - will be appended with a button that 
shows the full current search parameters as a URL.

config_file
-----------
Specify as a URL from which to pull a JSON config file specifying these options.

facets
------
A list of facet objects which should be created as filter options on the page.
As per elasticsearch facets settings, plus "display" as a display name for the facet, instead of field name.
If these should be nested, define them with full scope e.g. nestedobj.nestedfield.

extra_facets
------------
An object of named extra facet objects that should be submitted and executed on each query.
These will NOT be used to generate filters on the page, but the result object can be queried 
for their content for other purposes.

searchbox_fieldselect
---------------------
A list of objects specifying fields to which search terms should be restricted.
Each object should have a "display" value for displaying as the name of the option, 
and a "field" option specifying the field to restrict the search to.

search_sortby
----------------
A list of objects describing sort option dropdowns. 
Each object requires a "display" value, and "field" value upon which to sort results.
NOTE sort fields must be unique on the ES index, NOT lists. Otherwise it will fail silently. Choose wisely.

enable_rangeselect
------------------
RANGES NEED SOME WORK AFTER RECENT UPDATE, KEEP DISABLED FOR NOW
Enable or disable the ability to select a range of filter values

include_facets_in_querystring
-----------------------------
Default to false.
Whether or not to include full facet settings in the querystring when it is requested for display.
This makes it easier to get the querystring for other purposes, but does not change the query that is 
sent to the index.

result_display
--------------
A display template for search results. It is a list of lists.
Each list specifies a line. Within each list, specify the contents of the line using objects to describe 
them. Each content piece should pertain to a particular "field" of the result set, and should specify what 
to show "pre" and "post" the given field

display_images
--------------
Default to true, in which case any image found in a given result object will be displayed to the left 
in the result object output.

description
-----------
Just an option to provide a human-friendly description of the functionality of the instantiated facetview.
Like "search my shop". Will be displayed on the page. 

search_url
----------
The URL at the index to which searches should be submitted in order to retrieve JSON results.

datatype
--------
The datatype that should be used when submitting a search to the index - e.g. JSON for local, JSONP for remote.

initialsearch
-------------
Default to true, in which case a search-all will be submitted to the index on page load.
Set to false to wait for user input before issuing the first search.

fields
------
A list of which fields the index should return in result objects (by default elasticsearch returns them all).

partial_fields
--------------
A definition of which fields to return, as per elasticsearch docs http://www.elasticsearch.org/guide/reference/api/search/fields.html

nested
------
A list of keys for which the content should be considered nested for query and facet purposes.
NOTE this requires that such keys be referenced with their full scope e.g. nestedobj.nestedfield.
Only works on top-level keys so far.

default_url_params
------------------
Any query parameters that the index search URL needs by default.

freetext_submit_delay
---------------------
When search terms are typed in the search box, they are automatically submitted to the index.
This field specifies in milliseconds how long to wait before sending another query - e.g. waiting
for the user to finish typing a word.

q
-
Specify a query value to start with when the page is loaded. Will be submitted as the initial search value 
if initialsearch is enabled. Will also be set as the value of the searchbox on page load.

predefined_filters
------------------
Facet / query values to apply to all searches. Give each one a reference key, then in each object define it 
as per an elasticsearch query for appending to the bool must. 
If these filters should be applied at the nested level, then prefix the name with the relevant nesting prefix. 
e.g. if the nested object is called stats, call the filter stats.MYFILTER.

filter
-------
JSON document describing an `elasticsearch filter <http://www.elasticsearch.org/guide/reference/api/search/filter/>`_

paging
------
An object defining the paging settings:

    from
    ----
    Which result number to start displaying results from

    size
    ----
    How many results to get and display per "page" of results

pager_on_top
------------
Default to false, in which case the pager - e.g. result count and prev / next page buttons - only appear 
at the bottom of the search results.
Set to true to show the pager at the top of the search results as well.

pager_slider
------------
If this is set to true, then the paging options will be a left and right arrow at the bottom, with the 
count in between, but a bit bigger and more slider-y than the standard one. Works well for displaying 
featured content, for example.

sort
----
A list of objects defining how to sort the results, as per elasticsearch sorting.

searchwrap_start
searchwrap_end
----------------
HTML values in which to wrap the full result set, to style them into the page they are being injected into.

resultwrap_start
resultwrap_end
----------------
HTML values in which to wrap each result object

result_box_colours
------------------
A list of background colours that will be randomly assigned to each result object that has the "result_box" 
class. To use this, specify the colours in this list and ensure that the "result_display" option uses the 
"result_box" class to wrap the result objects.

fadein
------
Define a fade-in delay in milliseconds so that whenever a new list of results is displays, it uses the fade-in effect.

post_search_callback
--------------------
This can define or reference a function that will be executed any time new search results are retrieved and presented on the page.

pushstate
---------
Updates the URL string with the current query when the user changes the search terms

linkify
-------
Makes any URLs in the result contents into clickable links

default_operator
----------------
Sets the default operator in text search strings - elasticsearch uses OR by default, but can also be AND

default_freetext_fuzzify
------------------------
If this exists and is not false, it should be either * or ~. If it is * then * will be prepended and appended
to each string in the freetext search term, and if it is ~ then ~ will be appended to each string in the freetext 
search term. If * or ~ or : are already in the freetext search term, it will be assumed the user is already trying 
to do a complex search term so no action will be taken. NOTE these changes are not replicated into the freetext 
search box - the end user will not know they are happening.

*/


// now the facetview function
(function($){
    $.fn.facetview = function(options) {

        var result_num = 0;
        var topics_assigned = []; //needs to be global to attach onclick to div
        var similar_titles = [];
        var similar_authors = [];
        var authors = [];
        var auth_count = 0;
        var result_keywords = [];
        var keyword_count = 0;
        // a big default value (pulled into options below)
        // demonstrates how to specify an output style based on the fields that can be found in the result object
        // where a specified field is not found, the pre and post for it are just ignored
         var resdisplay = [
                [
                    {
                        "field": "author.name"
                    },
                    {
                        "pre": "(",
                        "field": "year",
                        "post": ")"
                    }
                ],
                [
                    {
                        "pre": "<strong>",
                        "field": "title",
                        "alternative_field": "booktitle",
                        "post": "</strong>"
                    }
                ],
                [
                    {
                        "field": "howpublished"
                    },
                    {
                        "pre": "in <em>",
                        "field": "journal.name",
                        "post": "</em>,"
                    },
                    {
                        "pre": "<em>",
                        "field": "booktitle",
                        "post": "</em>,"
                    },
                    {
                        "pre": "vol. ",
                        "field": "volume",
                        "post": ","
                    },
                    {
                        "pre": "p. ",
                        "field": "pages"
                    },
                    {
                        "field": "publisher"
                    }
                ],
                [
                    {
                        "field": "link.url"
                    }
                ],
                [
                    {
                        "pre": "<span class='highlightings'>",
                        "highlight_field": "text",
                        "post": "</span>"
                    }
                ]    
            ];

        // specify the defaults
        var defaults = {
            "config_file": false,
            "embedded_search": true,
            "searchbox_class": "",
            "searchbox_fieldselect": [],
            "searchbox_shade": "#ecf4ff",
            "search_sortby": [],
            "sharesave_link": true,
            "description":"",
            "facets":[],
            "extra_facets": {},
            "enable_rangeselect": false,
            "include_facets_in_querystring": false,
            "result_display": resdisplay,
            "display_images": true,
            "search_url":"",
            "datatype":"jsonp",
            "initialsearch":true,
            "fields": false,
            "partial_fields": false,
            "nested": ["topic1.topic"],
            "default_url_params":{},
            "freetext_submit_delay":"500",
            "q":"",
            "sort":[],
            "predefined_filters":{},
            "paging":{
                "from":0,
                "size":10
            },
            "pager_on_top": false,
            "pager_slider": false,
            "searchwrap_start":'<table class="table table-striped table-bordered" id="facetview_results">',
            "searchwrap_end":"</table>",
            "resultwrap_start":"<tr><td>",
            "resultwrap_end":"</td></tr>",
            "result_box_colours":[],
            "fadein":800,
            "post_search_callback": false,
            "pushstate": true,
            "linkify": true,
            "default_operator": "OR",
            "default_freetext_fuzzify": false
        };


        // and add in any overrides from the call
        // these options are also overridable by URL parameters
        // facetview options are declared as a function so they are available externally
        // (see bottom of this file)
        var provided_options = $.extend(defaults, options);
        var url_options = $.getUrlVars();
        $.fn.facetview.options = $.extend(provided_options,url_options);
        var options = $.fn.facetview.options;


        // ===============================================
        // functions to do with filters
        // ===============================================
        
        // show the filter values
        var showfiltervals = function(event) {
            event.preventDefault();
            if ( $(this).hasClass('facetview_open') ) {
                $(this).children('i').removeClass('icon-minus');
                $(this).children('i').addClass('icon-plus');
                $(this).removeClass('facetview_open');
                $('[id="facetview_' + $(this).attr('rel') +'"]', obj ).children().find('.facetview_filtervalue').hide();
                $(this).siblings('.facetview_filteroptions').hide();
            } else {
                $(this).children('i').removeClass('icon-plus');
                $(this).children('i').addClass('icon-minus');
                $(this).addClass('facetview_open');
                $('[id="facetview_' + $(this).attr('rel') +'"]', obj ).children().find('.facetview_filtervalue').show();
                $(this).siblings('.facetview_filteroptions').show();
            }
        };

        // function to switch filters to OR instead of AND
        var orfilters = function(event) {
            event.preventDefault();
            if ( $(this).attr('rel') == 'AND' ) {
                $(this).attr('rel','OR');
                $(this).css({'color':'#333'});
                $('.facetview_filterselected[rel="' + $(this).attr('href') + '"]', obj).addClass('facetview_logic_or');
            } else {
                $(this).attr('rel','AND');
                $(this).css({'color':'#aaa'});
                $('.facetview_filterselected[rel="' + $(this).attr('href') + '"]', obj).removeClass('facetview_logic_or');
            }
            dosearch();
        }

        // function to perform for sorting of filters
        var sortfilters = function(event) {
            event.preventDefault();
            var sortwhat = $(this).attr('href');
            var which = 0;
            for ( var i = 0; i < options.facets.length; i++ ) {
                var item = options.facets[i];
                if ('field' in item) {
                    if ( item['field'] == sortwhat) {
                        which = i;
                    }
                }
            }
            // iterate to next sort type on click. order is term, rterm, count, rcount
            if ( $(this).hasClass('facetview_term') ) {
                options.facets[which]['order'] = 'reverse_term';
                $(this).html('a-z <i class="icon-arrow-up"></i>');
                $(this).removeClass('facetview_term').addClass('facetview_rterm');
            } else if ( $(this).hasClass('facetview_rterm') ) {
                options.facets[which]['order'] = 'count';
                $(this).html('count <i class="icon-arrow-down"></i>');
                $(this).removeClass('facetview_rterm').addClass('facetview_count');
            } else if ( $(this).hasClass('facetview_count') ) {
                options.facets[which]['order'] = 'reverse_count';
                $(this).html('count <i class="icon-arrow-up"></i>');
                $(this).removeClass('facetview_count').addClass('facetview_rcount');
            } else if ( $(this).hasClass('facetview_rcount') ) {
                options.facets[which]['order'] = 'term';
                $(this).html('a-z <i class="icon-arrow-down"></i>');
                $(this).removeClass('facetview_rcount').addClass('facetview_term');
            }
            dosearch();
        };
        
        // adjust how many results are shown
        var morefacetvals = function(event) {
            event.preventDefault();
            var morewhat = options.facets[ $(this).attr('rel') ];
            if ('size' in morewhat ) {
                var currentval = morewhat['size'];
            } else {
                var currentval = 10;
            }
            var newmore = prompt('Currently showing ' + currentval + '. How many would you like instead?');
            if (newmore) {
                options.facets[ $(this).attr('rel') ]['size'] = parseInt(newmore);
                $(this).html(newmore);
                dosearch();
            }
        };

        // insert a facet range once selected
        // TODO: UPDATE
        var dofacetrange = function(rel) {
            $('#facetview_rangeresults_' + rel, obj).remove();
            var range = $('#facetview_rangechoices_' + rel, obj).html();
            var newobj = '<div style="display:none;" class="btn-group" id="facetview_rangeresults_' + rel + '"> \
                <a class="facetview_filterselected facetview_facetrange facetview_clear \
                btn btn-info" rel="' + rel + 
                '" alt="remove" title="remove"' +
                ' href="' + $(this).attr("href") + '">' +
                range + ' <i class="icon-white icon-remove"></i></a></div>';
            $('#facetview_selectedfilters', obj).append(newobj);
            $('.facetview_filterselected', obj).unbind('click',clearfilter);
            $('.facetview_filterselected', obj).bind('click',clearfilter);
            options.paging.from = 0;
            dosearch();
        };
        // clear a facet range
        var clearfacetrange = function(event) {
            event.preventDefault();
            $('#facetview_rangeresults_' + $(this).attr('rel'), obj).remove();
            $('#facetview_rangeplaceholder_' + $(this).attr('rel'), obj).remove();
            dosearch();
        };
        // build a facet range selector
        var facetrange = function(event) {
            // TODO: when a facet range is requested, should hide the facet list from the menu
            // should perhaps also remove any selections already made on that facet
            event.preventDefault();
            var rel = $(this).attr('rel');
            var rangeselect = '<div id="facetview_rangeplaceholder_' + rel + '" class="facetview_rangecontainer clearfix"> \
                <div class="clearfix"> \
                <h3 id="facetview_rangechoices_' + rel + '" style="margin-left:10px; margin-right:10px; float:left; clear:none;" class="clearfix"> \
                <span class="facetview_lowrangeval_' + rel + '">...</span> \
                <small>to</small> \
                <span class="facetview_highrangeval_' + rel + '">...</span></h3> \
                <div style="float:right;" class="btn-group">';
            rangeselect += '<a class="facetview_facetrange_remove btn" rel="' + rel + '" alt="remove" title="remove" \
                 href="#"><i class="icon-remove"></i></a> \
                </div></div> \
                <div class="clearfix" style="margin:20px;" id="facetview_slider_' + rel + '"></div> \
                </div>';
            $('#facetview_selectedfilters', obj).after(rangeselect);
            $('.facetview_facetrange_remove', obj).unbind('click',clearfacetrange);
            $('.facetview_facetrange_remove', obj).bind('click',clearfacetrange);
            var values = [];
            var valsobj = $( '#facetview_' + $(this).attr('href').replace(/\./gi,'_'), obj );
            valsobj.find('.facetview_filterchoice', obj).each(function() {
                values.push( $(this).attr('href') );
            });
            values = values.sort();
            $( "#facetview_slider_" + rel, obj ).slider({
                range: true,
                min: 0,
                max: values.length-1,
                values: [0,values.length-1],
                slide: function( event, ui ) {
                    $('#facetview_rangechoices_' + rel + ' .facetview_lowrangeval_' + rel, obj).html( values[ ui.values[0] ] );
                    $('#facetview_rangechoices_' + rel + ' .facetview_highrangeval_' + rel, obj).html( values[ ui.values[1] ] );
                    dofacetrange( rel );
                }
            });
            $('#facetview_rangechoices_' + rel + ' .facetview_lowrangeval_' + rel, obj).html( values[0] );
            $('#facetview_rangechoices_' + rel + ' .facetview_highrangeval_' + rel, obj).html( values[ values.length-1] );
        };

        // pass a list of filters to be displayed
        var buildfilters = function() {
            if ( options.facets.length > 0 ) {
                var filters = options.facets;
                var thefilters = '';
                for ( var idx = 0; idx < filters.length; idx++ ) {
                    // HACK
                    if (filters[idx].field == "topic1_topic") {
                        filters[idx]['size'] = num_topics;
                    }
                    //----------

                    var _filterTmpl = '<table id="facetview_{{FILTER_NAME}}" class="facetview_filters table table-bordered table-condensed table-striped" style="display:none;"> \
                        <tr><td><a class="facetview_filtershow" title="filter by {{FILTER_DISPLAY}}" rel="{{FILTER_NAME}}" \
                        style="color:#333; font-weight:bold;" href=""><i class="icon-plus"></i> {{FILTER_DISPLAY}} \
                        </a> \
                        <div class="btn-group facetview_filteroptions" style="display:none; margin-top:5px;"> \
                            <a class="btn btn-small facetview_learnmore" title="click to view search help information" href="#"><b>?</b></a> \
                            <a class="btn btn-small facetview_morefacetvals" title="filter list size" rel="{{FACET_IDX}}" href="{{FILTER_EXACT}}">{{FILTER_HOWMANY}}</a> \
                            <a class="btn btn-small facetview_sort {{FILTER_SORTTERM}}" title="filter value order" href="{{FILTER_EXACT}}">{{FILTER_SORTCONTENT}}</a> \
                            <a class="btn btn-small facetview_or" title="select another option from this filter" rel="AND" href="{{FILTER_EXACT}}" style="color:#aaa;">OR</a> \
                            ';
                    if ( options.enable_rangeselect ) {
                        _filterTmpl += '<a class="btn btn-small facetview_facetrange" title="make a range selection on this filter" rel="{{FACET_IDX}}" href="{{FILTER_EXACT}}" style="color:#aaa;">range</a>';
                    }
                    _filterTmpl +='</div> \
                        </td></tr> \
                        </table>';
                    _filterTmpl = _filterTmpl.replace(/{{FILTER_NAME}}/g, filters[idx]['field'].replace(/\./gi,'_').replace(/\:/gi,'_')).replace(/{{FILTER_EXACT}}/g, filters[idx]['field']);
                    thefilters += _filterTmpl;
                    if ('size' in filters[idx] ) {
                        thefilters = thefilters.replace(/{{FILTER_HOWMANY}}/gi, filters[idx]['size']);
                    } else {
                        thefilters = thefilters.replace(/{{FILTER_HOWMANY}}/gi, 10);
                    };
                    if ( 'order' in filters[idx] ) {
                        if ( filters[idx]['order'] == 'term' ) {
                            thefilters = thefilters.replace(/{{FILTER_SORTTERM}}/g, 'facetview_term');
                            thefilters = thefilters.replace(/{{FILTER_SORTCONTENT}}/g, 'a-z <i class="icon-arrow-down"></i>');
                        } else if ( filters[idx]['order'] == 'reverse_term' ) {
                            thefilters = thefilters.replace(/{{FILTER_SORTTERM}}/g, 'facetview_rterm');
                            thefilters = thefilters.replace(/{{FILTER_SORTCONTENT}}/g, 'a-z <i class="icon-arrow-up"></i>');
                        } else if ( filters[idx]['order'] == 'count' ) {
                            thefilters = thefilters.replace(/{{FILTER_SORTTERM}}/g, 'facetview_count');
                            thefilters = thefilters.replace(/{{FILTER_SORTCONTENT}}/g, 'count <i class="icon-arrow-down"></i>');
                        } else if ( filters[idx]['order'] == 'reverse_count' ) {
                            thefilters = thefilters.replace(/{{FILTER_SORTTERM}}/g, 'facetview_rcount');
                            thefilters = thefilters.replace(/{{FILTER_SORTCONTENT}}/g, 'count <i class="icon-arrow-up"></i>');
                        };
                    } else {
                        thefilters = thefilters.replace(/{{FILTER_SORTTERM}}/g, 'facetview_count');
                        thefilters = thefilters.replace(/{{FILTER_SORTCONTENT}}/g, 'count <i class="icon-arrow-down"></i>');
                    };
                    thefilters = thefilters.replace(/{{FACET_IDX}}/gi,idx);
                    if ('display' in filters[idx]) {
                        thefilters = thefilters.replace(/{{FILTER_DISPLAY}}/g, filters[idx]['display']);
                    } else {
                        thefilters = thefilters.replace(/{{FILTER_DISPLAY}}/g, filters[idx]['field']);
                    };
                };
                $('#facetview_filters', obj).html("").append(thefilters);
                $('.facetview_morefacetvals', obj).bind('click',morefacetvals);
                $('.facetview_facetrange', obj).bind('click',facetrange);
                $('.facetview_sort', obj).bind('click',sortfilters);
                $('.facetview_or', obj).bind('click',orfilters);
                $('.facetview_filtershow', obj).bind('click',showfiltervals);
                $('.facetview_learnmore', obj).unbind('click',learnmore);
                $('.facetview_learnmore', obj).bind('click',learnmore);
                options.description ? $('#facetview_filters', obj).append('<div>' + options.description + '</div>') : "";
            };
        };

        // trigger a search when a filter choice is clicked
        // or when a source param is found and passed on page load
        var clickfilterchoice = function(event,rel,href) {
            if ( event ) {
                event.preventDefault();
                var rel = $(this).attr("rel");
                var href = $(this).attr("href");
                //if user clicks link in result, assign href and rel with below
                // if (event.toElement.id.indexOf("_topic") > -1){
                //     rel = "topic1_topic"
                //     href = event.toElement.id.match(/topic\d+/g).toString().replace("topic","");
                //     $('#lda').css("display", "block")
                // }
                // else if(event.toElement.id.indexOf("simtitle") > -1){
                //     rel = title_field;
                //     href = event.toElement.id.split("simtitle__")[1]
                //         .replace(/AAA/g,"#").replace(/BBB/g," ").replace(/CCC/g,":").replace(/DDD/g,".")
                //         .replace(/EEE/g,"(").replace(/FFF/g,")").replace(/GGG/g,",");
                // }
                // else if(event.toElement.id.indexOf("simauth") > -1){
                //     rel = author_field;
                //     href = event.toElement.id.split("simauth__")[1]
                //         .replace(/AAA/g,"#").replace(/BBB/g," ").replace(/CCC/g,":").replace(/DDD/g,".")
                //         .replace(/EEE/g,"(").replace(/FFF/g,")").replace(/GGG/g,",").toLowerCase();
                // }
                // else if(event.toElement.id.indexOf("resultauth") > -1){
                //     rel = author_field;
                //     href = event.toElement.id.split("resultauth__")[1]
                //         .replace(/AAA/g,"#").replace(/BBB/g," ").replace(/CCC/g,":").replace(/DDD/g,".")
                //         .replace(/EEE/g,"(").replace(/FFF/g,")").replace(/GGG/g,",").toLowerCase();
                // }
                // else if(event.toElement.id.indexOf("keyword") > -1){
                //     rel = "keywords";
                //     href = event.toElement.id.split("keyword__")[1];
                // }
                //----------------------------------------------------
            }
            var relclean = rel.replace(/\./gi,'_').replace(/\:/gi,'_');
            // Do nothing if element already exists.
            if( $('a.facetview_filterselected[href="'+href+'"][rel="'+rel+'"]').length ){
                return null;
            }

            var newobj = '<a class="facetview_filterselected facetview_clear btn btn-info';
            if ( $('.facetview_or[href="' + rel + '"]', obj).attr('rel') == 'OR' ) {
                newobj += ' facetview_logic_or';
            }
            newobj += '" rel="' + rel + 
                '" alt="remove" title="remove"' +
                ' href="' + href + '">' +
                href + ' <i class="icon-white icon-remove" style="margin-top:1px;"></i></a>';

            if ( $('#facetview_group_' + relclean, obj).length ) {
                $('#facetview_group_' + relclean, obj).append(newobj);
            } else {
                var pobj = '<div id="facetview_group_' + relclean + '" class="btn-group">';
                pobj += newobj + '</div>';
                $('#facetview_selectedfilters', obj).append(pobj);
            };

            $('.facetview_filterselected', obj).unbind('click',clearfilter);
            $('.facetview_filterselected', obj).bind('click',clearfilter);
            if ( event ) {
                options.paging.from = 0;
                dosearch();
            };
        };

        // clear a filter when clear button is pressed, and re-do the search
        var clearfilter = function(event) {
            event.preventDefault();
            if ( $(this).siblings().length == 0 ) {
                $(this).parent().remove();
            } else {
                $(this).remove();
            }
            dosearch();
        };
        
        // ===============================================
        // functions to do with building results
        // ===============================================

        var dd_highlight_terms = [];

        // read the result object and return useful vals
        // returns an object that contains things like ["data"] and ["facets"]
        var parseresults = function(dataobj) {
            var resultobj = new Object();
            resultobj["records"] = new Array();
            resultobj["start"] = "";
            resultobj["found"] = "";
            resultobj["facets"] = new Object();
            for ( var item = 0; item < dataobj.hits.hits.length; item++ ) {
                if ( options.fields ) {
                    resultobj["records"].push(dataobj.hits.hits[item].fields);
                } else if ( options.partial_fields ) {
                    var keys = [];
                    for(var key in options.partial_fields){
                        keys.push(key);
                    }
                    resultobj["records"].push(dataobj.hits.hits[item].fields[keys[0]]);
                } else {
                    resultobj["records"].push(dataobj.hits.hits[item]._source);
                }
            }
            resultobj["start"] = "";
            resultobj["found"] = dataobj.hits.total;
            for (var item in dataobj.facets) {
                var facetsobj = new Object();
                for (var thing = 0; thing < dataobj.facets[item]["terms"].length; thing++) {
                    facetsobj[ dataobj.facets[item]["terms"][thing]["term"] ] = dataobj.facets[item]["terms"][thing]["count"];
                }
                resultobj["facets"][item] = facetsobj;
            }
            return resultobj;
        };

        // decrement result set
        var decrement = function(event) {
            event.preventDefault();
            if ( $(this).html() != '..' ) {
                options.paging.from = options.paging.from - options.paging.size;
                options.paging.from < 0 ? options.paging.from = 0 : "";
                dosearch();
            }
        };
        // increment result set
        var increment = function(event) {
            event.preventDefault();
            if ( $(this).html() != '..' ) {
                options.paging.from = parseInt($(this).attr('href'));
                dosearch();
            }
        };

        // used to get value by dotted notation in result_display
        var getvalue = function(obj, dotted_notation) {
            var parts = dotted_notation.split('.');
            parts.reverse();
            var ref = [parts.pop()];
            while (parts.length && !(ref.join(".") in obj)) {
                ref.push(parts.pop());
            }
            var addressed_ob = obj[ref.join(".")];
            var left = parts.reverse().join(".");

            if (addressed_ob && addressed_ob.constructor.toString().indexOf("Array") == -1) {
                if (parts.length)
                    return getvalue(addressed_ob, left);
                else
                    return addressed_ob;
            } else {
                if ( addressed_ob !== undefined ) {
                    var thevalue = [];
                    // HACK CUSTOM
                    // console.log(addressed)
                    // for ( var row = 0; row < addressed_ob.length; row++ ) {
                    //     thevalue.push(getvalue(addressed_ob[row], left));
                    // }
                    // return thevalue;
                    return addressed_ob;
                } else {
                    return undefined;
                }
            }
        };


        // given a result record, build how it should look on the page
        var buildrecord = function(index) {
            //used to assign unique ids to hyperlinks 
            result_num += 1;

            var record = options.data['records'][index];
            var result = options.resultwrap_start;

            // add first image where available
            if (options.display_images) {
                var recstr = JSON.stringify(record);
                var regex = /(http:\/\/\S+?\.(jpg|png|gif|jpeg))/;
                var img = regex.exec(recstr);
                if (img) {
                    result += '<img class="thumbnail" style="float:left; width:100px; margin:0 5px 10px 0; max-height:150px;" src="' + img[0] + '" />';
                }
            }
            //automatically add title and author fields (based on global vars)

            if(record.type == "solicitation"){
                title_field = "FundingOpportunityTitle"
            }

            //title
            result += '<h3>' + record[title_field] + '</h3>'
            result += '<b> Agency: </b> <span style="display: inline-block; height: 20px; margin: 4px 4px 3px; padding: 4; width: auto; line-height: 20px;\
                background-color: ' + cat1_color[record.org] +'; border-radius: 6px; text-align: center; font-size: 10pt; "><b style="margin: 6px;">' 
                + record.org + '</b></span>\
                <span style="display: inline-block; height: 20px; margin: 4px 4px 3px; padding: 4; width: auto; line-height: 20px;\
                background-color: ' + cat2_color[record.type] +'; border-radius: 6px; text-align: center; font-size: 10pt; "><b style="margin: 6px;">' 
                + record.type + '</b></span><br>\
                <b> Category: </b> <span style="display: inline-block; height: 20px; margin: 4px 4px 3px; padding: 4; width: auto; line-height: 20px;\
                background-color: lightblue; border-radius: 6px; text-align: center; font-size: 10pt; "><b style="margin: 6px;">' 
                + record.category_cs + '</b></span>'

            //authors
            // result += ' <b style=" display: inline-block; float: left; width: 145px;"> Authors: </b> <div style="display: inline-block; width: 700px;">';
            // for( x = 0; x < record[author_field].length; x++){
            //     author_id = record[author_field][x].replace(/#/g,"AAA").replace(/ /g,"BBB").replace(/:/g,"CCC").replace(/\./g,"DDD").
            //     replace(/\(/g,"EEE").replace(/\)/g,"FFF").replace(/,/g,"GGG")

            //     authors.push(author_id);
            //     result += '<a href="javaScript:void(0);" style="display: inline-block; margin-left: 5px;" id="resultauth__' + 
            //         author_id + '">' + record[author_field][x] + ', </a>';
            // }

            result += '<br></div>'
            // Define terms to be highlighted, allowing for easy highlighting and filtering of content text based on search/filters
            //free text query val
            var freetext_q = document.getElementById("freetext").value.replace(/"/g, '').replace("AND","")
                .replace("OR","").replace("  "," ").split(" ");

            if(freetext_q[freetext_q.length-1] == ""){
                freetext_q = freetext_q.slice(0, freetext_q.length-1)
            }
    
            // build list of filter values from query string
            var filters = options.querystring.slice(options.querystring.indexOf("active_facets={"),
                options.querystring.lastIndexOf("}")).replace("active_facets={","").split(/[:,]+/);
            
            filter_terms = []
            for (var x = 0; x < filters.length; x++){
                if (x % 2 == 1){
                    filter_terms.push(filters[x].replace(/"/g, ''));
                }
            }
            freetext_q != "" ? highlight_terms = filter_terms.concat(freetext_q) : highlight_terms = filter_terms;
            
            // Different display html for different data sources
            var display;
            if(record[result_displays.field] == result_displays.display1){
                display = options.result_display_1;
            } else if(record[result_displays.field] == result_displays.display2){
                display = options.result_display_2;
            } else{
                console.log("Unknown display value. Set 'result_displays' object values")
            }

            // add the record based on display template if available
            var lines = '';
            for ( var lineitem = 0; lineitem < display.length; lineitem++ ) {
                line = "";
                for ( var object = 0; object < display[lineitem].length; object++ ) {
                    var thekey = display[lineitem][object]['field'];
                    var thevalue = getvalue(record, thekey);
                    if (thevalue && thevalue.toString().length) {
                        display[lineitem][object]['pre']
                            ? line += display[lineitem][object]['pre'] : false;
                        if ( typeof(thevalue) == 'object' ) {
                            for ( var val = 0; val < thevalue.length; val++ ) {
                                val != 0 ? line += ', ' : false;
                                line += thevalue[val];
                            }
                        } else {
                            line += thevalue;
                        }
                        display[lineitem][object]['post'] 
                            ? line += display[lineitem][object]['post'] : line += ' ';
                    }
                }
                if (line) {
                    lines += line.replace(/^\s/,'').replace(/\s$/,'').replace(/\,$/,'');
                }
            }

            lines ? result += lines : result += JSON.stringify(record,"","    ");
            
            // Automatically add fields that are generated by processing script (lda, similar docs, keywords, etc.)
            //-----------------------------------------------------------------------------------------------
            
            //topics
            // result += '<br><span><b> Estimated Latent Topic (certainty): </b> <br>'

            // for(j = 1; j <= num_html_topics; j++){
            //     topic = record["topic" + j.toString() + "_topic"]
            //     prob = record["topic" + j.toString() + "_prob"].toFixed(2)
            //     topics_assigned.push(result_num + "_" + topic)
                
            //     result += '<b style="display: inline-block; width: 70px; float: left;"> Topic ' + j.toString() + ': </b><span style="display: inline-block; float: left; text-align: right; width: 60px;"><a style="color: #cc0000;" href="javaScript:void(0);" id="result'
            //      + result_num + '_topic' + topic + '">' + topic + '</a> (' 
            //     + prob + ')</span><br>'

            //     if(j == num_html_topics) {result += '<br>'};
            // }
            //---------------------------

            // if(record.mo_sent_index.length > 0 || record.mb_sent_index.length > 0){
            //     result += '\
            //     <div class="btn-group" style="margin-bottom: 5px; ">\
            //         <a id="show_deepdive' + result_num + '" class="btn dropdown-toggle btn-default" data-toggle="dropdown"\
            //             href="#" style="display: inline-block; text-align: center; float: none; width: 60%; border-color: steelblue; border-width; 3px;">\
            //             Show Extracted Relationships between Orbits, Bands, and Surveying Methods\
            //         <span class="caret"></span>\
            //         </a>\
            //     </div>\
            //     <div style="display: none;" id="deepdive' + result_num + '">\
            //     <br><b><span style="display: inline-block; height: 20px; margin: 4px 4px 3px; padding: 4; width: auto; line-height: 20px;\
            //     background-color: lightblue; border-radius: 6px;  font-size: 10pt; "><b style="margin: 6px;"><span style="font-size: 13pt;"> Orbit + Surveying Methods </span></b> \
            //     <hr style="border-color: black; margin-bottom: 0px;"></b><br>\
            //     <b><span style="display: inline-block; height: 20px; margin: 4px 4px 3px; padding: 4; width: auto; line-height: 20px;\
            //     background-color: #F0E68C; border-radius: 6px;  font-size: 10pt; "><b style="margin: 6px;"><span style="font-size: 13pt;"> Band + Surveying Methods </span></b> \
            //     <hr style="border-color: black; margin-bottom: 0px;"></b><br><br>'
            // }

            // for(x = 0; x < record.mo_sent_index.length; x++){
            //     result += ' <br>\
            //     <span style="display: inline-block; height: 20px; margin: 4px 4px 3px; padding: 4; width: auto; line-height: 20px;\
            //     background-color: lightblue; border-radius: 6px; text-align: center; font-size: 10pt; "><b style="margin: 6px;"><span style="font-size: 13pt;">'
            //     + record.mo_orbit[x] + ' </span> + <span style="font-size: 13pt;">'+ record.mo_method_mention[x] + ' </span>\</b></span>\
            //     <br>\
            //     <span><b style="font-size: 10pt;"> Actual orbit mention: </b> ' + record.mo_orbit_mention[x] + '</span>\
            //     <br>\
            //     <span class="dd_highlight"><b style="font-size: 10pt;"> Sentence '+  record.mo_sent_index[x] + ': </b> ' + record.mo_sent_text[x] + '</span><br>\
            //     <span><b style="font-size: 10pt;"> Confidence: </b> ' + record.mo_expectation[x] + '</span><br>'

            //     // dd_highlight_terms.push(record.mo_orbit_mention[x])
            //     // dd_highlight_terms.push(record.mo_method_mention[x])
            // }

            // for(x = 0; x < record.mb_sent_index.length; x++){
            //     result += ' <br>\
            //     <span style="display: inline-block; height: 20px; margin: 4px 4px 3px; padding: 4; width: auto; line-height: 20px;\
            //     background-color: #F0E68C; border-radius: 6px; text-align: center; font-size: 10pt; "><b style="margin: 6px;"><span style="font-size: 13pt;">'
            //     + record.mb_band[x] + ' </span> + <span style="font-size: 13pt;">'+ record.mb_method_mention[x] + ' </span>\</b></span>\
            //     <br>\
            //     <span><b style="font-size: 10pt;"> Actual orbit mention: </b> ' + record.mb_band_mention[x] + '</span>\
            //     <br>\
            //     <span class="dd_highlight"><b style="font-size: 10pt;"> Sentence '+  record.mb_sent_index[x] + ': </b> ' + record.mb_sent_text[x] + '</span><br>\
            //     <span><b style="font-size: 10pt;"> Confidence: </b> ' + record.mb_expectation[x] + '</span><br>'

            //     // dd_highlight_terms.push(record.mo_orbit_mention[x])
            //     // dd_highlight_terms.push(record.mo_method_mention[x])
            // }



            // for(x = 0; x < record.mb_sent_index.length; x++){
            //     result += ' <br><span style="font-size: 13pt;"><b style="font-size: 12px;"> sent </b>' + record.mb_sent_index[x] + ': </span>\
            //     <span style="display: inline-block; height: 20px; margin: 4px 4px 3px; padding: 4; width: auto; line-height: 20px;\
            //     background-color: "blue"; border-radius: 6px; text-align: center; font-size: 10pt; ">method<b style="margin: 6px;">' + record.mb_method_mention[x] +'</b> + </span>\
            //     <span><b style="font-size: 10pt;"> orbit </b> ' + record.mb_band_mention[x] + '</span><br>\
            //     <span><b style="font-size: 10pt;"> Conf: </b> ' + record.mb_expectation[x] + '</span><br>'
            // }

            // if(record.mo_sent_index.length > 0 || record.mb_sent_index.length > 0){
            //     result += '<hr style="border-color: black; margin-bottom: 0px;"></div><br>'
            // }



            // if(record.match_shared_authors.length > 0){
            //     result += '\
            //     <div class="btn-group" style="margin-bottom: 5px; ">\
            //         <a id="show_related' + result_num + '" class="btn dropdown-toggle btn-default" data-toggle="dropdown"\
            //             href="#" style="display: inline-block; text-align: center; float: none; width: 50%; border-color: green; border-width; 3px;">\
            //             Show Co-Authorship with Panelists and Steering Committee Members\
            //         <span class="caret"></span>\
            //         </a>\
            //     </div>\
            //     <div style="display: none;" id="related' + result_num + '">\
            //     <hr style="border-color: black; margin-bottom: 0px;">'
            // }
            

                        
            // for(x = 0; x < record.match_shared_authors.length; x++){
            //     var color = role_color[record.match_panelist_role[x]]
            //     if (record.match_panelist_role[x].indexOf("Steering Committee") == -1){
            //         record.match_panelist_role2[x] = "Panel " + record.match_panelist_role2[x] + ": "
            //     } else{
            //         record.match_panelist_role[x] = "Steering Committee" + " (" + record.match_panelist_role2[x] + ")"
            //         record.match_panelist_role2[x] = "";
            //     }
            //     // console.log(record.match_panelist_role[x])
            //     result += ' <br><span style="font-size: 13pt;"><b style="font-size: 12px;"> </b>' + record.match_panelist[x] + ' </span>\
            //     <span style="display: inline-block; height: 20px; margin: 4px 4px 3px; padding: 4; width: auto; line-height: 20px;\
            //     background-color: ' + color +'; border-radius: 6px; text-align: center; font-size: 10pt; "><b style="margin: 6px;">' + record.match_panelist_role2[x] + record.match_panelist_role[x]+'</b></span>\
            //     <br>\
            //     <span><b style="font-size: 10pt;"> Paper Title: </b> ' + record.match_titles[x] + '</span><br>\
            //     <span><b style="font-size: 10pt;"> Common Co-Authors: </b> ' + record.match_shared_authors[x] + '</span><br>'
            // }

            // if(record.match_shared_authors.length > 0){
            //     result += '<hr style="border-color: black; margin-bottom: 0px;"></div><br>'
            // }
            // console.log(record)



            //Similar papers and authors
            // result += '<span><b> Similar Round 2 Responses and Authors (strength of match): </b> <br>\
            // <text> (A strength of match cutoff at 0.40 is general rule of thumb for judging between similar and not similar) </text> <br>'
            
            // for (x = 0; x < num_similar; x++){
            // for (x = 0; x < record.similar.length; x++){

            //     title = record.similar[x].title;
            //     //Need to code into valid format for html ids that don't require escapes
            //     cleaned_title = title.replace(/#/g,"AAA").replace(/ /g,"BBB").replace(/:/g,"CCC").replace(/\./g,"DDD").
            //         replace(/\(/g,"EEE").replace(/\)/g,"FFF").replace(/,/g,"GGG")

            //     similar_titles.push(result_num + "____" + cleaned_title);

            //     score = record.similar[x].score.toFixed(2);
            //     auths = record.similar[x].authors

            //     result += '<b style="display: inline-block; float: left; font-size: 13pt; top: 4px;">' + (x+1).toString() + '</b>\
            //     <b style="display: inline-block; float: left; margin-left: 16px; "> Title: </b>\
            //     <a style="display:inline-block; width: 700px; margin-left: 13px; color: #cc0000; text-decoration: underline;"\
            //      href="javaScript:void(0);" id="result' + result_num + '_simtitle__' + cleaned_title + '">' + title 
            //      + '</a> <span style="margin-left: 5px; display: inline-block; float: right;"> (' + score + ') </span><br>';

            //     for(n = 0; n < auths.length; n++){
            //         //Need to code into valid format for html ids that don't require escapes
            //         clean_auth = auths[n].replace(/#/g,"AAA").replace(/ /g,"BBB").replace(/:/g,"CCC").replace(/\./g,"DDD").
            //             replace(/\(/g,"EEE").replace(/\)/g,"FFF").replace(/,/g,"GGG")

            //         var blanks = 0;
            //         if(n == 0){
            //             result += '<b style=" display: inline-block; float: left; margin-left: 25px; margin-right: 5px;">Auths: </b><div style="display: inline-block; width: 730px;"> ';
            //         }
            //         if(auths[n] == ""){
            //             blanks += 1
            //         }
            //         else{
            //             //defined at top facetview function score and set to zero each time dosearch is called, used for defining unique ids
            //             auth_count += 1;
            //             similar_authors.push(clean_auth);
            //             result += '<a style="display: inline-block; margin-left: 1px;" href="javaScript:void(0);" id="result' + auth_count + '_simauth__' 
            //                 + clean_auth + '">' + auths[n].replace(",","") + '</a>'
            //         }
            //         if(n+1 == auths.length){
            //             result += '</div><br>'
            //         }
            //         else if(auths[n] != "" && auths[n+1] != ""){
            //             result += ', ';
            //         }
                
            //     }

            //     if(x == record.similar.length - 1) {result += '<br>'};
            // }
            //---------------------------

            //KEYWORDS
            // result += '<b> Keywords: </b>'

            // keywords = record.keywords.split(" ")
            // for (w in keywords){
            //     keyword_count += 1;
            //     result_keywords.push(keywords[w])
            //     result += '<a href="javaScript:void(0);" id="result' + keyword_count + '_keyword__' + keywords[w] + '">' + keywords[w] + '</a>';
            //     if(keywords[w] != "" && parseInt(w,10)+1 != keywords.length && keywords[parseInt(w,10)+1] != ""){
            //         result += ', ';
            //     }
            // }
            //---------------------------

            result += options.resultwrap_end;
            return result;
        };


        //Assign clickfilterchoice function on click of hyperlinks in results 
        var hyperlinks_to_elements = function(index){
            // $(document).ready(function(){
            //     setTimeout(function(){
            //         topics
            //         for(l = 0; l < num_html_topics*options.data.records.length; l++){
            //             res_num = topics_assigned[l].split("_")[0]
            //             topic = topics_assigned[l].split("_")[1]
            //             $('#result' + res_num + '_topic' + topic, obj).click(clickfilterchoice)
            //         }

            //         similar papers
            //         for(m = 0; m < num_similar*options.data.records.length; m++){
            //             res_num = similar_titles[m].split("____")[0]
            //             title = similar_titles[m].split("____")[1]
            //             $('#result' + res_num + '_simtitle__' + title, obj).click(clickfilterchoice)
            //         }

            //         authors
            //         for(i = 0; i < authors.length; i++){
            //             auth = authors[i];
            //             $('#resultauth__' + auth, obj).click(clickfilterchoice)
            //         }

            //         similar authors
            //         for(i = 0; i < similar_authors.length; i++){
            //             sim_auth = similar_authors[i];
            //             $('#result' + (i+1) + '_simauth__' + sim_auth, obj).click(clickfilterchoice)
            //         }

            //         keywords
            //         for(b = 0; b < keyword_count; b++){
            //             $('#result' + (b+1) + '_keyword__' + result_keywords[b], obj).click(clickfilterchoice)
            //         }
            //     }, 2000);
            // })
        }
        

        // view a full record when selected
        var viewrecord = function(event) {
            event.preventDefault();
            var record = options.data['records'][$(this).attr('href')];
            alert(JSON.stringify(record,"","    "));
            
        }

        // put the results on the page
        var showresults = function(sdata) {
            
            // $(document).ready(function () {
            //     topic_counts = sdata.facets["topic1_topic"].terms;
            //     if(ldavis_initial == true){
            //         // ldavis_initial = false;
            //         var vis = new LDAvis("#lda_viz", "static/custom/process/lda_output/ldavis/output/lda.json");
            //     }
            //     else{
            //         var vis = new LDAvis("#lda_viz", "static/custom/process/lda_output/ldavis/output/lda.json");
            //         // ldavis_circles(); 
            //     }
            // });

            options.rawdata = sdata;
            // get the data and parse from the es layout
            var data = parseresults(sdata);
            options.data = data;
            
            // initialize plot                                                                                                                                                       
            if (line_chart == null && options.linechart_field != null && options.linechart_field != "") {
                line_chart = c3.generate({
                    bindto: '#line_chart',
                    data: {
                        x: 'year',
                        columns: [
                        ]
                    }
                });
            }


            // for each filter setup, find the results for it and append them to the relevant filter
            for ( var each = 0; each < options.facets.length; each++ ) {
                var facet = options.facets[each]['field'];
                var facetclean = options.facets[each]['field'].replace(/\./gi,'_').replace(/\:/gi,'_');
                var facet_filter = $('[id="facetview_'+facetclean+'"]', obj);
                facet_filter.children().find('.facetview_filtervalue').remove();
                var records = data["facets"][ facet ];

        var years = ['year'];
        var year_hits = ['hits'];
        var lineChartFacet = false;
        var dendrogramFacet = false;
        // HACK
        // console.log(data.facets.authors)
        // auths = []
        // auths_raw = Object.keys(data.facets.authors)
        // for (x in auths_raw){
        //     if(auths.indexOf(auths_raw[x].split("::")[0]) == -1){
        //         auths.push("\"" + auths_raw[x] + "\"")
        //     }
        // }
        var download = function(content, fileName, mimeType) {
          var a = document.createElement('a');
          mimeType = mimeType || 'application/octet-stream';

          if (navigator.msSaveBlob) { // IE10
            return navigator.msSaveBlob(new Blob([content], { type: mimeType }),     fileName);
          } else if ('download' in a) { //html5 A[download]
            a.href = 'data:' + mimeType + ',' + encodeURIComponent(content);
            a.setAttribute('download', fileName);
            document.body.appendChild(a);
            setTimeout(function() {
              a.click();
              document.body.removeChild(a);
            }, 66);
            return true;
          } else { //do iframe dataURL download (old ch+FF):
            var f = document.createElement('iframe');
            document.body.appendChild(f);
            f.src = 'data:' + mimeType + ',' + encodeURIComponent(content);

            setTimeout(function() {
              document.body.removeChild(f);
            }, 333);
            return true;
            }
        }
        // download(auths, "solid_auths.csv", 'text/csv')
        // console.log(auths)
        
        if (facet == options.linechart_field){
            lineChartFacet = true;
        }

        if (facet == options.dendrogram_field){
            dendrogramFacet = true;
        }
        
        //HACK
        var result_limit = 1000000;
        if (facet == author_field || facet == "keywords" || facet == "entities"){
            result_limit = 10;
        }

        //Another HACK    
        if (facet == "topic1_topic" && Object.keys(records).length == 1){
            single_topic = Object.keys(records)[0];
        }
        else if (facet == "topic1_topic" && Object.keys(records).length != 1){
            single_topic = undefined;
        }
        var cnt = 1;
        for ( var item in records ) {
            if(cnt > result_limit){
                break;
            }
            cnt += 1;
            // if 
            var append = '<tr class="facetview_filtervalue" style="display:none;"><td><a class="facetview_filterchoice' +
                '" rel="' + facet + '" href="' + item + '">' + item +
                ' (' + records[item] + ')</a></td></tr>';
            facet_filter.append(append);

            if (lineChartFacet){
                years.push(show_val);
                year_hits.push(records[item]);
            } 

            }

            if ( $('.facetview_filtershow[rel="' + facetclean + '"]', obj).hasClass('facetview_open') ) {
                facet_filter.children().find('.facetview_filtervalue').show();
            }

        if(lineChartFacet){
            // clean the years and hits
            var year_hash = {}
            for (var i = 0; i < years.length; i++){
                if (years[i] == "year") continue;
                var year = years[i].substring(0,4);
                if (year in year_hash){
                    hits = parseInt(years[year]);
                    hits += parseInt(year_hits[i]);
                }
                            else{
                                year_hash[year] = year_hits[i];
                }
            }

            years = [];
            year_hits = [];
            years.push('year');
            year_hits.push('hits');
            for (var year in year_hash){
            years.push(year);
            year_hits.push(year_hash[year]);
            }
                                    
            line_chart.load({
            columns: [
                years,
                year_hits
                ]
            });
        }

        if (dendrogramFacet){
                      $('#dendrogram').empty();
                      dendrogram = null;
                      var facet_selected = $('a.facetview_filterselected[rel="'+facet+'"]');
                      var root = {};
                      if (facet_selected.length > 0) {
                          dd_cluster = d3.layout.cluster().size([dd_height, dd_width - 160]);
                          dd_diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
                          dendrogram = d3.select("#dendrogram").append("svg:svg")
                                         .attr("width", dd_width)
                                         .attr("height", dd_height)
                                         .append("svg:g")
                                         .attr("transform", "translate(80, 0)");
                          var facet_text = facet_selected[0].text;
                          root = {
                              "name": facet_text,
                              "children": []
                          };

                          var rel_nodes = [];
                          for ( var i = 0; i < data.records.length; i++ ) {
                              var drec = data.records[i];
                  var drec_length = 0;
                  var drec_facet = eval('drec.'+facet);
                  if (drec_facet != undefined){
                  drec_length = drec_facet.length;
                  }
                              for (var j = 0; j < drec_length; j++) {
                                  var rel_node = eval('drec.'+facet+'[j]');
                                  if (facet_text.toLowerCase().trim() != rel_node.toLowerCase().trim() && rel_nodes.indexOf(rel_node) == -1) {
                                      root.children.push({ "name": rel_node, "children": []});
                                      rel_nodes.push(rel_node);
                                  }
                              }
                          }

                          var nodes = dd_cluster.nodes(root),
                              links = dd_cluster.links(nodes);

                          var link = dendrogram.selectAll(".link")
                              .data(links)
                            .enter().append("path")
                              .attr("class", "link")
                              .attr("d", dd_diagonal);

                          var node = dendrogram.selectAll(".node")
                              .data(nodes)
                            .enter().append("g")
                              .attr("class", "node")
                              .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

                          node.append("circle")
                              .attr("r", 4.5);

                          node.append("text")
                              .attr("dx", function(d) { return d.children ? -8 : 8; })
                              .attr("dy", 3)
                              .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
                              .text(function(d) { return d.name; });

                        d3.select(self.frameElement).style("height", dd_height + "px");

             }

        }

            }
            $('.facetview_filterchoice', obj).bind('click',clickfilterchoice);
            $('.facetview_filters', obj).each(function() {
                $(this).find('.facetview_filtershow').css({'color':'#333','font-weight':'bold'}).children('i').show();
                if ( $(this).children().find('.facetview_filtervalue').length > 1 ) {
                    $(this).show();
                } else {
                    //$(this).hide();
                    $(this).find('.facetview_filtershow').css({'color':'#ccc','font-weight':'normal'}).children('i').hide();
                };
            });

            // put result metadata on the page
            if ( typeof(options.paging.from) != 'number' ) {
                options.paging.from = parseInt(options.paging.from);
            }
            if ( typeof(options.paging.size) != 'number' ) {
                options.paging.size = parseInt(options.paging.size);
            }
            if ( options.pager_slider ) {
                var metaTmpl = '<div style="font-size:20px;font-weight:bold;margin:5px 0 10px 0;padding:5px 0 5px 0;border:1px solid #eee;border-radius:5px;-moz-border-radius:5px;-webkit-border-radius:5px;"> \
                    <a alt="previous" title="previous" class="facetview_decrement" style="color:#333;float:left;padding:0 40px 20px 20px;" href="{{from}}">&lt;</a> \
                    <span style="margin:30%;">{{from}} &ndash; {{to}} of {{total}}</span> \
                    <a alt="next" title="next" class="facetview_increment" style="color:#333;float:right;padding:0 20px 20px 40px;" href="{{to}}">&gt;</a> \
                </div>';
            } else {
                var metaTmpl = '<div class="pagination"> \
                    <ul> \
                        <li class="prev"><a class="facetview_decrement" href="{{from}}">&laquo; back</a></li> \
                        <li class="active"><a>{{from}} &ndash; {{to}} of {{total}}</a></li> \
                        <li class="next"><a class="facetview_increment" href="{{to}}">next &raquo;</a></li> \
                    </ul> \
                </div>';
            };
            $('.facetview_metadata', obj).first().html("Not found...");
            if (data.found) {
                var from = options.paging.from + 1;
                var size = options.paging.size;
                !size ? size = 10 : "";
                var to = options.paging.from+size;
                data.found < to ? to = data.found : "";
                var meta = metaTmpl.replace(/{{from}}/g, from);
                meta = meta.replace(/{{to}}/g, to);
                meta = meta.replace(/{{total}}/g, data.found);
                $('.facetview_metadata', obj).html("").append(meta);
                $('.facetview_decrement', obj).bind('click',decrement);
                from < size ? $('.facetview_decrement', obj).html('..') : "";
                $('.facetview_increment', obj).bind('click',increment);
                data.found <= to ? $('.facetview_increment', obj).html('..') : "";
            }

            // put the filtered results on the page
            $('#facetview_results',obj).html("");
            var infofiltervals = new Array();
            $.each(data.records, function(index, value) {
                // write them out to the results div
                 $('#facetview_results', obj).append( buildrecord(index) );
                 options.linkify ? $('#facetview_results tr:last-child', obj).linkify() : false;
            });
            if ( options.result_box_colours.length > 0 ) {
                jQuery('.result_box', obj).each(function () {
                    var colour = options.result_box_colours[Math.floor(Math.random()*options.result_box_colours.length)] ;
                    jQuery(this).css("background-color", colour);
                });
            }
            $('#facetview_results', obj).children().hide().fadeIn(options.fadein);
            $('.facetview_viewrecord', obj).bind('click',viewrecord);
            jQuery('.notify_loading').hide();
            // if a post search callback is provided, run it
            if (typeof options.post_search_callback == 'function') {
                options.post_search_callback.call(this);
            }

            //Highlight search terms and query filters (defined above)
            //---------------------------------------
            $("#facetview_results").highlight(highlight_terms);
            $(".dd_highlight").highlight(dd_highlight_terms);
            

            // for (var x=0; x < hist_fields.length; x++){
            //     hist_data = []
            //     hist_labels = []
            //     cnt = 0; 
            //     for (p in data.facets[hist_fields[x]]){
            //         cnt += 1;
            //         if(exclude_hist_values.indexOf(p) == -1 && cnt < hist_fields_limit && p.length < 70){
            //             hist_data.push(parseInt(data.facets[hist_fields[x]][p]))
            //             hist_labels.push(p)
            //         }
            //         else{
            //             cnt -= 1;
            //         }
            //     }
            //     draw_hist(hist_data, hist_labels, "hist" + x)
            // }

            // for (var y = 0; y < options.collapse.length; y++){
                for (var x = 1; x <= options.data.records.length; x ++){
                    $("#show_related" + x).on("click", function(){
                        var content_div = $(this)[0].id.replace("show_","");
                        var field = content_div.substring(0,content_div.length - 1)
                        if (document.getElementById(content_div).style.display == "block"){
                            document.getElementById(content_div).style.display = "none";
                        }
                        else{
                            document.getElementById(content_div).style.display = "block";
                        }
                    })
                }  

                for (var x = 1; x <= options.data.records.length; x ++){
                    $("#show_deepdive" + x).on("click", function(){
                        var content_div = $(this)[0].id.replace("show_","");
                        var field = content_div.substring(0,content_div.length - 1)
                        if (document.getElementById(content_div).style.display == "block"){
                            document.getElementById(content_div).style.display = "none";
                        }
                        else{
                            document.getElementById(content_div).style.display = "block";
                        }
                    })
                }  
            // }

            // categories_data = []
            // categories_labels = []
            // for (p in data.facets.category){
            //     categories_data.push(parseInt(data.facets.category[p]))
            //     categories_labels.push(p)
            // }
            // draw_hist(categories_data, categories_labels, "categories_hist")


            function sortFunction(a, b) {
                if (a[1] === b[1]) {
                    return 0;
                }
                else {
                    return (a[1] > b[1]) ? -1 : 1;
                }
            }

            // keywords_data = []
            // keywords_labels = []
            // keywords = []
            // for (var x = 0; x < Object.keys(data.facets.keywords).length; x ++){
            //     if(Object.keys(data.facets["keywords"]).indexOf(Object.keys(data.facets["entities"])[x]) > -1){
            //         keywords.push([Object.keys(data.facets["entities"])[x],parseInt(data.facets.entities[Object.keys(data.facets["entities"])[x]])]);    
            //     }
            // }
            // keywords = keywords.sort(sortFunction);
            // for (var j = 0; j < 50; j++){
            //     if(exclude_hist_values.indexOf(keywords[j][0]) == -1){
            //         keywords_data.push(keywords[j][1]);
            //         keywords_labels.push(keywords[j][0]);
            //     }
            // }
            // draw_hist(keywords_data, keywords_labels, "keywords_hist")


            // var salient_terms;
            // d3.json("static/custom/process/lda_output/ldavis/output/lda.json", function(error, data) {
            //     salient_terms = data.tinfo.Term.slice(0,30);
            //     salient_hist(salient_terms)
            // })

            // function salient_hist(salient_terms){
            //     salient_data = [];
            //     salient_labels = [];
            //     for (var x = 0; x < Object.keys(data.facets["keywords"]).length; x ++){
            //         if (salient_terms.indexOf(Object.keys(data.facets["keywords"])[x]) > -1 && exclude_hist_values.indexOf(Object.keys(data.facets["keywords"])[x]) == -1){
            //             salient_data.push(parseInt(data.facets.keywords[Object.keys(data.facets["keywords"])[x]]));
            //             salient_labels.push(Object.keys(data.facets["keywords"])[x]);
            //         }
            //     }
            //     draw_hist(salient_data, salient_labels, "salient_hist")
            // }
            


            //ONLY CALL FORCED-DIRECTED GRAPH WHEN IT IS OPEN
            //--------------------------------------------------
            // all_auths = Object.keys(data.facets[author_field]);
            // var actual_min = 2;
            // var filtered_auths = [];
            // if(Object.keys(data.facets[author_field]).length > 1000){
            //     for (var x = 0; x < all_auths.length; x++){
            //         if(data.facets[author_field][all_auths[x]] >= min_published){
            //             filtered_auths.push(all_auths[x]);
            //         }
            //     }
            // } else {
            //     actual_min = 1;
            //     filtered_auths = all_auths;
            // }
            

            // $(document).ready(function () { 
            //     if ($("#collapseOne").css("height") != "0px"){
            //         document.getElementById("force_viz").innerHTML = "";
            //         document.getElementById("min_papers").innerHTML = '*Showing authors with at least <b> ' + actual_min + ' </b> publications';
            //         force_viz("force_viz", filtered_auths, author_facet) 
            //     }    
            // });

            // $("#force_toggle").on("click", function(e){
            //     if($("#force").css("display") == "block"){
            //         document.getElementById("force_viz").innerHTML = "";
            //         document.getElementById("min_papers").innerHTML = '*Showing authors with at least <b> ' + actual_min + ' </b> publications';
            //         force_viz("force_viz", filtered_auths, author_facet)    
            //     }
            // })

            // $("#collapseOneTitle").on("click", function(e){
            //     if ($("#collapseOne").css("height") == "0px"){
            //         document.getElementById("force_viz").innerHTML = "";
            //         document.getElementById("min_papers").innerHTML = '*Showing authors with at least <b> ' + actual_min + ' </b> publications';
            //         force_viz("force_viz", filtered_auths, author_facet) 
            //     }    
            // })

            // $("#collapseThreeTitle").on("click", function(e){
            //     $("#collapseThree").css("height") == "0px"
            // })
            //--------------------------------------------------


            // LDA vis call
            //---------------------------------------------------
            // topic_counts = data.facets.topic1
            // var vis = new LDAvis("#lda_viz", "process/lda_output/ldavis/output/lda.json");
        };





        // ===============================================
        // functions to do with searching
        // ===============================================

        // fuzzify the freetext search query terms if required
        var fuzzify = function(querystr) {
            var rqs = querystr
            if ( options.default_freetext_fuzzify !== undefined ) {
                if ( options.default_freetext_fuzzify == "*" || options.default_freetext_fuzzify == "~" ) {
                    if ( querystr.indexOf('*') == -1 && querystr.indexOf('~') == -1 && querystr.indexOf(':') == -1 ) {
                        var optparts = querystr.split(' ');
                        pq = "";
                        for ( var oi = 0; oi < optparts.length; oi++ ) {
                            var oip = optparts[oi];
                            if ( oip.length > 0 ) {
                                oip = oip + options.default_freetext_fuzzify;
                                options.default_freetext_fuzzify == "*" ? oip = "*" + oip : false;
                                pq += oip + " ";
                            }
                        };
                        rqs = pq;
                    };

                };
            };
            return rqs;
        };

        // build the search query URL based on current params
        var elasticsearchquery = function() {
            var qs = {};
            var bool = false;
            var nested = false;
            var seenor = []; // track when an or group are found and processed
            $('.facetview_filterselected',obj).each(function() {
                !bool ? bool = {'must': [] } : "";
                if ( $(this).hasClass('facetview_facetrange') ) {
                    var rngs = {
                        'from': $('.facetview_lowrangeval_' + $(this).attr('rel'), this).html(),
                        'to': $('.facetview_highrangeval_' + $(this).attr('rel'), this).html()
                    };
                    var rel = options.facets[ $(this).attr('rel') ]['field'];
                    var robj = {'range': {}};
                    robj['range'][ rel ] = rngs;
                    // check if this should be a nested query
                    var parts = rel.split('.');
                    if ( options.nested.indexOf(parts[0]) != -1 ) {
                        !nested ? nested = {"nested":{"_scope":parts[0],"path":parts[0],"query":{"bool":{"must":[robj]}}}} : nested.nested.query.bool.must.push(robj);
                    } else {
                        bool['must'].push(robj);
                    }
                } else {
                    // TODO: check if this has class facetview_logic_or
                    // if so, need to build a should around it and its siblings
                    if ( $(this).hasClass('facetview_logic_or') ) {
                        if ( !($(this).attr('rel') in seenor) ) {
                            seenor.push($(this).attr('rel'));
                            var bobj = {'bool':{'should':[]}};
                            $('.facetview_filterselected[rel="' + $(this).attr('rel') + '"]').each(function() {
                                if ( $(this).hasClass('facetview_logic_or') ) {
                                    var ob = {'term':{}};
                                    ob['term'][ $(this).attr('rel') ] = $(this).attr('href');
                                    bobj.bool.should.push(ob);
                                };
                            });
                            if ( bobj.bool.should.length == 1 ) {
                                var spacer = {'match_all':{}};
                                bobj.bool.should.push(spacer);
                            }
                        }
                    } else {
                        var rel = $(this).attr('rel');
                        var facet = options.facets.filter(function(f) {
                            return f['field'] === rel && f['facet_filter'];
                        })[0];
                        var bobj = {'term':{}};
                        bobj['term'][rel] = $(this).attr('href');
                        if (facet) {
                            qs['filter'] = facet['facet_filter'];
                        }
                    }
                    
                    // check if this should be a nested query
                    var parts = $(this).attr('rel').split('.');
                    if ( options.nested.indexOf(parts[0]) != -1 ) {
                        !nested ? nested = {"nested":{"_scope":parts[0],"path":parts[0],"query":{"bool":{"must":[bobj]}}}} : nested.nested.query.bool.must.push(bobj);
                    } else {
                        bool['must'].push(bobj);
                    }
                }
            });
            for (var item in options.predefined_filters) {
                !bool ? bool = {'must': [] } : "";
                var pobj = options.predefined_filters[item];
                var parts = item.split('.');
                if ( options.nested.indexOf(parts[0]) != -1 ) {
                    !nested ? nested = {"nested":{"_scope":parts[0],"path":parts[0],"query":{"bool":{"must":[pobj]}}}} : nested.nested.query.bool.must.push(pobj);
                } else {
                    bool['must'].push(pobj);
                }
            }
            if (bool) {
                if ( options.q != "" ) {
                    var qryval = { 'query': fuzzify(options.q) };
                    $('.facetview_searchfield', obj).val() != "" ? qryval.default_field = $('.facetview_searchfield', obj).val() : "";
                    options.default_operator !== undefined ? qryval.default_operator = options.default_operator : false;
                    bool['must'].push( {'query_string': qryval } );
                };
                nested ? bool['must'].push(nested) : "";
                qs['query'] = {'bool': bool};
            } else {
                if ( options.q != "" ) {
                    var qryval = { 'query': fuzzify(options.q) };
                    $('.facetview_searchfield', obj).val() != "" ? qryval.default_field = $('.facetview_searchfield', obj).val() : "";
                    options.default_operator !== undefined ? qryval.default_operator = options.default_operator : false;
                    //HACK - custom
                    // console.log($('.facetview_searchfield', obj).val())
                    qryval['minimum_should_match'] = 1;
                    // --------------
                    qs['query'] = {'query_string': qryval };
                } else {
                    qs['query'] = {'match_all': {}};
                };
            };
            // set any paging
            options.paging.from != 0 ? qs['from'] = options.paging.from : "";
            options.paging.size != 10 ? qs['size'] = options.paging.size : "";
            // set any sort or fields options
            options.sort.length > 0 ? qs['sort'] = options.sort : "";
            options.fields ? qs['fields'] = options.fields : "";
            options.partial_fields ? qs['partial_fields'] = options.partial_fields : "";
            // set any facets
            qs['facets'] = {};
            for ( var item = 0; item < options.facets.length; item++ ) {
                var fobj = jQuery.extend(true, {}, options.facets[item] );
                var facet_filter = fobj['facet_filter'];
                delete fobj['display'];
                delete fobj['facet_filter'];
                var facet = {'terms': fobj};
                if (facet_filter || qs['filter']) {
                    facet['facet_filter'] = {'and': []};
                    if (facet_filter) {
                        facet['facet_filter']['and'].push(facet_filter);
                    }
                    if (qs['filter']) {
                        facet['facet_filter']['and'].push(qs['filter']);
                    }
                }
                var parts = fobj['field'].split('.');
                if(fobj.field == author_field || fobj.field == "keywords" || fobj.field == "entities"){
                    fobj.size = 10000;
                }
                qs['facets'][fobj['field']] = facet;
                for (var i; i < options.nested.length; i++ ) {
                    if (fobj['field'].indexOf(options.nested[i]) == 0) {
                         nested ? qs['facets'][fobj['field']]["scope"] = options.nested[i] : qs['facets'][fobj['field']]["nested"] = options.nested[i];
                    }
                }
            }
            
            jQuery.extend(true, qs['facets'], options.extra_facets );
            // set elasticsearch filter, if any
            // set any filter
            if (options.filter) {
                qs['filter'] = options.filter;
            }
            //alert(JSON.stringify(qs,"","    "));
            qy = JSON.stringify(qs);
            if ( options.include_facets_in_querystring ) {
                options.querystring = qy;
            } else {
                delete qs.facets;
                options.querystring = JSON.stringify(qs)
            }
            options.sharesave_link ? $('.facetview_sharesaveurl', obj).val('http://' + window.location.host + window.location.pathname + '?source=' + options.querystring) : "";
            return qy;
        };

        // execute a search
        var dosearch = function() {
            hyperlinks_to_elements()
            result_num = 0;

            topics_assigned = [];
            similar_titles = []; 
            similar_authors = [];
            auth_count = 0;
            result_keywords = [];
            keyword_count = 0;

            jQuery('.notify_loading').show();
            // update the options with the latest q value
            if ( options.searchbox_class.length == 0 ) {
                options.q = $('.facetview_freetext', obj).val();
            } else {
                options.q = $(options.searchbox_class).last().val();
            };
            // make the search query
            var qrystr = elasticsearchquery();
            // augment the URL bar if possible
            if ( options.pushstate ) {
                var currurl = '?source=' + options.querystring;
                window.history.pushState("","search",currurl);
            };
            $.ajax({
                type: "get",
                url: options.search_url,
                data: {source: qrystr},
                // processData: false,
                dataType: options.datatype,
                success: showresults
            });

            for(var x=0; x < kibana_vizzes.length; x++){
                $("#kibana_iframe" + x).attr('src', function(i,val){
                    return update_kibana_url(kibana_vizzes[x]["src"]);
                })
            }



        };


        // show search help
        var learnmore = function(event) {
            event.preventDefault();
            $('#facetview_learnmore', obj).toggle();
        };

        // adjust how many results are shown
        var howmany = function(event) {
            event.preventDefault();
            var newhowmany = prompt('Currently displaying ' + options.paging.size + 
                ' results per page. How many would you like instead?');
            if (newhowmany) {
                options.paging.size = parseInt(newhowmany);
                options.paging.from = 0;
                $('.facetview_howmany', obj).html(options.paging.size);
                dosearch();
            }
        };
        
        // change the search result order
        var order = function(event) {
            event.preventDefault();
            if ( $(this).attr('href') == 'desc' ) {
                $(this).html('<i class="icon-arrow-up"></i>');
                $(this).attr('href','asc');
                $(this).attr('title','current order ascending. Click to change to descending');
            } else {
                $(this).html('<i class="icon-arrow-down"></i>');
                $(this).attr('href','desc');
                $(this).attr('title','current order descending. Click to change to ascending');
            };
            orderby();
        };
        var orderby = function(event) {
            event ? event.preventDefault() : "";
            var sortchoice = $('.facetview_orderby', obj).val();
            if ( sortchoice.length != 0 ) {
                var sorting = {};
                var sorton = sortchoice;
                sorting[sorton] = {'order': $('.facetview_order', obj).attr('href')};
                options.sort = [sorting];
            } else {
                options.sort = [];
            }
            options.paging.from = 0;
            dosearch();
        };
        
        // parse any source params out for an initial search
        var parsesource = function() {
            var qrystr = options.source.query;
            if ( 'bool' in qrystr ) {
                var qrys = [];
                // TODO: check for nested
                if ( 'must' in qrystr.bool ) {
                    qrys = qrystr.bool.must;
                } else if ( 'should' in qrystr.bool ) {
                    qrys = qrystr.bool.should;
                };
                for ( var qry = 0; qry < qrys.length; qry++ ) {
                    for ( var key in qrys[qry] ) {
                        if ( key == 'term' ) {
                            for ( var t in qrys[qry][key] ) {
                                if ( !(t in options.predefined_filters) ) {
                                    clickfilterchoice(false,t,qrys[qry][key][t]);
                                };
                            };
                        } else if ( key == 'query_string' ) {
                            typeof(qrys[qry][key]['query']) == 'string' ? options.q = qrys[qry][key]['query'] : "";
                        } else if ( key == 'bool' ) {
                            // TODO: handle sub-bools
                        };
                    };
                };
            } else if ( 'query_string' in qrystr ) {
                typeof(qrystr.query_string.query) == 'string' ? options.q = qrystr.query_string.query : "";
            };
        }
        
        // show the current url with the result set as the source param
        var sharesave = function(event) {
            event.preventDefault();
            $('.facetview_sharesavebox', obj).toggle();
        };
        
        // adjust the search field focus
        var searchfield = function(event) {
            event.preventDefault();
            options.paging.from = 0;
            dosearch();
        };

        // a help box for embed in the facet view object below
        var thehelp = '<div id="facetview_learnmore" class="well" style="margin-top:10px; display:none;">'
        options.sharesave_link ? thehelp += '<p><b>Share</b> or <b>save</b> the current search by clicking the share/save arrow button on the right.</p>' : "";
        thehelp += '<p><b>Remove all</b> search values and settings by clicking the <b>X</b> icon at the left of the search box above.</p> \
            <p><b>Partial matches with wildcard</b> can be performed by using the asterisk <b>*</b> wildcard. For example, <b>einste*</b>, <b>*nstei*</b>.</p> \
            <p><b>Fuzzy matches</b> can be performed using tilde <b>~</b>. For example, <b>einsten~</b> may help find <b>einstein</b>.</p> \
            <p><b>Exact matches</b> can be performed with <b>"</b> double quotes. For example <b>"einstein"</b> or <b>"albert einstein"</b>.</p> \
            <p>Match all search terms by concatenating them with <b>AND</b>. For example <b>albert AND einstein</b>.</p> \
            <p>Match any term by concatenating them with <b>OR</b>. For example <b>albert OR einstein</b>.</p>';
        if ( !options.default_freetext_fuzzify ) {
            thehelp += '<p><b>Exclude</b> terms by prefixing them with <b>-</b> (minus sign). For example <b>albert -einstein</b>.</p> \
                        <p><b>Require</b> terms by prefixing them with <b>+</b> (plus sign). For example <b>albert -physics +einstein</b> (albert is now optional but increases relevance). <a href="http://www.elasticsearch.org/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#_boolean_operators" target="_blank">Full details here</a>.</p>';
        }

        thehelp += '<p><b>Combinations</b> will work too, like <b>albert OR einste~</b>, or <b>"albert" "einstein"</b>.</p> \
            <p><b>Result set size</b> can be altered by clicking on the result size number preceding the search box above.</p>';

        if ( options.searchbox_fieldselect.length > 0 ) {
            thehelp += '<p>By default, terms are searched for across entire record entries. \
                This can be restricted to particular fields by selecting the field of interest from the <b>search field</b> dropdown</p>';
        };
        if ( options.search_sortby.length > 0 ) {
            thehelp += '<p>Choose a field to <b>sort the search results</b> by clicking the double arrow above.</p>';
        };
        if ( options.facets.length > 0 ) {
            thehelp += '<hr></hr>';
            thehelp += '<p>Use the <b>filters</b> on the left to directly select values of interest. \
                Click the filter name to open the list of available terms and show further filter options.</p> \
                <p><b>Filter list size</b> can be altered by clicking on the filter size number.</p> \
                <p><b>Filter list order </b> can be adjusted by clicking the order options - \
                from a-z ascending or descending, or by count ascending or descending.</p> \
                <p>Filters search for unique values by default; to do an <b>OR</b> search - e.g. to look for more than one value \
                for a particular filter - click the OR button for the relevant filter then choose your values.</p> \
                <p>To further assist discovery of particular filter values, use in combination \
                with the main search bar - search terms entered there will automatically adjust the available filter values.</p>';
            if ( options.enable_rangeselect ) {
                thehelp += '<p><b>Apply a filter range</b> rather than just selecting a single value by clicking on the <b>range</b> button. \
                    This enables restriction of result sets to within a range of values - for example from year 1990 to 2012.</p> \
                    <p>Filter ranges are only available across filter values already in the filter list; \
                    so if a wider filter range is required, first increase the filter size then select the filter range.</p>';
            }
        };
        thehelp += '<p><a class="facetview_learnmore label" href="#">close the help</a></p></div>';
        
        // the facet view object to be appended to the page
        var thefacetview = '<div id="facetview"><div class="row-fluid">';
        if ( options.facets.length > 0 ) {
            thefacetview += '<div class="span3"><div id="facetview_filters" style="padding-top:20px;"></div></div>';
            thefacetview += '<div class="span9" id="facetview_rightcol">';
        } else {
            thefacetview += '<div class="span12" id="facetview_rightcol">';
        }
        thefacetview += '<div class="facetview_plots_container"><div id="line_chart"/><div id="dendrogram"/></div>';
        thefacetview += '<div class="facetview_search_options_container">';
        thefacetview += '<div class="btn-group" style="display:inline-block; margin-right:5px;"> \
            <a class="btn btn-small" title="clear all search settings and start again" href=""><i class="icon-remove"></i></a> \
            <a class="btn btn-small facetview_learnmore" title="click to view search help information" href="#"><b>?</b></a> \
            <a class="btn btn-small facetview_howmany" title="change result set size" href="#">{{HOW_MANY}}</a>';
        if ( options.search_sortby.length > 0 ) {
            thefacetview += '<a class="btn btn-small facetview_order" title="current order descending. Click to change to ascending" \
                href="desc"><i class="icon-arrow-down"></i></a>';
            thefacetview += '</div>';
            thefacetview += '<select class="facetview_orderby" style="border-radius:5px; \
                -moz-border-radius:5px; -webkit-border-radius:5px; width:100px; background:#eee; margin:0 5px 21px 0;"> \
                <option value="">order by</option>';
            for ( var each = 0; each < options.search_sortby.length; each++ ) {
                var obj = options.search_sortby[each];
                thefacetview += '<option value="' + obj['field'] + '">' + obj['display'] + '</option>';
            };
            thefacetview += '</select>';
        } else {
            thefacetview += '</div>';
        };
        if ( options.searchbox_fieldselect.length > 0 ) {
            thefacetview += '<select class="facetview_searchfield" style="border-radius:5px 0px 0px 5px; \
                -moz-border-radius:5px 0px 0px 5px; -webkit-border-radius:5px 0px 0px 5px; width:100px; margin:0 -2px 21px 0; background:' + options.searchbox_shade + ';">';
            thefacetview += '<option value="">search all</option>';
            for ( var each = 0; each < options.searchbox_fieldselect.length; each++ ) {
                var obj = options.searchbox_fieldselect[each];
                thefacetview += '<option value="' + obj['field'] + '">' + obj['display'] + '</option>';
            };
            thefacetview += '</select>';
        };
        thefacetview += '<input type="text" id="freetext" class="facetview_freetext span4" style="display:inline-block; margin:0 0 21px 0; background:' + options.searchbox_shade + ';" name="q" \
            value="" placeholder="search term" />';
        if ( options.sharesave_link ) {
            thefacetview += '<a class="btn facetview_sharesave" title="share or save this search" style="margin:0 0 21px 5px;" href=""><i class="icon-share-alt"></i></a>';
            thefacetview += '<div class="facetview_sharesavebox alert alert-info" style="display:none;"> \
                <button type="button" class="facetview_sharesave close">Ã—</button> \
                <p>Share or save this search:</p> \
                <textarea class="facetview_sharesaveurl" style="width:100%;height:100px;">http://' + window.location.host + 
                window.location.pathname + '?source=' + options.querystring + '</textarea> \
                </div>';
        }
        thefacetview += '</div>';
        thefacetview += thehelp;
        thefacetview += '<div style="clear:both;" class="btn-toolbar" id="facetview_selectedfilters"></div>';

        function toggleWidgets(div_id, button_id){
            if(document.getElementById(div_id).style.display == "none"){
                document.getElementById(div_id).style.display = "block";
                document.getElementById(button_id).style.background = "#31a354"
            }
            else{
                document.getElementById(div_id).style.display = "none";
                document.getElementById(button_id).style.background = "steelblue"
            }
        }

        $(document).ready(function () { 
            var toggle_ids = '#lda_toggle, #panel_toggle, #force_toggle, #categories_toggle, #keywords_toggle, #salient_toggle';
            for(var x = 0; x < kibana_vizzes.length; x++){
                toggle_ids += ", #kibana" + x + "_toggle"; 
            }

            $(toggle_ids).on('click', function (e) {
                var id = e.target.id || e.relatedTarget.id || e.toElement.id || function() {console.log("Couldn't attach element id")}
                toggleWidgets(id.replace("_toggle",""), id);
            })
        });


        function update_kibana_url(base_link){
            //Converts elasticsearch url (updated by facetview) to rison format used in Kibana urls. 

            String.prototype.replaceAll = function(search, replacement) {
                var target = this;
                return target.replace(new RegExp(search, 'g'), replacement);
            };

            // get es query to be converted to rison
            var url = decodeURI(window.location.href);
            qry_obj = JSON.parse(url.split("?source=")[1])
            // console.log(qry_obj)
             
            //get kibana query rison 
            old_qry_pre = (base_link.split("_a=")[0] + "_a=(").replace("'",'"')
            old_qry = base_link.split("_a=")[1]
            rison_obj = rison.decode(old_qry)

            // store values so they can be encapsulated with single quotes after added to url
            var values = [];

            // take query params from elastic obj and add to kibana url
            if(Object.keys(qry_obj["query"]).indexOf("bool") > -1){
                for(var x=0; x < qry_obj.query.bool.must.length; x++){

                    //Handle faceted terms
                    if(Object.keys(qry_obj.query.bool.must[x]).indexOf("term") > -1){
                        field = Object.keys(qry_obj.query.bool.must[x].term)[0];
                        value = qry_obj.query.bool.must[x].term[field].replaceAll(" ","%20").replaceAll("\\(","%28").replaceAll("\\)","%29").replaceAll(":","%3A");
                        values.push(value);

                        rison_obj.filters = rison_obj.filters.concat(rison.decode('!((meta:(disabled:!f,index:search-analytics,key:' + field +
                        ',negate:!f,value:' + value + '),query:(match:(' + field + ':(query:' + value + ',type:phrase)))))'))
                    } 
                    // Handle query strings (different with and without facets)
                    else if (Object.keys(qry_obj.query.bool.must[x]).indexOf("query_string") > -1){
                        qry_str = qry_obj.query.bool.must[x].query_string.query;
                        rison_obj.query.query_string.query = qry_str;
                    } 
                }
            } else if (Object.keys(qry_obj.query).indexOf("query_string") > -1){
                qry_str = qry_obj.query.query_string.query;
                rison_obj.query.query_string.query = qry_str;
            }

            // console.log(Object.keys(qry_obj.query))
                    
            // console.log(rison_obj)
            var new_qry = (rison.encode_object(rison_obj) + ")");

            for (var z = 0; z < values.length; z++){
                new_qry = new_qry.replaceAll(values[z],"\'" + values[z] + "\'")
            }
            
            var new_src = old_qry_pre + new_qry
            return new_src
        }

        //CUSTOM
        //---------------
        thefacetview+='\
        <div class="well">\
            <div style="margin-top: 0px; margin-left: 20px;">'

                //Add buttons for all kibana visuals and additional info panels
                var buttons = "";
                for(var x = 0; x < kibana_vizzes.length; x++){
                    buttons += '<button type="button" id="kibana' + x +'_toggle" class="btn btn-primary" style="background: steelblue; margin-left: 4px; margin-bottom: 4px;">' + kibana_vizzes[x]["label"] + '</button>'
                }
                thefacetview += buttons;       
                
                // <button type="button" id="salient_toggle" class="btn btn-primary" style="background: steelblue; margin-bottom: 4px;"> Salient Terms </button>\
                thefacetview += '\
                <br><br><button type="button" id="lda_toggle" class="btn btn-primary" style="background: #5254a3; margin-bottom: 4px; margin-left: 4px;"> Data Field Dictionary</button>\
                <button type="button" id="panel_toggle" class="btn btn-primary" style="background: #5254a3; margin-bottom: 4px;"> Data Sources Overview</button>\
            </div>\
        </div>'
        
        thefacetview += '<div class="facetview_plots_container" id="images"> \
            <div class="panel-group" id="accordion">'

                //Add divs/wells for all kibana visuals and additional info panels
                var button_divs = "";
                for(var x = 0; x < kibana_vizzes.length; x++){
                    button_divs += '\
                    <div class="well" id="kibana' + x +'" style="display: none;"> \
                        <div class="panel panel-default" id="panel3"> \
                            <div class="panel-heading"> \
                                <h4 class="panel-title"> \
                                    <a data-toggle="collapse" data-target="#collapseThree" href="#" onClick="return false;" style="font-size:18pt; color: #000; font-family: Helvetica Neue;">'
                                    + kibana_vizzes[x]["label"] + " " +
                                    '<i class="icon-chevron-down" style="margin-top:10px;"></i></a>\
                                </h4>\
                            </div>\
                            <div id="collapseThree" class="panel-collapse collapse in"> \
                                <div class="panel-body"> \
                                    <div id="kibana' + x + '" style="margin-top: 20px;">\
                                        <span>' + kibana_vizzes[x]["note"] + '</span>\
                                        <iframe id="kibana_iframe' + x + '"src="' + kibana_vizzes[x]["src"] + '" height="600" width="800"></iframe>"\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>';
                }
                thefacetview += button_divs;

                // thefacetview += '<div class="well" id="keywords" style="display: none;"> \
                //     <div class="panel panel-default" id="panel3"> \
                //         <div class="panel-heading"> \
                //             <h4 class="panel-title"> \
                //                 <a data-toggle="collapse" data-target="#collapseFour" href="#" onClick="return false;" style="font-size:18pt; color: #000; font-family: Helvetica Neue;"> Common Terms \
                //                 <i class="icon-chevron-down" style="margin-top:10px;"></i></a>\
                //             </h4>\
                //         </div>\
                //         <div id="collapseFour" class="panel-collapse collapse in"> \
                //             <div class="panel-body"> \
                //                 <div id="keywords_hist" style="height: 370px; width: 400px; margin-top: 20px; margin-left: 7px;"/>\
                //             </div>\
                //         </div>\
                //     </div>\
                // </div> \
                // <div class="well" id="salient" style="display: none;"> \
                //     <div class="panel panel-default" id="panel3"> \
                //         <div class="panel-heading"> \
                //             <h4 class="panel-title"> \
                //                 <a data-toggle="collapse" data-target="#collapseFive" href="#" onClick="return false;" style="font-size:18pt; color: #000; font-family: Helvetica Neue;"> Salient Terms \
                //                 <i class="icon-chevron-down" style="margin-top:10px;"></i></a><br>\
                //                 <a style="font-size: 8pt;"href="http://vis.stanford.edu/files/2012-Termite-AVI.pdf">\
                //                 1. saliency(term w) = frequency(w) * [sum_t p(t | w) * log(p(t | w)/p(t))] for topics t; see Chuang et. al (2012)</a>\
                //                 <br><span style="font-size: 8pt;"> *More info and total salient term counts available in "Latent Topics" widget</span>\
                //             </h4>\
                //         </div>\
                //         <div id="collapseFive" class="panel-collapse collapse in"> \
                //             <div class="panel-body"> \
                //                 <div id="salient_hist" style="height: 370px; width: 400px; margin-top: 20px; margin-left: 7px;"/>\
                //             </div>\
                //         </div>\
                //     </div>\
                // </div> \
                thefacetview += '<div class="well" id="lda" style="display: none;"> \
                    <div class="panel panel-default" id="panel3"> \
                        <div class="panel-heading"> \
                            <h4 class="panel-title"> \
                                <a data-toggle="collapse" data-target="#collapseSix" href="#" onClick="return false;" style="font-size:18pt; color: #000; font-family: Helvetica Neue;"> Data Dictionary \
                                <i class="icon-chevron-down" style="margin-top:10px;"></i></a>\
                            </h4>\
                        </div>\
                        <div id="collapseSix" class="panel-collapse collapse in"> \
                            <div class="panel-body"> \
                            <table cellspacing="2" cellpadding="5">\
                                <tr>\
                                    <td><b>Field Name</b></td>\
                                    <td><b>Award, Solicitation, or Both</b></td></b>\
                                    <td><b>NSF, NASA, or Both</b></td>\
                                </tr>\
                                <tr>\
                                    <td>AgencyContactInfo</td>\
                                    <td>Solicitation</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>CFDADescription</td>\
                                    <td>Solicitation</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>CFDANumber</td>\
                                    <td>Solicitation</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>ClosingDate</td>\
                                    <td>Solicitation</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>CompetitionID</td>\
                                    <td>Solicitation</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>FundingOpportunityNumber</td>\
                                    <td>Solicitation</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>FundingOpportunityTitle</td>\
                                    <td>Both</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>FundingOpportunityTitle_unanalyzed</td>\
                                    <td>Both</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>InstructionsURL</td>\
                                    <td>Solicitation</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>IsMultiProject</td>\
                                    <td>Solicitation</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>OfferingAgency</td>\
                                    <td>Solicitation</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>OpeningDate</td>\
                                    <td>Solicitation</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>SchemaURL</td>\
                                    <td>Solicitation</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>abstract</td>\
                                    <td>Both</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>agency</td>\
                                    <td>Both</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>arra_amount</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>award_amount</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>award_effective_date</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>award_expiration_date</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>award_id</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>award_instrument_value</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>award_title</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>award_title_unanalyzed</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>cfda_number</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>duns_number</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>effective_year</td>\
                                    <td>Both</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>estimated_total_amount</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>fund_program_name</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>fund_program_name_unanalyzed</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>institution_address</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>institution_city_name</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>institution_country</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>institution_name</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>institution_phone</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>institution_state</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>institution_state_abbr</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>institution_zip</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>investigator_email</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>investigator_end_date</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>investigator_firstname</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>investigator_fullname</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>investigator_lastname</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>investigator_role_code</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>investigator_start_date</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>max_amd_letter_date</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>min_amd_letter_date</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>obligated_amount</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>org</td>\
                                    <td>Both</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>organization_code</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>organization_directorate</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>organization_division</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>performer_district_code</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>pims_id</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>po_name</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>primary_program</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>primary_program_unanalyzed</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>program_element_code</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>program_element_text</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>program_element_text_unanalyzed</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>program_officer</td>\
                                    <td>Award</td>\
                                    <td>Both</td>\
                                </tr>\
                                <tr>\
                                    <td>program_reference_code</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>program_reference_text</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>program_url</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>synopsis</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>type</td>\
                                    <td>Both</td>\
                                    <td>NSF</td>\
                                </tr>\
                                <tr>\
                                    <td>url</td>\
                                    <td>Award</td>\
                                    <td>NSF</td>\
                                </tr>\
                            </table>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
                <div class="well" id="panel" style="display: none;"> \
                    <div class="panel panel-default" id="panel5"> \
                        <div class="panel-heading"> \
                            <h4 class="panel-title"> \
                                <a data-toggle="collapse" data-target="#collapseSeven" href="#" onClick="return false;" style="font-size:18pt; color: #000; font-family: Helvetica Neue;"> Data Sources \
                                <i class="icon-chevron-down" style="margin-top:10px;"></i></a>\
                            </h4>\
                        </div>\
                        <div id="collapseSeven" class="panel-collapse collapse in"> \
                            <div class="panel-body"> \
                                <img src="static/NSF.png"></img>\
                                <img width=400 src="static/NASA-current.png"></img>\
                            </div>\
                        </div>\
                    </div>\
                </div> \
                \
                <div class="well" id="force" style="display: none;"> \
                    <div class="panel panel-default" id="panel3"> \
                        <div class="panel-heading"> \
                            <h4 class="panel-title"> \
                                <a data-toggle="collapse" id="collapseOneTitle", data-target="#collapseOne" href="#" onClick="return false;" style="font-size:18pt; color: #000; font-family: Helvetica Neue;"> Network Visualization \
                                <i class="icon-chevron-down" style="margin-top:10px;"></i></a>\
                                <span style="font-size: 14px;"> (Hover over node and scroll to zoom, click node to drag)</span><br>\
                                <span id="min_papers" style="font-size: 12px;"> </span><br>\
                            </h4>\
                        </div>\
                        <div id="collapseOne" class="panel-collapse collapse in"> \
                            <div class="panel-body"> \
                                <div id="force_viz" style="height: 600px; width: 600px; margin-top: 20px; "/>\
                            </div>\
                        </div>\
                    </div>\
                </div> \
                \
            </div>\
        </div>'




        options.pager_on_top ? thefacetview += '<div class="facetview_metadata" style="margin-top:20px;"></div>' : "";
        thefacetview += options.searchwrap_start + options.searchwrap_end;
        thefacetview += '<div class="facetview_metadata"></div></div></div></div>';

        var obj = undefined;

        // ===============================================
        // now create the plugin on the page
        return this.each(function() {
            // get this object
            obj = $(this);
            
            // what to do when ready to go
            var whenready = function() {
                // append the facetview object to this object
                thefacetview = thefacetview.replace(/{{HOW_MANY}}/gi,options.paging.size);
                obj.append(thefacetview);
                !options.embedded_search ? $('.facetview_search_options_container', obj).hide() : "";


                // bind learn more and how many triggers
                $('.facetview_learnmore', obj).bind('click',learnmore);
                $('.facetview_howmany', obj).bind('click',howmany);
                $('.facetview_searchfield', obj).bind('change',searchfield);
                $('.facetview_orderby', obj).bind('change',orderby);
                $('.facetview_order', obj).bind('click',order);
                $('.facetview_sharesave', obj).bind('click',sharesave);

                // check paging info is available
                !options.paging.size && options.paging.size != 0 ? options.paging.size = 10 : "";
                !options.paging.from ? options.paging.from = 0 : "";

                // handle any source options
                if ( options.source ) {
                    parsesource();
                    delete options.source;
                }

                // set any default search values into the search bar and create any required filters
                if ( options.searchbox_class.length == 0 ) {
                    options.q != "" ? $('.facetview_freetext', obj).val(options.q) : "";
                    buildfilters();
                    $('.facetview_freetext', obj).bindWithDelay('keyup',dosearch,options.freetext_submit_delay);
                } else {
                    options.q != "" ? $(options.searchbox_class).last().val(options.q) : "";
                    buildfilters();
                    $(options.searchbox_class).bindWithDelay('keyup',dosearch,options.freetext_submit_delay);
                }

                options.source || options.initialsearch ? dosearch() : "";

            };
            
            // check for remote config options, then do first search
            if (options.config_file) {
                $.ajax({
                    type: "get",
                    url: options.config_file,
                    dataType: "jsonp",
                    success: function(data) {
                        options = $.extend(options, data);
                        whenready();
                    },
                    error: function() {
                        $.ajax({
                            type: "get",
                            url: options.config_file,
                            success: function(data) {
                                options = $.extend(options, $.parseJSON(data));
                                whenready();
                            },
                            error: function() {
                                whenready();
                            }
                        });
                    }
                });
            } else {
                whenready();
            }


        }); // end of the function  

    };
    // facetview options are declared as a function so that they can be retrieved
    // externally (which allows for saving them remotely etc)
    $.fn.facetview.options = {};
    
})(jQuery);