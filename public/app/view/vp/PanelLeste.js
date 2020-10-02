Ext.define('App.view.vp.PanelLeste', {
    extend: 'Ext.panel.Panel',
    xtype: 'PanelLeste',
    id: 'PanelLeste',
    width: 300,
    title: 'Comentários',
    collapsible: true,
    layout: 'fit',
    constructor: function() {
        var me = this;

        var myStore = Ext.create('Ext.data.Store', {
            model: Ext.create('Ext.data.Model', {
                    fields:[{name:'comentarioSo', mapping:'comentarioSo'},
                            {name:'usuario' ,mapping:'usuario'},
                            { name: 'dataSo', mapping:'dataSo', type: 'date', dateFormat: 'd/m/Y H:i:s' }
                            ]
            }),
            proxy: {
                type: 'ajax',
                method:'POST',
                url : BASEURL + '/api/vp/listarvpcomentario',
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
                    hideHeaders: true,
                    columns: [
                        {
                    
                            text: 'Usuário',
                            flex: 1,
                            dataIndex: 'usuario',
                            renderer: function(v) {
                                return '<b>' + v + '</b>';
                            }
                        }, 
                
                        {
                            // menuDisabled: true,
                            text: 'Data',
                            width: 140,
                            dataIndex: 'dataSo',
                            // renderer: Ext.util.Format.dateRenderer('d/m/Y H:i:s')
                        }
                    ],
        
                    features: [{
                        ftype: 'rowbody',
                        getAdditionalData: function (data, idx, record, orig) {
                            return {
                                rowBody: '<span>' + record.get("comentarioSo") + '</span>',
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