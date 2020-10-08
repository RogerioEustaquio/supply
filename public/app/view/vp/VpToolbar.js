Ext.define('App.view.vp.VpToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    xtype: 'vptoolbar',
    itemId: 'vptoolbar',
    margin: '2 2 2 2',
    requires: [

    ],
    constructor: function() {
        var me = this;

        var empbx = Ext.create('Ext.form.field.ComboBox',{
            width: 70,
            name: 'bxemp',
            itemId: 'bxemp',
            store: Ext.data.Store({
                fields: [{ name: 'idEmpresa' }, { name: 'apelido' }],
                proxy: {
                    type: 'ajax',
                    url: BASEURL + '/api/Vp/listarempresas',
                    reader: {
                        type: 'json',
                        root: 'data'
                    }
                }
            }),
            queryParam: 'codigo',
            queryMode: 'local',
            displayField: 'nome',
            valueField: 'nome',
            emptyText: 'Emp',
            forceSelection: true,
            disabled: true,
            margin: '1 1 1 1',
            listeners: {
               
            }
        });

        empbx.store.load(function(r){
            empbx.enable();
            empbx.select(USUARIO.empresa);
        });

        var dtinicio = Ext.create('Ext.form.field.Date',{
            name: 'dtinicio',
            // id: 'dtinicio',
            fieldLabel: 'Data de',
            margin: '2 2 2 12',
            width: 180,
            labelWidth: 50,
            format: 'd/m/Y',
            altFormats: 'dmY',
            emptyText: '__/__/____'
        });

        var dtfim = Ext.create('Ext.form.field.Date',{
            name: 'dtfim',
            // id: 'dtfim',
            fieldLabel: 'até',
            margin: '2 2 2 2',
            width: 132,
            labelWidth: 20,
            format: 'd/m/Y',
            altFormats: 'dmY',
            emptyText: '__/__/____'
        });

        var btnClean = Ext.create('Ext.button.Button',{
            
            iconCls: 'fa fa-file',
            tooltip: 'Limpar',
            margin: '1 1 1 4',
            handler: function() {
            
                empbx.setSelection(null);
                dtinicio.setValue(null);
                dtfim.setValue(null);
            }
        });

        var array = [
                        {
                            id_funcionario: USUARIO.id, nome: USUARIO.usuarioSistema, acessos: ['btnAprovar','btnConcluir','btnReprovar']
                        }
                    ];
        // console.log(array);
        var btnAprovar = null;
        var btnConcluir = null;
        var btnReprovar = null;
                    console.log(App.app.acessos);

        if(App.app.acessos.indexOf('btnAprovar') !== -1){
            btnAprovar = Ext.create('Ext.button.Button',{

                iconCls: 'fa fa-check',
                itemId: 'btnAprovar',
                tooltip: 'Aprovar',
                margin: '2 6 2 2',
                handler: me.onBtnAprovarClick
            });
        }

        if(App.app.acessos.indexOf('btnConcluir') !== -1){
            btnConcluir = Ext.create('Ext.button.Button',{
        
                iconCls: 'fa fa-check-double',
                itemId: 'btnConcluir',
                disabled: true,
                tooltip: 'Concluir',
                margin: '1 6 1 1',
                handler: me.onBtnConcluirClick
            });
        }

        if(App.app.acessos.indexOf('btnReprovar') !== -1){
            btnReprovar = Ext.create('Ext.button.Button',{
        
                iconCls: 'fa fa-times',
                itemId: 'btnCancelar',
                disabled: true,
                tooltip: 'Cancelar',
                margin: '1 6 1 1',
                handler: me.onBtnCancelarClick
            });
        }

        Ext.applyIf(me, {

            items: [
                empbx,
                dtinicio,
                dtfim,
                {
                    xtype: 'button',
                    iconCls: 'fa fa-search',
                    tooltip: 'Consultar',
                    margin: '1 1 1 1',
                    handler: me.onBtnConsultarClick
                },
                btnClean,
                '->',
                btnAprovar,
                btnConcluir,
                btnReprovar
            ]

        });

        me.callParent(arguments);

    },

    onBtnConsultarClick: function(btn){
        var me = btn.up('toolbar');

        var idEmpresa = '';
        
        if(me.down('combobox[name=bxemp]').getRawValue())
            idEmpresa = me.down('combobox[name=bxemp]').selection.data.idEmpresa;

        if(idEmpresa == ''){
            Ext.Msg.alert('Alerta','Selecione Empresa.');
            return null;
        }

        var storeItens  = me.up('panel').down('grid').getStore();
        var dtinicio    = me.down('datefield[name=dtinicio]').getRawValue();
        var dtfim       = me.down('datefield[name=dtfim]').getRawValue();

        var params =  {
            idEmpresa : idEmpresa,
            dataInicio : dtinicio,
            dataFim : dtfim
        };

        storeItens.getProxy().setExtraParams(params);
        storeItens.load();

    },

    onBtnAprovarClick: function(btn){
        var me = this;

        var itensGrid = me.up('vpmain').down('itensgridpanel');
        if(itensGrid.getSelection() == 0){
            Ext.Msg.alert('Alerta','Favor selecionar uma venda pedida.');
            return null;
        }

        var win = Ext.create('App.view.vp.AprovacaoVpWindow', {
            vpItem: itensGrid.getSelection()[0].data
        });

        win.show();
    },

    onBtnConcluirClick: function(btn){
        var me = this;

        var itensGrid = me.up('vpmain').down('itensgridpanel');
        if(itensGrid.getSelection() == 0){
            Ext.Msg.alert('Alerta','Favor selecionar uma venda pedida.');
            return null;
        }

        var win = Ext.create('App.view.vp.ConclusaoVpWindow', {
            vpItem: itensGrid.getSelection()[0].data
        });

        win.show();
    },

    onBtnCancelarClick: function(btn){
        var me = this;

        var itensGrid = me.up('vpmain').down('itensgridpanel');
        if(itensGrid.getSelection() == 0){
            Ext.Msg.alert('Alerta','Favor selecionar uma venda pedida.');
            return null;
        }

        var win = Ext.create('App.view.vp.CancelamentoVpWindow', {
            vpItem: itensGrid.getSelection()[0].data
        });

        win.show();
    }

});
