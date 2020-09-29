Ext.define('App.view.vp.ItensGridPanel', {
    extend: 'Ext.grid.Panel',
    xtype: 'ItensGridPanel',
    id: 'ItensGridPanel',
    margin: '1 1 1 1',
    constructor: function() {
        var me = this;

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
                            {name:'vpUsuarioLancamento',mapping:'vpUsuarioLancamento'},
                            {name:'vpFuncionarioVenda',mapping:'vpFuncionarioVenda'},
                            {name:'vpQtde',mapping:'vpQtde'}
                            ]
            }),
            proxy: {
                type: 'ajax',
                method:'POST',
                url : BASEURL + '/api/vp/listarvp',
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

            store: myStore,
            columns: [
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
                    flex: 1
                },
                {
                    text: 'Codigo',
                    dataIndex: 'codItem',
                    width: 100
                },
                {
                    text: 'Descrição',
                    dataIndex: 'descItem',
                    flex: 1
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
                    text: 'Lançamento',
                    dataIndex: 'vpDataLancamento',
                    width: 100
                },
                {
                    text: 'Usu. Venda',
                    dataIndex: 'vpUsuarioLancamento',
                    width: 100,
                    hidden: true
                },
                {
                    text: 'Vendedor',
                    dataIndex: 'vpFuncionarioVenda',
                    width: 100
                },
                {
                    text: 'Quantidade',
                    dataIndex: 'vpQtde',
                    width: 100
                }
            ],
            listeners: {
                click: {
                    element: 'el', //bind to the underlying el property on the panel
                    fn: function(record){

                        var girdLeste = me.up('container').down('#PanelLeste').down('grid');

                        var elements = record.record.data;

                        var params = {
                            emp : elements.idEmpresa
                        };
                        // console.log(v.record.data);

                        var girdLeste = me.up('container').down('#PanelLeste').down('grid');

                        girdLeste.getStore().getProxy().setExtraParams(params);

                        girdLeste.getStore().load();

                    }
                }
            }
        
        });

        me.callParent(arguments);

    }

});
