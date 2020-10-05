Ext.define('App.view.vp.ItensGridPanel', {
    extend: 'Ext.grid.Panel',
    xtype: 'ItensGridPanel',
    id: 'ItensGridPanel',
    margin: '1 1 1 1',
    requeri:[
        'Ext.ux.util.Format'
    ],
    constructor: function() {
        var me = this;

        var myStore = Ext.create('Ext.data.Store', {
            model: Ext.create('Ext.data.Model', {
                    fields:[{name:'idEmpresa',mapping:'idEmpresa',  type: 'string'},
                            {name:'idVendaPerdida',mapping:'idVendaPerdida',  type: 'string'},
                            {name:'idCliente',mapping:'idCliente',  type: 'string'},
                            {name:'nomeCliente',mapping:'nomeCliente',  type: 'string'},
                            {name:'codItem',mapping:'codItem',  type: 'string'},
                            {name:'descItem',mapping:'descItem',  type: 'string'},
                            {name:'marca',mapping:'marca',  type: 'string'},
                            {name:'curva',mapping:'curva',  type: 'string'},
                            {name:'tipo',mapping:'tipo',  type: 'string'},
                            {name:'vpDataLancamento', type: 'date', dateFormat: 'd/m/Y H:i' },
                            {name:'vpUsuarioLancamento',mapping:'vpUsuarioLancamento',  type: 'string'},
                            {name:'vpFuncionarioVenda',mapping:'vpFuncionarioVenda',  type: 'string'},
                            {name:'vpQtde',mapping:'vpQtde',  type: 'number'},
                            {name:'vpEstoque',mapping:'vpEstoque',  type: 'number'},
                            {name:'vpEventosRuptura_180d',mapping:'vpEventosRuptura_180d',  type: 'number'},
                            {name:'vpDiasRuptura_180d',mapping:'vpDiasRuptura_180d',  type: 'number'},
                            {name:'vpEventosRuptura_30d',mapping:'vpEventosRuptura_30d',  type: 'number'},
                            {name:'vpDiasRuptura_30d',mapping:'vpDiasRuptura_30d',  type: 'number'},
                            {name:'status',mapping:'status',  type: 'string'}
                            ]
            }),
            proxy: {
                type: 'ajax',
                // method:'POST',
                url : BASEURL + '/api/vp/listarvp',
                // encode: true,
                timeout: 240000,
                // format: 'json',
                reader: {
                    type: 'json',
                    root: 'data'
                }
            },
            autoLoad : false
        });

        Ext.applyIf(me, {

            store: myStore,
            columns: [
                {
                    text: 'Data',
                    width: 130,
                    align: 'center',
                    dataIndex: 'vpDataLancamento',
                    // renderer: Ext.util.Format.dateRenderer('d/m/Y H:i')
                    // renderer: function(v){

                    //     var valor = Ext.util.Format.date(v,'m/d/Y H:i');
                    //     return valor;
                    // }
                },
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
                    text: 'Tipo',
                    dataIndex: 'tipo',
                    width: 80
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
                    minWidth: 160
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
                    width: 160
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

                            if (value === 'Concluído')
                                metaData.tdCls = 'x-grid-cell-green-border';
                            if (value === 'Aprovado')
                                metaData.tdCls = 'x-grid-cell-yellow-border';
                            if (value === 'Cancelado')
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

                        var objTool = me.up('container').down('toolbar');

                        if (elements.status == 'Pendente'){

                            objTool.down('#btnComentario').setDisabled(false);
                            objTool.down('#btnAtendimento').setDisabled(true);
                            objTool.down('#btnConcluir').setDisabled(true);
                            objTool.down('#btnCancelar').setDisabled(false);

                        }

                        if(elements.status == 'Aprovado'){
                            
                            objTool.down('#btnComentario').setDisabled(true);
                            objTool.down('#btnAtendimento').setDisabled(true);
                            objTool.down('#btnConcluir').setDisabled(false);
                            objTool.down('#btnCancelar').setDisabled(false);

                        }

                        if(elements.status == 'Cancelado' || elements.status == 'Concluído'){
                            
                            objTool.down('#btnComentario').setDisabled(true);
                            objTool.down('#btnAtendimento').setDisabled(true);
                            objTool.down('#btnConcluir').setDisabled(true);
                            objTool.down('#btnCancelar').setDisabled(true);

                        }
                        
                        
                        

                        var params = {
                            emp : elements.idEmpresa,
                            idVendaPerdida : elements.idVendaPerdida
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
