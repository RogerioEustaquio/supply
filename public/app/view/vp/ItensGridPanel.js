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
                            {name:'vpQtde',mapping:'vpQtde'},
                            {name:'vpEstoque',mapping:'vpEstoque'},
                            {name:'vpEventosRuptura_180d',mapping:'vpEventosRuptura_180d'},
                            {name:'vpDiasRuptura_180d',mapping:'vpDiasRuptura_180d'},
                            {name:'vpEventosRuptura_30d',mapping:'vpEventosRuptura_30d'},
                            {name:'vpDiasRuptura_30d',mapping:'vpDiasRuptura_30d'},
                            {name:'status',mapping:'status'}
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
                    text: 'Código',
                    dataIndex: 'codItem',
                    width: 100
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
                    text: 'Lançamento',
                    dataIndex: 'vpDataLancamento',
                    width: 100
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
                },
                {
                    text: 'Estoque',
                    dataIndex: 'vpEstoque',
                    width: 80
                },
                {
                    text: 'Eventos<br> Ruptura 6M',
                    dataIndex: 'vpEventosRuptura_180d',
                    width: 100
                },
                {
                    text: 'Eventos<br> Ruptura 30D',
                    dataIndex: 'vpEventosRuptura_30d',
                    width: 100
                },
                {
                    text: 'Dias<br>Ruptura 6M',
                    dataIndex: 'vpDiasRuptura_180d',
                    width: 100
                },
                {
                    text: 'Dias<br>Ruptura 30D',
                    dataIndex: 'vpDiasRuptura_30d',
                    width: 100
                },
                {
                    text: 'Status',
                    width: 86,
                    dataIndex: 'status',
                    renderer: function (value, metaData, record) {

                            if (value === 2)
                                metaData.tdCls = 'x-grid-cell-green-border';
                            if (value === 3)
                                metaData.tdCls = 'x-grid-cell-yellow-border';
                            if (value === 4)
                                metaData.tdCls = 'x-grid-cell-red-border';

                        return value;
                    }
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
