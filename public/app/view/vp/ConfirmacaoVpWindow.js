Ext.define('App.view.vp.ConfirmacaoVpWindow', {
    extend: 'Ext.window.Window',
    xtype: 'ConfirmacaoVpWindow',
    id: 'ConfirmacaoVpWindow',
    height: Ext.getBody().getHeight() * 0.7,
    width: Ext.getBody().getWidth() * 0.8,
    title: 'Confirmação de venda perdida',
    requires:[

    ],
    layout: 'fit',
    constructor: function() {
        var me = this;

        var btnSo = Ext.create('Ext.form.field.TextArea', {

            fieldLabel: '<b>Comentário de Solicitação</b>',
            maxRows: 4,
            labelAlign: 'top',
            name: 'comentarioSo',
            anchor: '98%',
            margin: '20 1 1 1'
        });

        var btnAprov = Ext.create('Ext.form.field.TextArea', {

            fieldLabel: '<b>Comentário de Aprovação</b>',
            maxRows: 4,
            labelAlign: 'top',
            name: 'comentarioAp',
            anchor: '98%',
            margin: '1 1 1 1'
        });

        var btnConfirmar = Ext.create('Ext.button.Button',{
            
            text: 'Confirmar',
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
                                obs: btnSo.getValue()
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

        var myStore = Ext.create('Ext.data.Store', {
            model: Ext.create('Ext.data.Model', {
                    fields:[{name:'idEmpresa',mapping:'idEmpresa'},
                            {name:'idCliente',mapping:'idCliente'},
                            {name:'nomeCliente',mapping:'nomeCliente'},
                            {name:'codItem',mapping:'codItem'},
                            {name:'descItem',mapping:'descItem'},
                            {name:'marca',mapping:'marca'},
                            {name:'curva',mapping:'curva'},
                            {name:'vpDataLancamento',mapping:'vpDataLancamento'},
                            {name:'vpQtde',mapping:'vpQtde'},
                            ]
            })
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
                                    title: 'Vendedor',
                                    defaultType: 'textfield',
                                    defaults: {
                                        anchor: '100%'
                                    },
                            
                                    items: [
                                        {
                                            xtype: 'displayfield',
                                            id: 'WinVendedor'
                                        }
                                    ]
                                },
                                {
                                    xtype: 'grid',
                                    store: myStore,
                                    columns:[
                                        {
                                            text: 'Emp',
                                            dataIndex: 'emp',
                                            width: 52
                                        },
                                        {
                                            text: 'Cod. Cli.',
                                            dataIndex: 'idCliente',
                                            width: 100,
                                            hidden: true
                                        },
                                        {
                                            text: 'Cliente',
                                            dataIndex: 'nomeCliente',
                                            flex: 1,
                                            minWidth: 100
                                        },
                                        {
                                            text: 'Codigo',
                                            dataIndex: 'codItem',
                                            width: 100,
                                            hidden: true
                                        },
                                        {
                                            text: 'Descrição',
                                            dataIndex: 'descItem',
                                            flex: 1,
                                            minWidth: 100
                                        },
                                        {
                                            text: 'Marca',
                                            dataIndex: 'marca',
                                            width: 120
                                        },
                                        {
                                            text: 'Curva',
                                            dataIndex: 'curva',
                                            width: 60
                                        },
                                        {
                                            text: 'Quantidade',
                                            dataIndex: 'vpQtde',
                                            width: 100
                                        },
                                        {
                                            text: 'Lançamento',
                                            dataIndex: 'vpDataLancamento',
                                            width: 100
                                        }
                                    ]
                                },
                                btnSo,
                                btnAprov
                            ]
                        },
                        {
                            xtype: 'toolbar',
                            region: 'south',
                            margin: '0 0 0 0',
                            items: [
                                '->',
                                btnConfirmar
                            ]
                        }
                    ]
                }
            ]

        });

        me.callParent(arguments);

    }

});
