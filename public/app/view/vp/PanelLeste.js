Ext.define('App.view.vp.PanelLeste', {
    extend: 'Ext.panel.Panel',
    xtype: 'PanelLeste',
    id: 'PanelLeste',
    width: 300,
    title: 'Observações',
    layout: 'fit',
    constructor: function() {
        var me = this;

        var myStore = Ext.create('Ext.data.Store', {
            model: Ext.create('Ext.data.Model', {
                    fields:[{name:'obs',mapping:'obs'},
                            {name:'usuario',mapping:'usuario'}
                            ]
            }),
            proxy: {
                type: 'ajax',
                method:'POST',
                url : BASEURL + '/api/vp/listarvpobs',
                encode: true,
                timeout: 240000,
                format: 'json',
                reader: {
                    type: 'json',
                    rootProperty: 'data'
                }
            },
            autoLoad : false
        });

        Ext.applyIf(me, {

            items :[
                {
                    xtype: 'grid',
                    id: 'gridLeste',
                    store: myStore,
                    columns: [
                        {
                            
                            text: 'Usuário',
                            flex: 1,
                            dataIndex: 'usuario',
                            renderer: function(v) {
                                return '<b>' + v + '</b>';
                            }
                        }
                    ],
        
                    features: [{
                        ftype: 'rowbody',
                        getAdditionalData: function (data, idx, record, orig) {
                            return {
                                rowBody: '<span>' + record.get("obs") + '</span>',
                                rowBodyCls: "grid-body-cls"
                            };
                        }
                    }]
                }
            ]
        });

        me.callParent(arguments);

    }

});