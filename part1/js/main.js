var WineApp = (function(){

    // oApp will contain the whole App that we'll return to WineApp
    var oApp = null;
    
    var WineModel = null; 
    var WineCollection = null; 

    var WineListView = null;
    var WineListItemView = null;
    var WineView = null;

    var WineAppRouter = null;

    // We can use more intuitive characters like `{{ }}` for 
    // [underscrore js templates in backbone](http://japhr.blogspot.com/2011/10/underscorejs-templates-in-backbonejs.html) 
    _.templateSettings = {
        interpolate : /\{\{([\s\S]+?)\}\}/g
    };

    // ###WineModel
    // Model Definition. Represents a Wine 
    WineModel = Backbone.Model.extend();

    // ###WineCollection
    // Collection of `WineModel`. Represents the list of wines
    WineCollection = Backbone.Collection.extend({
        model: WineModel,
        // set the RESTful service API url
        url: "http://projects/BACKBONE/backbone-cellar/api/wines"
    });

     // ###WineListView
     // Wine List (UL)   
     // instance: `new WineListView({ model:this.wineList })     
     //        
     // ![HTML code generated](img/UL_WineListView.jpg "List of Wines")
      
    WineListView = Backbone.View.extend({

        tagName:'ul',

        initialize:function () {
            this.model.bind("reset", this.render, this);
        },

        render:function (eventName) {
        
        	var oCollection = this.model.models;
            // `oElementBase` tagName 'UL' that will be created on the fly
        	var oElementBase = this.el 
        	var oViewCurrentWine = null; 
        	
        	// For each element of the collection (wine)
        	// i create a LI with the info and append it to the UL
            _.each( oCollection, function (wine) {
            
            	// `oViewCurrentWine` a view of this current wine
            	oViewCurrentWine = new WineListItemView({ model:wine });
            	
            	// `oCurrentWineElement` a DOM element (LI) of this current wine
            	oCurrentWineElement = oViewCurrentWine.render().el;
            	
            	// append LI's to UL
                $(oElementBase).append( oCurrentWineElement );
                
            }, this);
            
            // return `this` so this method can be chained
            return this;
        }

    });

    // ###WineListItemView
    // Wine Element (LI) of the list    
    // instance: `new WineListItemView({ model:wine })`
    //        
    // ![HTML code generated](img/LI_WineListItemView.jpg "Item in the List of Wines")
     
    var WineListItemView = Backbone.View.extend({

        tagName:"li",

        template:_.template( $('#tpl-wine-list-item').html() ),

        initialize: function() {
            this.model.bind("change:selected", this.markSelection, this);
        },

        events: {
            "click a": "setSelection"
        },

        setSelection: function () {

            var aCollection = this.model.collection.models;

            _.each( aCollection, function (wine) {
                wine.set({ selected:false });
            });

            this.model.set({ selected:true });
                       
        },

        markSelection: function( wine, selected) {

            var oElement = this.el;
            var sClassSelected = selected ? "selected" : "";

            $(oElement).attr("class",sClassSelected);
        },

        render:function (eventName) {
        
        	var oJsonWineData = this.model.toJSON();
        	var sHtmlTemplate = this.template(oJsonWineData);
            // `oElementBase` tagName 'LI' that will be created on the fly
        	var oElementBase = this.el 
        	
            $(oElementBase).html(sHtmlTemplate);
            
            return this;
        }

    });

    // ###WineItemDetails
    // Show Data of every wine through `tpl-wine-details` template    
    // instance: `new WineListItemView({ model:wine });`
    //        
    // ![HTML code generated](img/DIV_WineItemDetails.jpg "Details of Wine")

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

    // ###WineAppRouter
    // Entry points of our app    
    // instance: `new WineAppRouter();`
    WineAppRouter = Backbone.Router.extend({

        // `wineList` *Collection* of wines
        wineList : null, 
        // `wineListView` *View* with the list of wines
        wineListView : null, 

        // `wine` *Model* representing an unique wWine
        wine : null, 
        // `wineView` *View* with the details of the wine
        wineView : null, 

        // we set what to do in our app URL's
        routes:{
            // at `http:\\our_app_url\` we call to `this.list` method 
            // and show the list of wines
            "": "list",
            
            // for example at `http:\\our_app_url\#wines\3` we call to `this.wineDetails` method
            // and show the details of wine with id=3
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