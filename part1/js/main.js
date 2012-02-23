// Models

var App = {
	views : {},
	collections: {}
};

// Model Definition 
var Wine = Backbone.Model.extend();

// Collection Definition 
var WineCollection = Backbone.Collection.extend({
    model:Wine,
    url:"../api/wines"
});

// ----- VIEWS ------------------------------------------------------------------------ 

/**
 * WineListView : Wine List (UL)
 * ex --> new WineListView({model:this.wineList});
 */
 
var WineListView = Backbone.View.extend({

    tagName:'ul',

    initialize:function () {
        this.model.bind("reset", this.render, this);
    },

    render:function (eventName) {
    
    	var oCollection = this.model.models;
    	var oBaseElement = this.el // tagName:'ul'... created on the fly
    	var oCurrentWine = null; 
    	
    	// For each element of the collection (wine)
    	// ... i create a LI with the info and append it to the UL
        _.each(oCollection, function (wine) {
        
        	// oCurrentWine: a view of this current wine
        	oCurrentWine = new WineListItemView({ model:wine });
        	
        	// oCurrentWineElement: a DOM element (LI) of this current wine
        	oCurrentWineElement = oCurrentWine.render().el;
        	
        	// append LI's to UL
            $(oBaseElement).append(oCurrentWineElement);
            
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

    render:function (eventName) {
    
    	var sWineJsonData = this.model.toJSON();
    	var sHtmlTemplate = this.template(sWineJsonData);
    	var oBaseElement = this.el // tagName:'li'... created on the fly
    	
        $(oBaseElement).html(sHtmlTemplate);
        
        return this;
    }

});

/**
 * WineItemDetails : Wine Element Details (LI)
 * ex --> new WineListItemView({ model:wine });
 */
 
var WineView = Backbone.View.extend({

    template:_.template($('#tpl-wine-details').html()),

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});


// Router
var AppRouter = Backbone.Router.extend({

    routes:{
        "":"list",
        "wines/:id":"wineDetails"
    },

    list:function () {
        this.wineList = new WineCollection();
        this.wineListView = new WineListView({model:this.wineList});
        this.wineList.fetch();
        $('#sidebar').html(this.wineListView.render().el);
    },

    wineDetails:function (id) {
        this.wine = this.wineList.get(id);
        this.wineView = new WineView({model:this.wine});
        $('#content').html(this.wineView.render().el);
    }
});

var app = new AppRouter();
Backbone.history.start();