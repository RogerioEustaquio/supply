Ext.define('App.controller.ApplicationController', {
    extend: 'Ext.app.Controller',

    requires: [
        
    ],

    control: {

    },

    routes: {
        'home': { action: 'mainAction' },
    },
    
    getViewport: function(){
        return App.getApplication().getMainView();
    },
    
    init: function() {
        var me = this;

        // Se não tiver logado
        // me.mainAction();
    },
    
    mainAction: function(){
        var me = this,
            viewport = me.getViewport();
        
        if(viewport){
            viewport.add({
                itemId: 'applicationtabs',
                region: 'center',
                xtype: 'tabpanel',
                layout: 'fit',
                items:[
                    {
                        xtype: 'vpmain'
                    }
                ]
            });
        }
    },

    homeAction: function(){
        var me = this,
        viewport = me.getViewport();
    }
    
});
