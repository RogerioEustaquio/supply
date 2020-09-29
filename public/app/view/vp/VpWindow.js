Ext.define('App.view.vp.VpWindow', {
    extend: 'Ext.window.Window',
    xtype: 'VpWindow',
    id: 'VpWindow',
    height: Ext.getBody().getHeight() * 0.4,
    width: Ext.getBody().getWidth() * 0.6,
    title: 'Observações Venda Perdida',
    requires:[

    ],
    layout: 'fit',
    constructor: function() {
        var me = this;

        var btnobs = Ext.create('Ext.form.field.TextArea', {

            emptyText: 'Observação Sobre Venda',
            maxRows: 4,
            name: 'obsVenda',
            anchor: '100%',
            margin: '1 1 1 1'
        });

        var btnEnviar = Ext.create('Ext.button.Button',{
            
            text: 'Enviar',
            tooltip: 'Limpar',
            margin: '1 6 1 1',
            handler: function(form) {

                var urlAction = '/api/vp/inserir';

                var param = {
                    emp: null
                };

                Ext.Ajax.request({
                    url : BASEURL + urlAction,
                    method: 'POST',
                    params: param,
                    success: function (response) {

                        var result = Ext.decode(response.responseText);
                        if(result.success){

                            var gridLeste = Ext.getCmp('gridLeste');

                            var params = {
                                obs: btnobs.getValue()
                            };

                            gridLeste.getStore().getProxy().setExtraParams(params);

                            gridLeste.getStore().load();

                            Ext.Msg.alert('info', 'Observação Registrada!');

                            me.close();

                        }else{
                            Ext.Msg.alert('info', result.message);
                        }

                    }
                });

            }
        });

        Ext.applyIf(me, {
            
            items:[
                {
                    xtype:'panel',
                    layout: 'border',
                    items:[
                        {
                            xtype: 'form',
                            region: 'center',
                            items: [
                                {
                                    xtype: 'fieldset',
                                    title: 'Info Venda Cliente',
                                    defaultType: 'textfield',
                                    defaults: {
                                        anchor: '100%'
                                    },
                            
                                    items: [
                                        {
                                            xtype: 'displayfield',
                                            id: 'winCliente'
                                        }
                                    ]
                                },
                                btnobs
                            ]
                        },
                        {
                            xtype: 'toolbar',
                            region: 'south',
                            items: [
                                '->',
                                btnEnviar
                            ]
                        }
                    ]
                }
            ]

        });

        me.callParent(arguments);

    }

});
