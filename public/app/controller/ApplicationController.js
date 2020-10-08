Ext.define('App.controller.ApplicationController', {
    extend: 'Ext.app.Controller',

    requires: [
        
    ],

    control: {

    },

    routes: {
        'home': { action: 'homeAction' },
    },
    
    getViewport: function(){
        return App.getApplication().getMainView();
    },
    
    init: function() {
        var me = this;

        me.mainAction();
    },
    
    mainAction: function(){
        var me = this,
            viewport = me.getViewport();
        
        if(viewport){
            viewport.add({
                itemId: 'applicationtabs',
                region: 'center',
                xtype: 'tabpanel',
                layout: 'fit'
            });
        }
    },

    homeAction: function(){
        var me = this;
        me.addMasterTab('vpmain');
    },

    addMasterTab: function(xtype){
        var me = this,
            viewport = me.getViewport(),
            viewportTabs = viewport.down('#applicationtabs'),
            tab = viewportTabs.down(xtype);

        if(!tab){
            tab = viewportTabs.add({
                closable: false,
                xtype: xtype,
                listeners: {
                    destroy: function(){
                        me.redirectTo('home');
                    }
                }
            });
        };
        
        viewportTabs.setActiveItem(tab);
    }
    //---------------------------
    
});
