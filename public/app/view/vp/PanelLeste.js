Ext.define('App.view.vp.PanelLeste', {
    extend: 'Ext.panel.Panel',
    xtype: 'panelleste',
    itemId: 'panelleste',
    width: 300,
    title: 'Comentários',
    collapsible: true,
    layout: 'fit',
    initComponent: function() {
        var me = this;

        Ext.GlobalEvents.on('vpsolicitacaoconcluida', function(vpItem){
            var gridLeste = me.down('#gridLeste'),
                gridLesteStore = gridLeste.getStore();

            gridLesteStore.getProxy().setExtraParams({
                idEmpresa: vpItem.idEmpresa,
                idVendaPerdida: vpItem.idVendaPerdida
            });

            gridLeste.getStore().load();
        });

        Ext.GlobalEvents.on('vpsolicitacaoaprovada', function(vpItem){
            var gridLeste = me.down('#gridLeste'),
                gridLesteStore = gridLeste.getStore();

            gridLesteStore.getProxy().setExtraParams({
                idEmpresa: vpItem.idEmpresa,
                idVendaPerdida: vpItem.idVendaPerdida
            });

            gridLeste.getStore().load();
        });

        Ext.GlobalEvents.on('vpsolicitacaocancelada', function(vpItem){
            var gridLeste = me.down('#gridLeste'),
                gridLesteStore = gridLeste.getStore();

            gridLesteStore.getProxy().setExtraParams({
                idEmpresa: vpItem.idEmpresa,
                idVendaPerdida: vpItem.idVendaPerdida
            });

            gridLeste.getStore().load();
        });

        var myStore = Ext.create('Ext.data.Store', {
            model: Ext.create('Ext.data.Model', {
                    fields:[{name:'comentario', mapping:'comentario'},
                            {name:'usuario' ,mapping:'usuario'},
                            { name: 'data', mapping:'data', type: 'date', dateFormat: 'd/m/Y H:i' },
                            {name:'status' ,mapping:'status'},
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
                    itemId: 'gridLeste',
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
                            width: 126,
                            dataIndex: 'data',
                            // renderer: Ext.util.Format.dateRenderer('d/m/Y H:i:s')
                        }
                    ],
        
                    features: [{
                        ftype: 'rowbody',
                        getAdditionalData: function (data, idx, record, orig) {

                            return {
                                rowBody: '<span>' +  (record.get("comentario") ? record.get("status") + ': ' + record.get("comentario") : '') + '</span>',
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