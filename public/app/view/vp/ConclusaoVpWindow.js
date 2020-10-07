Ext.define('App.view.vp.ConclusaoVpWindow', {
    extend: 'Ext.window.Window',
    xtype: 'conclusaovpwindow',
    itemId: 'conclusaovpwindow',
    height: Ext.getBody().getHeight() * 0.8,
    width: Ext.getBody().getWidth() * 0.8,
    title: 'Conclusão de Venda Perdida',
    requires:[

    ],
    layout: 'fit',
    vpItem: null,

    initComponent: function() {
        var me = this;

        var params = {
            idEmpresa: me.vpItem.idEmpresa,
            idVendaPerdida: me.vpItem.idVendaPerdida,
            idItem: me.vpItem.idItem,
            idCategoria: me.vpItem.idCategoria
        };

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
                params: params,
                reader: {
                    type: 'json',
                    root: 'data'
                }
            },
            autoLoad : true
        });

        Ext.applyIf(me, {
            
            items:[
                {
                    xtype:'container',
                    layout: 'border',
                    margin: '0 0 0 0',
                    items:[
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
                                                    value: me.vpItem.vpDataLancamento
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
                                                    value: me.vpItem.vpFuncionarioVenda
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
                                                    value: me.vpItem.idCliente + ' ' + me.vpItem.nomeCliente
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
                                    margin: '20 1 1 1',
                                    value: me.vpItem.vpComentario
                                },
                                {
                                    xtype: 'displayfield',
                                    fieldLabel: '<b>Comentário de Aprovação</b>',
                                    scrollable : true,
                                    labelAlign: 'top',
                                    id: 'comentarioAp',
                                    anchor: '98%',
                                    margin: '20 1 1 1',
                                    value: me.vpItem.vpAprovacaoComentario
                                },
                                {
                                    xtype: 'textarea',
                                    fieldLabel: '<b>Comentário de Conclusão</b>',
                                    maxRows: 4,
                                    labelAlign: 'top',
                                    name: 'comentarioConc',
                                    maxLength: 100,
                                    anchor: '98%',
                                    margin: '1 1 1 1'
                                }
                            ]
                        },
                        {
                            xtype: 'toolbar',
                            region: 'south',
                            margin: '0 0 0 0',
                            border: false,
                            items: [
                                '->',
                                {
                                    xtype: 'button',
                                    text: 'Concluir',
                                    tooltip: 'Concluir',
                                    margin: '1 6 1 1',
                                    handler: me.onConcluirClick
                                }
                            ]
                        }
                    ]
                }
            ]

        });

        me.callParent(arguments);

    },

    onConcluirClick: function(btn){
        var me = btn.up('window'),
            notyType = 'success',
            notyText = 'Solicitação concluida com sucesso!';

        var param = {
            idEmpresa: me.vpItem.idEmpresa,
            idVendaPerdida: me.vpItem.idVendaPerdida,
            comentarioConc: me.down('textarea[name=comentarioConc]').getValue()
        };

        me.setLoading({msg: '<b>Salvando os dados...</b>'});

        Ext.Ajax.request({
            url : BASEURL + '/api/vp/concluir',
            method: 'POST',
            params: param,
            success: function (response) {
                var result = Ext.decode(response.responseText);

                if(!result.success){
                    notyType = 'error';
                    notyText = result.message;
                    window.setLoading(false);
                }

                me.noty(notyType, notyText);

                if(result.success){

                    Ext.GlobalEvents.fireEvent('vpsolicitacaoconcluida', {
                        idEmpresa: me.vpItem.idEmpresa,
                        idVendaPerdida: me.vpItem.idVendaPerdida
                    });
                    
                    me.close();
                }
            }
        });
    },

    noty: function(notyType, notyText){
        new Noty({
            theme: 'relax',
            layout: 'bottomRight',
            type: notyType,
            timeout: 3000,
            text: notyText
        }).show();
    }

});
