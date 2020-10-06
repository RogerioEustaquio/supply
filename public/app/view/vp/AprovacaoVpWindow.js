Ext.define('App.view.vp.AprovacaoVpWindow', {
    extend: 'Ext.window.Window',
    xtype: 'AprovacaoVpWindow',
    id: 'AprovacaoVpWindow',
    height: Ext.getBody().getHeight() * 0.8,
    width: Ext.getBody().getWidth() * 0.9,
    title: 'Aprovação de venda perdida',
    requires:[

    ],
    layout: 'fit',
    constructor: function() {
        var me = this;

        var btnAp = Ext.create('Ext.form.field.TextArea', {

            fieldLabel: '<b>Comentário de Aprovação</b>',
            maxRows: 4,
            labelAlign: 'top',
            name: 'comentarioAp',
            maxLength: 100,
            anchor: '98%',
            margin: '1 1 1 1'
        });

        var btnAprovar = Ext.create('Ext.button.Button',{
            
            text: 'Aprovar',
            tooltip: 'Aprovar',
            margin: '1 6 1 1',
            handler: function(form) {

                var urlAction = '/api/vp/Aprovar';

                var dataVp = me.down('grid').getStore().getData().items[0].data;

                var param = {
                    emp: dataVp.idEmpresa,
                    idVendaPerdida: dataVp.idVendaPerdida,
                    comentarioAp: btnAp.getValue()
                };

                Ext.Ajax.request({
                    url : BASEURL + urlAction,
                    method: 'POST',
                    params: param,
                    success: function (response) {

                        var result = Ext.decode(response.responseText);
                        if(result.success){

                            var gridLeste = Ext.getCmp('gridLeste');

                            gridLeste.getStore().getProxy().setExtraParams(param);
                            gridLeste.getStore().load();

                            // Ext.Msg.alert('info', 'Comentário Registrado!');
                            me.close();

                            var gridItens = Ext.getCmp('ItensGridPanel');
                            gridItens.getStore().reload();

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
                            {name:'vpDataLancamento', type: 'date', dateFormat: 'd/m/Y H:i:s' },
                            {name:'vpQtde',mapping:'vpQtde'}
                            ]
            }),
            proxy: {
                type: 'ajax',
                url : BASEURL + '/api/vp/listaritenscategorias',
                timeout: 240000,
                reader: {
                    type: 'json',
                    root: 'data'
                }
            },
            autoLoad : false
        });


        var btntrash = Ext.create('Ext.button.Button',{
            
            // iconCls: 'fa fa-times',
            text: 'Cancelar Solicitação',
            id: 'btnCancelarWin',
            disabled: false,
            tooltip: 'Cancelar',
            margin: '1 6 1 1',
            handler: function(form) {

                var objWindow = Ext.getCmp('CancelamentoVpWindow');

                if(!objWindow){
                    objWindow = Ext.create('App.view.vp.CancelamentoVpWindow');
                    objWindow.show();
                }

                var storeGrid = objWindow.down('panel').down('grid').getStore();
                var array = me.down('grid').getStore().data.items;
                
                array.forEach(function(record) {

                    storeGrid.add(record.data);
                });

                objWindow.down('panel').down('#winDatacan').setValue(me.down('#winData').getValue());
                objWindow.down('panel').down('#winVendedorcan').setValue(me.down('#winVendedor').getValue());
                objWindow.down('panel').down('#winClientecan').setValue(me.down('#winCliente').getValue());
                objWindow.down('panel').down('#comentarioSocan').setValue(me.down('#comentarioSo').getValue());

            }
        });

        Ext.applyIf(me, {
            
            items:[
                {
                    xtype:'container',
                    layout: 'border',
                    margin: '0 0 0 0',
                    items:[
                        {
                            xtype: 'toolbar',
                            region: 'north',
                            items:[
                                btntrash
                            ]
                        },
                        {
                            xtype: 'form',
                            region: 'center',
                            border: false,
                            // padding: 5,
                            bodyPadding: '5 5 5 5',
                            items: [
                                {
                                    xtype: 'form',
                                    layout: 'hbox',
                                    border: false,
                                    items: [
                                        {
                                            xtype: 'fieldset',
                                            title: '<b>Data</b>',
                                            defaultType: 'textfield',
                                            width: '14%',
                                            margin: '0 6 6 0',
                                            defaults: {
                                                anchor: '100%'
                                            },
                                            items: [
                                                {
                                                    xtype: 'displayfield',
                                                    id: 'winData'
                                                }
                                            ]
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: '<b>Vendedor</b>',
                                            defaultType: 'textfield',
                                            width: '32%',
                                            margin: '0 6 6 0',
                                            defaults: {
                                                anchor: '100%'
                                            },
                                            items: [
                                                {
                                                    xtype: 'displayfield',
                                                    id: 'winVendedor'
                                                }
                                            ]
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: '<b>Cliente</b>',
                                            defaultType: 'textfield',
                                            flex: 1,
                                            // width: '44%',
                                            margin: '0 0 6 0',
                                            defaults: {
                                                anchor: '100%'
                                            },
                                            items: [
                                                {
                                                    xtype: 'displayfield',
                                                    id: 'winCliente'
                                                }
                                            ]
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
                                            minWidth: 100,
                                            hidden: true
                                        },
                                        {
                                            text: 'Código',
                                            dataIndex: 'codItem',
                                            width: 100,
                                            hidden: false
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
                                            text: 'Estoque',
                                            dataIndex: 'vpEstoque',
                                            width: 80
                                        },
                                        {
                                            text: 'Data',
                                            dataIndex: 'vpDataLancamento',
                                            width: 100,
                                            hidden: true
                                        }
                                    ]
                                },
                                {
                                    xtype: 'displayfield',
                                    fieldLabel: '<b>Comentário de Solicitação</b>',
                                    scrollable : true,
                                    labelAlign: 'top',
                                    id: 'comentarioSo',
                                    anchor: '98%',
                                    margin: '20 1 1 1'
                                },
                                btnAp
                            ]
                        },
                        {
                            xtype: 'toolbar',
                            region: 'south',
                            margin: '0 0 0 0',
                            border: false,
                            items: [
                                '->',
                                btnAprovar
                            ]
                        }
                    ]
                }
            ]

        });

        me.callParent(arguments);

    }

});
