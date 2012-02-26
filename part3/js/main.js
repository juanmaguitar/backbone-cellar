var WineApp = (function(){

    // oApp will contain the whole App that we'll return to WineApp
    var oApp = null;
    
    var WineModel = null; 
    var WineCollection = null; 

    var WineListView = null;
    var WineListItemView = null;
    var WineView = null;
    var WineHeaderView = null;

    var WineAppRouter = null;
    var oAppEvents = {}

    _.extend(oAppEvents, Backbone.Events);

    oAppEvents.on("select", function( oWineSelected ) {

        var aCollection = oApp.wineList.models;

        _.each( aCollection, function (wine) {
            wine.set({ selected:false });
        });

        oWineSelected.set({ selected:true });

    });

    // We can use more intuitive characters like `{{ }}` for 
    // [underscrore js templates in backbone](http://japhr.blogspot.com/2011/10/underscorejs-templates-in-backbonejs.html) 
    _.templateSettings = {
        interpolate : /\{\{([\s\S]+?)\}\}/g
    };


    // ###WineModel
    // Model Definition. Represents a Wine 
    WineModel = Backbone.Model.extend({

        // RESTful service endpoint to retrieve or persist Model data. 
        // Note that this attribute is only needed when retrieving/persisting Models 
        // that are not part of a Collection. If the Model is part of a Collection, 
        // the url attribute defined in the Collection is enough for Backbone.js to 
        // know how to retrieve, update, or delete data using your RESTful API.
        urlRoot: "../api/wines",
        defaults: {
            "id": null,
            "name": "",
            "grapes": "",
            "country": "USA",
            "region": "California",
            "year": "",
            "description": "",
            "picture": "Reserva.jpg"
        }
    });


    // ###WineCollection
    // Collection of `WineModel`. Represents the list of wines
    WineCollection = Backbone.Collection.extend({
        model: WineModel,
        // set the RESTful service API url
        url: "../api/wines"
    });


    // ###WineListView
    // Wine List (UL)   
    // instance: `new WineListView({ model:this.wineList })     
    //        
    // ![HTML code generated](img/UL_WineListView.jpg "List of Wines")
      
    WineListView = Backbone.View.extend({

        tagName:'ul',

        initialize:function () {

            _.bindAll(this, 'render', 'addWine');
            this.model.bind("reset", this.render);
            this.model.bind("add", this.addWine) 
        },

        addWine: function (wine) {
            
            var oViewItemWine = new WineListItemView({ model:wine });
            var oViewItemWineHTML = oViewItemWine.render().el;
            var oElementBase = this.el;

            $(oElementBase).append(oViewItemWineHTML);

        },

        render: function (eventName) {
        
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
            _.bindAll(this, 'render', 'close', "markSelection");
            this.model.bind("change", this.render);
            this.model.bind("destroy", this.close);
            this.model.bind("change:selected", this.markSelection);
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
        },

        close: function() {
            
            // `this.el here represents a DOM selection of the LI
            var oElement = this.el;
            
            // unbind of all events attached to this LI (this.events)
            $(oElement).unbind();
            // remove the element (from the list)
            $(oElement).remove();

        }

    });

    // ###WineItemDetails
    // Show Data of every wine through `tpl-wine-details` template    
    // instance: `new WineListItemView({ model:wine });`
    //        
    // ![HTML code generated](img/DIV_WineItemDetails.jpg "Details of Wine")

    WineView = Backbone.View.extend({

        template:_.template($('#tpl-wine-details').html()),

        initialize:function () {
            this.model.bind("change", this.render, this);
        },
    
        events:{
            "change input": "change",
            "click .save": "saveWine",
            "click .delete": "deleteWine"
        },

        render:function (eventName) {

            var oJsonWineData = this.model.toJSON();
            var sHtmlTemplate = this.template( oJsonWineData );
            var oElementBase = this.el;

            $(oElementBase).html(sHtmlTemplate);

            return this;
        },

        change:function ( eEvent) {

            var oInput = eEvent.target;

            // You could change your model on the spot, like this:     
            // `var change = {};`    
            // `change[target.name] = target.value`;    
            // `this.model.set(change);`    
            console.log('changing ' + oInput.id + ' from: ' + oInput.defaultValue + ' to: ' + oInput.value);

        },

        saveWine:function () {

            var bIsNew = false;
            var oAppCollection = oApp.wineList;
            var oCurrentModel  = this.model;
            var self = this;

            oCurrentModel.set({
                name: $('#name').val(),
                grapes: $('#grapes').val(),
                country: $('#country').val(),
                region: $('#region').val(),
                year: $('#year').val(),
                description: $('#description').val()
            });

            // We can check if the model has been saved to the server with 
            // [model.isNew()](http://documentcloud.github.com/backbone/#Model-isNew) 
            bIsNew = oCurrentModel.isNew();

            // With this method we can SAVE new wines or UPDATE existing ones
            if (bIsNew) {
                // Add this model (wine) to the collection created in App
                oAppCollection.create( this.model, {
                    success: function() {
                        oApp.navigate('wines/' + self.model.id, false);
                    }
                });
            } 
            else {
                // Update current model (this.model)
                oCurrentModel.save();
            }
            return false;
        },

        deleteWine:function () {

            var oCurrentModel  = this.model;

            oCurrentModel.destroy({
                success:function () {
                    alert('Wine deleted successfully');
                    window.history.back();
                }
            });
            return false;
        },

        close:function () {
            // this.el here represents a DOM selection of the DIV
            // showing the details of wine
            var oElement = this.el;
            
            // unbind of all events attached
            $(oElement).unbind();
            // clean the content of the element
            $(oElement).empty();
            
        }

    });

    // ###WineItemDetails
    // Show Data of every wine through `tpl-wine-details` template    
    // instance: `new WineListItemView({ model:wine });`
    //        
    // ![HTML code generated](img/DIV_WineItemDetails.jpg "Details of Wine")

    HeaderView = Backbone.View.extend({

        template:_.template($('#tpl-header').html()),

        initialize:function () {
            this.render();
        },

        render:function (eventName) {

            var sHtmlTemplate = this.template();
            var oElementBase = this.el;

            $(oElementBase).html(sHtmlTemplate);

            return this;

        },

        events:{
            "click .new": "newWine"
        },

        newWine:function (event) {
            
            oApp.navigate("wines/new", true);
            return false;

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
            
            "wines/new": "newWine",

            // for example at `http:\\our_app_url\#wines\3` we call to `this.wineDetails` method
            // and show the details of wine with id=3
            "wines/:id": "wineDetails"
        },

        initialize: function(options) {

            this.showHeader();

        },

        showHeader: function () {

            var oHeader = document.getElementById('header');
            var oHeaderHTML = new HeaderView().render().el;

            $(oHeader).html(oHeaderHTML);
        },

        list: function () {

            var oListSidebar = document.getElementById('sidebar');
            var self = this;

            this.wineList = new WineCollection();
            this.wineList.fetch({

                success: function() {

                    var oListSidebarContent = null;
                    var sRequestedId = self.requestedId;
                    var oRequestedModel = self.wineList.get(sRequestedId);

                    self.wineListView = new WineListView({ model:self.wineList });
                    oListSidebarContent = self.wineListView.render().el;

                    $(oListSidebar).html( oListSidebarContent );

                    if (self.requestedId) {
                        self.wineDetails(self.requestedId);
                    }

                }
            });

            
        },

        wineDetails: function (id) {

            var oDetailViewContainer = document.getElementById('content');
            var oDetailViewInfo = null;
            var oApp_DetailWineView = oApp.wineView;

            if (this.wineList) {
                
                this.wine = this.wineList.get(id);
                oAppEvents.trigger("select", this.wine);

                if (this.wineView) {
                    this.wineView.close();
                }
                this.wineView = new WineView({ model:this.wine });
                oDetailViewInfo = this.wineView.render().el;

                $(oDetailViewContainer).html( oDetailViewInfo );

            }

            else {

                this.requestedId = id;
                this.list();
            }
            
        },

        newWine: function() {

            var oNewWine = new WineModel();
            var oDetailViewContainer = document.getElementById('content');
            var oDetailViewInfo = null;

            if ( oApp.wineView) {
                oApp.wineView.close();
            }
            oApp.wineView = new WineView({ model: oNewWine });
            oDetailViewInfo = oApp.wineView.render().el;

            $(oDetailViewContainer).html( oDetailViewInfo );

        }

    });

    var oApp = new WineAppRouter();
    Backbone.history.start();

    return oApp;

})()