Ext.define('App.view.vp.Main', {
    extend: 'Ext.container.Container',
    xtype: 'vpmain',
    id: 'vpmain',
    itemId: 'vpmain',
    requires: [
    ],
    title: 'Venda Perdida',
    layout: 'border',

    constructor: function() {
        var me = this;
        
        Ext.applyIf(me, {
            style: {
                background:'#ffffff !important'
            },
            items: [
                {
                    xtype: 'VpToolbar',
                    region: 'north'
                },
                {
                    xtype: 'ItensGridPanel',
                    region: 'center'
                },
                {
                    xtype: 'PanelLeste',
                    region: 'east'
                }
            ]

        });

        me.callParent(arguments);
    }
    
});
