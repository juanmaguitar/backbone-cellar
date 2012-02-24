// Models

var WineApp = (function(){

    var oApp = null; // This will contain the App that we'll return
    
    var WineModel = null; 
    var WineCollection = null; 

    var WineListView = null;
    var WineListItemView = null;
    var WineView = null;

    var WineAppRouter = null;

    // http://japhr.blogspot.com/2011/10/underscorejs-templates-in-backbonejs.html
    _.templateSettings = {
        interpolate : /\{\{([\s\S]+?)\}\}/g
    };

    // ----- MODELS ------------------------------------------------------------------------ 

    // Model Definition 
    WineModel = Backbone.Model.extend();


    // ----- COLLECTION  ------------------------------------------------------------------------ 

    // Collection Definition 
    WineCollection = Backbone.Collection.extend({
        model: WineModel,
        url: "http://projects/BACKBONE/backbone-cellar/api/wines"
    });

    // ----- VIEWS ------------------------------------------------------------------------ 

    /**
     * WineListView : Wine List (UL)
     * ex --> new WineListView({model:this.wineList});
     */
     
    WineListView = Backbone.View.extend({

        tagName:'ul',

        initialize:function () {
            this.model.bind("reset", this.render, this);
        },

        render:function (eventName) {
        
        	var oCollection = this.model.models;
        	var oElementBase = this.el // tagName:'ul'... created on the fly
        	var oViewCurrentWine = null; 
        	
        	// For each element of the collection (wine)
        	// ... i create a LI with the info and append it to the UL
            _.each( oCollection, function (wine) {
            
            	// oCurrentWine: a view of this current wine
            	oViewCurrentWine = new WineListItemView({ model:wine });
            	
            	// oCurrentWineElement: a DOM element (LI) of this current wine
            	oCurrentWineElement = oViewCurrentWine.render().el;
            	
            	// append LI's to UL
                $(oElementBase).append( oCurrentWineElement );
                
            }, this);
            
            // return this so this method can be chained
            return this;
        }

    });

    /**
     * WineListItemView : Wine Element (LI)
     * ex --> new WineListItemView({ model:wine });
     */
     
    var WineListItemView = Backbone.View.extend({

        tagName:"li",

        template:_.template( $('#tpl-wine-list-item').html() ),

        events: {
            "click a": "markSelection"
        },

        markSelection: function(eEvent) {

            var oElement = eEvent.target.parentNode;

            $(oElement).addClass("selected").siblings().removeClass("selected");

        },

        render:function (eventName) {
        
        	var oJsonWineData = this.model.toJSON();
        	var sHtmlTemplate = this.template(oJsonWineData);
        	var oElementBase = this.el // tagName:'li'... created on the fly
        	
            $(oElementBase).html(sHtmlTemplate);
            
            return this;
        }

    });

    /**
     * WineItemDetails : Wine Element Details (LI)
     * ex --> new WineListItemView({ model:wine });
     */
     
    WineView = Backbone.View.extend({

        template:_.template($('#tpl-wine-details').html()),

        render:function (eventName) {

            var oJsonWineData = this.model.toJSON();
            var sHtmlTemplate = this.template( oJsonWineData );
            var oElementBase = this.el;

            $(oElementBase).html(sHtmlTemplate);

            return this;
        }

    });

    // ----- ROUTER ------------------------------------------------------------------------ 

    /**
     * WineAppRouter: Entry points of our app
     */

    WineAppRouter = Backbone.Router.extend({

        wineList : null, // Collection
        wineListView : null, // View List

        wine : null, // Model (Unique Wine)
        wineView : null, // View Detail

        routes:{
            "": "list",
            "wines/:id": "wineDetails"
        },

        initialize: function(options) {

            this.myWineCollection = new WineCollection();
            this.myWineCollection.fetch();

        },

        list: function () {

            var oListSidebar = document.getElementById('sidebar');
            var oListSidebarContent = null;

            this.wineListView = new WineListView({ model:this.myWineCollection });
            oListSidebarContent = this.wineListView.render().el;
            $(oListSidebar).html( oListSidebarContent );
        },

        wineDetails: function (id) {

            var oDetailViewContainer = document.getElementById('content');
            var oDetailViewInfo = null;

            this.wine = this.myWineCollection.get(id);
            this.wineView = new WineView({ model:this.wine });

            oDetailViewInfo = this.wineView.render().el;
            $(oDetailViewContainer).html( oDetailViewInfo );
        }
    });

    var App = new WineAppRouter();
    Backbone.history.start();

    return App;
})()