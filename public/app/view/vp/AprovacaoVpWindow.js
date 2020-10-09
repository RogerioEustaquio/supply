Ext.define('App.view.vp.AprovacaoVpWindow', {
    extend: 'Ext.window.Window',
    xtype: 'aprovacaovpwindow',
    itemId: 'aprovacaovpwindow',
    height: Ext.getBody().getHeight() * 0.8,
    width: Ext.getBody().getWidth() * 0.9,
    title: 'Aprovação de venda perdida',
    requires: [],

    layout: 'fit',
    vpItem: null,

    initComponent: function(config) {
        var me = this;
        // var utilFormat = Ext.create('Ext.ux.util.Format');

        var params = {
            idEmpresa: me.vpItem.idEmpresa,
            idVendaPerdida: me.vpItem.idVendaPerdida,
            idItem: me.vpItem.idItem,
            idCategoria: me.vpItem.idCategoria
        };

        var myStore = Ext.create('Ext.data.Store', {
            model: Ext.create('Ext.data.Model', {
                    fields:[{name:'idEmpresa',mapping:'idEmpresa'},
                            {name:'emp',mapping:'emp'},
                            {name:'codItem',mapping:'codItem'},
                            {name:'descricao',mapping:'descricao'},
                            {name:'marca',mapping:'marca'},
                            {name:'estoque',mapping:'estoque'},
                            {name:'qtdePendente',mapping:'qtdePendente'},
                            {name:'qtdeTotal_12m',mapping:'qtdeTotal_12m'},
                            {name:'qtdeTotal_6m',mapping:'qtdeTotal_6m'},
                            {name:'qtdeTotal_3m',mapping:'qtdeTotal_3m'},
                            {name:'med_12m',mapping:'med_12m', type: 'float'},
                            {name:'med_6m',mapping:'med_6m', type: 'float'},
                            {name:'med_3m',mapping:'med_3m', type: 'float'}
                           ]
            }),
            proxy: {
                type: 'ajax',
                url : BASEURL + '/api/vp/listaritenscategorias',
                timeout: 240000,
                extraParams: params,
                reader: {
                    type: 'json',
                    root: 'data'
                }
            },
            autoLoad: true
        });

        var toolcancelar = null;

        if(App.app.acessos.indexOf('btnReprovar') !== -1){
            toolcancelar = Ext.create('Ext.Toolbar',{
                region: 'north',
                items:[
                    {
                        xtype: 'button',
                        text: 'Cancelar Solicitação',
                        itemId: 'btncancelarwin',
                        disabled: false,
                        tooltip: 'Cancelar',
                        margin: '1 6 1 1',
                        handler: me.onCancelarClick
                    }
                ]
            });
        }

        Ext.applyIf(me, {
            
            items:[
                {
                    xtype:'container',
                    layout: 'border',
                    margin: '0 0 0 0',
                    items:[
                        toolcancelar,
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
                                            width: '12%',
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
                                            title: '<b>Quantidade Vp</b>',
                                            defaultType: 'textfield',
                                            width: '10%',
                                            margin: '0 6 6 0',
                                            defaults: {
                                                anchor: '100%'
                                            },
                                            items: [
                                                {
                                                    xtype: 'displayfield',
                                                    value: me.vpItem.vpQtde
                                                }
                                            ]
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: '<b>Estoque Vp</b>',
                                            defaultType: 'textfield',
                                            width: '8%',
                                            margin: '0 6 6 0',
                                            defaults: {
                                                anchor: '100%'
                                            },
                                            items: [
                                                {
                                                    xtype: 'displayfield',
                                                    value: me.vpItem.vpEstoque
                                                }
                                            ]
                                        },
                                        {
                                            xtype: 'fieldset',
                                            title: '<b>Vendedor</b>',
                                            defaultType: 'textfield',
                                            width: '28%',
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
                                    minHeight: 80,
                                    store: myStore,
                                    columns:[
                                        {
                                            text: 'Emp',
                                            dataIndex: 'emp',
                                            width: 52
                                        },
                                        {
                                            text: 'Código',
                                            dataIndex: 'codItem',
                                            width: 120,
                                            hidden: false
                                        },
                                        {
                                            text: 'Descrição',
                                            dataIndex: 'descricao',
                                            flex: 1,
                                            minWidth: 100
                                        },
                                        {
                                            text: 'Marca',
                                            dataIndex: 'marca',
                                            width: 120
                                        },
                                        {
                                            text: 'Estoque',
                                            dataIndex: 'estoque',
                                            width: 80
                                        },
                                        {
                                            text: 'Qtde Pendente',
                                            dataIndex: 'qtdePendente',
                                            width: 114,
                                            hidden: false
                                        },
                                        {
                                            text: 'Qtde 12M',
                                            dataIndex: 'qtdeTotal_12m',
                                            width: 80,
                                            hidden: false
                                        },
                                        {
                                            text: 'Qtde 6M',
                                            dataIndex: 'qtdeTotal_6m',
                                            width: 80,
                                            hidden: false
                                        },
                                        {
                                            text: 'Qtde 3M',
                                            dataIndex: 'qtdeTotal_3m',
                                            width: 80,
                                            hidden: false
                                        },
                                        {
                                            text: 'Méd. 12M',
                                            dataIndex: 'med_12m',
                                            width: 80,
                                            hidden: false,
                                            renderer: function (v) {
                                                return me.Value(v);
                                            }
                                        },
                                        {
                                            text: 'Méd. 6M',
                                            dataIndex: 'med_6m',
                                            width: 80,
                                            hidden: false,
                                            renderer: function (v) {
                                                return me.Value(v);
                                            }
                                        },
                                        {
                                            text: 'Méd. 3M',
                                            dataIndex: 'med_3m',
                                            width: 80,
                                            hidden: false,
                                            renderer: function (v) {
                                                return me.Value(v);
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'displayfield',
                                    fieldLabel: '<b>Comentário de Solicitação</b>',
                                    scrollable : true,
                                    labelAlign: 'top',
                                    itemId: 'comentarioSo',
                                    anchor: '98%',
                                    margin: '20 1 1 1',
                                    value: me.vpItem.vpComentario
                                },
                                {
                                    xtype: 'textarea',
                                    fieldLabel: '<b>Comentário de Aprovação</b>',
                                    maxRows: 4,
                                    labelAlign: 'top',
                                    name: 'comentarioAp',
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
                                    text: 'Aprovar',
                                    tooltip: 'Aprovar',
                                    margin: '1 6 1 1',
                                    handler: me.onAprovarClick
                                }
                            ]
                        }
                    ]
                }
            ]

        });

        me.callParent(arguments);

    },

    onCancelarClick: function(btn){
        var me = btn.up('window');

        me.close();

        var win = Ext.create('App.view.vp.CancelamentoVpWindow', {
            vpItem: me.vpItem
        });

        win.show();

    },

    onAprovarClick: function(btn){
        var me = btn.up('window'),
            notyType = 'success',
            notyText = 'Solicitação aprovada com sucesso!';

        var param = {
            idEmpresa: me.vpItem.idEmpresa,
            idVendaPerdida: me.vpItem.idVendaPerdida,
            comentarioAp: me.down('textarea[name=comentarioAp]').getValue()
        };

        me.setLoading({msg: '<b>Salvando os dados...</b>'});

        Ext.Ajax.request({
            url : BASEURL + '/api/vp/aprovar',
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

                    Ext.GlobalEvents.fireEvent('vpsolicitacaoaprovada', {
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
    },

    Value: function(v) {
        var val = '';
        if (v) {
            val = Ext.util.Format.currency(v, ' ', 4, false);
        } else {
            val = 0;
        }
        return val;
    }

});
